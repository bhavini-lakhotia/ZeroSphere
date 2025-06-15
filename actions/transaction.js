"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Helper: Serialize amounts and splits
const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount?.toNumber?.() ?? obj.amount,
  splits: obj.splits?.map((split) => ({
    ...split,
    amount: split.amount?.toNumber?.() ?? split.amount,
    paid: split.paid,
  })) ?? [],
});

// ✅ Helper: Calculate Next Recurring Date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY": date.setDate(date.getDate() + 1); break;
    case "WEEKLY": date.setDate(date.getDate() + 7); break;
    case "MONTHLY": date.setMonth(date.getMonth() + 1); break;
    case "YEARLY": date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
}

// ✅ Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const createdTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
          splits: data.splits?.length
            ? {
                create: data.splits.map((split) => ({
                  name: split.name,
                  amount: split.amount,
                  paid: split.paid ?? false,
                })),
              }
            : undefined,
        },
        include: { splits: true },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return createdTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message || "Failed to create transaction");
  }
}

// ✅ Update Transaction
export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const originalTransaction = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });
    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const transaction = await db.$transaction(async (tx) => {
      await tx.split.deleteMany({ where: { transactionId: id } });

      const updated = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
          splits: data.splits?.length
            ? {
                create: data.splits.map((split) => ({
                  name: split.name,
                  amount: split.amount,
                  paid: split.paid ?? false,
                })),
              }
            : undefined,
        },
        include: { splits: true },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: netBalanceChange } },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message || "Failed to update transaction");
  }
}

// ✅ Get Single Transaction
export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: { id, userId: user.id },
    include: { splits: true },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

// ✅ Get All Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
        splits: true,
      },
      orderBy: { date: "desc" },
    });

    return { success: true, data: transactions.map(serializeAmount) };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch transactions");
  }
}

// ✅ Scan Receipt with Gemini API
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }
      If it's not a receipt, return an empty object.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const text = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
    const data = JSON.parse(text);

    return {
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      merchantName: data.merchantName,
    };
  } catch (error) {
    throw new Error("Failed to scan receipt");
  }
}
//split wala part
export async function markSplitAsPaid({ splitId }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const split = await db.split.findUnique({
    where: { id: splitId },
    include: {
      transaction: {
        include: {
          account: true,
        },
      },
    },
  });

  if (!split || split.transaction.userId !== user.id) {
    throw new Error("Split not found or unauthorized");
  }

  // ✅ Update inside a transaction to keep it atomic
  const updatedSplit = await db.$transaction(async (tx) => {
    const markedSplit = await tx.split.update({
      where: { id: splitId },
      data: { paid: true },
    });

    // ✅ Update account balance
    await tx.account.update({
      where: { id: split.transaction.accountId },
      data: {
        balance: {
          increment: markedSplit.amount,
        },
      },
    });

    return markedSplit;
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      ...updatedSplit,
      amount: updatedSplit.amount.toNumber(),
      paid: updatedSplit.paid ?? false,
    },
  };
}

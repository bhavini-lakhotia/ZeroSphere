"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "account-id"; // Replace with actual
const USER_ID = "user-id";       // Replace with actual

// Categories with their typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions() {
  try {
    const transactions = [];
    const splits = [];
    let totalBalance = 0;

    // Generate 90 days of transactions
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const transactionId = crypto.randomUUID();

        transactions.push({
          id: transactionId,
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;

        // If it's an EXPENSE, create split payments
        if (type === "EXPENSE") {
          const split1Amount = Number((amount * 0.6).toFixed(2));
          const split2Amount = Number((amount - split1Amount).toFixed(2));

          splits.push(
            {
              id: crypto.randomUUID(),
              name: "Alice",
              amount: split1Amount,
              paid: true,
              transactionId,
            },
            {
              id: crypto.randomUUID(),
              name: "Bob",
              amount: split2Amount,
              paid: false,
              transactionId,
            }
          );
        }
      }
    }

    // Seed into DB
    await db.$transaction(async (tx) => {
      // Clear existing data
      await tx.split.deleteMany({});
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Insert splits
      if (splits.length > 0) {
        await tx.split.createMany({
          data: splits,
        });
      }

      // Update account balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions and ${splits.length} splits`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

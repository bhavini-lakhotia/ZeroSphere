import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="p-8 space-y-8 px-5 bg-gradient-to-b from-purple-200 via-[#f6f3f9] to-blue-200 dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81] transition-colors">
      {/* Header */}
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-xl p-8 bg-gradient-to-b from-white via-[#f6f3f9] to-white dark:bg-muted transition-colors shadow-md">
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
        >
          <AccountChart transactions={transactions} />
        </Suspense>
      </div>

      {/* Transactions Table Section */}
     
      <div className="relative mt-10 mb-32 rounded-xl p-6 shadow-md transition-colors 
          bg-[#fce7f3] dark:bg-[#1e1b4b] isolate z-10 border border-[#f0c8eb] dark:border-transparent">
        <Suspense
          fallback={<BarLoader className="mt-4" width="100%" color="#9333ea" />}
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}

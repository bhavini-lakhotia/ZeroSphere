import { Suspense } from "react";
import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-800 to-black dark:from-white dark:via-fuchsia-300 dark:to-purple-100">
      {/* Optional soft overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

      {/* Main content wrapper (no max-width) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-8 space-y-6 ">
        <h1 className="text-5xl font-extrabold">
          <span
            className="
              text-transparent 
              bg-clip-text 
              bg-gradient-to-r 
              from-purple-300 to-pink-300
              dark:from-purple-900 dark:to-pink-600
              transition-colors duration-500
            "
          >
            Dashboard
          </span>
        </h1>

        <div className="grid grid-cols-1">
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        </div>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </div>
        
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <CreateAccountDrawer>
            <Card className="bg-card text-card-foreground shadow-xl rounded-2xl border border-border transition hover:shadow-2xl hover:scale-[1.015] groupcursor-pointer border-dashed bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#3c1053] backdrop-blur-md">
              <CardContent className="flex flex-col justify-center items-center text-muted-foreground h-full pt-5 p-6">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-lg font-extrabold text-transparent 
              bg-clip-text 
              bg-gradient-to-r 
              from-purple-900 to-pink-900
              dark:from-purple-600 dark:to-pink-600
              transition-colors duration-500 hover:scale-[1.015] group">
                  Add New Account
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}

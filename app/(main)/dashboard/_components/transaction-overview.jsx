"use client";
import { PieChartLegend } from "@/components/PieChartLegend";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { markSplitAsPaid } from "@/actions/transaction";
import { categoryColors } from "@/data/categories";
import { normalizeCategory } from "@/components/PieChartLegend";
function ThemedPieTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "0.5rem",
        padding: 12,
        color: isDark ? "#f9fafb" : "#111827",
        fontWeight: 500,
        fontSize: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      {`${payload[0].name}: ₹${payload[0].value.toFixed(2)}`}
    </div>
  );
}
export function DashboardOverview({ accounts = [], transactions = [] }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    }
  }, []);
 
  const router = useRouter();
  const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccount?.id ?? "");
  const [loadingSplitId, setLoadingSplitId] = useState(null);

  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const handleMarkAsPaid = async (transactionId, splitId, splitName) => {
    const confirmed = window.confirm(
      `Are you sure ${splitName} has paid the amount?`
    );
    if (!confirmed) return;

    setLoadingSplitId(splitId);

    try {
      await markSplitAsPaid({ splitId });
      router.refresh();
    } catch (err) {
      const msg = err?.message ?? "Unknown error";
      console.error("Error marking split as paid:", msg, err);
      alert(`Failed to mark as paid: ${msg}`);
    } finally {
      setLoadingSplitId(null);
    }
  };

  const recentTransactions = [...accountTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();

  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = {};
  currentMonthExpenses.forEach((transaction) => {
    const { category, splits, amount } = transaction;
    const categoryKey = category || "Uncategorized";

    if (!expensesByCategory[categoryKey]) {
      expensesByCategory[categoryKey] = {
        personal: 0,
        reimbursed: 0,
        unpaid: 0,
      };
    }

    if (splits?.length) {
      splits.forEach((s) => {
        if (s.paid) {
          expensesByCategory[categoryKey].reimbursed += s.amount;
        } else {
          expensesByCategory[categoryKey].unpaid += s.amount;
        }
      });
      const reimbursedAmount = splits
        .filter((s) => s.paid)
        .reduce((sum, s) => sum + s.amount, 0);
      expensesByCategory[categoryKey].personal += amount - reimbursedAmount;
    } else {
      expensesByCategory[categoryKey].personal += amount;
    }
  });

  const pieChartData = [];
  Object.entries(expensesByCategory).forEach(([category, values]) => {
    if (values.personal > 0) {
      pieChartData.push({ name: `${category} (You)`, value: values.personal });
    }
    if (values.reimbursed > 0) {
      pieChartData.push({ name: `${category} (Reimbursed)`, value: values.reimbursed });
    }
    if (values.unpaid > 0) {
      pieChartData.push({ name: `${category} (Unpaid)`, value: values.unpaid });
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="rounded-2xl shadow-lg border border-border-adaptive transition-colors duration-300 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:bg-gradient-to-br dark:bg-gradient-to-br dark:from-purple-900 dark:to-blue-900 shadow-md transition-all hover:shadow-xl hover:scale-[1.015] group">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 p-6">
          <span className="text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1l2 7h11l2-7h1" />
              <circle cx="12" cy="5" r="2" />
            </svg>
          </span>
          <CardTitle className="text-2xl font-semibold text-foreground">Recent Transactions</CardTitle>

          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[140px] bg-[white] text-blue-900 border border-blue-300 hover:bg-blue-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent transactions</p>
            ) : (
              recentTransactions.map((transaction) => {
                const isSplit = transaction.splits?.length > 0;
                return (
                  <div key={transaction.id} className="space-y-2 border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || "Untitled"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), "PP")}
                        </p>
                      </div>
                      <div
                        className={`flex items-center font-bold text-base md:text-lg ${transaction.type === "EXPENSE" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="h-5 w-5 mr-1" />
                        ) : (
                          <ArrowUpRight className="h-4 w-5 mr-1" />
                        )}
                        ₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>

                    {isSplit && (
                      <div className="pl-4 pt-1 space-y-1">
                        {transaction.splits.map((split) => (
                          <div
                            key={split.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="text-muted-foreground">{split.name}</div>
                            <div className="flex items-center gap-2">
                              ₹{split.amount.toFixed(2)}
                              {split.paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <>
                                  <span className="text-red-500 text-xs flex items-center gap-1">
                                    <XCircle className="h-4 w-4" />
                                    Unpaid
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleMarkAsPaid(
                                        transaction.id,
                                        split.id,
                                        split.name
                                      )
                                    }
                                    disabled={loadingSplitId === split.id}
                                    className={cn(
                                      "text-xs hover:underline",
                                      loadingSplitId === split.id
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-600 dark:text-white hover:text-blue-700 dark:hover:text-blue-200" 
                                    )}
                                  >
                                    {loadingSplitId === split.id
                                      ? "Marking..."
                                      : "Mark as Paid"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}

<Card className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-purple-900 dark:to-blue-900 rounded-2xl shadow-lg border border-border transition-colors duration-300 hover:shadow-xl hover:scale-[1.015] group">
  <CardHeader className="flex flex-row items-center gap-3 p-6">
    <span className="text-purple-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a2 2 0 104 0 2 2 0 00-4 0zm-7-2a2 2 0 104 0 2 2 0 00-4 0zm14-6a2 2 0 104 0 2 2 0 00-4 0zm-7-2a2 2 0 104 0 2 2 0 00-4 0z" />
      </svg>
    </span>
    <CardTitle className="text-2xl font-semibold text-foreground">
      Monthly Expense Breakdown
    </CardTitle>
  </CardHeader>

  <CardContent className="p-6 pb-5">
    {pieChartData.length === 0 ? (
      <p className="text-center text-muted-foreground py-4">No expenses this month</p>
    ) : (
      <div className="h-[340px] flex flex-col items-center justify-between gap-4">
<ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie
      data={pieChartData}
      cx="50%"
      cy="50%"
      outerRadius={90}
      innerRadius={30}
      fill="#a78bfa"
      dataKey="value"
      labelLine={false}
    >
      {pieChartData.map((entry, index) => {
        const baseCategory = normalizeCategory(entry.name);
        return (
          <Cell
            key={`cell-${index}`}
            fill={categoryColors[baseCategory] || "#fbb6ce"}
          />
        );
      })}
    </Pie>
    <Tooltip content={<ThemedPieTooltip isDark={isDark} />} />
  </PieChart>
</ResponsiveContainer>

{/* ✅ Custom Legend OUTSIDE ResponsiveContainer */}
<div className="flex justify-center flex-col space-y-2">
  <PieChartLegend pieChartData={pieChartData} isDark={isDark} />
</div>
</div>
    )}
  </CardContent>
</Card>
</div>
)}
"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#3c1053] backdrop-blur-sm border border-border rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 shadow-md transition-all hover:shadow-xl hover:scale-[1.015] group">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 p-6 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-purple-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 8v8m8-8h-8m8 0a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>
          </span>
          <CardTitle className="text-xl font-semibold text-foreground">
            Monthly Budget (Default)
          </CardTitle>
        </div>
    
           <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-28"
                placeholder="Amount"
                autoFocus
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </>
          ) : (
            <>
              <CardDescription className="text-sm text-muted-foreground">
                {initialBudget
                  ? `₹${currentExpenses.toFixed(2)} of ₹${initialBudget.amount.toFixed(
                      2
                    )} spent`
                  : "No budget set"}
              </CardDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3">
  {initialBudget && (
    <div className="space-y-2 group">
      <Progress
        value={percentUsed}
        className="h-3 rounded-full bg-muted group-hover:bg-muted/70"
        extraStyles="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
      />
      <p className="text-xs text-muted-foreground text-right">
        {percentUsed.toFixed(1)}% used
      </p>
    </div>
  )}
</CardContent>

    </Card>
  );
}

export default BudgetProgress;

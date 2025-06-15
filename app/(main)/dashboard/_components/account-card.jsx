"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked) => {
    if (checked && !isDefault) {
      await updateDefaultFn(id);
    } else {
      toast.warning("You need at least one default account");
    }
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card className="w-full max-w-sm bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#3c1053] backdrop-blur-md border border-border rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.015] group">
      <CardHeader className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CardTitle className="text-xl font-semibold truncate capitalize text-foreground">
              {name}
            </CardTitle>
            {isDefault && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-primary text-primary"
              >
                Default
              </Badge>
            )}
          </div>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </div>
      </CardHeader>

      <Link href={`/account/${id}`} passHref>
        <CardContent className="px-6 pb-4 pt-5 cursor-pointer rounded-xl transition-colors duration-200 group-hover:bg-accent/30">
          <div className="text-3xl font-bold text-foreground">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {type[0].toUpperCase() + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
      </Link>

      <CardFooter className="flex justify-between px-6 pb-6 pt-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
          <span>Expense</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AccountCard;

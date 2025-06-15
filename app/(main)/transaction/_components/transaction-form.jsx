"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            recurringInterval: initialData.recurringInterval || undefined,
            splits: initialData.splits || [],
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            category: undefined,
            date: new Date(),
            isRecurring: false,
            recurringInterval: undefined,
            splits: [],
          },
  });

  const { loading: transactionLoading, fn: transactionFn, data: transactionResult } = useFetch(editMode ? updateTransaction : createTransaction);
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "splits",
  });

  const onSubmit = (data) => {
    const allSplits = (data.splits || []).filter(
      (s) => s.name.trim() !== "" && !isNaN(parseFloat(s.amount))
    );
    const totalSplits = allSplits.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const totalAmount = parseFloat(data.amount);

    // If any split entered, auto-assign remainder to "You"
    let updatedSplits = [...allSplits];
    if (updatedSplits.length > 0 && Math.abs(totalSplits - totalAmount) > 0.01) {
      const outstanding = totalAmount - totalSplits;
      if (outstanding < 0) {
        return toast.error("Split amounts exceed total amount.");
      }
      updatedSplits.push({ name: "You", amount: outstanding.toFixed(2), paid: true });
    }

    const formData = {
      ...data,
      amount: totalAmount,
      splits: updatedSplits.map((s) => ({
        ...s,
        amount: parseFloat(s.amount),
      })),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
    }
  };

  const handleEqualSplit = () => {
    const amount = parseFloat(getValues("amount"));
    const current = getValues("splits").filter((s) => s.name.trim() !== "");
    const totalPeople = current.length + 1; // +1 for "You"
    if (!amount || totalPeople === 0) return toast.error("Enter amount and at least one person");

    const splitAmount = (amount / totalPeople).toFixed(2);

    const newSplits = [
      ...current.map((s) => ({ ...s, amount: splitAmount })),
      { name: "You", amount: splitAmount, paid: true },
    ];
    replace(newSplits);
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(editMode ? "Transaction updated successfully" : "Transaction created successfully");
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter((category) => category.type === type);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
          <SelectTrigger className="
        w-full px-4 py-2 rounded-md shadow-sm border
        bg-gradient-to-r from-white to-purple-100 text-gray-900
        dark:from-[#1f1f2e] dark:to-[#2c2c3e] dark:text-white dark:hover:text-white
        hover:from-purple-100 hover:to-pink-100 dark:hover:from-[#2a2a3d] dark:hover:to-[#3b3b53]
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        transition-all duration-200">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="
        z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 dark:border-gray-700
        bg-white text-black dark:bg-[#1f1f2e] dark:text-white shadow-lg">
            <SelectItem value="EXPENSE" className="cursor-pointer px-4 py-2 hover:bg-purple-100 text-gray-900 bg-color-white dark:text-white dark:hover:bg-[#2a2a3d] dark:hover:text-white transition-colors">Expense</SelectItem>
            <SelectItem value="INCOME" className="cursor-pointer px-4 py-2 hover:bg-purple-100 text-gray-900 bg-color-white dark:text-white dark:hover:bg-[#2a2a3d] dark:hover:text-white transition-colors">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} className="
        w-full px-4 py-2 rounded-md border shadow-sm
        bg-gradient-to-r from-white to-purple-100 text-gray-900 
        dark:from-[#1f1f2e] dark:to-[#2c2c3e] dark:text-white
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        transition-all duration-200" />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>
    {/*account*/}
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
            <SelectTrigger className="
          w-full px-4 py-2 rounded-md shadow-sm border
          bg-gradient-to-r from-white to-purple-100 text-gray-900
          dark:from-[#1f1f2e] dark:to-[#2c2c3e] dark:text-white dark:hover:text-white
          hover:from-purple-100 hover:to-pink-100 dark:hover:from-[#2a2a3d] dark:hover:to-[#3b3b53]
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          transition-all duration-200">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1f1f2e] dark:hover:text-white dark:text-white text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg rounded-md"
            >
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="px-4 py-2cursor-pointer px-4 py-2 hover:bg-purple-100 text-gray-900 bg-color-white dark:text-white dark:hover:bg-[#2a2a3d] dark:hover:text-white transition-colors">
                  {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm dark:text-purple-400 text-left hover:bg-purple-100 dark:hover:bg-[#2a2a3d] transition-colors">+ Create Account</Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select onValueChange={(value) => setValue("category", value)} defaultValue={getValues("category")}>
          <SelectTrigger className="
        w-full px-4 py-2 rounded-md shadow-sm border
        bg-gradient-to-r from-white to-purple-100 text-gray-900
        dark:from-[#1f1f2e] dark:to-[#2c2c3e] dark:text-white dark:hover:text-white
        hover:from-purple-100 hover:to-pink-100 dark:hover:from-[#2a2a3d] dark:hover:to-[#3b3b53]
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        transition-all duration-200">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#1f1f2e] text-gray-900 dark:text-white border dark:hover:text-white border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="px-4 py-2 hover:bg-purple-100 dark:text-white dark:hover:text-white dark:hover:bg-[#2a2a3d] cursor-pointer transition-colors">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-2 ">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}>
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm dark:text-[#1f1f2e] font-semibold">Description</label>
        <Input className="dark:bg-[#1f1f2e] dark:text-white" placeholder="Enter description" {...register("description")} />
        {errors.description && <p className="text-sm dark:text-white text-red-500">{errors.description.message}</p>}
      </div>

      {/* Split Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium dark:text-[#1f1f2e] font-semibold">Split With</label>
        {fields.map((field, index) => (
          <div key={field.id} className="grid md:grid-cols-3 gap-2 items-center border p-2 rounded-md">
            <Input className="dark:text-[#1f1f2e] placeholder:text-[#1f1f2e]" placeholder="Name" {...register(`splits.${index}.name`)} />
            <Input  className="dark:text-[#1f1f2e] placeholder:text-[#1f1f2e]" type="number" step="0.01" placeholder="Amount" {...register(`splits.${index}.amount`)} />
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register(`splits.${index}.paid`)} />
              <label className="text-sm">Paid</label>
              <Button type="button" variant="ghost" onClick={() => remove(index)}>Remove</Button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => append({ name: "", amount: "", paid: false })}>
            + Add Split
          </Button>
          <Button type="button" variant="ghost" onClick={handleEqualSplit}>
            Equal Split
          </Button>
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base dark:text-[#1f1f2e] font-medium font-medium">Recurring Transaction</label>
          <div className="text-sm dark:text-gray-700">Set up a recurring schedule for this transaction</div>
        </div>
        <Switch checked={isRecurring} onCheckedChange={(checked) => setValue("isRecurring", checked)} />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select onValueChange={(value) => setValue("recurringInterval", value)} defaultValue={getValues("recurringInterval")}>
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}

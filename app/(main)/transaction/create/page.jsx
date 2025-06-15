import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const editId = searchParams?.edit; 

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 sm:px-6 lg:px-8 bg-transparent">
  <div className="max-w-3xl mx-auto">
    <div className="rounded-xl p-6 bg-transparent shadow-md ">
    <div className="mb-8 text-center md:text-left">
      <h1 className="text-5xl font-bold text-purple-900 dark:text-white">Add Transaction</h1>
    </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  </div>
</div>
  );
}

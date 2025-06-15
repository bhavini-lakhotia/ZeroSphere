import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout() {
  return (
    <div className="min-h-screen w-full">
      <Suspense
        fallback={
          <div className="w-full pt-8 px-4">
            <BarLoader width={"100%"} color="#9333ea" />
          </div>
        }
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
}

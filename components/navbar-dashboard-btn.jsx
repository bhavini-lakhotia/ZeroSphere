"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";

export default function DashboardNavButton() {
  const pathname = usePathname();
  const isActive = pathname === "/dashboard";

  return (
    <Link href="/dashboard">
      <Button
        variant={isActive ? "solidPurple" : "ghost"}
        className="flex items-center gap-2"
        aria-current={isActive ? "page" : undefined}
      >
        <LayoutDashboard size={18} className="shrink-0" />
        <span className="hidden md:inline">Dashboard</span>
      </Button>

    </Link>
  );
}

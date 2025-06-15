"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import ThemeToggleWrapper from "./theme-toggle-wrapper";
import DashboardNavButton from "./navbar-dashboard-btn";
import { usePathname } from "next/navigation";

const Header = () => {
  const [loginToggle, setLoginToggle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();

  // Check if current route is dashboard
  const isDashboardPage = pathname?.startsWith("/dashboard");

  // Detect theme
  useEffect(() => {
    const getDarkModeStatus = () =>
      document.documentElement.classList.contains("dark");

    setIsDarkMode(getDarkModeStatus());

    const observer = new MutationObserver(() => {
      setIsDarkMode(getDarkModeStatus());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Detect if scrolled past hero (only for non-dashboard pages)
  useEffect(() => {
    if (isDashboardPage) {
      setPastHero(true); // Always past-hero in dashboard
      return;
    }

    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isDashboardPage]);

  const logoSrc = () => {
    if (!pastHero) return "/ZeroSphere_logo.svg";
    return isDarkMode
      ? "/ZeroSphere_logo_light.svg"
      : "/ZeroSphere_logo_dark.svg";
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 backdrop-blur-md bg-transparent transition-all duration-500">
      <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center h-full">
          <button
            className="rounded-xl px-3 py-2 transition-transform duration-1000 hover:scale-110"
            aria-label="ZeroSphere home"
          >
            <Image
              src={logoSrc()}
              alt="ZeroSphere Logo"
              width={120}
              height={32}
              className={`max-h-10 w-auto object-contain transition-all duration-300 ${
                isDarkMode
                  ? "logo-gradient-dark brightness-125"
                  : "logo-gradient-light brightness-105"
              }`}
              priority
            />
          </button>
        </Link>

        {/* Nav Links */}
        <SignedOut>
  <div className="hidden md:flex items-center space-x-4 mr-4">
    <Button
      variant="ghost"
      className="text-lg font-extrabold italic text-neutral-900 dark:text-white/80 hover:text-purple-900 dark:hover:text-white px-3 py-2"
      onClick={() =>
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
      }
    >
      Features
    </Button>
  </div>
</SignedOut>


        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          <ThemeToggleWrapper />
          <SignedIn>
            <DashboardNavButton highlightGradient />
            <a href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </a>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                className={`bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600 transition-colors duration-300 ${
                  loginToggle ? "bg-[#a084ca] text-[#18122B]" : ""
                }`}
                onClick={() => setLoginToggle((prev) => !prev)}
              >
                {loginToggle ? "Welcome!" : "Login"}
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
  
};

export default Header;

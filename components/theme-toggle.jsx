"use client";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure theme is applied on client only
    useEffect(() => {
        setMounted(true);
    }, []);

    // Add smooth theme transition
    useEffect(() => {
        if (!mounted) return;
        const body = document.body;
        body.classList.add("theme-transition");
        const timeout = setTimeout(() => {
            body.classList.remove("theme-transition");
        }, 400);
        return () => clearTimeout(timeout);
    }, [resolvedTheme, mounted]);

    if (!mounted) return <div className="w-12 h-8" aria-hidden="true" />;

    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <Sun className="w-5 h-5 text-purple-900 dark:text-white transition-colors duration-300" />
            <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
                className="mx-1 transition-colors duration-300"
            />
            <Moon className="w-5 h-5 text-white dark:text-purple-900 transition-colors duration-300" />
        </label>
    );
}

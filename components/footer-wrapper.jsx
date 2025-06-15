"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function FooterWrapper() {
  const pathname = usePathname();
  const showFooter = pathname === "/";

  if (!showFooter) return null;

  return (
    <footer className="bg-white py-10 border-t border-blue-100">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 space-y-4">
        <div className="flex flex-wrap justify-center gap-6 text-black font-medium">
          <Link href="#features" className="hover:underline">
            Features
          </Link>
          
          <Link href="#about" className="hover:underline">
            About
          </Link>
        </div>

        <p>&copy; {new Date().getFullYear()} ZeroSphere. All rights reserved.</p>
      </div>
    </footer>
  );
}

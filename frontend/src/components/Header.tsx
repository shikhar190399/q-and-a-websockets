"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn, getUsername, removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check auth status on mount
    setLoggedIn(isLoggedIn());
    setUsername(getUsername());
  }, []);

  const handleLogout = () => {
    removeToken();
    setLoggedIn(false);
    setUsername(null);
    router.push("/dashboard");
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold hover:text-blue-400 transition">
          Q&A Dashboard
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {loggedIn ? (
            <>
              <span className="text-slate-300">
                Welcome, <span className="font-semibold text-white">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-blue-400 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main app page after 2 seconds
    const timer = setTimeout(() => {
      router.push("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-red-500 animate-pulse">
        Welcome to StudyHub!
      </h1>
    </div>
  );
}

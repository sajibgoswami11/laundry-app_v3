"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    switch (session.user.role) {
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
      case "SHOP_OWNER":
        router.push("/dashboard/shop");
        break;
      case "CUSTOMER":
        router.push("/dashboard/user");
        break;
      default:
        router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
} 
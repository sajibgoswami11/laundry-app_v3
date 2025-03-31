"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import UsersManagement from "@/components/admin/UsersManagement";
import ShopsManagement from "@/components/admin/ShopsManagement";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "shops">("users");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users Management
              </button>
              <button
                onClick={() => setActiveTab("shops")}
                className={`${
                  activeTab === "shops"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Shops Management
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "users" ? <UsersManagement /> : <ShopsManagement />}
          </div>
        </div>
      </main>
    </div>
  );
} 
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  services: Service[];
  owner: {
    name: string;
    phone: string;
  };
}

export default function ShopsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
      return;
    }

    const fetchShops = async () => {
      try {
        const response = await fetch("/api/shops");
        if (!response.ok) {
          throw new Error("Failed to fetch shops");
        }
        const data = await response.json();
        setShops(data);
      } catch (error) {
        setError("Error loading shops. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Laundry Shop</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {shop.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {shop.address}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{shop.description}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Services</h3>
                    <ul className="mt-2 space-y-1">
                      {shop.services.map((service) => (
                        <li
                          key={service.id}
                          className="text-sm text-gray-600 flex justify-between"
                        >
                          <span>{service.name}</span>
                          <span>${service.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        console.log("Navigating to shop ID:", shop.id);
                        router.push(`/dashboard/user/shops/${shop.id}`);
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
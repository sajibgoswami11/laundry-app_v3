"use client";

import { useEffect, useState } from "react";

interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  isApproved: boolean;
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ShopsManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const handleShopApproval = async (shopId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shop approval status");
      }

      const updatedShop = await response.json();
      setShops((prev) =>
        prev.map((shop) =>
          shop.id === shopId ? { ...shop, isApproved: updatedShop.isApproved } : shop
        )
      );
    } catch (error) {
      setError("Error updating shop approval status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Shops Management</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.owner.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{shop.phone}</div>
                    <div className="text-gray-500">{shop.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {shop.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        shop.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {shop.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleShopApproval(shop.id, !shop.isApproved)}
                      className={`${
                        shop.isApproved
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white px-3 py-1 rounded-md text-sm`}
                    >
                      {shop.isApproved ? "Revoke" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
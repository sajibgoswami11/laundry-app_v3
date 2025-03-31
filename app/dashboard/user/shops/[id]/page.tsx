"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import { useCart } from "@/contexts/CartContext";
import Cart from "@/components/Cart";

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

interface OrderItem {
  serviceId: string;
  quantity: number;
}

export default function ShopDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const { items, addItem } = useCart();

  // Unwrap the params object
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setShopId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (status === "loading" || !shopId) return;

    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
      return;
    }

    const fetchShop = async () => {
      try {
        const response = await fetch(`/api/shops/${shopId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch shop details");
        }
        const data = await response.json();
        setShop(data);
      } catch (error) {
        setError("Error loading shop details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShop();
  }, [session, status, router, shopId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Shop not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {shop.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {shop.description}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shop.address}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shop.phone}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shop.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shop.name}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shop.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {service.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">
                        ${service.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          addItem({
                            serviceId: service.id,
                            serviceName: service.name,
                            price: service.price,
                            quantity: 1,
                          })
                        }
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setShowCart(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <span>Cart ({items.length})</span>
              <span className="ml-2">${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </main>

      {showCart && (
        <Cart shopId={shop.id} onClose={() => setShowCart(false)} />
      )}
    </div>
  );
}
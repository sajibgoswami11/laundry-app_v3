"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";

interface Order {
  id: string;
  total: number;
  status: string;
  pickupTime: string;
  deliveryTime: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    quantity: number;
    price: number;
    service: {
      name: string;
    };
  }[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface NewService {
  name: string;
  description: string;
  price: number;
}

export default function ShopDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState<NewService>({
    name: "",
    description: "",
    price: 0,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "SHOP_OWNER") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data for shop owner:", session?.user?.id);

        const [ordersRes, servicesRes] = await Promise.all([
          fetch("/api/orders", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/shops/services", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        console.log("Orders response status:", ordersRes.status);
        console.log("Services response status:", servicesRes.status);

        if (!ordersRes.ok) {
          const errorData = await ordersRes.json();
          console.error("Orders API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch orders");
        }

        if (!servicesRes.ok) {
          const errorData = await servicesRes.json();
          console.error("Services API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch services");
        }

        const [ordersData, servicesData] = await Promise.all([
          ordersRes.json(),
          servicesRes.json(),
        ]);

        console.log("Fetched orders:", ordersData);
        console.log("Fetched services:", servicesData);

        setOrders(ordersData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Error loading data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      const updatedOrder = await response.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: updatedOrder.status } : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      setError(error instanceof Error ? error.message : "Error updating order status. Please try again.");
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shops/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newService),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add service");
      }

      const service = await response.json();
      setServices((prev) => [...prev, service]);
      setShowAddService(false);
      setNewService({ name: "", description: "", price: 0 });
    } catch (error) {
      console.error("Error adding service:", error);
      setError(error instanceof Error ? error.message : "Error adding service. Please try again.");
    }
  };

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
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Shop Dashboard
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
                {error}
              </div>
            )}

            {/* Services Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Services
                </h2>
                <button
                  onClick={() => setShowAddService(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Add New Service
                </button>
              </div>

              {showAddService && (
                <form onSubmit={handleAddService} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Service Name
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newService.name}
                        onChange={(e) =>
                          setNewService({ ...newService, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newService.description}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Add Service
                    </button>
                  </div>
                </form>
              )}

              {services.length === 0 ? (
                <p className="text-gray-500">No services added yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        ${service.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recent Orders
              </h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
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
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order.id, e.target.value)
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="ACCEPTED">Accepted</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="READY">Ready</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
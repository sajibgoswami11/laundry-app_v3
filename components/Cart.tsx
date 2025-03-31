"use client";

import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartProps {
  shopId: string;
  onClose: () => void;
}

export default function Cart({ shopId, onClose }: CartProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const router = useRouter();

  const handleCheckout = async () => {
    if (!pickupTime || !deliveryTime) {
      alert("Please select pickup and delivery times");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId,
          items: items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: item.price,
          })),
          pickupTime,
          deliveryTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      clearCart();
      onClose();
      router.push("/dashboard/user/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.serviceId}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <h3 className="font-medium">{item.serviceName}</h3>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.serviceId, Math.max(0, item.quantity - 1))
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.serviceId, item.quantity + 1)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.serviceId)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pickup Time
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Time
                    </label>
                    <input
                      type="datetime-local"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
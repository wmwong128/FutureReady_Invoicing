// update customer details
import { useMutation } from "@tanstack/react-query";
import type { Customer } from "@/data/types/Customer";

export function useUpdateCustomer(id: string) {
  return useMutation<Customer, Error, Partial<Customer>>({
    mutationFn: async (updates: Partial<Customer>) => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_MAIN_URL}/client/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      return response.json();
    },
  });
}

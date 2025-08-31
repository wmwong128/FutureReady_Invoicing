// fetch with id
import type { Customer } from "@/data/types/Customer";
import useMachine from "./useMachine";

export function useCustomerById(id: string) {
  const query = useMachine({
    url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/client/${id}`,
  });

  const customerData = query.data as Customer;

  return {
    customerData,
    ...query, // exposes isLoading, error, refetch, etc.
  };
}
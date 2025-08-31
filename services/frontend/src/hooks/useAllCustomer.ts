// fetch all customer
import type { Customer } from "@/data/types/Customer";
import useMachine from "./useMachine";

type CustomerResponse = {
  totalclients: number;
  averagepaymentdays: number;
  highriskcounts: number;
  allrevenue: number;
  customers: Customer[];
};

export function useAllCustomer() {
  const query = useMachine({
    url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/client`,
  });

  const data = query.data as CustomerResponse | undefined;

  return {
    customersData: data?.customers ?? [],
    totalclients: data?.totalclients ?? 0,
    averagepaymentdays: data?.averagepaymentdays ?? 0,
    highriskcounts: data?.highriskcounts ?? 0,
    allrevenue: data?.allrevenue ?? 0,
    ...query,
  };
}

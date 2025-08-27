// fetch all customer
import type { Customer } from "@/data/types/Customer";
import useMachine from "./useMachine";

export function useCustomer() {
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/customers`,
    });
    const customersData = query.data as Customer[]; //backend return array

    return {
        customersData, ...query
    }
}
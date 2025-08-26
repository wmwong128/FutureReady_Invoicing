import type { DashboardResponse } from "@/data/types/Dashboard";
import useMachine from "./useMachine";

export function useDashboard() {
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/`,
    });
    const dashboardData = query.data as DashboardResponse;

    return {
        dashboardData,
    }
}
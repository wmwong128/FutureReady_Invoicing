import type { DashboardResponse } from "@/data/types/Dashboard";
import useMachine from "./useMachine";
import { useAuth0 } from "@auth0/auth0-react";

export function useDashboard() {
    const { user } = useAuth0()
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/?issueremail=${user?.email}`,
    });
    const dashboardData = query.data as DashboardResponse;

    return {
        dashboardData,
    }
}
import type { DashboardData, DashboardResponse, RevenueTrend } from "@/data/types/Dashboard";
import useMachine from "./useMachine";
import { useAuth0 } from "@auth0/auth0-react";
import useMachineMutation from "./useMachineMutation";

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

export function useChatBot() {
    const askChatBot = useMachineMutation({
        url: `${import.meta.env.VITE_AI_MAIN_URL}/chat`,
        method: "POST",
    })

    return { askChatBot };
}
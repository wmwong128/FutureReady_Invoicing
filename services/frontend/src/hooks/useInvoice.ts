import type { Invoice, InvoiceReponse, InvoiceStats } from "@/data/types/Invoice";
import useMachine from "./useMachine";
import { useCallback } from "react";

export function useInvoiceManagement() {
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice`,
    });
    const data = query.data as InvoiceReponse;

    const stats: InvoiceStats = data;
    const invoices: Invoice[] = data?.invoices ?? [];
    const draftInvoices: Invoice[] = data?.draftInvoices ?? [];

    return {
        stats,
        invoices,
        draftInvoices,
    }
}

export function useInvoiceStripeView() {
    const viewInvoicePDF = useCallback(async (id: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice/${id}/stripepreview`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/pdf",
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetcg PDF");

            const blob = await response.blob();
            const pdfURL = URL.createObjectURL(blob);
            window.open(pdfURL, "_blank");
        } catch (error) {
            console.error(error);
            alert("Unable to load PDF");
        }
    }, []);
    return { viewInvoicePDF };
}
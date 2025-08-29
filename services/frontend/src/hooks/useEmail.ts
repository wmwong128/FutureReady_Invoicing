import { useMemo } from "react"
import useMachine from "./useMachine"

export interface MailData {
  emailHtml: string;
  clientName: string;
  invoiceId: string;
  reminderStage: "First Reminder" | "Second Reminder" | "Final Reminder" | "Due Inform";
  sentDate: string;
  sentTime: string;
  notes: string;
}

export default function useEmail() {
  const query = useMachine({
    url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/followup`,
    queryOptions: { queryKey: ["followup-emails"] }
  })

  const emailsData = useMemo(
    () => (query.data as MailData[]) ?? [],
    [query.data]
  )

  return { ...query, emailsData }
}

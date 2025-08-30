import useMachine from "./useMachine";

export interface mailData {
  emailhtml: string;
  client: string;
  invoicenumber: string;
  followupstage: number;
  reminderStage: string;
  sentDate: string;
  sentTime: string;
  notes: string;
}

export interface FollowUpResponse {
  totalEmail: number;
  firstReminder: number;
  finalReminder: number;
  dueInform: number;
  invoice: mailData[];
}

function mapReminderStage(stage: number): string {
  switch (stage) {
    case 1: return "First Reminder";
    case 2: return "Second Reminder";
    case 3: return "Final Reminder";
    case 4: return "Due Inform";
    default: return "Unknown";
  }
}

export function useEmail(issuerEmail: string) {
  const query = useMachine({
    url: `/followup/${issuerEmail}`,
  });

  const rawData = query.data as FollowUpResponse[] | undefined;

  let data: mailData[] = [];
  if (rawData && rawData.length > 0) {
    data = rawData[0].invoice.map((inv) => ({
      emailhtml: inv.emailhtml,
      client: inv.client,
      invoicenumber: inv.invoicenumber,
      followupstage: inv.followupstage,
      reminderStage: mapReminderStage(inv.followupstage),
      sentDate: inv.sentDate,
      sentTime: inv.sentTime,
      notes: inv.notes || "",
    }));
  }

  return {
    data,
    loading: query.isLoading,
    error: query.error,
  };
}

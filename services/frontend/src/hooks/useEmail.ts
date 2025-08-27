/* import { useMutation } from "@tanstack/react-query";
import useMachine from "./useMachine";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export function useEmail() {
  return useMutation({
    mutationFn: async (payload: EmailPayload) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      return response.json();
    },
  });
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

fetch(`${backendUrl}/your-endpoint`, {
  method: 'GET', // or 'POST', etc.
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
 */
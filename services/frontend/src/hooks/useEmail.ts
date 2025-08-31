import { useState, useEffect } from 'react';
import useM2MAuth from './useM2MAuth';

export interface mailData {
  _id: string;
  emailhtml: string;
  client: string;
  invoicenumber: string;
  followupstage: number;
  reminderstage: string;
  sentDate: string;
  sentTime: string;
  notes: string | null;
  riskscore?: number;
  risk?: string;
  stripeinvoiceid?: string;
  issueremail?: string;
  ordernumber?: number;
  invoicedate?: string;
  duedate?: string;
  status?: string;
  subtotal?: number;
  taxrate?: number;
  taxamount?: number;
  totalamount?: number;
  paymentmethod?: string | null;
  paymentdate?: string | null;
  payday?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUpResponse {
  totalEmail: number;
  firstReminder: number;
  finalReminder: number;
  dueInform: number;
  invoice: mailData[];
}

export function useEmail(issuerEmail: string) {
  const authResult = useM2MAuth();
  const [data, setData] = useState<mailData[]>([]);
  const [stats, setStats] = useState({
    totalEmail: 0,
    firstReminder: 0,
    finalReminder: 0,
    dueInform: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authResultData =
    typeof authResult.data === 'object' ? (authResult.data as object) : null;
  const accessToken =
    authResultData && 'access_token' in authResultData
      ? (authResultData['access_token'] as string)
      : null;
  const tokenType =
    authResultData && 'token_type' in authResultData
      ? (authResultData['token_type'] as string)
      : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Encode the email properly
        const encodedEmail = encodeURIComponent(issuerEmail);
        console.log(
          'Fetching data for email:',
          issuerEmail,
          'Encoded:',
          encodedEmail
        );

        // Use the full URL to avoid CORS issues
        const apiUrl = `http://localhost:8080/followup/${encodedEmail}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `${tokenType} ${accessToken}`,
          },
        });

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error details:', errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text.substring(0, 500));
          throw new Error('API did not return JSON. Received: ' + contentType);
        }

        const rawData = await response.json();
        console.log('Raw API response:', rawData);

        // Process the data as before
        const responseData =
          rawData && rawData.length > 0
            ? rawData[0]
            : {
                totalEmail: 0,
                firstReminder: 0,
                finalReminder: 0,
                dueInform: 0,
                invoice: [],
              };

        setData(responseData.invoice);
        setStats({
          totalEmail: responseData.totalEmail,
          firstReminder: responseData.firstReminder,
          finalReminder: responseData.finalReminder,
          dueInform: responseData.dueInform,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err.message as string)
            : 'Error'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (issuerEmail) {
      fetchData();
    } else {
      console.error('No issuer email provided');
      setError('No issuer email provided');
      setIsLoading(false);
    }
  }, [issuerEmail]);

  return {
    data,
    stats,
    isLoading,
    error,
  };
}

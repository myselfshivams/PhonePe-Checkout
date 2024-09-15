import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import sha256 from 'sha256';
import uniqid from 'uniqid';

const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const APP_BE_URL = "http://localhost:3000";

const retry = async (fn: Function, retries = 3, delay = 5000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error.response?.status !== 429) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2); 
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const amount = parseInt(req.query.amount as string) || 100;
      const userId = "MUID123";
      const merchantTransactionId = uniqid();

      const normalPayLoad = {
        merchantId: MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100,
        redirectUrl: `${APP_BE_URL}/api/payment/validate/${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: "9999999999",
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      const bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
      const base64EncodedPayload = bufferObj.toString("base64");

      const string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
      const sha256_val = sha256(string);
      const xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

      const response = await retry(() => axios.post(
        `${PHONE_PE_HOST_URL}/pg/v1/pay`,
        { request: base64EncodedPayload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
          },
        }
      ));

      res.status(200).json(response.data);
    } catch (error: any) {
      console.error('Error initiating payment:', error.message, error.response?.data);
      res.status(500).json({ error: 'Payment initiation failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import sha256 from 'sha256';

const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { merchantTransactionId } = req.query;

  if (!merchantTransactionId) {
    return res.status(400).json({ error: 'Missing merchant transaction ID' });
  }

  try {
    const string = `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
    const sha256_val = sha256(string);
    const xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    const response = await axios.get(
      `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          accept: "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      res.status(200).json({ success: true, status: response.data });
    } else {
      res.status(200).json({ success: false, status: response.data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment validation failed', details: (error as Error).message });
  }
}

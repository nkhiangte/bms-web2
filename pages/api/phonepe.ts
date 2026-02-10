// IMPORTANT: THIS FILE SIMULATES A BACKEND SERVER.
// In a real production environment, this code MUST run on a server (e.g., Firebase Cloud Functions or a Node.js server)
// to protect your Merchant ID and Salt Key. Exposing these in client-side code is a major security risk.

import { db } from '../../firebaseConfig';

const MERCHANT_ID = process.env.VITE_PHONEPE_MERCHANT_ID || '';
const SALT_KEY = process.env.VITE_PHONEPE_SALT_KEY || '';
const SALT_INDEX = parseInt(process.env.VITE_PHONEPE_SALT_INDEX || '1', 10);

// Use the PhonePe sandbox URL for testing
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PAY_API_ENDPOINT = "/pg/v1/pay";
const STATUS_API_ENDPOINT = "/pg/v1/status";

// Helper function to perform SHA256 hashing using the browser's SubtleCrypto API
async function sha256(str: string): Promise<string> {
    const textAsBuffer = new TextEncoder().encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Initiates a payment with PhonePe.
 * @param amount - The amount to be paid, in paisa (e.g., 100 for ₹1.00).
 * @param admissionId - The unique ID of the admission application.
 * @returns An object with the redirect URL for payment.
 */
export const initiatePhonePePayment = async (amount: number, admissionId: string) => {
    const merchantTransactionId = `MT_${admissionId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
    const userId = "MUID_" + Date.now(); // A unique ID for the user

    // The payload for the PhonePe API
    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount,
        redirectUrl: `${window.location.origin}/payment-status/${merchantTransactionId}`,
        redirectMode: "POST", // The user will be redirected back to your site via POST
        callbackUrl: `https://webhook.site/callback-url`, // A server-to-server callback URL (requires a real backend)
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    // 1. Create a transaction record in Firestore to link PhonePe's transaction with your admission ID
    try {
        await db.collection('transactions').doc(merchantTransactionId).set({
            admissionId: admissionId,
            amount: amount,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error creating transaction record in Firestore:", error);
        throw new Error("Could not initiate payment. Failed to create a transaction record.");
    }

    // 2. Base64 encode the payload
    const base64Payload = btoa(JSON.stringify(payload));

    // 3. Generate the checksum (X-VERIFY header)
    const stringToHash = base64Payload + PAY_API_ENDPOINT + SALT_KEY;
    const sha256Hash = await sha256(stringToHash);
    const checksum = `${sha256Hash}###${SALT_INDEX}`;

    // 4. Make the API call to PhonePe
    const response = await fetch(`${PHONEPE_HOST_URL}${PAY_API_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
        },
        body: JSON.stringify({ request: base64Payload }),
    });

    const responseData = await response.json();

    if (responseData.success) {
        return {
            redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
            merchantTransactionId: merchantTransactionId
        };
    } else {
        console.error("PhonePe API Error:", responseData);
        throw new Error(responseData.message || "Failed to initiate payment with PhonePe.");
    }
};


/**
 * Checks the status of a PhonePe transaction.
 * @param merchantTransactionId - The unique transaction ID generated during initiation.
 * @returns The status response from the PhonePe API.
 */
export const checkPhonePeStatus = async (merchantTransactionId: string) => {
    const apiPath = `${STATUS_API_ENDPOINT}/${MERCHANT_ID}/${merchantTransactionId}`;
    
    // 1. Generate the checksum for the status check API
    const stringToHash = apiPath + SALT_KEY;
    const sha256Hash = await sha256(stringToHash);
    const checksum = `${sha256Hash}###${SALT_INDEX}`;

    // 2. Make the API call to PhonePe's status endpoint
    const response = await fetch(`${PHONEPE_HOST_URL}${apiPath}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID,
        },
    });

    const responseData = await response.json();

    if (!response.ok) {
        console.error("PhonePe Status API Error:", responseData);
        throw new Error(responseData.message || 'Failed to check payment status.');
    }

    return responseData;
};

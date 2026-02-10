import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { NotificationType } from '../../types';
import { checkPhonePeStatus } from '../api/phonepe';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon } from '../../components/Icons';

const { useParams, Link } = ReactRouterDOM as any;

interface PaymentStatusPageProps {
    addNotification: (message: string, type: NotificationType, title?: string) => void;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ addNotification }) => {
    const { merchantTransactionId } = useParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('Verifying your payment, please wait...');

    useEffect(() => {
        if (!merchantTransactionId) {
            setStatus('failed');
            setMessage('Invalid transaction ID. Unable to verify payment.');
            return;
        }

        const pollStatus = async () => {
            try {
                const response = await checkPhonePeStatus(merchantTransactionId);
                console.log("PhonePe Status Response:", response);

                if (response.success && response.code === 'PAYMENT_SUCCESS') {
                    // Payment is successful, now update Firestore
                    const transactionRef = db.collection('transactions').doc(merchantTransactionId);
                    const transactionDoc = await transactionRef.get();

                    if (transactionDoc.exists) {
                        const { admissionId } = transactionDoc.data()!;
                        
                        // Update admission record
                        await db.collection('online_admissions').doc(admissionId).update({
                            paymentStatus: 'paid',
                            paymentTransactionId: merchantTransactionId,
                            status: 'approved' // Automatically approve on successful payment
                        });

                        // Update local transaction status
                        await transactionRef.update({ status: 'SUCCESS' });
                        
                        setStatus('success');
                        setMessage('Payment successful! Your admission application has been updated.');
                        addNotification('Payment confirmed and application updated!', 'success');
                        return true; // Stop polling
                    } else {
                         throw new Error('Transaction record not found in database.');
                    }
                } else if (response.success && response.code === 'PAYMENT_PENDING') {
                    // Still pending, continue polling
                    return false;
                } else {
                    // Payment failed or other error code
                    throw new Error(response.message || 'Payment failed or was cancelled.');
                }

            } catch (error: any) {
                console.error('Error during payment verification:', error);
                setStatus('failed');
                setMessage(error.message || 'An error occurred while verifying your payment.');

                try {
                    const transactionRef = db.collection('transactions').doc(merchantTransactionId);
                    await transactionRef.update({ status: 'FAILED', errorMessage: error.message });
                } catch(dbError) {
                    console.error("Failed to update transaction status to FAILED", dbError);
                }

                return true; // Stop polling on failure
            }
        };

        // Polling mechanism
        const intervalId = setInterval(async () => {
            const isDone = await pollStatus();
            if (isDone) {
                clearInterval(intervalId);
            }
        }, 3000); // Poll every 3 seconds

        // Cleanup on component unmount
        return () => clearInterval(intervalId);

    }, [merchantTransactionId, addNotification]);

    const StatusDisplay = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <SpinnerIcon className="w-16 h-16 text-sky-500" />
                        <h1 className="text-3xl font-bold text-slate-800 mt-4">Processing Payment</h1>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
                        <h1 className="text-3xl font-bold text-slate-800 mt-4">Payment Successful</h1>
                    </>
                );
            case 'failed':
                 return (
                    <>
                        <XCircleIcon className="w-16 h-16 text-red-500" />
                        <h1 className="text-3xl font-bold text-slate-800 mt-4">Payment Failed</h1>
                    </>
                );
        }
    };

    return (
        <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-4">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center justify-center">
                        <StatusDisplay />
                        <p className="mt-4 text-lg text-slate-600">{message}</p>
                         <div className="mt-8">
                            {status === 'success' && <Link to="/admissions/status" className="btn btn-primary">Check Final Admission Status</Link>}
                            {status === 'failed' && <Link to="/admissions" className="btn btn-secondary">Return to Admissions</Link>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;
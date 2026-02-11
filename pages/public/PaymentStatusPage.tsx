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
    const { merchantTransactionId } = useParams() as { merchantTransactionId: string };
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
                        const { admissionId, amount } = transactionDoc.data()!;
                        
                        // Update admission record
                        await db.collection('online_admissions').doc(admissionId).update({
                            paymentStatus: 'paid',
                            paymentAmount: amount / 100, // convert paisa to rupees
                            paymentTransactionId: merchantTransactionId
                        });

                        // Update transaction record
                        await transactionRef.update({ status: 'SUCCESS' });
                        
                        setStatus('success');
                        setMessage('Payment successful! Your admission records have been updated.');
                        addNotification('Payment was successful!', 'success', 'Payment Confirmed');

                    } else {
                        setStatus('failed');
                        setMessage('Transaction record not found. Please contact administration.');
                        addNotification('Could not find transaction record.', 'error');
                    }
                } else {
                    // Payment failed or is in a non-successful state
                    const transactionRef = db.collection('transactions').doc(merchantTransactionId);
                    await transactionRef.update({ status: response.code || 'FAILED' });

                    setStatus('failed');
                    setMessage(response.message || 'Payment was not successful. Please try again.');
                    addNotification(response.message || 'Payment failed.', 'error');
                }
            } catch (error: any) {
                console.error('Error verifying payment:', error);
                setStatus('failed');
                setMessage('An error occurred while verifying your payment. Please contact administration if the amount was debited.');
                addNotification('Error verifying payment.', 'error');
            }
        };

        // Use a timeout to give PhonePe's server-to-server callback some time to process before polling client-side
        const timer = setTimeout(() => {
            pollStatus();
        }, 3000); // 3-second delay

        return () => clearTimeout(timer);
    }, [merchantTransactionId, addNotification]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8 text-center">
                {status === 'processing' && (
                    <>
                        <SpinnerIcon className="w-16 h-16 text-sky-500 mx-auto animate-spin" />
                        <h1 className="text-2xl font-bold text-slate-800 mt-4">Processing Payment...</h1>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-slate-800 mt-4">Payment Successful!</h1>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-slate-800 mt-4">Payment Failed</h1>
                    </>
                )}
                <p className="text-slate-600 mt-2">{message}</p>
                <div className="mt-8">
                    <Link to="/" className="btn btn-primary">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;

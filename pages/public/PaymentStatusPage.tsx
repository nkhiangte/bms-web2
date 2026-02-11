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
    // Fix: Cast untyped useParams call to specific type to resolve build error
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
                        const { admissionId } = transactionDoc.data()!;
                        
                        // Update admission record
                        await db.collection('online_admissions').doc(admissionId).
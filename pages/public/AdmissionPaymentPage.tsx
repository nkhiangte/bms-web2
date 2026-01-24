
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType } from '../../types';
import { ADMISSION_FEE_AMOUNT, NOTEBOOK_SET_PRICES, OTHER_ADMISSION_ITEMS, UNIFORM_ITEMS, UNIFORM_SIZES } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, UploadIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB, useScript } from '../../utils';

interface AdmissionPaymentPageProps {
    onUpdateAdmissionPayment: (admissionId: string, updates: { paymentAmount: number, purchasedItems: AdmissionItem[], paymentScreenshotUrl: string, paymentTransactionId: string }) => Promise<boolean>;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
}

const AdmissionPaymentPage: React.FC<AdmissionPaymentPageProps> = ({ onUpdateAdmissionPayment, addNotification }) => {
    const { admissionId } = useParams<{ admissionId: string }>();
    const location = useLocation();
    const razorpayStatus = useScript('https://checkout.razorpay.com/v1/checkout.js');
    
    const { grade, studentName, fatherName, contact } = location.state || {};

    const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string }>>({});
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');

    const notebookPrice = useMemo(() => (grade && NOTEBOOK_SET_PRICES[grade as Grade]) ? NOTEBOOK_SET_PRICES[grade as Grade] : 0, [grade]);

    // FIX: Ensured all items in the array have a consistent shape to prevent type errors.
    const allItems = useMemo(() => [
        { name: 'Admission Fee', price: ADMISSION_FEE_AMOUNT, mandatory: true, checkable: false, hasSize: false, sizes: undefined },
        { name: `Notebook Set (${grade})`, price: notebookPrice, mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        { name: 'ID Card', price: OTHER_ADMISSION_ITEMS['ID Card'], mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        { name: 'Diary', price: OTHER_ADMISSION_ITEMS['Diary'], mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        ...UNIFORM_ITEMS.map(item => ({ ...item, mandatory: false, checkable: true, hasSize: true })),
    ], [grade, notebookPrice]);

    useEffect(() => {
        // Pre-select mandatory items
        const mandatory: Record<string, { quantity: number; size?: string }> = {};
        allItems.forEach(item => {
            if (item.mandatory) {
                mandatory[item.name] = { quantity: 1 };
            }
        });
        setSelectedItems(mandatory);
    }, [allItems]);

    const totalCost = useMemo(() => {
        return Object.entries(selectedItems).reduce((total, [itemName, details]) => {
            const item = allItems.find(i => i.name === itemName);
            return total + (item ? item.price * details.quantity : 0);
        }, 0);
    }, [selectedItems, allItems]);

    const handleItemToggle = (itemName: string, isChecked: boolean) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (isChecked) {
                const item = allItems.find(i => i.name === itemName);
                newItems[itemName] = { quantity: 1, size: item?.hasSize ? UNIFORM_SIZES[0] : undefined };
            } else {
                delete newItems[itemName];
            }
            return newItems;
        });
    };
    
    const handleSizeChange = (itemName: string, size: string) => {
        setSelectedItems(prev => ({...prev, [itemName]: {...prev[itemName], size}}));
    };

    const displayRazorpay = async () => {
        if (!paymentScreenshot) {
            addNotification("Please upload the payment screenshot before proceeding.", 'error');
            return;
        }
        if (razorpayStatus !== 'ready') {
            addNotification("Payment gateway is not ready. Please wait a moment and try again.", 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const screenshotUrl = await uploadToImgBB(await resizeImage(paymentScreenshot, 800, 800, 0.8));
            
            const options = {
                key: process.env.VITE_RAZORPAY_KEY_ID,
                amount: totalCost * 100,
                currency: "INR",
                name: "Bethel Mission School",
                description: `Admission Payment for ${studentName}`,
                image: "https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png",
                handler: async (response: any) => {
                    const purchasedItems: AdmissionItem[] = Object.entries(selectedItems).map(([name, details]) => {
                        const item = allItems.find(i => i.name === name)!;
                        return { name, price: item.price, quantity: details.quantity, size: details.size };
                    });

                    const success = await onUpdateAdmissionPayment(admissionId!, {
                        paymentAmount: totalCost,
                        purchasedItems,
                        paymentScreenshotUrl: screenshotUrl,
                        paymentTransactionId: response.razorpay_payment_id,
                    });

                    if (success) {
                        setPaymentStatus('success');
                    } else {
                        setPaymentStatus('error');
                    }
                },
                prefill: { name: fatherName, contact: contact },
                theme: { color: "#0ea5e9" },
                modal: { ondismiss: () => setIsProcessing(false) }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', (response: any) => {
                addNotification(response.error.description, 'error', 'Payment Failed');
                setIsProcessing(false);
            });
            paymentObject.open();

        } catch (error) {
            console.error("Payment preparation failed:", error);
            addNotification("Failed to prepare payment. Please check your screenshot and try again.", 'error');
            setIsProcessing(false);
        }
    };
    
    if (paymentStatus === 'success') {
         return (
            <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto">
                    <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold text-slate-800">Application Submitted!</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Thank you for your interest in Bethel Mission School. Your application has been received successfully.
                        The school office will review your application and contact you shortly regarding the next steps.
                    </p>
                    <Link to="/" className="mt-8 btn btn-primary">Return to Homepage</Link>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'error') {
         return (
            <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-red-600">Payment Update Failed</h1>
                    <p className="mt-4 text-lg text-slate-600">Your payment was likely successful, but we failed to update your application record. Please contact the school office with your payment details.</p>
                    <Link to="/" className="mt-8 btn btn-secondary">Return to Homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-800">Admission Payment (Step 2 of 2)</h1>
                        <p className="mt-2 text-lg text-slate-600">Select items and complete the payment to finalize your application.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {allItems.map(item => (
                                <div key={item.name} className={`p-4 border rounded-lg flex items-center justify-between ${item.mandatory ? 'bg-slate-100' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        {item.checkable && <input type="checkbox" checked={!!selectedItems[item.name]} onChange={e => handleItemToggle(item.name, e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600"/>}
                                        <div>
                                            <p className={`font-bold ${item.mandatory ? 'text-slate-800' : ''}`}>{item.name}</p>
                                            <p className="text-sm text-slate-600">₹{item.price}</p>
                                        </div>
                                    </div>
                                    {item.hasSize && selectedItems[item.name] && (
                                        <select value={selectedItems[item.name]?.size} onChange={e => handleSizeChange(item.name, e.target.value)} className="form-select text-sm py-1">
                                            {item.sizes?.map(size => <option key={size} value={size}>Size: {size}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-slate-50 p-6 rounded-lg border sticky top-28">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Cart Summary</h3>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(selectedItems).map(([name, details]) => {
                                        const item = allItems.find(i => i.name === name);
                                        return (
                                            <div key={name} className="flex justify-between">
                                                <span className="text-slate-600">{name} {details.size && `(Size: ${details.size})`}</span>
                                                <span className="font-semibold">₹{item?.price}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{totalCost}</span>
                                </div>
                                
                                <div className="mt-6">
                                     <label className="block text-sm font-bold text-slate-800">Upload Payment Screenshot*</label>
                                     <div className="mt-1 flex items-center gap-3">
                                        <button type="button" onClick={() => document.getElementById('payment-ss-upload')?.click()} className="btn btn-secondary whitespace-nowrap w-full">
                                            <UploadIcon className="w-5 h-5"/> Choose File
                                        </button>
                                        <input type="file" id="payment-ss-upload" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} accept="image/jpeg,image/png,image/webp" className="hidden"/>
                                    </div>
                                    {paymentScreenshot && <p className="text-xs text-slate-600 mt-1 truncate">{paymentScreenshot.name}</p>}
                                </div>
                                
                                <button onClick={displayRazorpay} disabled={isProcessing} className="w-full btn btn-primary !py-3 !text-base mt-6">
                                    {isProcessing ? <SpinnerIcon className="w-6 h-6"/> : null}
                                    {isProcessing ? 'Processing...' : `Pay ₹${totalCost}`}
                                </button>
                                 <p className="text-xs text-slate-500 mt-2 text-center">You will be redirected to Razorpay.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPaymentPage;
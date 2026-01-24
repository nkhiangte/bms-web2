
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType } from '../../types';
import { ADMISSION_FEE_AMOUNT, NOTEBOOK_SET_PRICES, OTHER_ADMISSION_ITEMS, UNIFORM_ITEMS, UNIFORM_SIZES } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, UploadIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';

interface AdmissionPaymentPageProps {
    onUpdateAdmissionPayment: (admissionId: string, updates: { paymentAmount: number, purchasedItems: AdmissionItem[], paymentScreenshotUrl: string, paymentTransactionId: string }) => Promise<boolean>;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
}

const AdmissionPaymentPage: React.FC<AdmissionPaymentPageProps> = ({ onUpdateAdmissionPayment, addNotification }) => {
    const { admissionId } = useParams<{ admissionId: string }>();
    const location = useLocation();
    
    const { grade, studentName } = location.state || {};

    const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string }>>({});
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');

    const notebookPrice = useMemo(() => (grade && NOTEBOOK_SET_PRICES[grade as Grade]) ? NOTEBOOK_SET_PRICES[grade as Grade] : 0, [grade]);

    const allItems = useMemo(() => [
        { name: 'Admission Fee', price: ADMISSION_FEE_AMOUNT, mandatory: true, checkable: false, hasSize: false, sizes: undefined },
        { name: `Notebook Set (${grade})`, price: notebookPrice, mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        { name: 'ID Card', price: OTHER_ADMISSION_ITEMS['ID Card'], mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        { name: 'Diary', price: OTHER_ADMISSION_ITEMS['Diary'], mandatory: false, checkable: true, hasSize: false, sizes: undefined },
        ...UNIFORM_ITEMS.map(item => ({ ...item, mandatory: false, checkable: true, hasSize: true })),
    ], [grade, notebookPrice]);

    useEffect(() => {
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

    const handleSubmit = async () => {
        if (!paymentScreenshot) {
            addNotification("Please upload a screenshot of your successful payment.", 'error', 'Screenshot Required');
            return;
        }
        if (!transactionId.trim()) {
            addNotification("Please enter the UPI Transaction ID from your payment app.", 'error', 'Transaction ID Required');
            return;
        }

        setIsProcessing(true);
        try {
            const screenshotUrl = await uploadToImgBB(await resizeImage(paymentScreenshot, 800, 800, 0.8));
            
            const purchasedItems: AdmissionItem[] = Object.entries(selectedItems).map(([name, details]) => {
                const item = allItems.find(i => i.name === name)!;
                return { name, price: item.price, quantity: details.quantity, size: details.size };
            });

            const success = await onUpdateAdmissionPayment(admissionId!, {
                paymentAmount: totalCost,
                purchasedItems,
                paymentScreenshotUrl: screenshotUrl,
                paymentTransactionId: transactionId,
            });

            if (success) {
                setPaymentStatus('success');
            } else {
                throw new Error("Failed to update admission record on the server.");
            }
        } catch (error) {
            console.error("Payment submission failed:", error);
            addNotification("Failed to submit payment details. Please try again or contact the school office.", 'error', 'Submission Failed');
            setPaymentStatus('error');
        } finally {
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
                    <h1 className="text-3xl font-bold text-red-600">Submission Failed</h1>
                    <p className="mt-4 text-lg text-slate-600">We were unable to save your payment details. Please try again. If the problem persists, please contact the school office.</p>
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
                        <p className="mt-2 text-lg text-slate-600">Select items and complete the payment to finalize your application for <span className="font-bold">{studentName}</span>.</p>
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
                            <div className="bg-slate-50 p-6 rounded-lg border sticky top-28 space-y-6">
                                <div>
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
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Instructions</h3>
                                    <p className="text-sm text-slate-600 mb-4">Pay the total amount using the details below, then upload the screenshot to finalize.</p>
                                     <div className="flex justify-center">
                                        <img src="https://i.ibb.co/L8mC9gW/qr-code-placeholder.png" alt="UPI QR Code Placeholder" className="w-48 h-48 border p-1"/>
                                     </div>
                                     <p className="text-center font-semibold mt-2">UPI ID: <span className="text-sky-700">bethelmissionschool@upi</span></p>
                                </div>
                                
                                <div>
                                     <label className="block text-sm font-bold text-slate-800">UPI Transaction ID*</label>
                                     <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="form-input w-full mt-1" placeholder="Enter ID from your payment app" required/>
                                </div>

                                <div>
                                     <label className="block text-sm font-bold text-slate-800">Upload Payment Screenshot*</label>
                                     <div className="mt-1 flex items-center gap-3">
                                        <button type="button" onClick={() => document.getElementById('payment-ss-upload')?.click()} className="btn btn-secondary whitespace-nowrap w-full">
                                            <UploadIcon className="w-5 h-5"/> Choose File
                                        </button>
                                        <input type="file" id="payment-ss-upload" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} accept="image/jpeg,image/png,image/webp" className="hidden"/>
                                    </div>
                                    {paymentScreenshot && <p className="text-xs text-slate-600 mt-1 truncate">{paymentScreenshot.name}</p>}
                                </div>
                                
                                <button onClick={handleSubmit} disabled={isProcessing || !paymentScreenshot || !transactionId} className="w-full btn btn-primary !py-3 !text-base mt-2">
                                    {isProcessing ? <SpinnerIcon className="w-6 h-6"/> : null}
                                    {isProcessing ? 'Submitting...' : 'Submit Payment & Finalize Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPaymentPage;

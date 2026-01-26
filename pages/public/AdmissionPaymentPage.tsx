import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType } from '../../types';
import { ADMISSION_FEE_AMOUNT, NOTEBOOK_SET_PRICES, OTHER_ADMISSION_ITEMS, UNIFORM_ITEMS, UNIFORM_SIZES } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, UploadIcon, PrinterIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';
import { jsPDF } from 'jspdf';

interface AdmissionPaymentPageProps {
    onUpdateAdmissionPayment: (admissionId: string, updates: { paymentAmount: number, purchasedItems: AdmissionItem[], paymentScreenshotUrl: string, paymentTransactionId: string, billId: string }) => Promise<boolean>;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
    schoolConfig: { paymentQRCodeUrl?: string; upiId?: string };
}

const AdmissionPaymentPage: React.FC<AdmissionPaymentPageProps> = ({ onUpdateAdmissionPayment, addNotification, schoolConfig }) => {
    const { admissionId } = useParams<{ admissionId: string }>();
    const location = useLocation();
    
    const { grade, studentName, fatherName, contact } = location.state || {};

    const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string }>>({});
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
    
    const [billId] = useState(`BILL-${Math.floor(100000 + Math.random() * 900000)}`);

    // Use dynamic config or provided screenshot defaults. Fallback to a placeholder if missing.
    const upiId = schoolConfig.upiId || 'nkhiangte@oksbi';
    const qrCodeUrl = schoolConfig.paymentQRCodeUrl || 'https://via.placeholder.com/300x300.png?text=QR+Code+Not+Set';

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
        return (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).reduce((total, [itemName, details]) => {
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
        setSelectedItems(prev => {
            const item = prev[itemName];
            if (!item) return prev;
            return { ...prev, [itemName]: { ...item, size } };
        });
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
            
            const purchasedItems: AdmissionItem[] = (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([name, details]) => {
                const item = allItems.find(i => i.name === name)!;
                // FIX: Ensure size is null if undefined, as Firestore doesn't support undefined
                return { 
                    name, 
                    price: item.price, 
                    quantity: details.quantity, 
                    size: details.size || null 
                };
            });

            const success = await onUpdateAdmissionPayment(admissionId!, {
                paymentAmount: totalCost,
                purchasedItems,
                paymentScreenshotUrl: screenshotUrl,
                paymentTransactionId: transactionId,
                billId: billId,
            });

            if (success) {
                setPaymentStatus('success');
            } else {
                throw new Error("Failed to update admission record on the server.");
            }
        } catch (error: any) {
            console.error("Payment submission failed:", error);
            // Check for specific Firestore errors
            const errorMessage = error.message?.includes('undefined') 
                ? "Internal Error: Invalid data format. Please contact support." 
                : "Failed to submit payment details. Please try again.";
            
            addNotification(errorMessage, 'error', 'Submission Failed');
            setPaymentStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const generateReceipt = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("BETHEL MISSION SCHOOL", pageWidth / 2, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Bethel Veng, Champhai, Mizoram - 796321", pageWidth / 2, 26, { align: "center" });
        doc.text("ADMISSION & MERCHANDISE RECEIPT", pageWidth / 2, 32, { align: "center" });
        
        doc.setLineWidth(0.5);
        doc.line(10, 36, pageWidth - 10, 36);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Bill ID: ${billId}`, 15, 45);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 45, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.text(`Student Name: ${studentName}`, 15, 52);
        doc.text(`Father's Name: ${fatherName || 'N/A'}`, 15, 59);
        doc.text(`Class Applied: ${grade}`, pageWidth / 2 + 10, 52);
        doc.text(`Contact: ${contact || 'N/A'}`, pageWidth / 2 + 10, 59);
        
        let yPos = 70;
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Item Description", 20, yPos);
        doc.text("Size", 110, yPos);
        doc.text("Price", 140, yPos);
        doc.text("Amount", 180, yPos);
        
        yPos += 8;
        doc.setFont("helvetica", "normal");

        const items = Object.entries(selectedItems) as [string, { quantity: number; size?: string }][];
        items.forEach(([name, details]) => {
            const itemDef = allItems.find(i => i.name === name);
            const price = itemDef ? itemDef.price : 0;
            const amount = price * details.quantity;

            doc.text(name, 20, yPos);
            doc.text(details.size || '-', 110, yPos);
            doc.text(`${price}`, 140, yPos);
            doc.text(`${amount}`, 180, yPos);
            yPos += 7;
        });

        doc.line(15, yPos, pageWidth - 15, yPos);
        yPos += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Grand Total", 140, yPos);
        doc.text(`Rs. ${totalCost}`, 180, yPos);

        yPos += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Payment Mode: Online (UPI)`, 15, yPos);
        doc.text(`Transaction ID: ${transactionId}`, 15, yPos + 6);
        
        yPos += 20;
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.rect(15, yPos, pageWidth - 30, 25);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("STORE KEEPER INSTRUCTIONS:", 20, yPos + 6);
        doc.setFont("helvetica", "normal");
        doc.text("Please verify the Bill ID and Transaction ID before handing over the merchandise.", 20, yPos + 12);
        doc.text("Uniform sizes can be exchanged within 3 days if unused and unwashed.", 20, yPos + 18);

        doc.save(`${studentName}_BMS_Receipt.pdf`);
    };
    
    if (paymentStatus === 'success') {
         return (
            <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto px-4">
                    <CheckCircleIcon className="w-24 h-24 text-emerald-500 mx-auto mb-6"/>
                    <h1 className="text-3xl font-bold text-slate-800">Payment Successful!</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Your application for <strong>{studentName}</strong> has been finalized.
                    </p>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mt-8 text-left">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Payment Receipt</h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Bill ID:</span>
                            <span className="font-mono font-bold text-slate-800">{billId}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Transaction ID:</span>
                            <span className="font-mono font-bold text-slate-800">{transactionId}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-slate-600">Total Amount:</span>
                            <span className="font-bold text-emerald-600">₹{totalCost}</span>
                        </div>
                        <div className="bg-sky-50 p-3 rounded text-sm text-sky-800 mb-6">
                            <strong>Note:</strong> Please download this receipt and show it at the school store to collect your Uniforms, Books, and Diary.
                        </div>
                        <button onClick={generateReceipt} className="w-full btn btn-primary flex items-center justify-center gap-2">
                            <PrinterIcon className="w-5 h-5" /> Download Receipt
                        </button>
                    </div>
                    <Link to="/" className="mt-8 inline-block text-sky-600 font-semibold hover:underline">Return to Homepage</Link>
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
                                        {(Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([name, details]) => {
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
                                        <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 border p-1 bg-white shadow-sm"/>
                                     </div>
                                     <p className="text-center font-semibold mt-2">UPI ID: <span className="text-sky-700">{upiId}</span></p>
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
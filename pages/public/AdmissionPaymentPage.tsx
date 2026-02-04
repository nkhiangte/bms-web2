
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType, AdmissionSettings, User, OnlineAdmission } from '../../types';
import { SpinnerIcon, CheckCircleIcon, UploadIcon, PrinterIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';
import { jsPDF } from 'jspdf';
import { DEFAULT_ADMISSION_SETTINGS, UNIFORM_SIZES } from '../../constants';
import EditableContent from '../../components/EditableContent';
import { db } from '../../firebaseConfig';

const { useParams, useLocation, Link } = ReactRouterDOM as any;

interface AdmissionPaymentPageProps {
    onUpdateAdmissionPayment: (admissionId: string, updates: { paymentAmount: number, purchasedItems: AdmissionItem[], paymentScreenshotUrl: string, paymentTransactionId: string, billId: string }) => Promise<boolean>;
    addNotification: (message: string, type: NotificationType, title?: string) => void;
    schoolConfig: { paymentQRCodeUrl?: string; upiId?: string };
    admissionConfig?: AdmissionSettings; 
    user: User | null;
}

const AdmissionPaymentPage: React.FC<AdmissionPaymentPageProps> = ({ 
    onUpdateAdmissionPayment, 
    addNotification, 
    schoolConfig,
    admissionConfig = DEFAULT_ADMISSION_SETTINGS,
    user
}) => {
    // FIX: Removed the generic type argument from useParams as the ReactRouterDOM proxy object 
    // doesn't support generic calls directly in this setup.
    const { admissionId } = useParams();
    const location = useLocation();
    
    // State to hold admission details, possibly fetched from DB if not in location.state
    const [admissionDetails, setAdmissionDetails] = useState<{
        grade: string;
        studentName: string;
        fatherName: string;
        contact: string;
        studentType: 'Newcomer' | 'Existing';
    } | null>(null);

    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string }>>({});
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
    
    const [billId] = useState(`BILL-${Math.floor(100000 + Math.random() * 900000)}`);

    // Use dynamic config or provided screenshot defaults. Fallback to a placeholder if missing.
    const upiId = schoolConfig.upiId || 'nkhiangte@oksbi';
    const qrCodeUrl = schoolConfig.paymentQRCodeUrl || 'https://via.placeholder.com/300x300.png?text=QR+Code+Not+Set';

    useEffect(() => {
        const fetchDetails = async () => {
            if (location.state) {
                // Data exists in navigation state
                setAdmissionDetails({
                    grade: location.state.grade,
                    studentName: location.state.studentName,
                    fatherName: location.state.fatherName,
                    contact: location.state.contact,
                    studentType: location.state.studentType || 'Newcomer'
                });
                setIsLoadingDetails(false);
            } else if (admissionId) {
                // Fetch from Firestore
                try {
                    const docRef = db.collection('online_admissions').doc(admissionId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data() as OnlineAdmission;
                        setAdmissionDetails({
                            grade: data.admissionGrade,
                            studentName: data.studentName,
                            fatherName: data.fatherName,
                            contact: data.contactNumber,
                            studentType: data.studentType || 'Newcomer'
                        });
                        
                        // If already paid, set status to success immediately to show receipt
                        if (data.paymentStatus === 'paid') {
                             setPaymentStatus('success');
                        }
                    } else {
                        addNotification("Admission record not found.", 'error');
                    }
                } catch (error) {
                    console.error("Error fetching admission details:", error);
                    addNotification("Failed to load admission details.", 'error');
                } finally {
                    setIsLoadingDetails(false);
                }
            } else {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [admissionId, location.state]);

    const { grade, studentName, fatherName, contact, studentType } = admissionDetails || { studentType: 'Newcomer' };

    // Get the correct fee structure based on student type from dynamic config
    const feeStructure = useMemo(() => {
        const structures = admissionConfig.feeStructure || DEFAULT_ADMISSION_SETTINGS.feeStructure;
        return studentType === 'Existing' ? structures.existingStudent : structures.newStudent;
    }, [admissionConfig, studentType]);
    
    // Calculate Base Fee Total from the structured data
    const baseFeeTotal = useMemo(() => {
        if (!feeStructure) return 0;
        const oneTimeTotal = (feeStructure.oneTime || []).reduce((sum, item) => sum + item.amount, 0);
        const annualTotal = (feeStructure.annual || []).reduce((sum, item) => sum + item.amount, 0);
        return oneTimeTotal + annualTotal;
    }, [feeStructure]);

    const notebookPrice = useMemo(() => (grade && admissionConfig.notebookPrices[grade as Grade]) ? admissionConfig.notebookPrices[grade as Grade] : 0, [grade, admissionConfig.notebookPrices]);

    const allItems = useMemo(() => {
        // Start with optional/merchandise items. The main Admission Fees are now handled separately.
        const items = [
            { name: `Notebook Set (${grade})`, price: notebookPrice, mandatory: false, checkable: true, hasSize: false, sizes: undefined as string[] | undefined, priceBySize: undefined as Record<string, number> | undefined },
        ];

        admissionConfig.items.forEach(itemConfig => {
            items.push({
                name: itemConfig.name,
                price: itemConfig.price,
                priceBySize: itemConfig.priceBySize,
                mandatory: itemConfig.mandatory,
                checkable: !itemConfig.mandatory, // If not mandatory, it's checkable (optional)
                hasSize: itemConfig.type === 'uniform',
                sizes: itemConfig.type === 'uniform' ? UNIFORM_SIZES : undefined
            });
        });

        return items;
    }, [grade, notebookPrice, admissionConfig]);

    useEffect(() => {
        const mandatory: Record<string, { quantity: number; size?: string }> = {};
        allItems.forEach(item => {
            if (item.mandatory) {
                mandatory[item.name] = { quantity: 1 };
            }
        });
        setSelectedItems(mandatory);
    }, [allItems]);

    const merchandiseTotal = useMemo(() => {
        return (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).reduce((total, [itemName, details]) => {
            const item = allItems.find(i => i.name === itemName);
            if (!item) return total;
            
            // Check if there is a specific price for the selected size
            let effectivePrice = item.price;
            if (item.hasSize && details.size && item.priceBySize && item.priceBySize[details.size]) {
                effectivePrice = item.priceBySize[details.size];
            }
            
            return total + (effectivePrice * details.quantity);
        }, 0);
    }, [selectedItems, allItems]);
    
    // Grand Total is now Base Fee + Merchandise
    const grandTotal = baseFeeTotal + merchandiseTotal;

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
    
    const getItemPriceDisplay = (item: typeof allItems[0], selectedSize?: string) => {
        if (item.hasSize && item.priceBySize) {
            if (selectedSize && item.priceBySize[selectedSize]) {
                return item.priceBySize[selectedSize];
            }
            // Show range or base price if multiple
            const prices = Object.values(item.priceBySize) as number[];
            if (prices.length > 0) {
                 const min = Math.min(...prices);
                 const max = Math.max(...prices);
                 if (min !== max) return `${min} - ${max}`;
            }
        }
        return item.price;
    }

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
                
                // Determine price at moment of purchase
                let finalPrice = item.price;
                if (item.hasSize && details.size && item.priceBySize && item.priceBySize[details.size]) {
                    finalPrice = item.priceBySize[details.size];
                }

                return { 
                    name, 
                    price: finalPrice, 
                    quantity: details.quantity, 
                    size: details.size || null 
                };
            });
            
            // Add the base fee breakdown as purchased items for record keeping
            [...(feeStructure.oneTime || []), ...(feeStructure.annual || [])].forEach(fee => {
                purchasedItems.push({
                    name: fee.name,
                    price: fee.amount,
                    quantity: 1,
                    size: null
                });
            });

            const success = await onUpdateAdmissionPayment(admissionId!, {
                paymentAmount: grandTotal,
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
        
        // Fee Structure Section in PDF
        doc.setFont("helvetica", "bold");
        doc.text("A. ONE-TIME CHARGES", 15, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        (feeStructure.oneTime || []).forEach(item => {
            doc.text(item.name, 20, yPos);
            doc.text(`${item.amount}`, 180, yPos);
            yPos += 6;
        });

        yPos += 4;
        doc.setFont("helvetica", "bold");
        doc.text("B. ANNUAL / PERIODIC CHARGES", 15, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        (feeStructure.annual || []).forEach(item => {
            doc.text(item.name, 20, yPos);
            doc.text(`${item.amount}`, 180, yPos);
            yPos += 6;
        });
        
        // Merchandise Section in PDF
        if (Object.keys(selectedItems).length > 0) {
            yPos += 4;
            doc.setFont("helvetica", "bold");
            doc.text("C. ADDITIONAL ITEMS", 15, yPos);
            yPos += 6;
            doc.setFont("helvetica", "normal");
            
            const items = Object.entries(selectedItems) as [string, { quantity: number; size?: string }][];
            items.forEach(([name, details]) => {
                const itemDef = allItems.find(i => i.name === name);
                let price = itemDef ? itemDef.price : 0;
                
                if (itemDef?.hasSize && details.size && itemDef.priceBySize && itemDef.priceBySize[details.size]) {
                    price = itemDef.priceBySize[details.size];
                }

                const amount = price * details.quantity;

                doc.text(`${name} ${details.size ? `(${details.size})` : ''}`, 20, yPos);
                doc.text(`${amount}`, 180, yPos);
                yPos += 6;
            });
        }

        doc.line(15, yPos, pageWidth - 15, yPos);
        yPos += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Grand Total", 140, yPos);
        doc.text(`Rs. ${grandTotal}`, 180, yPos);

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

    if (isLoadingDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <SpinnerIcon className="w-10 h-10 text-sky-600" />
            </div>
        );
    }
    
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
                            <span className="font-bold text-emerald-600">₹{grandTotal}</span>
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
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                         <h1 className="text-3xl font-extrabold text-slate-800">
                             <EditableContent id="adm_pay_title" defaultContent="Admission Payment" type="text" user={user} />
                        </h1>
                        <p className="mt-2 text-lg text-slate-600">Finalize application for <span className="font-bold">{studentName}</span> ({studentType})</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Detailed Fee Structure Table */}
                            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-slate-100 p-3 border-b">
                                    <h2 className="font-bold text-slate-800">Fee Structure Breakdown</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-600 border-b">
                                                <th className="py-2 px-4 text-left w-12">S.No</th>
                                                <th className="py-2 px-4 text-left">Description of Fee Head</th>
                                                <th className="py-2 px-4 text-right">Amount (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-800">
                                            {/* ONE-TIME CHARGES */}
                                            <tr className="bg-slate-50/50 font-bold border-b">
                                                <td className="py-2 px-4">A</td>
                                                <td className="py-2 px-4" colSpan={2}>ONE-TIME CHARGES ({studentType === 'Newcomer' ? 'New Admissions Only' : 'Existing Student'})</td>
                                            </tr>
                                            {(feeStructure.oneTime || []).map((fee, idx) => (
                                                <tr key={fee.id} className="border-b">
                                                    <td className="py-2 px-4">{idx + 1}</td>
                                                    <td className="py-2 px-4">{fee.name}</td>
                                                    <td className="py-2 px-4 text-right">{fee.amount}</td>
                                                </tr>
                                            ))}
                                            {(feeStructure.oneTime || []).length === 0 && (
                                                <tr><td colSpan={3} className="py-2 px-4 text-center italic text-slate-500">No one-time charges configured.</td></tr>
                                            )}

                                            {/* ANNUAL CHARGES */}
                                            <tr className="bg-slate-50/50 font-bold border-b">
                                                <td className="py-2 px-4">B</td>
                                                <td className="py-2 px-4" colSpan={2}>ANNUAL / PERIODIC CHARGES</td>
                                            </tr>
                                            {(feeStructure.annual || []).map((fee, idx) => (
                                                <tr key={fee.id} className="border-b">
                                                    <td className="py-2 px-4">{idx + 1}</td>
                                                    <td className="py-2 px-4">{fee.name}</td>
                                                    <td className="py-2 px-4 text-right">{fee.amount}</td>
                                                </tr>
                                            ))}
                                            {(feeStructure.annual || []).length === 0 && (
                                                <tr><td colSpan={3} className="py-2 px-4 text-center italic text-slate-500">No annual charges configured.</td></tr>
                                            )}
                                            
                                            {/* TOTAL */}
                                            <tr className="bg-slate-200 font-bold">
                                                <td className="py-3 px-4"></td>
                                                <td className="py-3 px-4">TOTAL PAYABLE AMOUNT (FEES)</td>
                                                <td className="py-3 px-4 text-right">{baseFeeTotal}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Additional Items Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Additional Items (Optional)</h3>
                                {allItems.map(item => {
                                    const currentSize = selectedItems[item.name]?.size;
                                    const displayPrice = getItemPriceDisplay(item, currentSize);
                                    
                                    return (
                                    <div key={item.name} className={`p-4 border rounded-lg flex items-center justify-between ${item.mandatory ? 'bg-slate-100' : 'hover:bg-slate-50 transition'}`}>
                                        <div className="flex items-center gap-4">
                                            {item.checkable && <input type="checkbox" checked={!!selectedItems[item.name]} onChange={e => handleItemToggle(item.name, e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600"/>}
                                            <div>
                                                <p className={`font-bold ${item.mandatory ? 'text-slate-800' : ''}`}>{item.name}</p>
                                                <p className="text-sm text-slate-600">₹{displayPrice}</p>
                                            </div>
                                        </div>
                                        {item.hasSize && selectedItems[item.name] && (
                                            <select value={selectedItems[item.name]?.size} onChange={e => handleSizeChange(item.name, e.target.value)} className="form-select text-sm py-1">
                                                {item.sizes?.map(size => <option key={size} value={size}>Size: {size}</option>)}
                                            </select>
                                        )}
                                    </div>
                                )})}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-slate-50 p-6 rounded-lg border sticky top-28 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4">Payment Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-slate-700">Base Admission Fees</span>
                                            <span className="text-slate-900">₹{baseFeeTotal}</span>
                                        </div>
                                        {Object.keys(selectedItems).length > 0 && <hr className="border-slate-300 my-2" />}
                                        {(Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([name, details]) => {
                                            const item = allItems.find(i => i.name === name);
                                            let effectivePrice = item ? item.price : 0;
                                            if (item && item.hasSize && details.size && item.priceBySize && item.priceBySize[details.size]) {
                                                effectivePrice = item.priceBySize[details.size];
                                            }

                                            return (
                                                <div key={name} className="flex justify-between">
                                                    <span className="text-slate-600">{name} {details.size && `(${details.size})`}</span>
                                                    <span className="font-semibold">₹{effectivePrice}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-300 flex justify-between font-extrabold text-lg text-slate-900">
                                        <span>Grand Total</span>
                                        <span className="text-emerald-700">₹{grandTotal}</span>
                                    </div>
                                </div>
                                
                                <div>
                                     <h3 className="text-xl font-bold text-slate-800 mb-2">
                                        <EditableContent id="adm_pay_instr_title" defaultContent="Payment Instructions" type="text" user={user} />
                                    </h3>
                                    <div className="text-sm text-slate-600 mb-4">
                                         <EditableContent id="adm_pay_instr_desc" defaultContent="Pay the total amount using the details below, then upload the screenshot to finalize." type="textarea" user={user} />
                                    </div>
                                     <div className="flex justify-center">
                                        <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 border p-1 bg-white shadow-sm"/>
                                     </div>
                                     <p className="text-center font-semibold mt-2">UPI ID: <span className="text-sky-700 font-mono">{upiId}</span></p>
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
                                    {isProcessing ? 'Submitting...' : 'Submit Payment & Finalize'}
                                </button>
                                
                                 <div className="mt-4 pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-700 mb-2">Store Instructions</h4>
                                    <div className="text-xs text-slate-600 space-y-1">
                                         <EditableContent id="adm_pay_store_instr" defaultContent="- Verify Bill ID & Transaction ID before handing over merchandise.\n- Uniform sizes can be exchanged within 3 days if unused." type="textarea" user={user} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionPaymentPage;

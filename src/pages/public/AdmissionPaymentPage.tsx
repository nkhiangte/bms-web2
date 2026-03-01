import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType, AdmissionSettings, User, OnlineAdmission, FeePayments } from '@/types';
import { SpinnerIcon, CheckCircleIcon, UploadIcon, CurrencyDollarIcon, BackIcon } from '@/components/Icons';
import { resizeImage, uploadToImgBB } from '@/utils';
import { DEFAULT_ADMISSION_SETTINGS, UNIFORM_SIZES } from '@/constants';
import { db } from '@/firebaseConfig';
import jsPDF from 'jspdf';

const { useParams, useLocation, Link, useNavigate } = ReactRouterDOM as any;

interface AdmissionPaymentPageProps {
    addNotification: (message: string, type: NotificationType, title?: string) => void;
    admissionConfig?: AdmissionSettings; 
    user: User | null;
    schoolConfig: { paymentQRCodeUrl?: string; upiId?: string };
}

const AdmissionPaymentPage: React.FC<AdmissionPaymentPageProps> = ({ 
    addNotification, 
    admissionConfig = DEFAULT_ADMISSION_SETTINGS,
    user,
    schoolConfig,
}) => {
    const { admissionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [admissionDetails, setAdmissionDetails] = useState<OnlineAdmission | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; size?: string }>>({});
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    
    useEffect(() => {
        const fetchDetails = async () => {
            if (location.state) {
                setAdmissionDetails(prev => ({ ...prev, ...(location.state as Partial<OnlineAdmission>) }));
            } else if (admissionId) {
                try {
                    const docRef = db.collection('online_admissions').doc(admissionId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        setAdmissionDetails({ id: doc.id, ...doc.data() } as OnlineAdmission);
                    } else {
                        addNotification("Admission record not found.", 'error');
                    }
                } catch (error: any) {
                    console.error("Error fetching admission details:", error);
                    const msg = error?.code === 'permission-denied'
                        ? "Permission denied. Please contact the school office."
                        : "Failed to load admission details.";
                    addNotification(msg, 'error');
                }
            }
            setIsLoadingDetails(false);
        };

        fetchDetails();
    }, [admissionId, location.state, addNotification]);

    useEffect(() => {
        if (admissionDetails?.paymentStatus === 'paid' || admissionDetails?.paymentStatus === 'pending') {
            setPaymentSubmitted(true);
        }
    }, [admissionDetails]);

    const { admissionGrade: grade, studentType = 'Newcomer' } = admissionDetails || {};

    const feeStructure = useMemo(() => {
        const structures = admissionConfig.feeStructure || DEFAULT_ADMISSION_SETTINGS.feeStructure;
        return studentType === 'Existing' ? structures.existingStudent : structures.newStudent;
    }, [admissionConfig, studentType]);
    
    const baseFeeTotal = useMemo(() => {
        if (!feeStructure) return 0;
        const oneTimeTotal = (feeStructure.oneTime || []).reduce((sum, item) => sum + item.amount, 0);
        const annualTotal = (feeStructure.annual || []).reduce((sum, item) => sum + item.amount, 0);
        return oneTimeTotal + annualTotal;
    }, [feeStructure]);

    const notebookPrice = useMemo(() => (grade && admissionConfig.notebookPrices[grade as Grade]) ? admissionConfig.notebookPrices[grade as Grade] : 0, [grade, admissionConfig.notebookPrices]);

    const allItems = useMemo(() => {
        const items = [
            { name: `Notebook Set (${grade})`, price: notebookPrice, mandatory: false, checkable: true, hasSize: false, sizes: undefined, priceBySize: undefined },
        ];
        admissionConfig.items.forEach(itemConfig => {
            items.push({
                name: itemConfig.name, price: itemConfig.price, priceBySize: itemConfig.priceBySize, mandatory: itemConfig.mandatory,
                checkable: !itemConfig.mandatory, hasSize: itemConfig.type === 'uniform',
                sizes: itemConfig.type === 'uniform' ? UNIFORM_SIZES : undefined
            });
        });
        return items;
    }, [grade, notebookPrice, admissionConfig]);

    useEffect(() => {
        const mandatory: Record<string, { quantity: number; size?: string }> = {};
        allItems.forEach(item => { if (item.mandatory) mandatory[item.name] = { quantity: 1 }; });
        setSelectedItems(mandatory);
    }, [allItems]);

    const merchandiseTotal = useMemo(() => {
        return (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).reduce((total, [itemName, details]) => {
            const item = allItems.find(i => i.name === itemName);
            if (!item) return total;
            let effectivePrice = item.price;
            if (item.hasSize && details.size && item.priceBySize && item.priceBySize[details.size]) {
                effectivePrice = item.priceBySize[details.size];
            }
            return total + (effectivePrice * details.quantity);
        }, 0);
    }, [selectedItems, allItems]);
    
    const grandTotal = baseFeeTotal + merchandiseTotal;

    const handleItemToggle = (itemName: string, isChecked: boolean) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (isChecked) {
                const item = allItems.find(i => i.name === itemName);
                newItems[itemName] = { quantity: 1, size: item?.hasSize ? UNIFORM_SIZES[0] : undefined };
            } else { delete newItems[itemName]; }
            return newItems;
        });
    };
    
    const handleSizeChange = (itemName: string, size: string) => {
        setSelectedItems(prev => ({ ...prev, [itemName]: { ...prev[itemName], size } }));
    };
    
    const getItemPriceDisplay = (item: typeof allItems[0], selectedSize?: string) => {
        if (item.hasSize && item.priceBySize) {
            if (selectedSize && item.priceBySize[selectedSize]) return item.priceBySize[selectedSize];
            const prices = Object.values(item.priceBySize);
            if (prices.length > 0) {
                 const min = Math.min(...(prices as number[]));
                 const max = Math.max(...(prices as number[]));
                 if (min !== max) return `${min} - ${max}`;
            }
        }
        return item.price;
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshotFile(e.target.files[0]);
        }
    };

    // ── PDF generation ────────────────────────────────────────────────────────
    const generateReceiptPDF = (
        id: string,
        details: OnlineAdmission,
        items: AdmissionItem[],
        baseTotal: number,
        itemsTotal: number,
        total: number
    ) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const margin = 20;
        const contentW = pageW - margin * 2;
        let y = 0;

        // ── Header band ──────────────────────────────────────────────────────
        doc.setFillColor(15, 40, 80);
        doc.rect(0, 0, pageW, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(17);
        doc.setFont('helvetica', 'bold');
        doc.text('BETHEL MISSION SCHOOL', pageW / 2, 13, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Lungpho, Champhai District, Mizoram — 796321', pageW / 2, 20, { align: 'center' });
        doc.text('bethelms04@gmail.com  |  bms04.com', pageW / 2, 26, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT RECEIPT & ADMISSION ACKNOWLEDGEMENT', pageW / 2, 34, { align: 'center' });

        y = 50;

        // ── Status badge ─────────────────────────────────────────────────────
        doc.setFillColor(220, 252, 231);
        doc.setDrawColor(134, 239, 172);
        doc.roundedRect(margin, y, contentW, 12, 3, 3, 'FD');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('✓  Payment Submitted — PENDING VERIFICATION', pageW / 2, y + 8, { align: 'center' });

        y += 20;

        // ── Reference ID box ─────────────────────────────────────────────────
        doc.setFillColor(15, 40, 80);
        doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('REFERENCE ID', pageW / 2, y + 6, { align: 'center' });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(id, pageW / 2, y + 14, { align: 'center' });

        y += 24;

        const submittedOn = new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${submittedOn}`, pageW / 2, y, { align: 'center' });

        y += 10;

        // ── Student details section ───────────────────────────────────────────
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentW, 8, 'FD');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT DETAILS', margin + 3, y + 5.5);
        y += 10;

        const studentRows: [string, string][] = [
            ['Student Name', details.studentName || '—'],
            ['Class', details.admissionGrade || '—'],
            ["Father's Name", details.fatherName || '—'],
            ['Contact', details.contactNumber ? `+91 ${details.contactNumber}` : '—'],
            ['Student Type', details.studentType || '—'],
            ['Admission Type', (details as any).boardingType || '—'],
        ];

        const colW = contentW / 2;
        studentRows.forEach(([label, value], i) => {
            const col = i % 2;
            const rx = margin + col * colW;
            if (col === 0 && i !== 0) y += 8;
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.text(label, rx + 2, y);
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.text(value.length > 28 ? value.slice(0, 26) + '…' : value, rx + 2, y + 4.5);
        });
        y += 14;

        // ── Fee breakdown table ───────────────────────────────────────────────
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentW, 8, 'FD');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('FEE BREAKDOWN', margin + 3, y + 5.5);
        y += 12;

        // Base fees
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Base Admission Fees', margin + 2, y);
        doc.text(`Rs. ${baseTotal}`, margin + contentW - 2, y, { align: 'right' });
        y += 6;

        // Purchased items
        if (items.length > 0) {
            items.forEach(item => {
                const label = item.size ? `${item.name} (${item.size})` : item.name;
                doc.text(label.length > 40 ? label.slice(0, 38) + '…' : label, margin + 2, y);
                doc.text(`Rs. ${item.price * item.quantity}`, margin + contentW - 2, y, { align: 'right' });
                y += 6;
            });
        }

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, margin + contentW, y);
        y += 6;

        // Grand total
        doc.setFillColor(15, 40, 80);
        doc.rect(margin, y, contentW, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT PAID', margin + 3, y + 7);
        doc.text(`Rs. ${total}`, margin + contentW - 3, y + 7, { align: 'right' });
        y += 16;

        // ── Note ─────────────────────────────────────────────────────────────
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(margin, y, contentW, 22, 3, 3, 'FD');
        doc.setTextColor(29, 78, 216);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('IMPORTANT', margin + 4, y + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Your payment is under verification. Please bring this receipt and your Reference ID', margin + 4, y + 13);
        doc.text('to the school office to collect your purchased items and complete enrollment.', margin + 4, y + 19);
        y += 28;

        // ── Footer ────────────────────────────────────────────────────────────
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, margin + contentW, y);
        y += 5;
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
            'This is a computer-generated receipt. For queries, contact bethelms04@gmail.com or visit the school office.',
            pageW / 2, y, { align: 'center', maxWidth: contentW }
        );
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW / 2, y + 6, { align: 'center' });

        doc.save(`BMS_Receipt_${id}.pdf`);
    };

    const handleSubmitPayment = async () => {
        if (!screenshotFile) {
            addNotification("Please upload a screenshot of your payment to confirm.", 'error');
            return;
        }
        if (!admissionId) return;

        setIsUploading(true);
        try {
            const resized = await resizeImage(screenshotFile, 800, 800, 0.8);
            const url = await uploadToImgBB(resized);

            const itemsToPurchase: AdmissionItem[] = (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([itemName, details]) => {
                const item = allItems.find(i => i.name === itemName)!;
                let price = item.price;
                if (item.hasSize && details.size && item.priceBySize) {
                    price = item.priceBySize[details.size] ?? item.price;
                }
                return { 
                    name: itemName, 
                    price: price ?? 0, 
                    quantity: details.quantity ?? 1, 
                    ...(details.size ? { size: details.size } : {})
                };
            });

            await db.collection('online_admissions').doc(admissionId).update({
                paymentStatus: 'pending',
                paymentAmount: grandTotal ?? 0,
                paymentScreenshotUrl: url,
                purchasedItems: itemsToPurchase
            });

            // Generate receipt PDF after successful Firestore update
            try {
                if (admissionDetails) {
                    generateReceiptPDF(
                        admissionId,
                        admissionDetails,
                        itemsToPurchase,
                        baseFeeTotal,
                        merchandiseTotal,
                        grandTotal
                    );
                }
            } catch (pdfErr) {
                console.warn('PDF generation failed (non-critical):', pdfErr);
            }

            setPaymentSubmitted(true);
        } catch (error) {
            console.error("Payment submission failed:", error);
            addNotification("Failed to submit payment proof. Please try again.", 'error');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingDetails) {
        return <div className="flex items-center justify-center min-h-screen"><SpinnerIcon className="w-10 h-10 text-sky-600" /></div>;
    }

    if (!admissionDetails) {
        return <div className="text-center py-20">Admission details not found.</div>
    }

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            Back
                        </button>
                    </div>
                    <div className="text-center mb-8">
                         <h1 className="text-3xl font-extrabold text-slate-800">Admission Payment</h1>
                         <p className="mt-2 text-lg text-slate-600">Finalize application for <span className="font-bold">{admissionDetails.studentName}</span> ({studentType})</p>
                    </div>

                    {paymentSubmitted ? (
                        <div className="text-center py-12">
                            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4"/>
                            <h2 className="text-2xl font-bold text-slate-800">Application Submitted!</h2>
                            <p className="text-slate-600 mt-4 max-w-lg mx-auto">
                                You have successfully submitted the admission forms. Please use this reference ID to collect merchandise from the school.
                            </p>
                            <div className="mt-6 inline-block bg-slate-100 border-2 border-dashed border-sky-300 rounded-lg px-8 py-4">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Reference ID</p>
                                <p className="font-mono text-2xl font-bold text-sky-700">{admissionId}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(admissionId)}
                                    className="mt-3 text-xs font-semibold text-slate-500 hover:text-sky-600 underline"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">📄 A payment receipt has been downloaded to your device.</p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Link to="/" className="btn btn-secondary">Go to Homepage</Link>
                                <Link to="/admissions/status" className="btn btn-primary">Check Status</Link>
                            </div>
                        </div>
                    ) : (
                    <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Right side: Instructions and Payment */}
                        <div className="lg:order-2">
                             <div className="p-6 bg-slate-50 border rounded-xl space-y-4">
                                 <h3 className="text-lg font-bold text-slate-800">Instructions</h3>
                                 <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
                                     <li>Calculate your total amount on the left.</li>
                                     <li>Pay the total amount using the QR Code or UPI ID below.</li>
                                     <li>Take a screenshot of the successful payment.</li>
                                     <li>Upload the screenshot and submit for verification.</li>
                                 </ol>
                            </div>
                            <div className="p-6 bg-white mt-6 rounded-xl border-2 border-sky-200">
                                <div className="flex flex-col items-center">
                                    {schoolConfig.paymentQRCodeUrl ? (
                                        <img src={schoolConfig.paymentQRCodeUrl} alt="School Payment QR Code" className="w-48 h-48 border p-1 rounded-md"/>
                                    ) : <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-500 rounded-md">QR Not Set</div>}
                                    <p className="mt-4 font-semibold text-slate-700">UPI ID: <span className="font-mono text-sky-700">{schoolConfig.upiId}</span></p>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Payment Screenshot*</label>
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" required/>
                                </div>
                            </div>
                        </div>

                        {/* Left Side: Item Selection */}
                        <div className="lg:order-1">
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
                    </div>

                    <div className="mt-10 border-t pt-8">
                        <div className="max-w-md ml-auto space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                                <div className="flex justify-between font-medium"><span className="text-slate-700">Base Fees</span><span>₹{baseFeeTotal}</span></div>
                                <div className="flex justify-between font-medium"><span className="text-slate-700">Additional Items</span><span>₹{merchandiseTotal}</span></div>
                                <div className="flex justify-between font-extrabold text-lg text-slate-900 pt-2 border-t"><span>Grand Total</span><span className="text-emerald-700">₹{grandTotal}</span></div>
                            </div>
                            <button onClick={handleSubmitPayment} disabled={isUploading || !screenshotFile}
                                className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-4 !text-xl shadow-xl hover:shadow-emerald-200 transition-all disabled:bg-slate-400">
                                {isUploading ? <SpinnerIcon className="w-6 h-6"/> : <CurrencyDollarIcon className="w-6 h-6"/>}
                                <span>{isUploading ? 'Submitting...' : 'Submit Payment Proof'}</span>
                            </button>
                        </div>
                    </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdmissionPaymentPage;

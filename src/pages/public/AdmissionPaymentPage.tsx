
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType, AdmissionSettings, User, OnlineAdmission, FeePayments } from '@/types';
import { SpinnerIcon, CheckCircleIcon, UploadIcon, CurrencyDollarIcon, BackIcon } from '@/components/Icons';
import { resizeImage, uploadToImgBB } from '@/utils';
import { DEFAULT_ADMISSION_SETTINGS, UNIFORM_SIZES } from '@/constants';
import { db } from '@/firebaseConfig';

const { useParams, useLocation, Link, useNavigate } = ReactRouterDOM as any;

interface AdmissionPaymentPageProps {
    addNotification: (message: string, type: NotificationType, title?: string) => void;
    admissionConfig?: AdmissionSettings;
    user: User | null;
    schoolConfig: { paymentQRCodeUrl?: string; upiId?: string; schoolName?: string; udiseCode?: string; udiseCodeElementary?: string; udiseCodeSecondary?: string; address?: string };
}

const SCHOOL_LOGO_URL = 'https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png';

// ── Printable PDF Acknowledgement ──────────────────────────────────────────
const generateAcknowledgementPDF = (data: {
    studentName: string;
    referenceId: string;
    admissionGrade: string;
    submissionDate: string;
    paymentAmount: number;
    schoolName: string;
}) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Admission Acknowledgement — Bethel Mission School</title>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; padding: 40px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-size: 80px; font-weight: 900; color: rgba(14,165,233,0.05); pointer-events: none; z-index: 0; white-space: nowrap; }
    .page { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; border: 2px solid #0ea5e9; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); color: white; padding: 28px 32px; text-align: center; }
    .header-inner { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .header-logo { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); object-fit: cover; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px; }
    .header p { font-size: 13px; opacity: 0.8; }
    .udise-row { display: flex; justify-content: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 3px 12px; font-size: 10px; font-family: monospace; letter-spacing: 0.5px; }
    .body { padding: 32px; }
    .ack-title { text-align: center; margin-bottom: 24px; }
    .ack-title h2 { font-size: 18px; color: #0369a1; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    .ack-title p { font-size: 12px; color: #64748b; margin-top: 4px; }
    .ref-box { background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 10px; padding: 16px 24px; text-align: center; margin-bottom: 28px; }
    .ref-box .label { font-size: 11px; font-weight: 700; color: #0ea5e9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .ref-box .ref-id { font-size: 26px; font-weight: 900; font-family: 'Courier New', monospace; color: #0369a1; letter-spacing: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-item { background: #f8fafc; border-radius: 8px; padding: 12px 16px; border-left: 3px solid #0ea5e9; }
    .info-item .key { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-item .value { font-size: 14px; font-weight: 700; color: #1e293b; }
    .amount-box { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .amount-box .label { font-size: 13px; color: #065f46; font-weight: 600; }
    .amount-box .amount { font-size: 22px; font-weight: 900; color: #059669; }
    .note { background: #fff7ed; border-left: 3px solid #f59e0b; border-radius: 4px; padding: 12px 16px; font-size: 12px; color: #78350f; line-height: 1.6; margin-bottom: 24px; }
    .footer { border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer .sign { text-align: right; }
    .footer .sign .line { border-top: 1px solid #334155; width: 160px; margin-bottom: 6px; }
    .footer .sign p { font-size: 11px; color: #64748b; }
    .footer .generated { font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
<div class="watermark">ACKNOWLEDGEMENT</div>
<div class="page">
  <div class="header">
    <div class="header-inner">
      <img src="${SCHOOL_LOGO_URL}" alt="BMS Logo" class="header-logo" crossorigin="anonymous" />
      <div>
        <h1>Bethel Mission School</h1>
        <p>Online Admission Portal</p>
      </div>
    </div>
    <div class="udise-row">
      <span class="badge">Elementary UDISE: 15040100705</span>
      <span class="badge">Secondary UDISE: 15040100708</span>
    </div>
  </div>
  <div class="body">
    <div class="ack-title">
      <h2>Admission Acknowledgement</h2>
      <p>This document acknowledges receipt of your admission application</p>
    </div>
    <div class="ref-box">
      <div class="label">Reference / Application ID</div>
      <div class="ref-id">${data.referenceId}</div>
    </div>
    <div class="info-grid">
      <div class="info-item">
        <div class="key">Student Name</div>
        <div class="value">${data.studentName}</div>
      </div>
      <div class="info-item">
        <div class="key">Class Applied For</div>
        <div class="value">${data.admissionGrade}</div>
      </div>
      <div class="info-item">
        <div class="key">Application Date</div>
        <div class="value">${data.submissionDate}</div>
      </div>
      <div class="info-item">
        <div class="key">Printed On</div>
        <div class="value">${today}</div>
      </div>
    </div>
    <div class="amount-box">
      <span class="label">Total Amount Submitted</span>
      <span class="amount">₹${data.paymentAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="note">
      <strong>Important:</strong> Please keep this reference ID safe. Use it to track your application status, collect merchandise from the school, and for all future correspondence. Payment is subject to verification by the school office.
    </div>
    <div class="footer">
      <div class="generated">
        <p>Generated via Online Admission Portal</p>
        <p>Bethel Mission School</p>
        <p>${today}</p>
      </div>
      <div class="sign">
        <div class="line"></div>
        <p>Authorised Signatory</p>
        <p>Bethel Mission School</p>
      </div>
    </div>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`);
    printWindow.document.close();
};


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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}, [paymentSubmitted]);
    const [copyClicked, setCopyClicked] = useState(false);

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
        if (e.target.files && e.target.files[0]) setScreenshotFile(e.target.files[0]);
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(admissionId);
        setCopyClicked(true);
        setTimeout(() => setCopyClicked(false), 2000);
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
        return <div className="text-center py-20">Admission details not found.</div>;
    }

    // School constants
    const SCHOOL_NAME = 'Bethel Mission School';
    const SCHOOL_LOGO = 'https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png';
    const UDISE_ELEMENTARY = '15040100705';
    const UDISE_SECONDARY = '15040100708';

    const schoolName = SCHOOL_NAME;
    const submissionDateFormatted = admissionDetails.submissionDate
        ? new Date(admissionDetails.submissionDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <div className="mb-8">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                            <BackIcon className="w-5 h-5" /> Back
                        </button>
                    </div>

                    {/* Header with school info */}
                    <div className="text-center mb-6">
                        <img src={SCHOOL_LOGO} alt="Bethel Mission School" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-slate-200 object-cover shadow" />
                        <h1 className="text-3xl font-extrabold text-slate-800">Admission Payment</h1>
                        <p className="mt-2 text-lg text-slate-600">Finalising application for <span className="font-bold">{admissionDetails.studentName}</span> ({studentType})</p>
                        <div className="flex justify-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs font-mono bg-slate-100 text-slate-500 rounded-full px-3 py-0.5">Elementary UDISE: {UDISE_ELEMENTARY}</span>
                            <span className="text-xs font-mono bg-slate-100 text-slate-500 rounded-full px-3 py-0.5">Secondary UDISE: {UDISE_SECONDARY}</span>
                        </div>
                    </div>

                    {paymentSubmitted ? (
                        /* ── SUCCESS PAGE ──────────────────────────────────────── */
                        <div className="text-center py-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
                                <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Application Submitted!</h2>
                            <p className="text-slate-600 mt-3 max-w-lg mx-auto">
                                Your application has been received. Use the reference ID below to track your application and collect merchandise from the school.
                            </p>

                            {/* Reference ID box */}
                            <div className="mt-6 inline-block bg-slate-100 border-2 border-dashed border-sky-300 rounded-xl px-8 py-5">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Reference / Application ID</p>
                                <p className="font-mono text-2xl font-extrabold text-sky-700 tracking-widest">{admissionId}</p>
                                <button
                                    onClick={handleCopyId}
                                    className="mt-3 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1 mx-auto"
                                >
                                    {copyClicked ? (
                                        <><CheckCircleIcon className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600">✓ Copied!</span></>
                                    ) : (
                                        <span>📋 Copy to Clipboard</span>
                                    )}
                                </button>
                            </div>

                            {/* Summary table */}
                            <div className="mt-8 max-w-md mx-auto bg-slate-50 rounded-xl border overflow-hidden text-left">
                                <div className="px-5 py-3 bg-slate-100 border-b">
                                    <p className="text-sm font-bold text-slate-700">Application Summary</p>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {[
                                            ['Student Name', admissionDetails.studentName],
                                            ['Class Applied For', admissionDetails.admissionGrade],
                                            ['Application Type', studentType],
                                            ['Amount Submitted', `₹${grandTotal.toLocaleString('en-IN')}`],
                                            ['Date', submissionDateFormatted],
                                        ].map(([k, v]) => (
                                            <tr key={k} className="border-b last:border-0">
                                                <td className="px-5 py-2.5 text-slate-500 font-medium w-44">{k}</td>
                                                <td className="px-5 py-2.5 font-semibold text-slate-800">{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Download Acknowledgement */}
                            <div className="mt-8">
                                <button
                                    onClick={() => generateAcknowledgementPDF({
                                        studentName: admissionDetails.studentName,
                                        referenceId: admissionId,
                                        admissionGrade: admissionDetails.admissionGrade,
                                        submissionDate: submissionDateFormatted,
                                        paymentAmount: grandTotal,
                                        schoolName,
                                    })}
                                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-colors text-sm"
                                >
                                    🖨️ Download / Print Acknowledgement
                                </button>
                                <p className="text-xs text-slate-400 mt-2">A printable PDF with your reference ID, student details, and amount paid</p>
                            </div>

                            {/* Security note */}
                            <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-400">
                                🔒 Your data is secure and encrypted.
                            </div>

                            <div className="mt-6 flex justify-center gap-4">
                                <Link to="/" className="btn btn-secondary">Go to Homepage</Link>
                                <Link to="/admissions/status" className="btn btn-primary">Check Status</Link>
                            </div>
                        </div>
                    ) : (
                        /* ── PAYMENT FORM ─────────────────────────────────────── */
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-8">
                                {/* Right: QR + Instructions */}
                                <div className="lg:order-2">
                                    <div className="p-6 bg-slate-50 border rounded-xl space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800">Instructions</h3>
                                        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
                                            <li>Review and select items on the left side.</li>
                                            <li>Pay the <strong>Grand Total</strong> using the QR Code or UPI ID below.</li>
                                            <li>Take a screenshot of the successful payment.</li>
                                            <li>Upload the screenshot and click <em>Submit Payment Proof</em>.</li>
                                        </ol>
                                    </div>

                                    <div className="p-6 bg-white mt-5 rounded-xl border-2 border-sky-200">
                                        <div className="flex flex-col items-center">
                                            {schoolConfig.paymentQRCodeUrl ? (
                                                <img src={schoolConfig.paymentQRCodeUrl} alt="School Payment QR Code" className="w-48 h-48 border p-1 rounded-md" />
                                            ) : <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-500 rounded-md text-sm">QR Not Set</div>}
                                            <p className="mt-4 font-semibold text-slate-700">UPI ID: <span className="font-mono text-sky-700">{schoolConfig.upiId}</span></p>
                                        </div>
                                        <div className="mt-6">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Payment Screenshot *</label>
                                            <input type="file" onChange={handleFileChange} accept="image/*"
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                                required />
                                            {screenshotFile && <p className="text-xs text-emerald-600 mt-1">✓ {screenshotFile.name} selected</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Left: Items */}
                                <div className="lg:order-1">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Additional Items (Optional)</h3>
                                        {allItems.map(item => {
                                            const currentSize = selectedItems[item.name]?.size;
                                            const displayPrice = getItemPriceDisplay(item, currentSize);
                                            return (
                                                <div key={item.name} className={`p-4 border rounded-lg flex items-center justify-between gap-4 ${item.mandatory ? 'bg-slate-100' : 'hover:bg-slate-50 transition'}`}>
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {item.checkable && (
                                                            <input type="checkbox" checked={!!selectedItems[item.name]}
                                                                onChange={e => handleItemToggle(item.name, e.target.checked)}
                                                                className="form-checkbox h-5 w-5 text-sky-600 flex-shrink-0" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 truncate">{item.name}</p>
                                                            <p className="text-sm text-slate-500">₹{displayPrice}{item.mandatory ? ' · Mandatory' : ''}</p>
                                                        </div>
                                                    </div>
                                                    {item.hasSize && selectedItems[item.name] && (
                                                        <select value={selectedItems[item.name]?.size} onChange={e => handleSizeChange(item.name, e.target.value)}
                                                            className="form-select text-sm py-1 flex-shrink-0">
                                                            {item.sizes?.map(size => <option key={size} value={size}>Size: {size}</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Fee Breakdown + Submit */}
                            <div className="mt-10 border-t pt-8">
                                <div className="max-w-md ml-auto space-y-4">

                                    {/* Detailed fee breakdown table */}
                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="bg-slate-50 px-5 py-3 border-b">
                                            <p className="text-sm font-bold text-slate-700">Fee Breakdown</p>
                                        </div>
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {/* One-time fees */}
                                                {(feeStructure?.oneTime || []).map(fh => (
                                                    <tr key={fh.id} className="border-b border-slate-100">
                                                        <td className="px-5 py-2.5 text-slate-600">{fh.name}</td>
                                                        <td className="px-5 py-2.5 text-right font-medium text-slate-800">₹{fh.amount.toLocaleString('en-IN')}</td>
                                                        <td className="px-5 py-2.5 text-right">
                                                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">One-time</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Annual fees */}
                                                {(feeStructure?.annual || []).map(fh => (
                                                    <tr key={fh.id} className="border-b border-slate-100">
                                                        <td className="px-5 py-2.5 text-slate-600">{fh.name}</td>
                                                        <td className="px-5 py-2.5 text-right font-medium text-slate-800">₹{fh.amount.toLocaleString('en-IN')}</td>
                                                        <td className="px-5 py-2.5 text-right">
                                                            <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 rounded-full px-2 py-0.5">Annual</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Merchandise */}
                                                {Object.keys(selectedItems).length > 0 && (
                                                    <tr className="border-b border-slate-100">
                                                        <td className="px-5 py-2.5 text-slate-600">Selected Items</td>
                                                        <td className="px-5 py-2.5 text-right font-medium text-slate-800">₹{merchandiseTotal.toLocaleString('en-IN')}</td>
                                                        <td className="px-5 py-2.5 text-right">
                                                            <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">Items</span>
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Grand total */}
                                                <tr className="bg-emerald-50">
                                                    <td className="px-5 py-3 font-extrabold text-slate-900">Grand Total</td>
                                                    <td className="px-5 py-3 text-right font-extrabold text-lg text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</td>
                                                    <td className="px-5 py-3"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Security note */}
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                                        🔒 Your data is secure. Payment details are encrypted.
                                    </p>

                                    <button
                                        onClick={handleSubmitPayment}
                                        disabled={isUploading || !screenshotFile}
                                        className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-4 !text-xl shadow-xl hover:shadow-emerald-200 transition-all disabled:bg-slate-400 flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? <SpinnerIcon className="w-6 h-6" /> : <CurrencyDollarIcon className="w-6 h-6" />}
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

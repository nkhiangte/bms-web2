import React, { useState, useEffect, useMemo } from 'react';
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

    const handleSubmitPayment = async () => {
        if (!screenshotFile) { addNotification("Please upload a screenshot of your payment to confirm.", 'error'); return; }
        if (!admissionId) return;
        setIsUploading(true);
        try {
            const resized = await resizeImage(screenshotFile, 800, 800, 0.8);
            const url = await uploadToImgBB(resized);
            const itemsToPurchase: AdmissionItem[] = (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([itemName, details]) => {
                const item = allItems.find(i => i.name === itemName)!;
                let price = item.price;
                if(item.hasSize && details.size && item.priceBySize) { price = item.priceBySize[details.size] ?? item.price; }
                return { name: itemName, price: price ?? 0, quantity: details.quantity ?? 1, ...(details.size ? { size: details.size } : {}) };
            });
            await db.collection('online_admissions').doc(admissionId).update({
                paymentStatus: 'pending', paymentAmount: grandTotal ?? 0, paymentScreenshotUrl: url, purchasedItems: itemsToPurchase
            });
            setPaymentSubmitted(true);
        } catch (error) {
            addNotification("Failed to submit payment proof. Please try again.", 'error');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingDetails) {
        return <div className="flex items-center justify-center min-h-screen bg-black"><SpinnerIcon className="w-10 h-10 text-sky-400" /></div>;
    }
    if (!admissionDetails) {
        return <div className="text-center py-20 bg-black min-h-screen text-slate-300">Admission details not found.</div>;
    }

    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl max-w-4xl mx-auto">
                    <div className="mb-8">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                            <BackIcon className="w-5 h-5" />Back
                        </button>
                    </div>
                    <div className="text-center mb-8">
                         <h1 className="text-3xl font-extrabold text-white">Admission Payment</h1>
                         <p className="mt-2 text-lg text-slate-400">Finalize application for <span className="font-bold text-sky-400">{admissionDetails.studentName}</span> ({studentType})</p>
                    </div>

                    {paymentSubmitted ? (
                        <div className="text-center py-12">
                            <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
                            <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
                            <p className="text-slate-400 mt-4 max-w-lg mx-auto">You have successfully submitted the admission forms. Please use this reference ID to collect merchandise from the school.</p>
                            <div className="mt-6 inline-block bg-zinc-800 border-2 border-dashed border-sky-700 rounded-lg px-8 py-4">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Reference ID</p>
                                <p className="font-mono text-2xl font-bold text-sky-400">{admissionId}</p>
                                <button onClick={() => navigator.clipboard.writeText(admissionId)} className="mt-3 text-xs font-semibold text-slate-500 hover:text-sky-400 underline">Copy to Clipboard</button>
                            </div>
                            <div className="mt-8 flex justify-center gap-4">
                                <Link to="/" className="btn btn-secondary">Go to Homepage</Link>
                                <Link to="/admissions/status" className="btn btn-primary">Check Status</Link>
                            </div>
                        </div>
                    ) : (
                    <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="lg:order-2">
                             <div className="p-6 bg-zinc-800 border border-zinc-700 rounded-xl space-y-4">
                                 <h3 className="text-lg font-bold text-white">Instructions</h3>
                                 <ol className="list-decimal list-inside text-sm text-slate-300 space-y-2">
                                     <li>Calculate your total amount on the left.</li>
                                     <li>Pay using the QR Code or UPI ID below.</li>
                                     <li>Take a screenshot of the successful payment.</li>
                                     <li>Upload the screenshot and submit for verification.</li>
                                 </ol>
                            </div>
                            <div className="p-6 bg-zinc-800 border border-sky-900 mt-6 rounded-xl">
                                <div className="flex flex-col items-center">
                                    {schoolConfig.paymentQRCodeUrl ? (
                                        <img src={schoolConfig.paymentQRCodeUrl} alt="School Payment QR Code" className="w-48 h-48 border border-zinc-600 p-1 rounded-md bg-white"/>
                                    ) : <div className="w-48 h-48 bg-zinc-700 flex items-center justify-center text-slate-400 rounded-md">QR Not Set</div>}
                                    <p className="mt-4 font-semibold text-slate-300">UPI ID: <span className="font-mono text-sky-400">{schoolConfig.upiId}</span></p>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Upload Payment Screenshot*</label>
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-sky-400 hover:file:bg-zinc-600" required/>
                                </div>
                            </div>
                        </div>
                        <div className="lg:order-1">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white border-b border-zinc-700 pb-2">Additional Items (Optional)</h3>
                                {allItems.map(item => {
                                    const currentSize = selectedItems[item.name]?.size;
                                    const displayPrice = getItemPriceDisplay(item, currentSize);
                                    return (
                                    <div key={item.name} className={`p-4 border rounded-lg flex items-center justify-between ${item.mandatory ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition'}`}>
                                        <div className="flex items-center gap-4">
                                            {item.checkable && <input type="checkbox" checked={!!selectedItems[item.name]} onChange={e => handleItemToggle(item.name, e.target.checked)} className="form-checkbox h-5 w-5 text-sky-500"/>}
                                            <div>
                                                <p className="font-bold text-slate-200">{item.name}</p>
                                                <p className="text-sm text-slate-400">₹{displayPrice}</p>
                                            </div>
                                        </div>
                                        {item.hasSize && selectedItems[item.name] && (
                                            <select value={selectedItems[item.name]?.size} onChange={e => handleSizeChange(item.name, e.target.value)} className="text-sm py-1 bg-zinc-700 border border-zinc-600 text-slate-200 rounded">
                                                {item.sizes?.map(size => <option key={size} value={size}>Size: {size}</option>)}
                                            </select>
                                        )}
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-zinc-700 pt-8">
                        <div className="max-w-md ml-auto space-y-4">
                            <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl space-y-2">
                                <div className="flex justify-between font-medium text-slate-300"><span>Base Fees</span><span>₹{baseFeeTotal}</span></div>
                                <div className="flex justify-between font-medium text-slate-300"><span>Additional Items</span><span>₹{merchandiseTotal}</span></div>
                                <div className="flex justify-between font-extrabold text-lg text-white pt-2 border-t border-zinc-700"><span>Grand Total</span><span className="text-emerald-400">₹{grandTotal}</span></div>
                            </div>
                            <button onClick={handleSubmitPayment} disabled={isUploading || !screenshotFile}
                                className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-500 !py-4 !text-xl shadow-xl transition-all disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center justify-center gap-2">
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

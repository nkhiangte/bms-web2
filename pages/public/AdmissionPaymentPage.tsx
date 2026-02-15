

import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType, AdmissionSettings, User, OnlineAdmission } from '../../types';
import { SpinnerIcon, CheckCircleIcon, UploadIcon, CurrencyDollarIcon, BackIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';
import { jsPDF } from 'jspdf';
import { DEFAULT_ADMISSION_SETTINGS, UNIFORM_SIZES } from '../../constants';
import EditableContent from '../../components/EditableContent';
import { db } from '../../firebaseConfig';

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
                } catch (error) {
                    console.error("Error fetching admission details:", error);
                    addNotification("Failed to load admission details.", 'error');
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
// FIX: Cast the result of Object.entries to explicitly type the 'details' object, resolving property access errors.
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

    const handleSubmitPayment = async () => {
        if (!screenshotFile) {
            addNotification("Please upload a screenshot of your payment to confirm.", 'error');
            return;
        }
        if (!admissionId || grandTotal <= 0) return;

        setIsUploading(true);
        try {
            const resized = await resizeImage(screenshotFile, 800, 800, 0.8);
            const url = await uploadToImgBB(resized);

            const itemsToPurchase: AdmissionItem[] = (Object.entries(selectedItems) as [string, { quantity: number; size?: string }][]).map(([itemName, details]) => {
                const item = allItems.find(i => i.name === itemName)!;
                let price = item.price;
                if(item.hasSize && details.size && item.priceBySize) {
                    price = item.priceBySize[details.size] ?? item.price;
                }
                return { name: itemName, price, quantity: details.quantity, size: details.size };
            });

            await db.collection('online_admissions').doc(admissionId).update({
                paymentStatus: 'pending',
                paymentAmount: grandTotal,
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
                            <h2 className="text-2xl font-bold text-slate-800">Payment Submitted!</h2>
                            <p className="text-slate-600 mt-2">Your payment is now pending verification from the school office. You can check the status of your application later.</p>
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
                                <div className="flex justify-between font-extrabold text-lg text-slate-900 pt-2 border-t"><span >Grand Total</span><span className="text-emerald-700">₹{grandTotal}</span></div>
                            </div>
                            <button onClick={handleSubmitPayment} disabled={isUploading || grandTotal <= 0} className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 !py-4 !text-xl shadow-xl hover:shadow-emerald-200 transition-all disabled:bg-slate-400">
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
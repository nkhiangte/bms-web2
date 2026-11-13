import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Grade, AdmissionItem, NotificationType, AdmissionSettings, User, OnlineAdmission } from '@/types';
import { SpinnerIcon, CheckCircleIcon, CurrencyDollarIcon, BackIcon } from '@/components/Icons';
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
        const structures = (admissionConfig.feeStructure || DEFAULT_ADMISSION_SETTINGS.feeStructure) as any;
        if (studentType === 'Existing') return structures.existingStudent;
        if (studentType === 'Boarder') return structures.boarder ?? structures.newStudent;
        return structures.newStudent;
    }, [admissionConfig, studentType]);

    const baseFeeTotal = useMemo(() => {
        if (!feeStructure) return 0;
        const oneTimeTotal = (feeStructure.oneTime || []).reduce((sum: number, item: any) => sum + item.amount, 0);
        const annualTotal = (feeStructure.annual || []).reduce((sum: number, item: any) => sum + item.amount, 0);
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

            const updatePayload = JSON.parse(JSON.stringify({
                paymentStatus: 'pending',
                paymentAmount: grandTotal ?? 0,
                paymentScreenshotUrl: url,
                purchasedItems: itemsToPurchase
            }, (_, v) => v === undefined ? null : v));

            await db.collection('online_admissions').doc(admissionId).update(updatePayload);
            setPaymentSubmitted(true);
        } catch (error) {
            console.error("Payment submission failed:", error);
            addNotification("Failed to submit payment proof. Please try again.", 'error');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingDetails) {
        return <div className="flex items-center justify-center min-h-screen bg-[#F4F7FB]"><SpinnerIcon className="w-10 h-10 text-[#0B1F3A]" /></div>;
    }

    if (!admissionDetails) {
        return <div className="text-center py-20 bg-[#F4F7FB] text-[#0B1F3A] font-semibold">Admission details not found.</div>;
    }

    const studentTypeLabel =
        studentType === 'Boarder' ? 'Boarder / Residential'
        : studentType === 'Existing' ? 'Existing Student'
        : 'New Student';

    return (
        <div className="bg-[#F4F7FB] py-10 sm:py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="bg-white border-t-4 border-[#C9A84C] p-6 sm:p-10 md:p-12 rounded-2xl shadow-lg max-w-4xl mx-auto">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            Back
                        </button>
                    </div>
                    <div className="text-center mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8E6D1B]">Bethel Mission School &middot; Champhai</p>
                        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">Admission Payment</h1>
                        <p className="mt-2 text-base sm:text-lg text-[#0B1F3A]/80">
                            Finalize application for <span className="font-bold text-[#0B1F3A]">{admissionDetails.studentName}</span>{' '}
                            <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                                studentType === 'Boarder'
                                    ? 'bg-[#0B1F3A] text-[#DFC06B]'
                                    : studentType === 'Existing'
                                    ? 'bg-[#FBF6E8] text-[#8E6D1B] border border-[#C9A84C]'
                                    : 'bg-[#F4F7FB] text-[#0B1F3A] border border-[#0B1F3A]/20'
                            }`}>
                                {studentTypeLabel}
                            </span>
                        </p>
                        {studentType === 'Boarder' && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-[#FBF6E8] border border-[#C9A84C] rounded-xl px-4 py-2 text-[#0B1F3A] text-sm font-medium">
                                <span>Residential / boarding fees are included in the base fee total below.</span>
                            </div>
                        )}
                    </div>

                    {paymentSubmitted ? (
                        <div className="text-center py-10">
                            <CheckCircleIcon className="w-16 h-16 text-[#8E6D1B] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-[#0B1F3A]">Application Submitted!</h2>
                            <p className="text-[#0B1F3A]/75 mt-4 max-w-lg mx-auto">
                                You have successfully submitted the admission forms. Please use this reference ID to collect merchandise from the school.
                            </p>
                            <div className="mt-6 inline-block bg-[#FBF6E8] border-2 border-dashed border-[#C9A84C] rounded-xl px-8 py-4">
                                <p className="text-xs text-[#8E6D1B] font-bold uppercase tracking-wider mb-2">Reference ID</p>
                                <p className="font-tabular text-2xl font-extrabold text-[#0B1F3A]">{admissionId}</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(admissionId)}
                                    className="mt-3 text-xs font-bold text-[#8E6D1B] hover:text-[#0B1F3A] underline"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                                <Link to="/" className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-lg border border-[#0B1F3A] text-[#0B1F3A] font-bold hover:bg-[#0B1F3A] hover:text-white transition-colors">
                                    Go to Homepage
                                </Link>
                                <Link to="/admissions/status" className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold transition-colors">
                                    Check Status
                                </Link>
                            </div>
                        </div>
                    ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="lg:order-2">
                                <div className="p-6 bg-[#F4F7FB] border border-[#0B1F3A]/10 rounded-xl space-y-4">
                                    <h3 className="text-lg font-bold text-[#0B1F3A]">Instructions</h3>
                                    <ol className="list-decimal list-inside text-sm text-[#0B1F3A]/85 space-y-2">
                                        <li>Calculate your total amount on the left.</li>
                                        <li>Pay the total amount using the QR Code or UPI ID below.</li>
                                        <li>Take a screenshot of the successful payment.</li>
                                        <li>Upload the screenshot and submit for verification.</li>
                                    </ol>
                                </div>
                                <div className="p-6 bg-white mt-6 rounded-xl border-2 border-[#C9A84C]">
                                    <div className="flex flex-col items-center">
                                        {schoolConfig.paymentQRCodeUrl ? (
                                            <img src={schoolConfig.paymentQRCodeUrl} alt="School Payment QR Code" className="w-48 h-48 border border-[#0B1F3A]/15 p-1 rounded-md" />
                                        ) : <div className="w-48 h-48 bg-[#F4F7FB] flex items-center justify-center text-[#0B1F3A]/60 rounded-md font-medium">QR Not Set</div>}
                                        <p className="mt-4 font-semibold text-[#0B1F3A]">UPI ID: <span className="font-tabular text-[#8E6D1B]">{schoolConfig.upiId}</span></p>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-bold text-[#0B1F3A] mb-2">Upload Payment Screenshot*</label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="block w-full text-sm text-[#0B1F3A]/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#FBF6E8] file:text-[#0B1F3A] hover:file:bg-[#C9A84C]/30"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:order-1">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-[#0B1F3A] border-b border-[#0B1F3A]/15 pb-2">Additional Items (Optional)</h3>
                                    {allItems.map(item => {
                                        const currentSize = selectedItems[item.name]?.size;
                                        const displayPrice = getItemPriceDisplay(item, currentSize);
                                        return (
                                            <div key={item.name} className={`p-4 border border-[#0B1F3A]/15 rounded-lg flex items-center justify-between ${item.mandatory ? 'bg-[#FBF6E8]' : 'hover:bg-[#F4F7FB] transition'}`}>
                                                <div className="flex items-center gap-4">
                                                    {item.checkable && <input type="checkbox" checked={!!selectedItems[item.name]} onChange={e => handleItemToggle(item.name, e.target.checked)} className="form-checkbox h-5 w-5 text-[#0B1F3A] rounded border-[#0B1F3A]/30" />}
                                                    <div>
                                                        <p className="font-bold text-[#0B1F3A]">{item.name}</p>
                                                        <p className="text-sm text-[#0B1F3A]/75 font-tabular">&#8377;{displayPrice}</p>
                                                    </div>
                                                </div>
                                                {item.hasSize && selectedItems[item.name] && (
                                                    <select value={selectedItems[item.name]?.size} onChange={e => handleSizeChange(item.name, e.target.value)} className="form-select text-sm py-1 border-[#0B1F3A]/20">
                                                        {item.sizes?.map(size => <option key={size} value={size}>Size: {size}</option>)}
                                                    </select>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-[#0B1F3A]/15 pt-8">
                            <div className="max-w-md ml-auto space-y-4">
                                <div className="p-4 bg-[#F4F7FB] rounded-xl space-y-2 border border-[#0B1F3A]/10">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-[#0B1F3A]/80">
                                            Base Fees
                                            {studentType === 'Boarder' && <span className="ml-2 text-xs text-[#8E6D1B] font-bold">(incl. boarding)</span>}
                                        </span>
                                        <span className="font-tabular font-bold text-[#0B1F3A]">&#8377;{baseFeeTotal}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span className="text-[#0B1F3A]/80">Additional Items</span>
                                        <span className="font-tabular font-bold text-[#0B1F3A]">&#8377;{merchandiseTotal}</span>
                                    </div>
                                    <div className="flex justify-between font-extrabold text-lg text-[#0B1F3A] pt-2 border-t border-[#0B1F3A]/15">
                                        <span>Grand Total</span>
                                        <span className="font-tabular text-[#8E6D1B]">&#8377;{grandTotal}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={isUploading || !screenshotFile}
                                    className="w-full min-h-[52px] rounded-xl bg-[#C9A84C] hover:bg-[#DFC06B] text-[#0B1F3A] font-extrabold text-lg shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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

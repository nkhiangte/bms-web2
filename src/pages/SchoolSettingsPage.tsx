
import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon, HomeIcon, UploadIcon, SaveIcon, SpinnerIcon } from '@/components/Icons';
import { resizeImage, uploadToImgBB } from '@/utils';

const { Link, useNavigate } = ReactRouterDOM as any;

interface SchoolSettingsPageProps {
    config: { paymentQRCodeUrl?: string; upiId?: string };
    onUpdate: (updates: { paymentQRCodeUrl?: string; upiId?: string }) => Promise<boolean>;
}

const SchoolSettingsPage: React.FC<SchoolSettingsPageProps> = ({ config, onUpdate }) => {
    const navigate = useNavigate();
    const [upiId, setUpiId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUpiId(config.upiId || 'nkhiangte@oksbi');
        // Use a safe placeholder if no config is set
        setQrCodeUrl(config.paymentQRCodeUrl || 'https://via.placeholder.com/300x300.png?text=QR+Code+Not+Set');
    }, [config]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                const compressedDataUrl = await resizeImage(file, 600, 600, 0.8);
                const imgBbUrl = await uploadToImgBB(compressedDataUrl);
                setQrCodeUrl(imgBbUrl);
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("Failed to upload image. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onUpdate({ upiId, paymentQRCodeUrl: qrCodeUrl });
        setIsSaving(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-6">School Settings</h1>
            
            <form onSubmit={handleSave} className="space-y-8">
                <section className="p-6 bg-slate-50 border rounded-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Payment Details (Online Admissions)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700">School UPI ID</label>
                                <input 
                                    type="text" 
                                    value={upiId} 
                                    onChange={e => setUpiId(e.target.value)} 
                                    className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" 
                                    placeholder="e.g., nkhiangte@oksbi"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Current default is: <strong>nkhiangte@oksbi</strong></p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700">Payment QR Code</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-32 h-32 bg-white border p-1 rounded-lg flex items-center justify-center overflow-hidden">
                                        {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Preview" className="w-full h-full object-contain" /> : <div className="text-slate-400 text-xs">No QR Set</div>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary text-sm" disabled={isUploading}>
                                            {isUploading ? <SpinnerIcon className="w-4 h-4"/> : <UploadIcon className="w-4 h-4"/>}
                                            {isUploading ? 'Uploading...' : 'Update QR Image'}
                                        </button>
                                        <p className="text-[10px] text-slate-500">Max size: 600x600px</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 border rounded-lg shadow-inner">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Live Preview</h3>
                            <div className="flex flex-col items-center">
                                <img src={qrCodeUrl || 'https://via.placeholder.com/300x300.png?text=No+QR'} alt="QR Preview" className="w-40 h-40 border p-1 bg-white mb-2"/>
                                <p className="text-xs font-semibold text-slate-600">UPI ID: <span className="text-sky-700 font-mono">{upiId}</span></p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary !px-8 !py-3">
                        {isSaving ? <SpinnerIcon className="w-5 h-5"/> : <SaveIcon className="w-5 h-5"/>}
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SchoolSettingsPage;

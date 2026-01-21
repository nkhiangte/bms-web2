
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { BackIcon, HomeIcon, UserIcon, CameraIcon, SpinnerIcon, KeyIcon } from '../components/Icons';
import PhotoWithFallback from '../components/PhotoWithFallback';
import { resizeImage, uploadToImgBB } from '../utils';

interface UserProfilePageProps {
  currentUser: User;
  onUpdateProfile: (updates: { photoURL?: string }) => Promise<{ success: boolean; message?: string }>;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ currentUser, onUpdateProfile }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        try {
            const resizedImage = await resizeImage(file, 256, 256, 0.9);
            const imageUrl = await uploadToImgBB(resizedImage);
            const result = await onUpdateProfile({ photoURL: imageUrl });
            if (!result.success) {
                setError(result.message || 'Failed to update profile picture.');
            }
        } catch (err: any) {
            console.error("Photo upload failed:", err);
            setError(err.message || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800">
                        <BackIcon className="w-5 h-5"/> Back
                    </button>
                    <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                        <HomeIcon className="w-5 h-5"/> Home
                    </Link>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                </div>

                <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full shadow-lg border-4 border-white">
                            <PhotoWithFallback src={currentUser.photoURL || undefined} alt="Your profile picture" />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Change profile picture"
                        >
                            {isUploading ? <SpinnerIcon className="w-8 h-8" /> : <CameraIcon className="w-8 h-8" />}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900">{currentUser.displayName}</h2>
                        <p className="text-slate-600">{currentUser.email}</p>
                        <p className="mt-2 px-3 py-1 text-sm font-semibold rounded-full bg-sky-100 text-sky-800 inline-block capitalize">{currentUser.role.replace('_', ' ')}</p>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                    <Link to="/portal/change-password" className="btn btn-secondary">
                        <KeyIcon className="w-5 h-5" />
                        Change Password
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;

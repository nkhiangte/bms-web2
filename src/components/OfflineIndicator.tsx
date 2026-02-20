import React, { useState, useEffect } from 'react';
import { SpinnerIcon, OfflineIcon } from '@/components/Icons';

const OfflineIndicator: React.FC = () => {
    const [status, setStatus] = useState<'online' | 'offline' | 'syncing'>(navigator.onLine ? 'online' : 'offline');

    useEffect(() => {
        const handleOffline = () => setStatus('offline');
        const handleOnline = () => setStatus('syncing');

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    useEffect(() => {
        if (status === 'syncing') {
            const timer = setTimeout(() => {
                setStatus('online');
            }, 3000); // Show syncing message for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [status]);


    if (status === 'online') {
        return null;
    }

    const config = {
        offline: {
            bgColor: 'bg-amber-500',
            icon: <OfflineIcon className="w-5 h-5" />,
            message: "You are offline. Changes are saved locally and will sync when you reconnect."
        },
        syncing: {
            bgColor: 'bg-sky-500',
            icon: <SpinnerIcon className="w-5 h-5" />,
            message: "Reconnected. Syncing your changes..."
        },
    };

    const currentConfig = config[status as 'offline' | 'syncing'];

    return (
        <div 
            className={`fixed top-16 left-0 right-0 ${currentConfig.bgColor} text-white text-center text-sm font-semibold py-2 px-4 shadow-lg flex items-center justify-center gap-3 z-50 animate-fade-in`}
            role="status"
            aria-live="assertive"
        >
            {currentConfig.icon}
            <span>{currentConfig.message}</span>
        </div>
    );
};

export default OfflineIndicator;

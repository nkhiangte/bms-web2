
import React, { useState, useEffect } from 'react';
import { UserIcon } from '@/components/Icons';

interface PhotoWithFallbackProps {
    src?: string;
    alt: string;
}

const PhotoWithFallback: React.FC<PhotoWithFallbackProps> = ({ src, alt }) => {
    const [hasError, setHasError] = useState(!src);

    useEffect(() => {
        setHasError(!src);
    }, [src]);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div className="relative w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
            {hasError ? (
                <div className="flex items-center justify-center text-slate-500 w-full h-full">
                    <UserIcon className="w-2/3 h-2/3" />
                </div>
            ) : (
                <img src={src} alt={alt} className="h-full w-full object-cover" onError={handleError} />
            )}
        </div>
    );
};

export default PhotoWithFallback;

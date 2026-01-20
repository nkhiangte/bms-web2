import React, { useState } from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '../../components/Icons';

const { Link } = ReactRouterDOM as any;

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-colors"
                aria-label="Close image viewer"
            >
                &times;
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
};

const InspireAwardPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    const inspireImages = [
        { src: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-6900955725830066556-n.jpg', alt: 'Inspire Award Manak photo' },
        { src: 'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg', alt: 'Inspire Award Manak photo' },
        { src: 'https://i.ibb.co/b5v8Hxvp/514372881-24293595740264800-8462211473640291659-n.jpg', alt: 'Inspire Award Manak photo' },
        { src: 'https://i.ibb.co/mVwyFSgJ/494758587-1100608388765203-5290716023143196073-n.jpg', alt: 'Inspire Award Manak photo' },
        { src: 'https://i.ibb.co/s9scMZyH/509441634-1141633191329389-7367666819097111066-n.jpg', alt: 'Inspire Award Manak photo' },
        { src: 'https://i.ibb.co/3yVTYJYk/474992910-1025250816300961-1770585234026191097-n.jpg', alt: 'Inspire Award Manak photo' },
    ];

    return (
        <>
            <div className="bg-slate-50 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="mb-8">
                        <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                            <BackIcon className="w-5 h-5" />
                            Back to Science & Maths Achievements
                        </Link>
                    </div>
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6">
                            INSPIRE Award MANAK
                        </h1>
                         <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>Since 2011, our school has actively participated in the INSPIRE Award MANAK programme (<a href="https://www.inspireawards-dst.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Learn more</a>). This platform has given our students the opportunity to present innovative projects at both state and national levels.</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong>2012</strong> – Lalhmangaihzuali won 1st Prize at the state level and represented Mizoram at the National Exhibition, New Delhi.</li>
                                <li><strong>2015</strong> – Lalramengmawia won 2nd Prize at the state level and participated at the National Exhibition, New Delhi.</li>
                                <li><strong>2020</strong> – Lalruatpuia Hrahsel was selected for the National Level, but the exhibition was cancelled due to the Covid-19 pandemic.</li>
                                <li><strong>2021</strong> – J. Malsawma won 2nd Prize and presented at the National Exhibition, New Delhi.</li>
                                <li><strong>2024</strong> – Paul K. Lalhruaitluanga won 2nd Prize at the state level and is scheduled to participate at the National Level in 2025.</li>
                            </ul>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Achievements in Pictures</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {inspireImages.map((image, index) => (
                                    <figure key={index} className="aspect-square cursor-pointer" onClick={() => handleImageClick(image.src, image.alt)}>
                                        <img 
                                            src={image.src} 
                                            alt={image.alt} 
                                            className="rounded-lg shadow-md w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                                            loading="lazy"
                                        />
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedImage && (
                <Lightbox 
                    src={selectedImage.src} 
                    alt={selectedImage.alt} 
                    onClose={() => setSelectedImage(null)} 
                />
            )}
        </>
    );
};
export default InspireAwardPage;
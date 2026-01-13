import React, { useState } from 'react';

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
                onClick={e => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
        </div>
    );
};

const FeatureCard: React.FC<{
    title: string;
    imageSrc: string;
    imageCaption: string;
    onImageClick: () => void;
}> = ({ title, imageSrc, imageCaption, onImageClick }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
        <h3 className="text-xl font-bold text-slate-800 p-4 bg-slate-100 border-b text-center">{title}</h3>
        <div 
            className="cursor-pointer group flex-grow relative"
            onClick={onImageClick}
        >
             <div className="h-64 bg-slate-200">
                <img 
                    src={imageSrc} 
                    alt={imageCaption} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
             <div className="p-2 bg-black/40 text-white absolute bottom-0 w-full backdrop-blur-sm">
                 <p className="text-sm font-semibold text-center">{imageCaption}</p>
            </div>
        </div>
    </div>
);


const InfrastructurePage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-cover bg-center text-white py-32 px-4" style={{ backgroundImage: "url('https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg')" }}>
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div className="relative container mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                        Our Infrastructure
                    </h1>
                    <p className="mt-4 text-lg md:text-xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                        Building a Strong Foundation for Future Leaders
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="bg-slate-50 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="max-w-3xl mx-auto text-lg text-slate-600">
                            Our campus is thoughtfully designed to provide a safe, stimulating, and resource-rich environment that supports academic learning, creative exploration, and physical well-being.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            title="School and Office Building"
                            imageSrc="https://i.ibb.co/bD0FQtH/Gemini-Generated-Image-2sotet2sotet2sot.png"
                            imageCaption="Aerial view of School and Office building"
                            onImageClick={() => handleImageClick('https://i.ibb.co/bD0FQtH/Gemini-Generated-Image-2sotet2sotet2sot.png', 'Aerial view of School and Office building')}
                        />
                        <FeatureCard 
                            title="Main building"
                            imageSrc="https://i.ibb.co/cBBVTRT/Gemini-Generated-Image-gbwgpygbwgpygbwg.png"
                            imageCaption="Main building"
                            onImageClick={() => handleImageClick('https://i.ibb.co/cBBVTRT/Gemini-Generated-Image-gbwgpygbwgpygbwg.png', 'Main building')}
                        />
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

export default InfrastructurePage;
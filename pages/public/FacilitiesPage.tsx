import React, { useState, useEffect } from 'react';

interface GalleryImage {
    src: string;
    alt: string;
}

interface Facility {
    name: string;
    description: string;
    imageSrc?: string;
    caption?: string;
    videoUrl?: string;
    gallery?: GalleryImage[];
}

const facilities: Facility[] = [
    { name: 'Spacious Classrooms', description: 'Well-ventilated and equipped with modern teaching aids.' },
    { name: 'Science Laboratories', description: 'Fully equipped labs for Physics, Chemistry, and Biology.' },
    { 
        name: 'Library', 
        description: 'A vast collection of books, journals, and digital resources.',
        imageSrc: 'https://i.ibb.co/3sZq1bM/library.jpg',
        caption: 'School library with shelves full of books',
        videoUrl: 'https://www.facebook.com/share/v/1B6wYVQz8H/'
    },
    { 
      name: 'Playground', 
      description: 'Our multi-use ground features a basketball court, volleyball court, and play equipment. It is also used for morning assembly and drills.',
      imageSrc: 'https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg',
      caption: 'School playground area',
      gallery: [
          { src: 'https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg', alt: 'Playground equipment' },
          { src: 'https://i.ibb.co/84GgTdbL/IMG-20250908-WA0041.jpg', alt: 'Playground view' },
          { src: 'https://i.ibb.co/FqwBr4Qm/IMG-20250908-WA0042.jpg', alt: 'Students on playground' },
          { src: 'https://i.ibb.co/VcMMb35K/IMG-20250908-WA0043.jpg', alt: 'Another view of the playground' },
          { src: 'https://i.ibb.co/mC0mQq9P/IMG-20250908-WA0044.jpg', alt: 'Playground court' },
      ]
    },
    { name: 'Location & Environment', description: "Our school enjoys a serene location, cut off from the hustle and bustle of town and surrounded by a green environment. Despite its peaceful setting, it is easily accessible, located just half a kilometer from the main road. Situated on the northernmost part of town, the campus sits at a slightly elevated point overlooking the town's main attraction, Keilungliah waters." },
];

const Lightbox: React.FC<{ images: GalleryImage[]; startIndex: number; onClose: () => void }> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const goToPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [images.length, onClose]);

    if (!images || images.length === 0) return null;
    const currentImage = images[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-colors z-[51]" aria-label="Close image viewer">
                &times;
            </button>
            
            {/* Prev Button */}
            {images.length > 1 && (
                <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 z-[51] text-2xl" aria-label="Previous image">
                    &#8249;
                </button>
            )}
            
            <img src={currentImage.src} alt={currentImage.alt} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
            
            {/* Next Button */}
            {images.length > 1 && (
                <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 z-[51] text-2xl" aria-label="Next image">
                    &#8250;
                </button>
            )}
             {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-[51]">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

const ImageCard: React.FC<{
    facility: Facility;
    onClick: (images: GalleryImage[], startIndex: number) => void;
}> = ({ facility, onClick }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
        <div className="cursor-pointer group relative" onClick={() => onClick(facility.gallery || (facility.imageSrc ? [{src: facility.imageSrc, alt: facility.caption || ''}] : []), 0)}>
            <div className="aspect-video bg-slate-200">
                {facility.imageSrc && <img src={facility.imageSrc} alt={facility.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
            </div>
             {facility.gallery && facility.gallery.length > 1 &&
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                    1 / {facility.gallery.length}
                </div>
            }
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-slate-800">{facility.name}</h3>
            <p className="mt-2 text-slate-600 flex-grow">{facility.description}</p>
            {facility.videoUrl && (
                <a 
                    href={facility.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800 self-start"
                >
                    Watch it on Facebook &rarr;
                </a>
            )}
        </div>
    </div>
);


const FacilitiesPage: React.FC = () => {
    const [lightboxConfig, setLightboxConfig] = useState<{ images: GalleryImage[], startIndex: number } | null>(null);

    const handleImageClick = (images: GalleryImage[], startIndex: number) => {
        setLightboxConfig({ images, startIndex });
    };

    const locationFacility = facilities.find(f => f.name === 'Location & Environment');
    const otherFacilities = facilities.filter(f => f.name !== 'Location & Environment');

    return (
        <>
            <div className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Our Facilities</h1>
                        <p className="mt-4 text-lg text-slate-600">A Safe and Stimulating Environment for Learning</p>
                    </div>
                    
                    {locationFacility && (
                        <div className="relative bg-cover bg-center rounded-lg shadow-lg overflow-hidden my-8" style={{ backgroundImage: "url('https://i.ibb.co/bD0FQtH/Gemini-Generated-Image-2sotet2sotet2sot.png')" }}>
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                            <div className="relative p-8 md:p-12 text-white">
                                <h3 className="text-3xl font-bold" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{locationFacility.name}</h3>
                                <p className="mt-4 text-lg leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{locationFacility.description}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        {otherFacilities.map(facility => (
                            facility.imageSrc ? (
                                <ImageCard 
                                    key={facility.name}
                                    facility={facility} 
                                    onClick={handleImageClick}
                                />
                            ) : (
                                <div key={facility.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                    <h3 className="text-xl font-bold text-slate-800">{facility.name}</h3>
                                    <p className="mt-2 text-slate-600">{facility.description}</p>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
            {lightboxConfig && (
                <Lightbox 
                    images={lightboxConfig.images}
                    startIndex={lightboxConfig.startIndex}
                    onClose={() => setLightboxConfig(null)} 
                />
            )}
        </>
    );
};
export default FacilitiesPage;
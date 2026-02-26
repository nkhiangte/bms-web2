

import React, { useState, useEffect } from 'react';
import EditableContent from '../../components/EditableContent';
import { User } from '../../types';

interface GalleryImage {
    src: string;
    alt: string;
}

// Static gallery for playground since we can't edit arrays dynamically yet
const playgroundGallery: GalleryImage[] = [
    { src: 'https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg', alt: 'Playground equipment' },
    { src: 'https://i.ibb.co/84GgTdbL/IMG-20250908-WA0041.jpg', alt: 'Playground view' },
    { src: 'https://i.ibb.co/FqwBr4Qm/IMG-20250908-WA0042.jpg', alt: 'Students on playground' },
    { src: 'https://i.ibb.co/VcMMb35K/IMG-20250908-WA0043.jpg', alt: 'Another view of the playground' },
    { src: 'https://i.ibb.co/mC0mQq9P/IMG-20250908-WA0044.jpg', alt: 'Playground court' },
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
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-colors z-[51]" aria-label="Close image viewer">
                &times;
            </button>
            {images.length > 1 && (
                <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 z-[51] text-2xl" aria-label="Previous image">
                    &#8249;
                </button>
            )}
            <img src={currentImage.src} alt={currentImage.alt} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
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

interface FacilitiesPageProps {
    user: User | null;
}

const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ user }) => {
    const [lightboxConfig, setLightboxConfig] = useState<{ images: GalleryImage[], startIndex: number } | null>(null);

    const handleImageClick = (images: GalleryImage[], startIndex: number) => {
        setLightboxConfig({ images, startIndex });
    };

    return (
        <div className="py-16 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                 <div className="text-center mb-12">
                     <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        <EditableContent id="facilities_title" defaultContent="Our Facilities" type="text" user={user} />
                     </h1>
                     <div className="mt-4 text-lg text-slate-600">
                        <EditableContent id="facilities_subtitle" defaultContent="A Safe and Stimulating Environment for Learning" type="text" user={user} />
                     </div>
                 </div>

                 {/* Location (Hero Card) */}
                 <div className="relative bg-cover bg-center rounded-lg shadow-lg overflow-hidden my-8 group h-96">
                    <div className="absolute inset-0">
                        <EditableContent 
                            id="facility_location_bg"
                            defaultContent="https://i.ibb.co/bD0FQtH/Gemini-Generated-Image-2sotet2sotet2sot.png"
                            type="image"
                            user={user}
                            className="w-full h-full object-cover"
                            imgAlt="Location Background"
                        />
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"></div>
                    </div>
                    
                    <div className="relative p-8 md:p-12 text-white h-full flex flex-col justify-center pointer-events-none">
                         <div className="pointer-events-auto">
                             <h3 className="text-3xl font-bold">
                                <EditableContent id="facility_location_title" defaultContent="Location & Environment" type="text" user={user} />
                             </h3>
                             <div className="mt-4 text-lg leading-relaxed max-w-4xl">
                                <EditableContent 
                                    id="facility_location_desc" 
                                    defaultContent="Our school enjoys a serene location, cut off from the hustle and bustle of town and surrounded by a green environment. Despite its peaceful setting, it is easily accessible, located just half a kilometer from the main road. Situated on the northernmost part of town, the campus sits at a slightly elevated point overlooking the town's main attraction, Keilungliah waters." 
                                    type="textarea" 
                                    user={user} 
                                />
                             </div>
                         </div>
                    </div>
                 </div>

                 {/* Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                     {/* Classrooms */}
                     <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800">
                            <EditableContent id="facility_classrooms_title" defaultContent="Spacious Classrooms" type="text" user={user}/>
                        </h3>
                        <div className="mt-2 text-slate-600 flex-grow">
                            <EditableContent id="facility_classrooms_desc" defaultContent="Well-ventilated and equipped with modern teaching aids." type="textarea" user={user}/>
                        </div>
                     </div>

                     {/* Labs */}
                     <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800">
                            <EditableContent id="facility_labs_title" defaultContent="Science Laboratories" type="text" user={user}/>
                        </h3>
                        <div className="mt-2 text-slate-600 flex-grow">
                            <EditableContent id="facility_labs_desc" defaultContent="Fully equipped labs for Physics, Chemistry, and Biology." type="textarea" user={user}/>
                        </div>
                     </div>
                     
                     {/* Library */}
                      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                        <div className="h-64 bg-slate-200 relative">
                             <EditableContent 
                                id="facility_library_img"
                                defaultContent="https://i.ibb.co/3sZq1bM/library.jpg"
                                type="image"
                                user={user}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800">
                                <EditableContent id="facility_library_title" defaultContent="Library" type="text" user={user}/>
                            </h3>
                            <div className="mt-2 text-slate-600 flex-grow">
                                <EditableContent id="facility_library_desc" defaultContent="A vast collection of books, journals, and digital resources." type="textarea" user={user}/>
                            </div>
                            <a 
                                href="https://www.facebook.com/share/v/1B6wYVQz8H/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800 self-start"
                            >
                                Watch Video Tour &rarr;
                            </a>
                        </div>
                     </div>

                     {/* Playground */}
                      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                        <div className="h-64 bg-slate-200 relative cursor-pointer group" onClick={() => handleImageClick(playgroundGallery, 0)}>
                             <EditableContent 
                                id="facility_playground_img"
                                defaultContent="https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg"
                                type="image"
                                user={user}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                             <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
                                Click to View Gallery
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                             <h3 className="text-xl font-bold text-slate-800">
                                <EditableContent id="facility_playground_title" defaultContent="Playground" type="text" user={user}/>
                            </h3>
                            <div className="mt-2 text-slate-600 flex-grow">
                                <EditableContent id="facility_playground_desc" defaultContent="Our multi-use ground features a basketball court, volleyball court, and play equipment. It is also used for morning assembly and drills." type="textarea" user={user}/>
                            </div>
                        </div>
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
        </div>
    )
}

export default FacilitiesPage;

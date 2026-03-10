import React, { useState, useEffect } from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface GalleryImage { src: string; alt: string; }

const playgroundGallery: GalleryImage[] = [
    { src: 'https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg', alt: 'Playground equipment' },
    { src: 'https://i.ibb.co/84GgTdbL/IMG-20250908-WA0041.jpg', alt: 'Playground view' },
    { src: 'https://i.ibb.co/FqwBr4Qm/IMG-20250908-WA0042.jpg', alt: 'Students on playground' },
    { src: 'https://i.ibb.co/VcMMb35K/IMG-20250908-WA0043.jpg', alt: 'Another view' },
    { src: 'https://i.ibb.co/mC0mQq9P/IMG-20250908-WA0044.jpg', alt: 'Playground court' },
];

const Lightbox: React.FC<{ images: GalleryImage[]; startIndex: number; onClose: () => void }> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const goToPrev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)); };
    const goToNext = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)); };
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setCurrentIndex(p => (p === 0 ? images.length - 1 : p - 1));
            else if (e.key === 'ArrowRight') setCurrentIndex(p => (p === images.length - 1 ? 0 : p + 1));
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);
    if (!images.length) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }} onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-5 text-4xl transition-colors" style={{ color: 'var(--text-secondary)' }}>&times;</button>
            {images.length > 1 && <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>&#8249;</button>}
            <img src={images[currentIndex].src} alt={images[currentIndex].alt} className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
            {images.length > 1 && <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>&#8250;</button>}
            {images.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-secondary)' }}>{currentIndex + 1} / {images.length}</div>}
        </div>
    );
};

const FacilityCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        {children}
    </div>
);

interface FacilitiesPageProps { user: User | null; }

const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ user }) => {
    const [lightboxConfig, setLightboxConfig] = useState<{ images: GalleryImage[]; startIndex: number } | null>(null);

    return (
        <div className="py-20" style={{ background: 'var(--bg-base)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <div className="section-label mb-3">Campus</div>
                    <h1 className="section-heading">
                        <EditableContent id="facilities_title" defaultContent="Our Facilities" type="text" user={user} />
                    </h1>
                    <div className="gold-rule mt-4 mb-5" />
                    <p className="section-subtext max-w-xl mx-auto">
                        <EditableContent id="facilities_subtitle" defaultContent="A Safe and Stimulating Environment for Learning" type="text" user={user} />
                    </p>
                </div>

                {/* Location Hero */}
                <div className="relative rounded-2xl overflow-hidden mb-12 h-80 md:h-96">
                    <div className="absolute inset-0">
                        <EditableContent id="facility_location_bg" defaultContent="https://i.ibb.co/bD0FQtH/Gemini-Generated-Image-2sotet2sotet2sot.png" type="image" user={user} className="w-full h-full object-cover" imgAlt="Location" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.85) 40%, rgba(8,8,8,0.3))' }} />
                    </div>
                    <div className="relative h-full flex flex-col justify-center p-8 md:p-12 max-w-2xl">
                        <div className="section-label mb-3">
                            <EditableContent id="facility_location_title" defaultContent="Location & Environment" type="text" user={user} />
                        </div>
                        <div className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            <EditableContent id="facility_location_desc" defaultContent="Our school enjoys a serene location, cut off from the hustle and bustle of town and surrounded by a green environment. Despite its peaceful setting, it is easily accessible, located just half a kilometer from the main road." type="textarea" user={user} />
                        </div>
                    </div>
                </div>

                {/* Facility Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FacilityCard>
                        <div className="p-6">
                            <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                <EditableContent id="facility_classrooms_title" defaultContent="Spacious Classrooms" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="facility_classrooms_desc" defaultContent="Well-ventilated and equipped with modern teaching aids." type="textarea" user={user} />
                            </div>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="p-6">
                            <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                <EditableContent id="facility_labs_title" defaultContent="Science Laboratories" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="facility_labs_desc" defaultContent="Fully equipped labs for Physics, Chemistry, and Biology." type="textarea" user={user} />
                            </div>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="h-48 overflow-hidden">
                            <EditableContent id="facility_library_img" defaultContent="https://i.ibb.co/3sZq1bM/library.jpg" type="image" user={user} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                <EditableContent id="facility_library_title" defaultContent="Library" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed flex-grow" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="facility_library_desc" defaultContent="A vast collection of books, journals, and digital resources." type="textarea" user={user} />
                            </div>
                            <a href="https://www.facebook.com/share/v/1B6wYVQz8H/" target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-semibold self-start" style={{ color: 'var(--gold)' }}>
                                Watch Video Tour →
                            </a>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="h-48 overflow-hidden relative cursor-pointer group" onClick={() => setLightboxConfig({ images: playgroundGallery, startIndex: 0 })}>
                            <EditableContent id="facility_playground_img" defaultContent="https://i.ibb.co/r2ZjJ6CD/IMG-20250908-WA0040.jpg" type="image" user={user} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full pointer-events-none" style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--gold)' }}>
                                Click to View Gallery
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                <EditableContent id="facility_playground_title" defaultContent="Playground" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                <EditableContent id="facility_playground_desc" defaultContent="Our multi-use ground features a basketball court, volleyball court, and play equipment." type="textarea" user={user} />
                            </div>
                        </div>
                    </FacilityCard>
                </div>
            </div>

            {lightboxConfig && (
                <Lightbox images={lightboxConfig.images} startIndex={lightboxConfig.startIndex} onClose={() => setLightboxConfig(null)} />
            )}
        </div>
    );
};

export default FacilitiesPage;

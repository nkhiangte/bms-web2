import React, { useState, useEffect } from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

interface GalleryImage { src: string; alt: string; }

const playgroundGallery: GalleryImage[] = [
    { src: '/assets/school/campus.jpg', alt: 'School campus and playground' },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07162B]/95" onClick={onClose}>
            <button onClick={onClose} aria-label="Close" className="absolute top-4 right-5 text-4xl text-white/80 hover:text-[#DFC06B] transition-colors">&times;</button>
            {images.length > 1 && <button onClick={goToPrev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl w-11 h-11 rounded-full flex items-center justify-center bg-[#132D52] border border-[#C9A84C]/50 text-white">&#8249;</button>}
            <img src={images[currentIndex].src} alt={images[currentIndex].alt} className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl border border-[#C9A84C]/30" onClick={e => e.stopPropagation()} />
            {images.length > 1 && <button onClick={goToNext} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl w-11 h-11 rounded-full flex items-center justify-center bg-[#132D52] border border-[#C9A84C]/50 text-white">&#8250;</button>}
            {images.length > 1 && <div className="font-tabular absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-[#0B1F3A] border border-[#C9A84C]/40 text-white">{currentIndex + 1} / {images.length}</div>}
        </div>
    );
};

const FacilityCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="rounded-xl overflow-hidden flex flex-col bg-[#132D52] border border-[#C9A84C]/30 shadow-lg">
        {children}
    </div>
);

interface FacilitiesPageProps { user: User | null; }

const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ user }) => {
    const [lightboxConfig, setLightboxConfig] = useState<{ images: GalleryImage[]; startIndex: number } | null>(null);

    return (
        <div className="py-12 sm:py-16 bg-[#0B1F3A]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
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
                <div className="relative rounded-2xl overflow-hidden mb-12 h-80 md:h-96 border border-[#C9A84C]/35">
                    <div className="absolute inset-0">
                        <EditableContent id="facility_location_bg" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" imgAlt="Location" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#07162B]/90 via-[#07162B]/65 to-[#07162B]/30" />
                    </div>
                    <div className="relative h-full flex flex-col justify-center p-6 sm:p-10 md:p-12 max-w-2xl">
                        <div className="section-label mb-3">
                            <EditableContent id="facility_location_title" defaultContent="Location & Environment" type="text" user={user} />
                        </div>
                        <div className="text-base leading-relaxed text-white">
                            <EditableContent id="facility_location_desc" defaultContent="Our school enjoys a serene location, cut off from the hustle and bustle of town and surrounded by a green environment. Despite its peaceful setting, it is easily accessible, located just half a kilometer from the main road." type="textarea" user={user} />
                        </div>
                    </div>
                </div>

                {/* Facility Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FacilityCard>
                        <div className="p-6">
                            <h3 className="text-lg font-extrabold mb-2 text-white">
                                <EditableContent id="facility_classrooms_title" defaultContent="Spacious Classrooms" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed text-white/80">
                                <EditableContent id="facility_classrooms_desc" defaultContent="Well-ventilated and equipped with modern teaching aids." type="textarea" user={user} />
                            </div>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="p-6">
                            <h3 className="text-lg font-extrabold mb-2 text-white">
                                <EditableContent id="facility_labs_title" defaultContent="Science Laboratories" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed text-white/80">
                                <EditableContent id="facility_labs_desc" defaultContent="Fully equipped labs for Physics, Chemistry, and Biology." type="textarea" user={user} />
                            </div>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="h-48 overflow-hidden bg-[#07162B]">
                            <EditableContent id="facility_library_img" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-lg font-extrabold mb-2 text-white">
                                <EditableContent id="facility_library_title" defaultContent="Library" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed flex-grow text-white/80">
                                <EditableContent id="facility_library_desc" defaultContent="A vast collection of books, journals, and digital resources." type="textarea" user={user} />
                            </div>
                            <a href="https://www.facebook.com/share/v/1B6wYVQz8H/" target="_blank" rel="noopener noreferrer" className="mt-4 text-sm font-bold self-start text-[#DFC06B] hover:text-white transition-colors">
                                Watch Video Tour &rarr;
                            </a>
                        </div>
                    </FacilityCard>

                    <FacilityCard>
                        <div className="h-48 overflow-hidden relative cursor-pointer group bg-[#07162B]" onClick={() => setLightboxConfig({ images: playgroundGallery, startIndex: 0 })}>
                            <EditableContent id="facility_playground_img" defaultContent="/assets/school/campus.jpg" type="image" user={user} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none bg-[#07162B]/85 text-[#DFC06B] border border-[#C9A84C]/50">
                                Click to View Gallery
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-lg font-extrabold mb-2 text-white">
                                <EditableContent id="facility_playground_title" defaultContent="Playground" type="text" user={user} />
                            </h3>
                            <div className="text-sm leading-relaxed text-white/80">
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

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
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
};


const NccPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    const nccImages = [
        { src: "https://i.ibb.co/Pv7Ywf08/481219402-1045908077568568-4366507493258612299-n.jpg", alt: "Pausawmdawngzela with his memento" },
        { src: "https://i.ibb.co/HfP57wVR/Whats-App-Image-2025-08-15-at-22-01-05-61a1a32f.jpg", alt: "Thanglianzauva and comrades with memento" },
        { src: "https://i.ibb.co/kRjqsTX/IMG-20250903-WA0126.jpg", alt: "NCC Cadets at camp" },
        { src: "https://i.ibb.co/HTYNs1vm/IMG-20250903-WA0117.jpg", alt: "NCC Cadets in formation" },
        { src: "https://i.ibb.co/m50Z3m8S/480676115-1045908447568531-917041848015969130-n.jpg", alt: "Group photo of NCC cadets" },
        { src: "https://i.ibb.co/205jpMc3/475860549-1031353152357394-961984726285749165-n.jpg", alt: "NCC cadets during an activity" },
        { src: "https://i.ibb.co/kgq9Mcw0/18-cadets-from-our-school-are-undergoing-NCC-camp-at-Tanhril-Best-of-luck-and-make-the-school.jpg", alt: "18 cadets from our school undergoing NCC camp at Tanhril" },
        { src: "https://i.ibb.co/0jyqfYFd/IMG-20250903-WA0133.jpg", alt: "NCC Cadets posing for a picture" },
        { src: "https://i.ibb.co/JwfhbS5B/IMG-20250908-WA0045.jpg", alt: "NCC Cadets group photo" },
    ];

    return (
        <>
            <div className="relative py-16">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-fixed" 
                    style={{ backgroundImage: "url('https://i.ibb.co/Pv7Ywf08/481219402-1045908077568568-4366507493258612299-n.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">National Cadet Corps (NCC)</h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>The National Cadet Corps (NCC) in our school serves as a platform for students who wish to cultivate discipline, leadership, and a spirit of service to the nation. Introduced in 2021, the NCC has become a preliminary training ground for young minds who aspire to contribute to society and the country with dedication and responsibility.</p>
                            <p>Since its establishment, the unit has successfully organized and participated in two training camps – in 2023 and 2025. These camps provided cadets with rigorous physical training, drills, and lessons in teamwork, all of which are essential qualities for shaping future leaders. Beyond the physical aspect, cadets also gained valuable exposure to values such as resilience, commitment, and patriotism.</p>
                            <p>Our cadets have consistently excelled and brought recognition to the school. In the 2023 training camp, Pausawmdawngzela was awarded the title of Best Junior Cadet, a proud achievement for both the individual and the institution. Continuing this tradition of excellence, in 2025, Thanglianzauva received the same honor, further highlighting the commitment and capabilities of our NCC students.</p>
                            <p>The school remains committed to supporting and strengthening the NCC program, seeing it not just as an extracurricular activity, but as a foundation for nurturing responsible citizens and inspiring future leaders. Through the NCC, our students are encouraged to embrace discipline, courage, and a lifelong passion for serving the nation.</p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">NCC in Pictures</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {nccImages.map((image, index) => (
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

export default NccPage;
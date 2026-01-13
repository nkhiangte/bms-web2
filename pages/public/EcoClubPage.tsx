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

const EcoClubPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    const images = {
        cleaning: { src: "https://i.ibb.co/v4K7XDrt/Gemini-Generated-Image-b9avk8b9avk8b9av.png", alt: "Students participating in a cleaning drive" },
        plantation: [
            { src: "https://i.ibb.co/kFcQMGS/eco.jpg", alt: "Students and parents planting a tree for Ek Ped Maa Ke Naam" },
            { src: "https://i.ibb.co/zW5C3cXM/eco2.jpg", alt: "Students and parents planting a tree for Ek Ped Maa Ke Naam" },
        ],
        trip: [
            { src: "https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg", alt: "Students on their educational trip to Murlen National Park" },
            { src: "https://i.ibb.co/99MNzTFm/482016092-1057352176424158-7792727531104613420-n.jpg", alt: "Students exploring during the Murlen National Park trip" },
            { src: "https://i.ibb.co/vW928kd/482018943-1057347896424586-5123530206387161722-n.jpg", alt: "Eco club members at Murlen National Park" },
        ]
    };

    const imageClasses = "rounded-lg shadow-md w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105";

    return (
        <>
            <div className="relative py-16">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-fixed" 
                    style={{ backgroundImage: "url('https://i.ibb.co/kFcQMGS/eco.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Eco Club – Growing Green Together</h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>The story of the Eco Club at Bethel Mission School began in 2022, when the government introduced the idea to schools across Mizoram. Our school embraced it right away, and from that moment, a new journey started — a journey of planting, cleaning, learning, and caring for the world around us.</p>
                            <p>Every year since then, the Eco Club has made it a tradition to plant trees and plants around our school. Watching those little saplings grow taller each year is like watching a new friend flourish beside us. It reminds us that small steps today can turn into big changes for tomorrow.</p>
                            <p>But our efforts do not stop at the school gate. With brooms, gloves, and a lot of energy, the Eco Club students often step out into the Bethel Veng locality for cleaning drives. These community activities not only make our surroundings cleaner but also bring us closer to the people living around us.</p>
                            <p>One of the highlights of our Eco Club adventure was the three-day trip to Murlen National Park by our Class IX students in December 2023. Surrounded by lush forests, rare plants, and the calls of birds, the students experienced nature like never before. It was a lesson no classroom could teach — one that left us in awe of how beautiful and fragile our environment is.</p>
                            <p>In 2025, we took part in a very special programme called “Ek Ped Maa Ke Naam”. Together with our parents, we planted 10 trees. It was more than just planting; it was about honoring mothers and the nurturing role they play, just like trees do for the earth. That day, students and parents stood side by side, hands muddy but hearts proud.</p>
                            <p>The Eco Club of Bethel Mission School is more than just a club — it is a family of young caretakers of the earth. With every plant we nurture and every space we clean, we are learning to live responsibly and lovingly with nature. And this is only the beginning of our story. 🌱</p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Club Activities in Pictures</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <figure>
                                    <img 
                                        src={images.cleaning.src} 
                                        alt={images.cleaning.alt}
                                        className={`${imageClasses} aspect-[4/3]`}
                                        onClick={() => handleImageClick(images.cleaning.src, images.cleaning.alt)}
                                        aria-hidden="true"
                                    />
                                    <figcaption className="mt-2 text-center text-sm text-slate-600 italic">
                                        Community Cleaning Drive
                                    </figcaption>
                                </figure>
                                <figure>
                                    <div className="grid grid-cols-2 gap-4">
                                        {images.plantation.map((img, index) => (
                                            <img 
                                                key={index}
                                                src={img.src} 
                                                alt={img.alt}
                                                className={`${imageClasses} aspect-square`}
                                                onClick={() => handleImageClick(img.src, img.alt)}
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </div>
                                    <figcaption className="mt-2 text-center text-sm text-slate-600 italic">
                                        "Ek Ped Maa Ke Naam" Tree Plantation
                                    </figcaption>
                                </figure>
                                <figure className="md:col-span-2">
                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {images.trip.map((img, index) => (
                                            <img 
                                                key={index}
                                                src={img.src} 
                                                alt={img.alt}
                                                className={`${imageClasses} aspect-video`}
                                                onClick={() => handleImageClick(img.src, img.alt)}
                                                aria-hidden="true"
                                            />
                                        ))}
                                     </div>
                                     <figcaption className="mt-2 text-center text-sm text-slate-600 italic">
                                        Educational Trip to Murlen National Park
                                    </figcaption>
                                </figure>
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

export default EcoClubPage;
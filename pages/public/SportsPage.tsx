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

const SportsPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };
    
    const sportsImages = [
        { 
            src: "https://i.ibb.co/5XTrLbwh/basketball.jpg", 
            alt: "Basketball team with trophy", 
            caption: "Champion of District Middle School Basketball Tournament 2024",
        },
        { 
            src: "https://i.ibb.co/n8fnmNhH/72697182-2681155108602175-1363499533471842304-n.jpg", 
            alt: "Middle School District RYFS winner", 
            caption: "Middle School District RYFS winner" 
        },
        { 
            src: "https://i.ibb.co/XfxCBgmf/472918646-1015291717296871-2380144409877056095-n.jpg", 
            alt: "Lalthanpuia with his gold medal", 
            caption: "Lalthanpuia with his gold medal" 
        },
    ];

    return (
        <>
            <div className="relative py-16">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-fixed" 
                    style={{ backgroundImage: "url('https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png')" }}
                ></div>
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Sports</h1>
                        </div>

                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>At our school, we believe that education is not complete without a strong focus on physical well-being. Since its inception, the school has actively encouraged students to participate in sports and games, recognizing their role in building discipline, teamwork, and a healthy lifestyle.</p>

                            <p>One of the most anticipated events of the year is the Annual Sports Week, where students compete with enthusiasm and sportsmanship. Both individual and team competitions are organized, and students proudly represent their houses – Blue, Green, Yellow, and Red – in a spirit of friendly rivalry.</p>

                            <p>To support these activities, the school campus is equipped with a basketball court and a volleyball court, while a community football field lies just 300 meters away, ensuring easy access for training and matches.</p>

                            <p>Beyond the school premises, our students actively take part in district- and state-level competitions. Some of our proud achievements include:</p>

                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li><strong>2024</strong> – Our Middle School team was crowned District Inter-Middle School Basketball Champion, organized by the Champhai Basketball Association.</li>
                                <li><strong>2022</strong> – Our student Lalthanpuia won the Gold Medal in Shotput at the State School Games.</li>
                                <li><strong>2019</strong> – Our Middle School football team won the District Reliance Foundation Youth Sports (RFYS), a tournament organized by Reliance Foundation Youth Sports.</li>
                            </ul>

                            <p>Sports at our school are more than just competitions – they are a way of life. They instill confidence, teach resilience, and nurture the spirit of unity and perseverance among our students.</p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Achievements in Pictures</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {sportsImages.map((image, index) => (
                                    <figure 
                                        key={image.src} 
                                        className={`${index === 0 ? 'md:col-span-2' : ''} cursor-pointer group`} 
                                        onClick={() => handleImageClick(image.src, image.alt)}
                                        aria-hidden="true"
                                    >
                                        <div className="overflow-hidden rounded-lg shadow-md">
                                            <img 
                                                src={image.src} 
                                                alt={image.alt} 
                                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
                                            />
                                        </div>
                                        <figcaption className="mt-2 text-center text-sm text-slate-600 italic">
                                            {image.caption}
                                        </figcaption>
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

export default SportsPage;
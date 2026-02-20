
import React, { useState } from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';

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

const SlsmeePage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    const slsmeeImages = [
        { src: 'https://i.ibb.co/wJgWfX6/science-lab.jpg', alt: 'Students conducting an experiment in a science lab' },
        { src: 'https://i.ibb.co/PZQWjnSw/513908221-24296131616677879-6351230232773483387-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/hxs5HZkg/514531788-24296131393344568-2198525709277279617-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/MDHGVk98/515288958-24296131586677882-6482541779742828754-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/4g8vs7WT/82365382-2885695514814799-2974900507639808000-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/whzxkh8g/82382633-2885695498148134-4845767534265237504-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/zhPpFsrV/82469687-2885695048148179-1340365598370037760-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/PfT51zh/82747208-2885695434814807-6273726259037995008-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/HLPfWzv1/83063680-2885695028148181-1408408686476394496-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/kV3Pgcm0/83551238-2885695264814824-1483087417450692608-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/sp9jKKfM/472763465-1012448840914492-4576499978317823426-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/67F3PL7Y/472787086-1012448884247821-5086531350531673060-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/B5LqqzkF/472789339-1012448834247826-4896396285884982823-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/RpCP2rQR/484024136-1059203859572323-361806768226200750-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/Rp21YDVp/486554010-1071003088392400-3077242666718941925-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/FkGDQzSQ/scf.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/YBvNNktr/487351624-1071003008392408-7745277044986580374-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/ccnpZkwX/495015908-1100608392098536-6482439324117342875-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/Pzw3KnFQ/511058197-1141633201329388-4248602465406784120-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/7JTMXNkx/513070738-24296131426677898-8876353783963498086-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/SwJs3prt/515491676-24325519250405782-8117117242357659744-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/jPCJ4VR2/515652627-24325519513739089-8070440370248861293-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/HLwXyYmZ/514321849-24323008767323497-3271600711330002798-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/0Rm6n0xP/514326823-24294659990158375-4829408242396113050-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/x8RXYkQX/514373461-24294660123491695-5305558488763545236-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/PGhpKNNv/515008876-24325519613739079-230914487716669804-n.jpg', alt: 'Science Exhibition photo' },
        { src: 'https://i.ibb.co/cKrKrWkw/515396969-24323008997323474-2379869968809350831-n.jpg', alt: 'Science Exhibition photo' },
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
                            State Level Science Mathematics & Environment Exhibition (SLSMEE)
                        </h1>
                        <div className="space-y-6 text-slate-700 leading-relaxed">
                            <p>Participation in the State Level Science Mathematics & Environment Exhibition (SLSMEE) organized by SCERT began in 2006, and since then, our students have created an inspiring legacy. Among the highlights:</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong>2006</strong> – First participation.</li>
                                <li><strong>2014</strong> – Lalrinchhani (Class IX) won 3rd Prize, and later showcased her project at the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Eastern India Science Fair</a> 2015 at BITM, Kolkata.</li>
                                <li><strong>2015</strong> – Runrempuia and Vanlalfeli (both Class IX) won 1st Prizes, while Lalbuatsaiha won 3rd Prize. All three represented Mizoram at the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Eastern India Science Fair</a> 2015, BITM, Kolkata.</li>
                                <li><strong>2016</strong> – Joar Vanlalchhanhimi (Class IX) won 1st Prize, earning the honor of participating at the <a href="https://ncert.nic.in/jn-national-science-exhibition.php?ln=en" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">JNSMEE 2017</a> in Bhopal, Madhya Pradesh.</li>
                                <li><strong>2017</strong> – C.L. Kimteii and R. Lalrinmawii won prizes and presented their work at the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Eastern India Science Fair</a> 2018, BITM, Kolkata.</li>
                                <li><strong>2018</strong> – Zenngoluni won 1st Prize and Dosiamliana won 2nd Prize, both advancing to the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Eastern India Science Fair</a> 2019, BITM, Kolkata.</li>
                                <li><strong>2019</strong> – Four students (C. Lalrohlui, K.C. Lalremruatpuia, Vanlalhlupuii, and Lalrohlupuii) represented the state at the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-semibold">Eastern India Science Fair</a> 2020, BITM, Kolkata.</li>
                                <li><strong>2022</strong> – Laldinpuii won 1st Prize in the Mathematics category.</li>
                                <li><strong>2024</strong> – Lawmgsangzuali Hmar and Lalruatkima received prizes and represented the state at the NE India Science Fair, National Science Centre, Guwahati.</li>
                            </ul>
                        </div>
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Achievements in Pictures</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {slsmeeImages.map((image, index) => (
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

export default SlsmeePage;

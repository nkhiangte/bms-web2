import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BackIcon } from '../../components/Icons';

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

const NcscPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    const handleImageClick = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
    };

    const ncscImages = [
        { src: 'https://i.ibb.co/gbZSsDzP/515223941-24291994003758307-393261482748103493-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/rR7Bx14K/515246164-10162776949751928-1985770073446807228-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/s9hXhF4Q/515438443-10162780562481928-2459845752212302508-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/5XPKMKZV/515503702-10162780562101928-5950071808391612573-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/LzJgw5gH/515512561-24309982068626167-4944475833958490180-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/wh9zgxqZ/515569932-10162780562611928-991674172130101053-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/ymZXVvmD/518154716-10162834558566928-8065201215402155111-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/Q7dQnwrq/518301896-10162834558556928-3569681775274891163-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/HT5FJNR2/43823274-2082001785184180-8729620071065845760-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/CKTLrBpD/49242663-10156563532346928-4125074315508973568-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/1GGW9N6T/155517860-10158732566506928-5342967571712318670-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/5pGLXFn/468268910-10161775723426928-2496725236831747593-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/k6XL3xhz/468731825-10161871318756928-7943691516154849628-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/tTXC4QWV/470189993-10162017409671928-3911441204160861156-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/CTSRHM7/471989292-10162062483741928-1098968700965491660-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/0pD4YVmX/494743505-10162482041481928-1214925901997431985-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/GQznnNRh/508855611-10162714320096928-3115130264557838080-n.jpg', alt: 'Science Congress photo' },
        { src: 'https://i.ibb.co/4n0k0J9W/514949967-24322776687346705-6043877798367325580-n.jpg', alt: 'Science Congress photo' },
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
                        National Children’s Science Congress
                    </h1>
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p>The Children’s Science Congress, organized by the Department of Science & Technology, has been another platform where our students consistently shine.</p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li><strong>2012–2013</strong> – Students won 1st Prizes at the District Level and advanced to the State Level.</li>
                            <li><strong>2014</strong> – H. Lalrinchhani won 1st Prize at the District Level, went to the State Level, and was selected for the National Level where she presented in Bengaluru.</li>
                            <li><strong>2015</strong> – C. Lalrindiki represented Mizoram at the National Level, Chandigarh.</li>
                            <li><strong>2016</strong> – Lalhunthari presented her project at the National Level, Baramati (Pune).</li>
                            <li><strong>2017</strong> – Lalzikpuii Hrahsel won 1st Prize at the District Level and advanced to the State Level.</li>
                            <li><strong>2018</strong> – Lalruatlawmi was selected for the National Level, presenting at Bhubaneswar.</li>
                            <li><strong>2019–2022</strong> – Students participated actively at the State Level.</li>
                            <li><strong>2023</strong> – J. Malsawmzuali won 1st Prize at the District Level, advanced to the State Level, and was selected for the National Level.</li>
                        </ul>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Achievements in Pictures</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {ncscImages.map((image, index) => (
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
export default NcscPage;
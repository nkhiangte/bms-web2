import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
const { Link } = ReactRouterDOM as any;

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300">&times;</button>
        <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
);

const InspireAwardPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{src:string;alt:string}|null>(null);
    const inspireImages = [
        {src:'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-4900955725830066556-n.jpg',alt:'Inspire Award Manak photo'},
        {src:'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg',alt:'Inspire Award Manak photo'},
        {src:'https://i.ibb.co/b5v8Hxvp/514372881-24293595740264800-8462211473640291659-n.jpg',alt:'Inspire Award Manak photo'},
        {src:'https://i.ibb.co/mVwyFSgJ/494758587-1100608388765203-5290716023143196073-n.jpg',alt:'Inspire Award Manak photo'},
        {src:'https://i.ibb.co/s9scMZyH/509441634-1141633191329389-7367666819097111066-n.jpg',alt:'Inspire Award Manak photo'},
        {src:'https://i.ibb.co/3yVTYJYk/474992910-1025250816300961-1770585234026191097-n.jpg',alt:'Inspire Award Manak photo'},
    ];
    return (
        <>
            <div className="bg-black py-16 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="mb-8">
                        <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                            <BackIcon className="w-5 h-5" />Back to Science & Maths Achievements
                        </Link>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">INSPIRE Award MANAK</h1>
                        <div className="space-y-6 text-slate-300 leading-relaxed">
                            <p>Since 2011, our school has actively participated in the INSPIRE Award MANAK programme (<a href="https://www.inspireawards-dst.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-semibold">Learn more</a>). This platform has given our students the opportunity to present innovative projects at both state and national levels.</p>
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li><strong className="text-white">2012</strong> – Lalhmangaihzuali won 1st Prize at the state level and represented Mizoram at the National Exhibition, New Delhi.</li>
                                <li><strong className="text-white">2015</strong> – Lalramengmawia won 2nd Prize at the state level and participated at the National Exhibition, New Delhi.</li>
                                <li><strong className="text-white">2020</strong> – Lalruatpuia Hrahsel was selected for the National Level, but the exhibition was cancelled due to Covid-19.</li>
                                <li><strong className="text-white">2021</strong> – J. Malsawma won 2nd Prize and presented at the National Exhibition, New Delhi.</li>
                                <li><strong className="text-white">2024</strong> – Paul K. Lalhruaitluanga won 2nd Prize at the state level.</li>
                            </ul>
                        </div>
                        <div className="mt-12 pt-8 border-t border-zinc-700">
                            <h2 className="text-2xl font-bold text-center text-white mb-8">Achievements in Pictures</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {inspireImages.map((img,i)=>(
                                    <figure key={i} className="aspect-square cursor-pointer group" onClick={()=>setSelectedImage(img)}>
                                        <img src={img.src} alt={img.alt} className="rounded-lg shadow-md w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 border border-zinc-700" loading="lazy" />
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedImage && <Lightbox src={selectedImage.src} alt={selectedImage.alt} onClose={()=>setSelectedImage(null)} />}
        </>
    );
};
export default InspireAwardPage;

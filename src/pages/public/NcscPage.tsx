import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';
const { Link } = ReactRouterDOM as any;

const Lightbox: React.FC<{src:string;alt:string;onClose:()=>void}> = ({src,alt,onClose}) => (
    <div className="fixed inset-0 bg-[#07162B]/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-[#DFC06B]">&times;</button>
        <img
            src={src}
            alt={alt}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl border border-[#C9A84C]/50"
            onClick={e=>e.stopPropagation()}
        />
    </div>
);

const NcscPage: React.FC = () => {
    const [selectedImage,setSelectedImage] = useState<{src:string;alt:string}|null>(null);
    const ncscImages = [
        'https://i.ibb.co/gbZSsDzP/515223941-24291994003758307-393621482748103493-n.jpg',
        'https://i.ibb.co/rR7Bx14K/515246164-10162776949751928-1985770073446807228-n.jpg',
        'https://i.ibb.co/s9hXhF4Q/515438443-10162780562481928-2459845752212302508-n.jpg',
        'https://i.ibb.co/5XPKMKZV/515503702-10162780562101928-5950071808391612573-n.jpg',
        'https://i.ibb.co/LzJgw5gH/515512561-24309982068626167-4944475833958490180-n.jpg',
        'https://i.ibb.co/whzxkh8g/515569932-10162780562611928-991674172130101053-n.jpg',
        'https://i.ibb.co/ymZXVvmD/518154716-10162834558566928-8065201215402155111-n.jpg',
        'https://i.ibb.co/Q7dQnwrq/518301896-10162834558556928-3569681775274891163-n.jpg',
        'https://i.ibb.co/HT5FJNR2/43823274-2082001785184180-8729620071065845760-n.jpg',
        'https://i.ibb.co/CKTLrBpD/49242663-10156563532346928-4125074315508973568-n.jpg',
        'https://i.ibb.co/1GGW9N6T/155517860-10158732566506928-5342967571712318670-n.jpg',
        'https://i.ibb.co/5pGLXFn/468268910-10161775723426928-2496725236831747593-n.jpg',
        'https://i.ibb.co/k6XL3xhz/468731825-10161871318756928-7943691516154849628-n.jpg',
        'https://i.ibb.co/tTXC4QWV/470189993-10162017409671928-3911441204160861156-n.jpg',
        'https://i.ibb.co/CTSRHM7/471989292-10162062483741928-1098968700965491660-n.jpg',
        'https://i.ibb.co/0pD4YVmX/494743505-10162482041481928-1214925901997431985-n.jpg',
        'https://i.ibb.co/GQznnNRh/508855611-10162714320096928-3115130264557838080-n.jpg',
        'https://i.ibb.co/4n0k0J9W/514949967-24322776687346705-6043877798367325580-n.jpg',
    ].map(src=>({src,alt:'Science Congress photo'}));
    return (
        <>
        <div className="bg-[#F4F7FB] py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-6">
                    <Link to="/achievements/science" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A] hover:text-[#8E6D1B] transition-colors">
                        <BackIcon className="w-5 h-5" />Back to Science &amp; Maths Achievements
                    </Link>
                </div>
                <div className="bg-white border border-[#0B1F3A]/15 border-t-4 border-t-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-lg">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mb-6">National Children&apos;s Science Congress</h1>
                    <div className="space-y-6 text-[#132D52] leading-relaxed">
                        <p>The Children&apos;s Science Congress, organized by the Department of Science &amp; Technology, has been another platform where our students consistently shine.</p>
                        <ul className="space-y-2.5">
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2012–2013</strong> – Students won 1st Prizes at the District Level and advanced to the State Level.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2014</strong> – H. Lalrinchhani won 1st Prize at the District Level and was selected for the National Level, Bengaluru.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2015</strong> – C. Lalrindiki represented Mizoram at the National Level, Chandigarh.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2016</strong> – Lalhunthari presented at the National Level, Baramati (Pune).</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2017</strong> – Lalzikpuii Hrahsel won 1st Prize at the District Level.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2018</strong> – Lalruatlawmi was selected for the National Level, Bhubaneswar.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2019–2022</strong> – Students participated actively at the State Level.</li>
                            <li className="p-3 bg-[#F4F7FB] rounded-lg border-l-4 border-[#C9A84C]"><strong className="text-[#0B1F3A] font-tabular">2023</strong> – J. Malsawmzuali won 1st Prize at the District Level and was selected for the National Level.</li>
                        </ul>
                    </div>
                    <div className="mt-12 pt-8 border-t border-[#C9A84C]/40">
                        <h2 className="text-2xl font-bold text-center text-[#0B1F3A] mb-8">Achievements in Pictures</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {ncscImages.map((img,i)=>(
                                <figure key={i} className="aspect-square cursor-pointer group bg-[#F4F7FB] rounded-xl overflow-hidden border border-[#0B1F3A]/15" onClick={()=>setSelectedImage(img)}>
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                                    />
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
export default NcscPage;

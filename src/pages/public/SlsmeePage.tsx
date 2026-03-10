import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BackIcon } from '@/components/Icons';

const { Link } = ReactRouterDOM as any;

const Lightbox: React.FC<{src:string;alt:string;onClose:()=>void}> = ({src,alt,onClose}) => (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300">&times;</button>
        <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e=>e.stopPropagation()} />
    </div>
);

const SlsmeePage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{src:string;alt:string}|null>(null);

    const slsmeeImages = [
        'https://i.ibb.co/wJgWfX6/science-lab.jpg',
        'https://i.ibb.co/PZQWjnSw/513908221-24296131616677879-6351230232773483387-n.jpg',
        'https://i.ibb.co/hxs5HZkg/514531788-24296131393344568-2198525709277279617-n.jpg',
        'https://i.ibb.co/MDHGVk98/515288958-24296131586677882-6482541779742828754-n.jpg',
        'https://i.ibb.co/4g8vs7WT/82365382-2885695514814799-2974900507639808000-n.jpg',
        'https://i.ibb.co/whzxkh8g/82382633-2885695498148134-4845767534265237504-n.jpg',
        'https://i.ibb.co/zhPpFsrV/82469687-2885695048148179-1340365598370037760-n.jpg',
        'https://i.ibb.co/PfT51zh/82747208-2885695434814807-6273726259037995008-n.jpg',
        'https://i.ibb.co/HLPfWzv1/83063680-2885695028148181-1408408686476394496-n.jpg',
        'https://i.ibb.co/kV3Pgcm0/83551238-2885695264814824-1483087417450692608-n.jpg',
        'https://i.ibb.co/sp9jKKfM/472763465-1012448840914492-4576499978317823426-n.jpg',
        'https://i.ibb.co/67F3PL7Y/472787086-1012448884247821-5086531350531673060-n.jpg',
        'https://i.ibb.co/B5LqqzkF/472789339-1012448834247826-4896396285884982823-n.jpg',
        'https://i.ibb.co/RpCP2rQR/484024136-1059203859572323-361806768226200750-n.jpg',
        'https://i.ibb.co/Rp21YDVp/486554010-1071003088392400-3077242666718941925-n.jpg',
        'https://i.ibb.co/FkGDQzSQ/scf.jpg',
        'https://i.ibb.co/YBvNNktr/487351624-1071003008392408-7745277044986580374-n.jpg',
        'https://i.ibb.co/ccnpZkwX/495015908-1100608392098536-6482439324117342875-n.jpg',
        'https://i.ibb.co/Pzw3KnFQ/511058197-1141633201329388-4248602465406784120-n.jpg',
        'https://i.ibb.co/7JTMXNkx/513070738-24296131426677898-8876353783963498086-n.jpg',
        'https://i.ibb.co/SwJs3prt/515491676-24325519250405782-8117117242357659744-n.jpg',
        'https://i.ibb.co/jPCJ4VR2/515652627-24325519513739089-8070440370248861293-n.jpg',
        'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg',
        'https://i.ibb.co/HLwXyYmZ/514321849-24323008767323497-3271600711330002798-n.jpg',
        'https://i.ibb.co/0Rm6n0xP/514326823-24294659990158375-4829408242396113050-n.jpg',
        'https://i.ibb.co/x8RXYkQX/514373461-24294660123491695-5305558488763545236-n.jpg',
        'https://i.ibb.co/PGhpKNNv/515008876-24325519613739079-230914487716669804-n.jpg',
        'https://i.ibb.co/cKrKrWkw/515396969-24323008997323474-2379869968809350831-n.jpg',
    ].map(src => ({src, alt:'Science Exhibition photo'}));

    return (
        <>
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-8">
                    <Link to="/achievements/science" className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        <BackIcon className="w-5 h-5" /> Back to Science & Maths Achievements
                    </Link>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">State Level Science Mathematics & Environment Exhibition (SLSMEE)</h1>
                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <p>Participation in the SLSMEE organized by SCERT began in 2006, and since then, our students have created an inspiring legacy.</p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li><strong className="text-white">2006</strong> – First participation.</li>
                            <li><strong className="text-white">2014</strong> – Lalrinchhani (Class IX) won 3rd Prize, and showcased her project at the <a href="https://bitm.gov.in/science-fair/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-semibold">Eastern India Science Fair</a> 2015 at BITM, Kolkata.</li>
                            <li><strong className="text-white">2015</strong> – Runrempuia and Vanlalfeli (both Class IX) won 1st Prizes; all three represented Mizoram at BITM, Kolkata.</li>
                            <li><strong className="text-white">2016</strong> – Joar Vanlalchhanhimi won 1st Prize, earning a place at <a href="https://ncert.nic.in/jn-national-science-exhibition.php?ln=en" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline font-semibold">JNSMEE 2017</a> in Bhopal.</li>
                            <li><strong className="text-white">2017</strong> – C.L. Kimteii and R. Lalrinmawii won prizes and presented at BITM, Kolkata 2018.</li>
                            <li><strong className="text-white">2018</strong> – Zenngoluni won 1st Prize and Dosiamliana won 2nd Prize, both advancing to BITM, Kolkata 2019.</li>
                            <li><strong className="text-white">2019</strong> – Four students represented the state at the Eastern India Science Fair 2020, BITM, Kolkata.</li>
                            <li><strong className="text-white">2022</strong> – Laldinpuii won 1st Prize in the Mathematics category.</li>
                            <li><strong className="text-white">2024</strong> – Lawmgsangzuali Hmar and Lalruatkima represented the state at the NE India Science Fair, National Science Centre, Guwahati.</li>
                        </ul>
                    </div>
                    <div className="mt-12 pt-8 border-t border-zinc-700">
                        <h2 className="text-2xl font-bold text-center text-white mb-8">Achievements in Pictures</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {slsmeeImages.map((img,i) => (
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
export default SlsmeePage;

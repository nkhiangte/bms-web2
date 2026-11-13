import React, { useState } from 'react';

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

const SportsPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{src:string;alt:string}|null>(null);

    const sportsImages = [
        { src:"https://i.ibb.co/5XTrLbwh/basketball.jpg", alt:"Basketball team with trophy", caption:"Champion of District Middle School Basketball Tournament 2024" },
        { src:"https://i.ibb.co/n8fnmNhH/72697182-2681155108602175-1363499533471842304-n.jpg", alt:"Middle School District RYFS winner", caption:"Middle School District RYFS winner" },
        { src:"https://i.ibb.co/XfxCBgmf/472918646-1015291717296871-2380144409877056095-n.jpg", alt:"Lalthanpuia with his gold medal", caption:"Lalthanpuia with his gold medal" },
    ];

    return (
        <>
            <div className="relative py-12 md:py-16 bg-[#0B1F3A]">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"url('/assets/school/campus.jpg')"}}></div>
                <div className="absolute inset-0 bg-[#07162B]/85"></div>
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white border-t-4 border-[#C9A84C] p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-10">
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                                Athletics &amp; Teamwork
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">Sports</h1>
                        </div>
                        <div className="space-y-5 text-[#132D52] leading-relaxed">
                            <p>At our school, we believe that education is not complete without a strong focus on physical well-being. Since its inception, the school has actively encouraged students to participate in sports and games, recognizing their role in building discipline, teamwork, and a healthy lifestyle.</p>
                            <p>One of the most anticipated events of the year is the Annual Sports Week, where students compete with enthusiasm and sportsmanship. Students proudly represent their houses – Blue, Green, Yellow, and Red – in a spirit of friendly rivalry.</p>
                            <p>The school campus is equipped with a basketball court and a volleyball court, while a community football field lies just 300 meters away, ensuring easy access for training and matches.</p>
                            <p className="font-semibold text-[#0B1F3A]">Some of our proud achievements include:</p>
                            <ul className="list-disc list-inside space-y-2.5 pl-2 sm:pl-4">
                                <li><strong className="text-[#0B1F3A] font-tabular">2024</strong> – Our Middle School team was crowned District Inter-Middle School Basketball Champion, organized by the Champhai Basketball Association.</li>
                                <li><strong className="text-[#0B1F3A] font-tabular">2022</strong> – Our student Lalthanpuia won the Gold Medal in Shotput at the State School Games.</li>
                                <li><strong className="text-[#0B1F3A] font-tabular">2019</strong> – Our Middle School football team won the District Reliance Foundation Youth Sports (RFYS).</li>
                            </ul>
                            <p>Sports at our school are more than just competitions – they instill confidence, teach resilience, and nurture the spirit of unity and perseverance among our students.</p>
                        </div>
                        <div className="mt-12 pt-8 border-t border-[#C9A84C]/40">
                            <h2 className="text-2xl font-bold text-center text-[#0B1F3A] mb-8">Achievements in Pictures</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {sportsImages.map((img,i) => (
                                    <figure key={img.src} className={`${i===0?'md:col-span-2':''} cursor-pointer group`} onClick={()=>setSelectedImage(img)} aria-hidden="true">
                                        <div className="overflow-hidden rounded-xl shadow-md border border-[#0B1F3A]/15 bg-[#F4F7FB]">
                                            <img
                                                src={img.src}
                                                alt={img.alt}
                                                loading="lazy"
                                                decoding="async"
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/school/campus.jpg'; }}
                                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <figcaption className="mt-2 text-center text-sm text-[#132D52]/75 italic">{img.caption}</figcaption>
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
export default SportsPage;

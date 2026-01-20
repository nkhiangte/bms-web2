import React, { useState, useMemo, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { FolderIcon } from '../../components/Icons';

const { useLocation } = ReactRouterDOM as any;

// Data structure definitions
interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryFolder {
  name: string;
  thumbnail: string;
  images?: GalleryImage[];
  subfolders?: GalleryFolder[];
}

// Hierarchical data structure for the entire gallery
const galleryData: GalleryFolder[] = [
    {
        name: 'By Event/Occasion',
        thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg',
        subfolders: [
            { name: 'Annual Day', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg', images: [] },
            { name: 'Sports Day', thumbnail: 'https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png', images: [{ src: 'https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png', alt: 'A collage of students participating in sports day activities' }] },
            {
                name: 'Science Fair',
                thumbnail: 'https://i.ibb.co/wJgWfX6/science-lab.jpg',
                subfolders: [
                    { name: 'Science Exhibition', thumbnail: 'https://i.ibb.co/PZQWjnSw/513908221-24296131616677879-6351230232773483387-n.jpg', images: [
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
                    ] },
                    { name: 'Science Congress', thumbnail: 'https://i.ibb.co/gbZSsDzP/515223941-24291994003758307-393261482748103493-n.jpg', images: [
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
                    ] },
                    { name: 'Inspire Award Manak', thumbnail: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-6900955725830066556-n.jpg', images: [
                        { src: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-6900955725830066556-n.jpg', alt: 'Inspire Award Manak photo' },
                        { src: 'https://i.ibb.co/wNdTrN1Y/514321355-24293614526929588-1390587138641001551-n.jpg', alt: 'Inspire Award Manak photo' },
                        { src: 'https://i.ibb.co/b5v8Hxvp/514372881-24293595740264800-8462211473640291659-n.jpg', alt: 'Inspire Award Manak photo' },
                        { src: 'https://i.ibb.co/mVwyFSgJ/494758587-1100608388765203-5290716023143196073-n.jpg', alt: 'Inspire Award Manak photo' },
                        { src: 'https://i.ibb.co/s9scMZyH/509441634-1141633191329389-7367666819097111066-n.jpg', alt: 'Inspire Award Manak photo' },
                    ] },
                ]
            },
            { name: 'Independence Day', thumbnail: 'https://i.ibb.co/cS90VHKc/476668433-1037388101753899-3862117555630986673-n.jpg', images: [
                { src: 'https://i.ibb.co/cS90VHKc/476668433-1037388101753899-3862117555630986673-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/LzLCBP5C/476799614-1037388158420560-5930861916188103240-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/xKJ2Vmqc/476817001-1037388215087221-6787739082745578123-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/pBwR8m3r/477715750-1037388038420572-6037139661675919890-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/bgCgpTmh/514347424-24305597779064596-5890144361028005399-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/RtvBnb6/515443063-24305597772397930-5359059720813545254-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/GQLyjhTp/515495100-24305597765731264-4232971096819185273-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/Xx5G3vcj/69312373-2559072040810483-3884789419491721216-n.jpg', alt: 'Independence Day photo' },
                { src: 'https://i.ibb.co/3YpNzBvG/83944464-2900796296638054-3861645915202781184-n.jpg', alt: 'Independence Day photo' },
            ] },
            { name: 'Teachers Day', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg', images: [] },
            { name: 'Cultural Programs', thumbnail: 'https://i.ibb.co/jPvswhZt/473249294-1015300233962686-4114946528800957864-n.jpg', images: [
                { src: 'https://i.ibb.co/jPvswhZt/473249294-1015300233962686-4114946528800957864-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/HTkC8v8G/473266941-1015300330629343-3572310492262552047-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/3yLj5hLs/486552052-1071019135057462-4778827989130498675-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/Ps0pN4Yt/486574547-1071019188390790-6341207713011567687-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/dJK9XrS3/486609366-1071019231724119-1055579064156903141-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/rK1NG3SV/486609645-1071019125057463-5128797904548773228-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/S71VDzzx/486969079-1071019221724120-4832506910434299230-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/VkPGnCy/487054235-1071019118390797-8792701053921172051-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/KpMhYKX9/487367981-1071019228390786-4555676267454479014-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/zTWwd46v/510437859-24227474656876909-5106638019103131461-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/zTWwd46v/510437859-24227474656876909-5106638019103131461-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/cXMTZbGZ/510439662-24227472690210439-1781996875253238322-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/sdr698Ds/510490190-24227472726877102-8288538556354951387-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/21CDyFzV/510950628-24227474693543572-5828141449774296078-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/XxrGFcgj/514001704-24293994076891633-1609471865320658363-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/ycccdVtZ/515057172-24293993676891673-2056123332010295857-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/jZvhWTfT/46376991-2132009286850096-5163845399093444608-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/Z64ybh9X/472961530-1015300333962676-5968792782051593440-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/0pLPxynC/473112738-1015300023962707-3363142981550390990-n.jpg', alt: 'Cultural Program photo' },
                { src: 'https://i.ibb.co/MkD54SgZ/473237073-1015300300629346-6179338872225975629-n.jpg', alt: 'Cultural Program photo' },
            ] },
            { name: 'Competitions', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg', images: [] },
            { 
                name: 'Field Trips', 
                thumbnail: 'https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg',
                subfolders: [
                    {
                        name: 'Eco-Club',
                        thumbnail: 'https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg',
                        images: [
                            { src: 'https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg', alt: 'Eco-Club Field Trip Photo 1' },
                            { src: 'https://i.ibb.co/99MNzTFm/482016092-1057352176424158-7792727531104613420-n.jpg', alt: 'Eco-Club Field Trip Photo 2' },
                            { src: 'https://i.ibb.co/vW928kd/482018943-1057347896424586-5123530206387161722-n.jpg', alt: 'Eco-Club Field Trip Photo 3' }
                        ]
                    }
                ]
            },
        ]
    },
    {
        name: 'By Year',
        thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg',
        subfolders: [
            { name: '2025 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', images: [] },
            { name: '2024 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', images: [{ src: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', alt: 'Students gathered outside on the school grounds' }, { src: 'https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png', alt: 'A collage of students participating in sports day activities' }] },
            { name: '2023 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', images: [] },
        ]
    },
    {
        name: 'By Category',
        thumbnail: 'https://i.ibb.co/L5r89w8/classroom.jpg',
        subfolders: [
            { 
                name: 'Students', 
                thumbnail: 'https://i.ibb.co/qY7bFZS/students-hands-up.jpg', 
                subfolders: [
                    { name: 'Nursery', thumbnail: 'https://i.ibb.co/qY7bFZS/students-hands-up.jpg', images: [] },
                    { name: 'Kindergarten', thumbnail: 'https://i.ibb.co/7tJPj551/KG.jpg', images: [{ src: 'https://i.ibb.co/7tJPj551/KG.jpg', alt: 'Kindergarten students' }] },
                    { name: 'Class I', thumbnail: 'https://i.ibb.co/Xf5c4818/Class-I.jpg', images: [{ src: 'https://i.ibb.co/Xf5c4818/Class-I.jpg', alt: 'Class I students' }] },
                    { name: 'Class II', thumbnail: 'https://i.ibb.co/tMrpjDZ0/class-II.jpg', images: [{ src: 'https://i.ibb.co/tMrpjDZ0/class-II.jpg', alt: 'Class II students' }] },
                    { name: 'Class III', thumbnail: 'https://i.ibb.co/cXSYv4mz/Class-III.jpg', images: [{ src: 'https://i.ibb.co/cXSYv4mz/Class-III.jpg', alt: 'Class III students' }] },
                    { name: 'Class IV', thumbnail: 'https://i.ibb.co/d03Y9tK8/IV.jpg', images: [{ src: 'https://i.ibb.co/d03Y9tK8/IV.jpg', alt: 'Class IV students' }] },
                    { name: 'Class V', thumbnail: 'https://i.ibb.co/Y4h2LgxK/V.jpg', images: [{ src: 'https://i.ibb.co/Y4h2LgxK/V.jpg', alt: 'Class V students' }] },
                    { name: 'Class VI', thumbnail: 'https://i.ibb.co/YHMpJV4/vi.jpg', images: [{ src: 'https://i.ibb.co/YHMpJV4/vi.jpg', alt: 'Class VI students' }] },
                    { name: 'Class VII', thumbnail: 'https://i.ibb.co/mr37WwBH/VII.jpg', images: [{ src: 'https://i.ibb.co/mr37WwBH/VII.jpg', alt: 'Class VII students' }] },
                    { name: 'Class VIII', thumbnail: 'https://i.ibb.co/r2wSqfQn/VIII.jpg', images: [{ src: 'https://i.ibb.co/qY7bFZS/students-hands-up.jpg', alt: 'Students raising their hands in class' }, { src: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', alt: 'Students gathered outside on the school grounds' }, { src: 'https://i.ibb.co/r2wSqfQn/VIII.jpg', alt: 'Class VIII students' }] },
                    { name: 'Class IX', thumbnail: 'https://i.ibb.co/JFFqxc47/IX.jpg', images: [{ src: 'https://i.ibb.co/JFFqxc47/IX.jpg', alt: 'Class IX students' }] },
                    { name: 'Class X', thumbnail: 'https://i.ibb.co/Rk4f4FCm/X.jpg', images: [{ src: 'https://i.ibb.co/Rk4f4FCm/X.jpg', alt: 'Class X students' }] },
                ]
            },
            { name: 'Campus & Infrastructure', thumbnail: 'https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg', images: [{ src: 'https://i.ibb.co/3sZq1bM/library.jpg', alt: 'School library with shelves full of books' }, { src: 'https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg', alt: 'Front view of the Bethel Mission School building' }] },
            { name: 'Classrooms', thumbnail: 'https://i.ibb.co/L5r89w8/classroom.jpg', images: [{ src: 'https://i.ibb.co/L5r89w8/classroom.jpg', alt: 'Bright and modern classroom with students' }] },
            { name: 'Achievements', thumbnail: 'https://i.ibb.co/wJgWfX6/science-lab.jpg', images: [] },
            { name: 'Activities', thumbnail: 'https://i.ibb.co/0Y1k4g3/art-class.jpg', images: [{ src: 'https://i.ibb.co/0Y1k4g3/art-class.jpg', alt: 'Children engaged in an art and craft class' }] },
            { name: 'Alumni', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg', images: [] },
        ]
    }
];


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
                onClick={e => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
        </div>
    );
};

const GalleryPage: React.FC = () => {
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        if (location.state?.initialPath && Array.isArray(location.state.initialPath)) {
            setCurrentPath(location.state.initialPath);
        }
    }, [location.state]);

    const handleFolderClick = (folderName: string) => {
        setCurrentPath(prev => [...prev, folderName]);
    };

    const handleBreadcrumbClick = (index: number) => {
        setCurrentPath(prev => prev.slice(0, index + 1));
    };

    const currentContent = useMemo(() => {
        let content: { subfolders?: GalleryFolder[], images?: GalleryImage[] } = { subfolders: galleryData };
        let currentLevel = galleryData;
        
        for (const folderName of currentPath) {
            const nextFolder = currentLevel.find(f => f.name === folderName);
            if (nextFolder) {
                content = { subfolders: nextFolder.subfolders, images: nextFolder.images };
                currentLevel = nextFolder.subfolders || [];
            } else {
                return { subfolders: galleryData };
            }
        }
        return content;
    }, [currentPath]);

    const hasContent = (currentContent.subfolders && currentContent.subfolders.length > 0) || (currentContent.images && currentContent.images.length > 0);

    return (
        <>
            <div className="bg-slate-50 py-16 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold text-slate-800 text-center">School Gallery</h1>
                    </div>
                    
                    {/* Breadcrumbs */}
                    <nav className="text-sm font-semibold text-slate-600 mb-8 flex items-center flex-wrap" aria-label="Breadcrumb">
                        <button onClick={() => setCurrentPath([])} className="hover:text-sky-600">Gallery</button>
                        {currentPath.map((folder, index) => (
                            <React.Fragment key={folder}>
                                <span className="mx-2">/</span>
                                <button onClick={() => handleBreadcrumbClick(index)} className="hover:text-sky-600">
                                    {folder}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>

                    {!hasContent ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <p className="text-slate-700 text-lg font-semibold">This folder is empty.</p>
                            <p className="text-slate-600 mt-2">More photos coming soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Render Folders */}
                            {currentContent.subfolders?.map((folder) => (
                                <div 
                                    key={folder.name}
                                    onClick={() => handleFolderClick(folder.name)}
                                    className="aspect-square relative rounded-lg overflow-hidden shadow-md cursor-pointer group"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${folder.thumbnail})` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
                                    <div className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                                        <FolderIcon className="w-8 h-8 opacity-80" />
                                        <h3 className="font-bold text-lg mt-1">{folder.name}</h3>
                                    </div>
                                </div>
                            ))}

                            {/* Render Images */}
                            {currentContent.images?.map((image, index) => (
                                <div 
                                    key={index} 
                                    className="aspect-square bg-slate-200 rounded-lg overflow-hidden shadow-md cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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

export default GalleryPage;
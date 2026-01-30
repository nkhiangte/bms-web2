
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve member export issues
import * as ReactRouterDOM from 'react-router-dom';
import { FolderIcon } from '../../components/Icons';
import DynamicImageGrid from '../../components/DynamicImageGrid';
import { User } from '../../types';

const { useLocation } = ReactRouterDOM as any;

// Data structure definitions
interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryFolder {
  name: string;
  thumbnail: string;
  images?: GalleryImage[]; // Legacy support for hardcoded images
  subfolders?: GalleryFolder[];
}

// Hierarchical data structure for the entire gallery
const galleryData: GalleryFolder[] = [
    {
        name: 'By Event/Occasion',
        thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg',
        subfolders: [
            { name: 'Annual Day', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg' },
            { name: 'Sports Day', thumbnail: 'https://i.ibb.co/G4nP4YwB/photo-collage-png-1.png' },
            {
                name: 'Science Fair',
                thumbnail: 'https://i.ibb.co/wJgWfX6/science-lab.jpg',
                subfolders: [
                    { name: 'Science Exhibition', thumbnail: 'https://i.ibb.co/PZQWjnSw/513908221-24296131616677879-6351230232773483387-n.jpg' },
                    { name: 'Science Congress', thumbnail: 'https://i.ibb.co/gbZSsDzP/515223941-24291994003758307-393261482748103493-n.jpg' },
                    { name: 'Inspire Award Manak', thumbnail: 'https://i.ibb.co/4RQczTjb/511184389-1141633194662722-6900955725830066556-n.jpg' },
                ]
            },
            { name: 'Independence Day', thumbnail: 'https://i.ibb.co/cS90VHKc/476668433-1037388101753899-3862117555630986673-n.jpg' },
            { name: 'Teachers Day', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg' },
            { name: 'Cultural Programs', thumbnail: 'https://i.ibb.co/jPvswhZt/473249294-1015300233962686-4114946528800957864-n.jpg' },
            { name: 'Competitions', thumbnail: 'https://i.ibb.co/xqSRg0WL/nano-banana-no-bg-2025-08-30-T18-20-46.jpg' },
            { 
                name: 'Field Trips', 
                thumbnail: 'https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg',
                subfolders: [
                    {
                        name: 'Eco-Club',
                        thumbnail: 'https://i.ibb.co/JjD8shYt/482014936-1057351903090852-7796551938999983593-n.jpg',
                    }
                ]
            },
        ]
    },
    {
        name: 'By Year',
        thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg',
        subfolders: [
            { name: '2025 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg' },
            { name: '2024 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg' },
            { name: '2023 Events', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg' },
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
                    { name: 'Nursery', thumbnail: 'https://i.ibb.co/qY7bFZS/students-hands-up.jpg' },
                    { name: 'Kindergarten', thumbnail: 'https://i.ibb.co/7tJPj551/KG.jpg' },
                    { name: 'Class I', thumbnail: 'https://i.ibb.co/Xf5c4818/Class-I.jpg' },
                    { name: 'Class II', thumbnail: 'https://i.ibb.co/tMrpjDZ0/class-II.jpg' },
                    { name: 'Class III', thumbnail: 'https://i.ibb.co/cXSYv4mz/Class-III.jpg' },
                    { name: 'Class IV', thumbnail: 'https://i.ibb.co/d03Y9tK8/IV.jpg' },
                    { name: 'Class V', thumbnail: 'https://i.ibb.co/Y4h2LgxK/V.jpg' },
                    { name: 'Class VI', thumbnail: 'https://i.ibb.co/YHMpJV4/vi.jpg' },
                    { name: 'Class VII', thumbnail: 'https://i.ibb.co/mr37WwBH/VII.jpg' },
                    { name: 'Class VIII', thumbnail: 'https://i.ibb.co/r2wSqfQn/VIII.jpg' },
                    { name: 'Class IX', thumbnail: 'https://i.ibb.co/JFFqxc47/IX.jpg' },
                    { name: 'Class X', thumbnail: 'https://i.ibb.co/Rk4f4FCm/X.jpg' },
                ]
            },
            { name: 'Campus & Infrastructure', thumbnail: 'https://i.ibb.co/BHqzjc7B/476817001-1037388215087221-6787739082745578123-n.jpg' },
            { name: 'Classrooms', thumbnail: 'https://i.ibb.co/L5r89w8/classroom.jpg' },
            { name: 'Achievements', thumbnail: 'https://i.ibb.co/wJgWfX6/science-lab.jpg' },
            { name: 'Activities', thumbnail: 'https://i.ibb.co/0Y1k4g3/art-class.jpg' },
            { name: 'Alumni', thumbnail: 'https://i.ibb.co/yc3mzG5V/IMG-4859.jpg' },
        ]
    }
];

interface GalleryPageProps {
    user: User | null;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ user }) => {
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState<string[]>([]);

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
        let content: { subfolders?: GalleryFolder[] } = { subfolders: galleryData };
        let currentLevel = galleryData;
        
        for (const folderName of currentPath) {
            const nextFolder = currentLevel.find(f => f.name === folderName);
            if (nextFolder) {
                content = { subfolders: nextFolder.subfolders };
                currentLevel = nextFolder.subfolders || [];
            } else {
                // If not found (shouldn't happen in normal flow), revert to root
                return { subfolders: galleryData };
            }
        }
        return content;
    }, [currentPath]);

    const isLeafNode = !currentContent.subfolders || currentContent.subfolders.length === 0;

    // Generate a unique ID for Firestore based on the folder path
    const galleryId = currentPath.length > 0 
        ? `gallery_${currentPath.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '_')).join('_')}`
        : 'gallery_root';

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

                    {!isLeafNode ? (
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
                        </div>
                    ) : (
                        // Render Dynamic Grid for Leaf Nodes
                        <DynamicImageGrid id={galleryId} user={user} displayType="grid" />
                    )}
                </div>
            </div>
        </>
    );
};

export default GalleryPage;

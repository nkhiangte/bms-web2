/**
 * ONE-TIME SEED SCRIPT
 * Run this once from your browser console or as a utility to migrate
 * all hardcoded achievements into Firestore.
 *
 * Usage: import and call seedAchievements() once, e.g. from a temp admin button.
 * Delete or disable after running.
 */

import { db } from '@/firebaseConfig';

const hardcodedAchievements = [
    // ── Academic ──────────────────────────────────────────────────────────────
    {
        title: 'MBSE HSLC 4th Rank',
        description: 'Esther Tingbiakmuani secured 4th rank in the MBSE HSLC Board Examination.',
        year: '2023',
        category: 'Academic',
        studentName: 'Esther Tingbiakmuani',
        imageUrl: 'https://i.ibb.co/v4zsJtrq/esther.jpg',
    },
    {
        title: 'MBSE HSLC 10th Rank',
        description: 'Manngaihsangi secured 10th rank in the MBSE HSLC Board Examination.',
        year: '2020',
        category: 'Academic',
        studentName: 'Manngaihsangi',
        imageUrl: 'https://i.ibb.co/4wrY5r7B/manngaih.jpg',
    },
    {
        title: 'MBSE HSLC 10th Rank',
        description: 'C.L. Kimteii secured 10th rank in the MBSE HSLC Board Examination.',
        year: '2019',
        category: 'Academic',
        studentName: 'C.L. Kimteii',
        imageUrl: 'https://i.ibb.co/ks8prn9Z/cl-kim.jpg',
    },
    {
        title: 'MBSE HSLC 10th Rank',
        description: 'R. Lalrinmawii secured 10th rank in the MBSE HSLC Board Examination.',
        year: '2019',
        category: 'Academic',
        studentName: 'R. Lalrinmawii',
        imageUrl: 'https://i.ibb.co/1fYFM37C/r-rinmawii.jpg',
    },

    // ── Sports ────────────────────────────────────────────────────────────────
    {
        title: 'District Inter-Middle School Basketball Champions',
        description: 'Our Middle School team was crowned District Inter-Middle School Basketball Champion, organised by the Champhai Basketball Association.',
        year: '2024',
        category: 'Sports',
        studentName: '',
        imageUrl: 'https://i.ibb.co/5XTrLbwh/basketball.jpg',
    },
    {
        title: 'Gold Medal — Shotput, State School Games',
        description: 'Lalthanpuia won the Gold Medal in Shotput at the State School Games.',
        year: '2022',
        category: 'Sports',
        studentName: 'Lalthanpuia',
        imageUrl: 'https://i.ibb.co/XfxCBgmf/472918646-1015291717296871-2380144409877056095-n.jpg',
    },
    {
        title: 'District RFYS Football Winners',
        description: 'Our Middle School football team won the District Reliance Foundation Youth Sports (RFYS) tournament.',
        year: '2019',
        category: 'Sports',
        studentName: '',
        imageUrl: 'https://i.ibb.co/n8fnmNhH/72697182-2681155108602175-1363499533471842304-n.jpg',
    },

    // ── Quiz ──────────────────────────────────────────────────────────────────
    {
        title: 'District Level Inter-School Quiz — Winners',
        description: 'Our students won the District Level Inter-School Quiz Competition.',
        year: '2023',
        category: 'Quiz',
        studentName: '',
        imageUrl: '',
    },
    {
        title: 'State Level General Knowledge Olympiad — Runners-up',
        description: 'Our students finished as runners-up at the State Level General Knowledge Olympiad.',
        year: '2022',
        category: 'Quiz',
        studentName: '',
        imageUrl: '',
    },
];

export async function seedAchievements() {
    console.log('Seeding achievements...');
    const batch = db.batch();

    hardcodedAchievements.forEach(achievement => {
        const ref = db.collection('achievements').doc();
        batch.set(ref, achievement);
    });

    await batch.commit();
    console.log(`✅ ${hardcodedAchievements.length} achievements seeded successfully!`);
}

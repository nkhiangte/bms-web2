import { Grade } from '@/types';

export interface CurriculumChapter {
    name: string;
    description?: string;
}

export const MBSE_CURRICULUM_CHAPTERS: Record<string, Record<string, string[]>> = {
    [Grade.IX]: {
        'Mathematics': [
            '1. Number Systems',
            '2. Polynomials',
            '3. Coordinate Geometry',
            '4. Linear Equations in Two Variables',
            '5. Lines and Angles',
            '6. Triangles (Congruence Criteria)',
            '7. Quadrilaterals',
            '8. Circles (Chords, Perpendicular from Centre, Subtended Angles by Arcs)',
            '9. Constructions (Triangle given base, angle and sum/diff of sides, perimeter, triangle & quadrilateral of equal area)',
            '10. Compound Interest (Growth & Depreciation)',
            '11. Heron’s Formula',
            '12. Surface Areas and Volumes',
            '13. Statistics'
        ],
        'Science': [
            '1. Matter in Our Surroundings',
            '2. Is Matter Around Us Pure?',
            '3. Atoms and Molecules',
            '4. Structure of the Atom',
            '5. The Fundamental Unit of Life (Cell)',
            '6. Tissues (Plant and Animal Tissues)',
            '7. Motion',
            '8. Force and Laws of Motion',
            '9. Gravitation (Floatation, Archimedes Principle)',
            '10. Work and Energy',
            '11. Sound',
            '12. Improvement in Food Resources'
        ],
        'Social Science': [
            'History: 1. The French Revolution',
            'History: 2. Socialism in Europe & Russian Revolution',
            'History: 3. Nazism and the Rise of Hitler',
            'Geography: 1. India - Size and Location',
            'Geography: 2. Physical Features of India',
            'Geography: 3. Drainage System',
            'Geography: 4. Climate',
            'Geography: 5. Natural Vegetation and Wildlife',
            'Geography: 6. Population',
            'Pol. Science: 1. What is Democracy? Why Democracy?',
            'Pol. Science: 2. Constitutional Design',
            'Pol. Science: 3. Electoral Politics',
            'Pol. Science: 4. Working of Institutions',
            'Pol. Science: 5. Democratic Rights',
            'Economics: 1. The Story of Village Palampur',
            'Economics: 2. People as Resource',
            'Economics: 3. Poverty as a Challenge',
            'Economics: 4. Food Security in India'
        ],
        'English': [
            'Beehive: 1. The Fun They Had',
            'Beehive: 2. The Sound of Music',
            'Beehive: 3. The Little Girl',
            'Beehive: 4. A Truly Beautiful Mind',
            'Beehive: 5. The Snake and the Mirror',
            'Beehive: 6. My Childhood',
            'Beehive: 7. Reach for the Top',
            'Beehive: 8. Kathmandu',
            'Beehive: 9. If I Were You',
            'Poetry: The Road Not Taken',
            'Poetry: Wind',
            'Poetry: Rain on the Roof',
            'Poetry: A Legend of the Northland',
            'Poetry: No Men Are Foreign',
            'Poetry: On Killing a Tree',
            'Poetry: A Slumber Did My Spirit Seal',
            'Moments (Supplementary Reader)',
            'Grammar: Tenses, Modals, Subject-Verb Concord, Reported Speech',
            'Writing: Descriptive Paragraph, Diary Entry, Short Story'
        ],
        'Mizo': [
            'Thu (Prose) - MBSE Text',
            'Hla (Poetry) - MBSE Text',
            'Lemchan (Drama) - MBSE Text',
            'Mizo Grammar (Tawng Upa, Mizo Tawng Ziah Dan, Zaibul)',
            'Essay & Letter Writing (Thuziak leh Lehkhathawn)'
        ],
        'Hindi': [
            'Sparsh (Prose & Poetry)',
            'Sanchayan',
            'Hindi Vyakaran (Varn Vichar, Sandhi, Samas, Muhavare)',
            'Patra Lekhan & Nibandh'
        ],
        'Computer': [
            '1. Computer System Overview',
            '2. Input and Output Devices',
            '3. Memory and Storage Devices',
            '4. Basics of Operating Systems',
            '5. Word Processing (MS Word / LibreOffice)',
            '6. Presentation Software (PowerPoint)',
            '7. Spreadsheets (MS Excel)',
            '8. Cyber Safety and Ethics'
        ]
    },
    [Grade.X]: {
        'Mathematics': [
            '1. Real Numbers (Fundamental Theorem of Arithmetic)',
            '2. Polynomials (Zeroes & Quadratic Relationships)',
            '3. Pair of Linear Equations in Two Variables',
            '4. Quadratic Equations',
            '5. Arithmetic Progressions (AP)',
            '6. Triangles (Similarity, Thales / BPT Theorem)',
            '7. Coordinate Geometry (Distance & Section Formula)',
            '8. Introduction to Trigonometry (Trigonometric Ratios & Identities)',
            '9. Some Applications of Trigonometry (Heights and Distances)',
            '10. Circles (Tangents to a Circle, Cyclic Quadrilaterals & Properties)',
            '11. Areas Related to Circles',
            '12. Surface Areas and Volumes (Combinations of Solids)',
            '13. Statistics (Mean, Median, Mode of Grouped Data)',
            '14. Probability'
        ],
        'Science': [
            '1. Chemical Reactions and Equations',
            '2. Acids, Bases and Salts',
            '3. Metals and Non-metals',
            '4. Carbon and its Compounds',
            '5. Life Processes (Nutrition, Respiration, Transportation, Excretion)',
            '6. Control and Coordination (Nervous System & Hormones)',
            '7. How do Organisms Reproduce? (Asexual & Sexual)',
            '8. Heredity and Evolution',
            '9. Light – Reflection and Refraction',
            '10. The Human Eye and the Colorful World',
            '11. Electricity (Ohm’s Law, Resistance, Heating Effect)',
            '12. Magnetic Effects of Electric Current (Electromagnetic Induction)',
            '13. Our Environment (Ecosystem & Waste Management)'
        ],
        'Social Science': [
            'History: 1. The Rise of Nationalism in Europe',
            'History: 2. Nationalism in India',
            'History: 3. The Making of a Global World',
            'History: 4. The Age of Industrialisation',
            'History: 5. Print Culture and the Modern World',
            'Geography: 1. Resources and Development',
            'Geography: 2. Forest and Wildlife Resources',
            'Geography: 3. Water Resources',
            'Geography: 4. Agriculture',
            'Geography: 5. Minerals and Energy Resources',
            'Geography: 6. Manufacturing Industries',
            'Geography: 7. Lifelines of National Economy',
            'Pol. Science: 1. Power Sharing',
            'Pol. Science: 2. Federalism',
            'Pol. Science: 3. Gender, Religion and Caste',
            'Pol. Science: 4. Political Parties',
            'Pol. Science: 5. Outcomes of Democracy',
            'Economics: 1. Development',
            'Economics: 2. Sectors of the Indian Economy',
            'Economics: 3. Money and Credit',
            'Economics: 4. Globalisation and the Indian Economy',
            'Economics: 5. Consumer Rights'
        ],
        'English': [
            'First Flight: 1. A Letter to God',
            'First Flight: 2. Nelson Mandela: Long Walk to Freedom',
            'First Flight: 3. Two Stories about Flying',
            'First Flight: 4. From the Diary of Anne Frank',
            'First Flight: 5. Glimpses of India',
            'First Flight: 6. Mijbil the Otter',
            'First Flight: 7. Madam Rides the Bus',
            'First Flight: 8. The Sermon at Benares',
            'First Flight: 9. The Proposal',
            'Poetry: Dust of Snow, Fire and Ice, A Tiger in the Zoo, Amanda!, Animals, The Trees, Fog, For Anne Gregory',
            'Footprints without Feet (Supplementary Reader)',
            'Grammar: Tenses, Modals, Active/Passive Voice, Reported Speech',
            'Writing: Formal Letters, Analytical Paragraph'
        ],
        'Mizo': [
            'Thu (Prose) - MBSE Class 10 Text',
            'Hla (Poetry) - MBSE Class 10 Text',
            'Lemchan (Drama) - MBSE Class 10 Text',
            'Mizo Grammar (Tawng Upa, Mizo Tawng Hman Dan)',
            'Essay & Letter Writing (Thuziak leh Inbiakpawhna)'
        ],
        'Hindi': [
            'Sparsh II (Prose & Poetry)',
            'Sanchayan II',
            'Hindi Vyakaran (Padvandh, Rachna ke aadhar par vakya, Samas, Muhavare)',
            'Suchna Lekhan, Vigyapan Lekhan, Patra Lekhan, Nibandh'
        ],
        'Computer': [
            '1. Networking Concepts & Internet Technologies',
            '2. HTML & CSS Web Design Basics',
            '3. Cyber Ethics and Information Security',
            '4. Scratch / Python Programming Introduction',
            '5. Database Management Concepts'
        ]
    },
    [Grade.VIII]: {
        'Mathematics': [
            '1. Rational Numbers',
            '2. Linear Equations in One Variable',
            '3. Understanding Quadrilaterals',
            '4. Data Handling (Bar Graphs, Pie Charts, Probability)',
            '5. Squares and Square Roots',
            '6. Cubes and Cube Roots',
            '7. Comparing Quantities (Profit/Loss, Compound Interest)',
            '8. Algebraic Expressions and Identities',
            '9. Mensuration (Area, Surface Area and Volume)',
            '10. Exponents and Powers',
            '11. Direct and Inverse Proportions',
            '12. Factorisation',
            '13. Introduction to Graphs'
        ],
        'Science': [
            '1. Crop Production and Management',
            '2. Microorganisms: Friend and Foe',
            '3. Coal and Petroleum',
            '4. Combustion and Flame',
            '5. Conservation of Plants and Animals',
            '6. Reproduction in Animals',
            '7. Reaching the Age of Adolescence',
            '8. Force and Pressure',
            '9. Friction',
            '10. Sound',
            '11. Chemical Effects of Electric Current',
            '12. Some Natural Phenomena (Lightning, Earthquakes)',
            '13. Light'
        ],
        'Social Science': [
            'History: How, When and Where, From Trade to Territory, Ruling the Countryside, Tribals, Dikus and Golden Age, When People Rebel (1857), Civilising the "Native", Women, Caste and Reform, The Making of National Movement',
            'Geography: Resources, Land, Soil, Water, Natural Vegetation, Agriculture, Industries, Human Resources',
            'Civics: The Indian Constitution, Understanding Secularism, Parliament and Making Laws, Judiciary, Marginalisation'
        ],
        'English': [
            'Honeydew (Prose & Poetry)',
            'It So Happened (Supplementary)',
            'Grammar & Composition (Tenses, Prepositions, Voice, Letter & Story Writing)'
        ],
        'Mizo': ['Prose (Thu)', 'Poetry (Hla)', 'Mizo Grammar', 'Composition'],
        'Hindi': ['Vasant Part 3', 'Bharat Ki Khoj', 'Hindi Vyakaran'],
        'Computer': ['Operating Systems, Networking, Spreadsheets, HTML Basics, Computer Ethics']
    },
    [Grade.VII]: {
        'Mathematics': [
            '1. Integers',
            '2. Fractions and Decimals',
            '3. Data Handling',
            '4. Simple Equations',
            '5. Lines and Angles',
            '6. The Triangle and Its Properties',
            '7. Comparing Quantities',
            '8. Rational Numbers',
            '9. Perimeter and Area',
            '10. Algebraic Expressions',
            '11. Exponents and Powers',
            '12. Symmetry and Visualising Solid Shapes'
        ],
        'Science': [
            '1. Nutrition in Plants',
            '2. Nutrition in Animals',
            '3. Heat and Temperature',
            '4. Acids, Bases and Salts',
            '5. Physical and Chemical Changes',
            '6. Respiration in Organisms',
            '7. Transportation in Animals and Plants',
            '8. Reproduction in Plants',
            '9. Motion and Time',
            '10. Electric Current and its Effects',
            '11. Light',
            '12. Forests: Our Lifeline',
            '13. Wastewater Story'
        ],
        'Social Science': ['History (Our Pasts II)', 'Geography (Our Environment)', 'Civics (Social and Political Life II)'],
        'English': ['Honeycomb (Prose & Poetry)', 'An Alien Hand', 'Grammar and Creative Writing'],
        'Mizo': ['Prose (Thu)', 'Poetry (Hla)', 'Grammar and Composition'],
        'Hindi': ['Vasant Part 2', 'Bal Mahabharat Katha', 'Hindi Vyakaran'],
        'Computer': ['Computer Fundamentals, Office Tools, Safe Internet Practices']
    },
    [Grade.VI]: {
        'Mathematics': [
            '1. Knowing Our Numbers',
            '2. Whole Numbers',
            '3. Playing with Numbers (Factors, Multiples, Prime/Composite)',
            '4. Basic Geometrical Ideas',
            '5. Understanding Elementary Shapes',
            '6. Integers',
            '7. Fractions',
            '8. Decimals',
            '9. Data Handling',
            '10. Mensuration (Perimeter and Area of rectangle/square)',
            '11. Algebra Basics',
            '12. Ratio and Proportion'
        ],
        'Science': [
            '1. Components of Food',
            '2. Sorting Materials into Groups',
            '3. Separation of Substances',
            '4. Getting to Know Plants',
            '5. Body Movements',
            '6. The Living Organisms — Characteristics and Habitats',
            '7. Motion and Measurement of Distances',
            '8. Light, Shadows and Reflections',
            '9. Electricity and Circuits',
            '10. Fun with Magnets',
            '11. Air Around Us'
        ],
        'Social Science': ['History (Our Pasts I)', 'Geography (The Earth: Our Habitat)', 'Civics (Social and Political Life I)'],
        'English': ['Honeysuckle (Prose & Poetry)', 'A Pact with the Sun', 'Basic Grammar & Writing'],
        'Mizo': ['Prose (Thu)', 'Poetry (Hla)', 'Grammar and Composition'],
        'Hindi': ['Vasant Part 1', 'Bal Ramkatha', 'Hindi Vyakaran'],
        'Computer': ['Introduction to Computers, Hardware & Software, Word Processing Basics']
    },
    [Grade.V]: {
        'Mathematics': ['Large Numbers', 'Operations on Numbers', 'Factors and Multiples (HCF & LCM)', 'Fractions', 'Decimals', 'Measurement', 'Perimeter and Area', 'Geometry Basics', 'Data Handling'],
        'Science': ['Plant Reproduction', 'Animal Habitats and Adaptations', 'Human Skeletal & Nervous System', 'Food and Health', 'Safety and First Aid', 'Air and Water', 'Simple Machines', 'Our Universe'],
        'Social Studies': ['Maps and Globes', 'Movements of the Earth', 'Climate Zones', 'Democratic Republic of Congo / Grasslands', 'Pollution and Conservation', 'Freedom Struggle', 'United Nations'],
        'English I': ['Reading Comprehension', 'Prose Stories', 'Poems'],
        'English II': ['Nouns, Pronouns, Verbs, Adverbs, Tenses, Prepositions, Conjunctions', 'Paragraph & Letter Writing'],
        'Mizo': ['Zirlai (Prose)', 'Hla (Poetry)', 'Tawng Ziah Dan', 'Thuziak'],
        'Hindi': ['Reading, Vocabulary, Simple Sentences, Grammar Basics'],
        'Computer': ['Evolution of Computers, Windows Overview, MS Word Formatting, Internet Basics'],
        'General Knowledge': ['India & World, Nature, Science, Sports, Current Affairs']
    },
    [Grade.IV]: {
        'Mathematics': ['Numbers and Numeration', 'Addition and Subtraction', 'Multiplication and Division', 'Fractions', 'Money', 'Time', 'Geometry (Lines, Shapes)', 'Perimeter', 'Patterns and Data'],
        'Science': ['Green Plants', 'Plant Adaptations', 'Animals and Their Young Ones', 'Food: Our Basic Need', 'Digestion and Teeth', 'Clothes We Wear', 'Solids, Liquids and Gases', 'Weather and Seasons'],
        'Social Studies': ['Our Country India', 'The Northern Mountains & Plains', 'The Great Indian Desert', 'The Southern Plateaus', 'Coastal Plains and Islands', 'Our Natural Resources', 'Our Culture and Heritage'],
        'English I': ['Reading Comprehension, Stories, Poems'],
        'English II': ['Grammar (Parts of Speech, Punctuation, Tenses)', 'Creative Writing'],
        'Mizo': ['Zirlai bu, Mizo Tawng, Hla leh Thuziak'],
        'Hindi': ['Simple Words, Sentences, Rhymes, Basic Grammar'],
        'Computer': ['Input/Output Devices, Computer Memory, MS Paint / MS Word'],
        'General Knowledge': ['General Knowledge & Moral Science']
    },
    [Grade.III]: {
        'Mathematics': ['4-Digit Numbers', 'Addition and Subtraction', 'Multiplication', 'Division', 'Fractions', 'Shapes and Patterns', 'Measurement of Length, Weight, Capacity', 'Time and Calendar', 'Money', 'Data Handling'],
        'Science': ['Living and Non-Living Things', 'Parts of a Plant', 'Animals: Food and Feeding Habits', 'Birds: Beaks, Claws and Nests', 'Our Body', 'Safety and Home', 'Air, Water and Weather', 'Sun, Moon and Stars'],
        'Social Studies': ['The Earth Our Home', 'The Solar System', 'Our Environment', 'Indian States and Cities', 'National Symbols', 'Transport and Communication'],
        'English I': ['Coursebook Stories and Poems'],
        'English II': ['Grammar: Nouns, Verbs, Adjectives, Pronouns, Prepositions, Punctuation'],
        'Mizo': ['Zirlai bu leh Mizo Tawng'],
        'Hindi': ['Hindi Varnamala, Words, Simple Sentences'],
        'Computer': ['Introduction to Computers, Hardware vs Software, Tux Paint / MS Paint'],
        'General Knowledge': ['Animals, Plants, India, Sports, Science Fun']
    },
    [Grade.II]: {
        'MATH': ['Numbers up to 1000', 'Addition with Regrouping', 'Subtraction with Regrouping', 'Multiplication Tables', 'Division Basics', 'Shapes and Patterns', 'Measurement', 'Money', 'Time'],
        'ENG-I': ['Stories and Poems with comprehension questions'],
        'ENG-II': ['Nouns, Verbs, Singular/Plural, This/That/These/Those, Simple Sentences'],
        'MIZO': ['Mizo Zirlai bu, Hawrawp ziah dan leh thu tawi'],
        'EVS': ['About Myself', 'My Family', 'My School', 'Our Neighborhood', 'Plants and Animals Around Us', 'Air, Water and Food', 'Safety Rules'],
        'Hindi': ['Swar, Vyanjan, Matrayen, Do/Teen Akshar ke shabd'],
        'Computer': ['Parts of Computer, Uses of Computer, Mouse and Keyboard Skills'],
        'General Knowledge': ['Basic GK, Animals, Fruits, Colors, Good Manners']
    },
    [Grade.I]: {
        'Mathematics': ['Numbers 1 to 100', 'Addition & Subtraction (Single and 2-digit)', 'Shapes and Spatial Understanding', 'Measurement Basics', 'Patterns', 'Money', 'Time and Days of the Week'],
        'English': ['Alphabet Phonetics', 'Sight Words', 'Simple Sentences', 'Nouns and Pronouns', 'Poems and Short Stories'],
        'Mizo': ['Mizo Hawrawp A AW B', 'Thumal ziah dan', 'Hla tawi'],
        'EVS': ['My Body', 'My Family', 'My Home', 'Food We Eat', 'Clothes We Wear', 'Animals & Plants', 'Good Habits & Safety'],
        'General Knowledge': ['Basic Identification, Animals, Colors, Shapes, Manners']
    },
    [Grade.KINDERGARTEN]: {
        'English I': ['Phonics & Letter Sounds', 'Rhymes', 'Story Telling', 'Sight Words'],
        'English II': ['Three Letter Words (CVC)', 'Simple Vowels', 'Tracing & Writing'],
        'Maths': ['Numbers 1 to 50', 'Counting Objects', 'Big/Small, Long/Short, Heavy/Light', 'Shapes and Colors'],
        'Conversation': ['Self Introduction', 'Family', 'Greetings & Classroom Courtesy'],
        'General Knowledge': ['Fruits, Vegetables, Animals, Birds, Seasons']
    },
    [Grade.NURSERY]: {
        'ABC Oral': ['Alphabet recognition (A to Z)', 'Phonic sounds', 'Picture association'],
        'ABC Writing': ['Standing lines', 'Sleeping lines', 'Slanting lines', 'Curves', 'Letter tracing'],
        'Numbers Oral': ['Numbers 1 to 20 counting', 'Object counting with toys/fingers'],
        'Numbers Writing': ['Tracing numbers 1 to 10'],
        'Rhyme': ['Action songs and nursery rhymes'],
        'Conversation': ['Name, Age, School name, Colors and basic shapes']
    }
};

/**
 * Returns available chapters for a given Grade and Subject under MBSE curriculum.
 * Fallbacks to matching common keywords (e.g. "Math" matches "Mathematics").
 */
export function getMBSEChapters(grade: Grade, subject: string): string[] {
    const gradeMap = MBSE_CURRICULUM_CHAPTERS[grade];
    if (!gradeMap) return [];

    const normSubject = subject.trim().toLowerCase();

    // Exact or direct match
    for (const [subjKey, chapters] of Object.entries(gradeMap)) {
        if (subjKey.toLowerCase() === normSubject) {
            return chapters;
        }
    }

    // Fuzzy / prefix match (e.g. 'Math' -> 'Mathematics', 'Eng' -> 'English', 'Science' -> 'Science')
    for (const [subjKey, chapters] of Object.entries(gradeMap)) {
        const keyLower = subjKey.toLowerCase();
        if (
            (normSubject.includes('math') && keyLower.includes('math')) ||
            (normSubject.includes('sci') && keyLower.includes('sci')) ||
            (normSubject.includes('social') && keyLower.includes('social')) ||
            (normSubject.includes('eng') && keyLower.includes('eng')) ||
            (normSubject.includes('mizo') && keyLower.includes('mizo')) ||
            (normSubject.includes('comp') && keyLower.includes('comp')) ||
            (normSubject.includes('hin') && keyLower.includes('hin'))
        ) {
            return chapters;
        }
    }

    return [];
}

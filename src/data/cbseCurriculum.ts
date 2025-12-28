// CBSE Curriculum Data Structure for Classes 1-12
// Based on CBSE curriculum framework

export interface CurriculumTopic {
    name: string;
    description?: string;
}

export interface CurriculumSubject {
    name: string;
    topics: CurriculumTopic[];
}

export interface CurriculumGrade {
    grade: string;
    subjects: CurriculumSubject[];
}

export interface CurriculumClass {
    className: string;
    grades: CurriculumGrade[];
}

// CBSE Curriculum Data
export const cbseCurriculum: CurriculumClass[] = [
    // Primary Classes (1-5)
    {
        className: 'Primary',
        grades: [
            {
                grade: 'Class 1',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Alphabets and Phonics' },
                            { name: 'Simple Words and Sentences' },
                            { name: 'Rhymes and Stories' },
                            { name: 'Picture Reading' },
                            { name: 'Basic Grammar' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'वर्णमाला (Alphabets)' },
                            { name: 'शब्द और वाक्य (Words and Sentences)' },
                            { name: 'कविताएँ (Poems)' },
                            { name: 'कहानियाँ (Stories)' },
                            { name: 'बुनियादी व्याकरण (Basic Grammar)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Numbers 1-100' },
                            { name: 'Addition and Subtraction' },
                            { name: 'Shapes and Patterns' },
                            { name: 'Measurement' },
                            { name: 'Time and Money' }
                        ]
                    },
                    {
                        name: 'Environmental Studies (EVS)',
                        topics: [
                            { name: 'My Family and Friends' },
                            { name: 'Plants and Animals' },
                            { name: 'Food and Shelter' },
                            { name: 'Water and Air' },
                            { name: 'Safety and Health' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 2',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Reading Comprehension' },
                            { name: 'Vocabulary Building' },
                            { name: 'Sentence Formation' },
                            { name: 'Stories and Poems' },
                            { name: 'Grammar Basics' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'पठन और लेखन (Reading and Writing)' },
                            { name: 'शब्दावली (Vocabulary)' },
                            { name: 'वाक्य रचना (Sentence Formation)' },
                            { name: 'कहानी और कविता (Stories and Poems)' },
                            { name: 'व्याकरण (Grammar)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Numbers up to 1000' },
                            { name: 'Addition and Subtraction' },
                            { name: 'Multiplication Tables' },
                            { name: 'Geometry Basics' },
                            { name: 'Data Handling' }
                        ]
                    },
                    {
                        name: 'Environmental Studies (EVS)',
                        topics: [
                            { name: 'Our Body and Health' },
                            { name: 'Living and Non-living Things' },
                            { name: 'Seasons and Weather' },
                            { name: 'Transport and Communication' },
                            { name: 'Our Environment' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 3',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Reading and Comprehension' },
                            { name: 'Creative Writing' },
                            { name: 'Grammar and Punctuation' },
                            { name: 'Poetry and Prose' },
                            { name: 'Speaking and Listening' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'पाठ्य सामग्री (Reading Material)' },
                            { name: 'रचनात्मक लेखन (Creative Writing)' },
                            { name: 'व्याकरण और विराम चिह्न (Grammar and Punctuation)' },
                            { name: 'कविता और गद्य (Poetry and Prose)' },
                            { name: 'बोलना और सुनना (Speaking and Listening)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Numbers and Operations' },
                            { name: 'Multiplication and Division' },
                            { name: 'Fractions' },
                            { name: 'Measurement and Geometry' },
                            { name: 'Data Handling and Patterns' }
                        ]
                    },
                    {
                        name: 'Environmental Studies (EVS)',
                        topics: [
                            { name: 'Plants and Their Parts' },
                            { name: 'Animals and Their Habitats' },
                            { name: 'Food and Nutrition' },
                            { name: 'Natural Resources' },
                            { name: 'Community Helpers' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 4',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Advanced Reading Skills' },
                            { name: 'Essay Writing' },
                            { name: 'Parts of Speech' },
                            { name: 'Literature Analysis' },
                            { name: 'Oral Communication' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'उन्नत पठन कौशल (Advanced Reading)' },
                            { name: 'निबंध लेखन (Essay Writing)' },
                            { name: 'शब्द भेद (Parts of Speech)' },
                            { name: 'साहित्य विश्लेषण (Literature Analysis)' },
                            { name: 'मौखिक संचार (Oral Communication)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Large Numbers' },
                            { name: 'Four Operations' },
                            { name: 'Fractions and Decimals' },
                            { name: 'Geometry and Symmetry' },
                            { name: 'Perimeter and Area' }
                        ]
                    },
                    {
                        name: 'Environmental Studies (EVS)',
                        topics: [
                            { name: 'Human Body Systems' },
                            { name: 'Ecosystem and Food Chain' },
                            { name: 'States of Matter' },
                            { name: 'Earth and Universe' },
                            { name: 'Cultural Heritage' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 5',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Comprehension and Inference' },
                            { name: 'Descriptive Writing' },
                            { name: 'Tenses and Voice' },
                            { name: 'Drama and Poetry' },
                            { name: 'Debate and Discussion' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'समझ और अनुमान (Comprehension)' },
                            { name: 'वर्णनात्मक लेखन (Descriptive Writing)' },
                            { name: 'काल और वाच्य (Tenses and Voice)' },
                            { name: 'नाटक और कविता (Drama and Poetry)' },
                            { name: 'वाद-विवाद (Debate)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Number System' },
                            { name: 'Fractions and Decimals' },
                            { name: 'Percentage and Ratio' },
                            { name: 'Geometry and Mensuration' },
                            { name: 'Data Handling' }
                        ]
                    },
                    {
                        name: 'Environmental Studies (EVS)',
                        topics: [
                            { name: 'Digestive and Respiratory Systems' },
                            { name: 'Natural Disasters' },
                            { name: 'Conservation of Resources' },
                            { name: 'Solar System' },
                            { name: 'Indian Freedom Struggle' }
                        ]
                    }
                ]
            }
        ]
    },
    // Upper Primary Classes (6-8)
    {
        className: 'Upper Primary',
        grades: [
            {
                grade: 'Class 6',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Reading Comprehension' },
                            { name: 'Grammar and Composition' },
                            { name: 'Literature - Prose and Poetry' },
                            { name: 'Writing Skills' },
                            { name: 'Vocabulary Enhancement' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'पाठ्य पुस्तक (Textbook)' },
                            { name: 'व्याकरण (Grammar)' },
                            { name: 'साहित्य (Literature)' },
                            { name: 'लेखन कौशल (Writing Skills)' },
                            { name: 'शब्दावली (Vocabulary)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Number System' },
                            { name: 'Algebra Basics' },
                            { name: 'Geometry' },
                            { name: 'Mensuration' },
                            { name: 'Data Handling' }
                        ]
                    },
                    {
                        name: 'Science',
                        topics: [
                            { name: 'Food and Its Components' },
                            { name: 'Materials and Their Properties' },
                            { name: 'Motion and Measurement' },
                            { name: 'Light, Shadows and Reflections' },
                            { name: 'Electricity and Circuits' }
                        ]
                    },
                    {
                        name: 'Social Science',
                        topics: [
                            { name: 'History - Early Societies' },
                            { name: 'Geography - Earth and Its Features' },
                            { name: 'Civics - Democracy' },
                            { name: 'Economics - Basic Concepts' },
                            { name: 'Map Skills' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 7',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Advanced Reading' },
                            { name: 'Grammar and Usage' },
                            { name: 'Literature Analysis' },
                            { name: 'Creative Writing' },
                            { name: 'Communication Skills' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'उन्नत पठन (Advanced Reading)' },
                            { name: 'व्याकरण और प्रयोग (Grammar)' },
                            { name: 'साहित्य विश्लेषण (Literature Analysis)' },
                            { name: 'रचनात्मक लेखन (Creative Writing)' },
                            { name: 'संचार कौशल (Communication)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Integers and Rational Numbers' },
                            { name: 'Algebraic Expressions' },
                            { name: 'Lines and Angles' },
                            { name: 'Perimeter and Area' },
                            { name: 'Data Handling and Probability' }
                        ]
                    },
                    {
                        name: 'Science',
                        topics: [
                            { name: 'Nutrition in Plants and Animals' },
                            { name: 'Heat and Temperature' },
                            { name: 'Acids, Bases and Salts' },
                            { name: 'Weather, Climate and Adaptations' },
                            { name: 'Respiration in Organisms' }
                        ]
                    },
                    {
                        name: 'Social Science',
                        topics: [
                            { name: 'History - Medieval India' },
                            { name: 'Geography - Environment' },
                            { name: 'Civics - State Government' },
                            { name: 'Economics - Markets' },
                            { name: 'Social and Political Life' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 8',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Reading and Interpretation' },
                            { name: 'Advanced Grammar' },
                            { name: 'Literary Devices' },
                            { name: 'Formal Writing' },
                            { name: 'Public Speaking' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'पठन और व्याख्या (Reading and Interpretation)' },
                            { name: 'उन्नत व्याकरण (Advanced Grammar)' },
                            { name: 'साहित्यिक उपकरण (Literary Devices)' },
                            { name: 'औपचारिक लेखन (Formal Writing)' },
                            { name: 'सार्वजनिक भाषण (Public Speaking)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Rational Numbers' },
                            { name: 'Linear Equations' },
                            { name: 'Quadrilaterals' },
                            { name: 'Mensuration' },
                            { name: 'Probability and Statistics' }
                        ]
                    },
                    {
                        name: 'Science',
                        topics: [
                            { name: 'Crop Production and Management' },
                            { name: 'Force and Pressure' },
                            { name: 'Chemical Effects of Electric Current' },
                            { name: 'Sound' },
                            { name: 'Pollution and Conservation' }
                        ]
                    },
                    {
                        name: 'Social Science',
                        topics: [
                            { name: 'History - Modern India' },
                            { name: 'Geography - Resources' },
                            { name: 'Civics - Indian Constitution' },
                            { name: 'Economics - Globalization' },
                            { name: 'Social Justice' }
                        ]
                    }
                ]
            }
        ]
    },
    // Secondary Classes (9-10)
    {
        className: 'Secondary',
        grades: [
            {
                grade: 'Class 9',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Literature - Beehive' },
                            { name: 'Literature - Moments' },
                            { name: 'Grammar and Writing' },
                            { name: 'Comprehension' },
                            { name: 'Formal Letters and Applications' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'क्षितिज (Kshitij)' },
                            { name: 'कृतिका (Kritika)' },
                            { name: 'व्याकरण और लेखन (Grammar and Writing)' },
                            { name: 'पठन कौशल (Reading Skills)' },
                            { name: 'औपचारिक पत्र (Formal Letters)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Number Systems' },
                            { name: 'Polynomials' },
                            { name: 'Coordinate Geometry' },
                            { name: 'Linear Equations in Two Variables' },
                            { name: 'Triangles and Quadrilaterals' },
                            { name: 'Statistics and Probability' }
                        ]
                    },
                    {
                        name: 'Science',
                        topics: [
                            { name: 'Matter in Our Surroundings' },
                            { name: 'Motion' },
                            { name: 'Force and Laws of Motion' },
                            { name: 'Gravitation' },
                            { name: 'Work and Energy' },
                            { name: 'Atoms and Molecules' }
                        ]
                    },
                    {
                        name: 'Social Science',
                        topics: [
                            { name: 'History - French Revolution' },
                            { name: 'Geography - India Size and Location' },
                            { name: 'Civics - Democracy' },
                            { name: 'Economics - The Story of Village Palampur' },
                            { name: 'Disaster Management' }
                        ]
                    },
                    {
                        name: 'Information Technology',
                        topics: [
                            { name: 'Computer Fundamentals' },
                            { name: 'Internet and Web' },
                            { name: 'MS Office' },
                            { name: 'Digital Documentation' },
                            { name: 'Cyber Safety' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 10',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'First Flight - Prose' },
                            { name: 'First Flight - Poetry' },
                            { name: 'Footprints Without Feet' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar' }
                        ]
                    },
                    {
                        name: 'Hindi',
                        topics: [
                            { name: 'क्षितिज भाग 2 (Kshitij Part 2)' },
                            { name: 'कृतिका भाग 2 (Kritika Part 2)' },
                            { name: 'व्याकरण (Grammar)' },
                            { name: 'लेखन कौशल (Writing Skills)' },
                            { name: 'पत्र लेखन (Letter Writing)' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Real Numbers' },
                            { name: 'Polynomials' },
                            { name: 'Pair of Linear Equations' },
                            { name: 'Quadratic Equations' },
                            { name: 'Arithmetic Progressions' },
                            { name: 'Triangles and Circles' },
                            { name: 'Trigonometry' },
                            { name: 'Statistics and Probability' }
                        ]
                    },
                    {
                        name: 'Science',
                        topics: [
                            { name: 'Chemical Reactions and Equations' },
                            { name: 'Acids, Bases and Salts' },
                            { name: 'Metals and Non-metals' },
                            { name: 'Reflection and Refraction' },
                            { name: 'Electricity' },
                            { name: 'Magnetic Effects of Current' },
                            { name: 'Life Processes' },
                            { name: 'Heredity and Evolution' }
                        ]
                    },
                    {
                        name: 'Social Science',
                        topics: [
                            { name: 'History - Nationalism in India' },
                            { name: 'Geography - Resources and Development' },
                            { name: 'Civics - Power Sharing' },
                            { name: 'Economics - Development' },
                            { name: 'Map Work' }
                        ]
                    },
                    {
                        name: 'Information Technology',
                        topics: [
                            { name: 'Digital Documentation Advanced' },
                            { name: 'Electronic Spreadsheet' },
                            { name: 'Database Management' },
                            { name: 'Web Applications' },
                            { name: 'IT Applications' }
                        ]
                    }
                ]
            }
        ]
    },
    // Senior Secondary - Science Stream (11-12)
    {
        className: 'Senior Secondary - Science',
        grades: [
            {
                grade: 'Class 11',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Hornbill - Prose' },
                            { name: 'Hornbill - Poetry' },
                            { name: 'Snapshots' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar' }
                        ]
                    },
                    {
                        name: 'Physics',
                        topics: [
                            { name: 'Physical World and Measurement' },
                            { name: 'Kinematics' },
                            { name: 'Laws of Motion' },
                            { name: 'Work, Energy and Power' },
                            { name: 'Gravitation' },
                            { name: 'Thermodynamics' },
                            { name: 'Waves' }
                        ]
                    },
                    {
                        name: 'Chemistry',
                        topics: [
                            { name: 'Some Basic Concepts of Chemistry' },
                            { name: 'Structure of Atom' },
                            { name: 'Chemical Bonding' },
                            { name: 'States of Matter' },
                            { name: 'Thermodynamics' },
                            { name: 'Equilibrium' },
                            { name: 'Organic Chemistry Basics' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Sets and Functions' },
                            { name: 'Trigonometry' },
                            { name: 'Complex Numbers' },
                            { name: 'Linear Inequalities' },
                            { name: 'Permutations and Combinations' },
                            { name: 'Binomial Theorem' },
                            { name: 'Sequences and Series' }
                        ]
                    },
                    {
                        name: 'Biology',
                        topics: [
                            { name: 'The Living World' },
                            { name: 'Biological Classification' },
                            { name: 'Plant Kingdom' },
                            { name: 'Animal Kingdom' },
                            { name: 'Cell Structure and Function' },
                            { name: 'Biomolecules' },
                            { name: 'Photosynthesis' }
                        ]
                    },
                    {
                        name: 'Computer Science',
                        topics: [
                            { name: 'Computer System and Organization' },
                            { name: 'Computational Thinking' },
                            { name: 'Python Fundamentals' },
                            { name: 'Data Handling' },
                            { name: 'Societal Impacts' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 12',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Flamingo - Prose' },
                            { name: 'Flamingo - Poetry' },
                            { name: 'Vistas' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar and Literature' }
                        ]
                    },
                    {
                        name: 'Physics',
                        topics: [
                            { name: 'Electrostatics' },
                            { name: 'Current Electricity' },
                            { name: 'Magnetic Effects of Current' },
                            { name: 'Electromagnetic Induction' },
                            { name: 'Optics' },
                            { name: 'Dual Nature of Matter' },
                            { name: 'Atoms and Nuclei' },
                            { name: 'Semiconductor Electronics' }
                        ]
                    },
                    {
                        name: 'Chemistry',
                        topics: [
                            { name: 'Solutions' },
                            { name: 'Electrochemistry' },
                            { name: 'Chemical Kinetics' },
                            { name: 'Surface Chemistry' },
                            { name: 'd and f Block Elements' },
                            { name: 'Coordination Compounds' },
                            { name: 'Aldehydes and Ketones' },
                            { name: 'Biomolecules' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Relations and Functions' },
                            { name: 'Inverse Trigonometric Functions' },
                            { name: 'Matrices and Determinants' },
                            { name: 'Continuity and Differentiability' },
                            { name: 'Applications of Derivatives' },
                            { name: 'Integrals' },
                            { name: 'Differential Equations' },
                            { name: 'Vectors and 3D Geometry' },
                            { name: 'Probability' }
                        ]
                    },
                    {
                        name: 'Biology',
                        topics: [
                            { name: 'Reproduction in Organisms' },
                            { name: 'Sexual Reproduction in Plants' },
                            { name: 'Human Reproduction' },
                            { name: 'Principles of Inheritance' },
                            { name: 'Molecular Basis of Inheritance' },
                            { name: 'Evolution' },
                            { name: 'Biotechnology' },
                            { name: 'Ecology and Environment' }
                        ]
                    },
                    {
                        name: 'Computer Science',
                        topics: [
                            { name: 'Python Programming' },
                            { name: 'Data Structures' },
                            { name: 'Database Management' },
                            { name: 'Computer Networks' },
                            { name: 'Boolean Algebra' }
                        ]
                    }
                ]
            }
        ]
    },
    // Senior Secondary - Commerce Stream (11-12)
    {
        className: 'Senior Secondary - Commerce',
        grades: [
            {
                grade: 'Class 11',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Hornbill - Prose' },
                            { name: 'Hornbill - Poetry' },
                            { name: 'Snapshots' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar' }
                        ]
                    },
                    {
                        name: 'Accountancy',
                        topics: [
                            { name: 'Introduction to Accounting' },
                            { name: 'Theory Base of Accounting' },
                            { name: 'Recording of Transactions' },
                            { name: 'Trial Balance' },
                            { name: 'Financial Statements' },
                            { name: 'Accounting for Bills of Exchange' }
                        ]
                    },
                    {
                        name: 'Business Studies',
                        topics: [
                            { name: 'Nature and Purpose of Business' },
                            { name: 'Forms of Business Organization' },
                            { name: 'Private, Public and Global Enterprises' },
                            { name: 'Business Services' },
                            { name: 'Emerging Modes of Business' },
                            { name: 'Social Responsibility of Business' }
                        ]
                    },
                    {
                        name: 'Economics',
                        topics: [
                            { name: 'Introduction to Microeconomics' },
                            { name: 'Consumer Equilibrium' },
                            { name: 'Demand and Supply' },
                            { name: 'Elasticity of Demand' },
                            { name: 'Production Function' },
                            { name: 'Cost and Revenue' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Sets and Functions' },
                            { name: 'Trigonometry' },
                            { name: 'Statistics' },
                            { name: 'Probability' },
                            { name: 'Linear Programming' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 12',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Flamingo - Prose' },
                            { name: 'Flamingo - Poetry' },
                            { name: 'Vistas' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar and Literature' }
                        ]
                    },
                    {
                        name: 'Accountancy',
                        topics: [
                            { name: 'Accounting for Partnership Firms' },
                            { name: 'Reconstitution of Partnership' },
                            { name: 'Dissolution of Partnership' },
                            { name: 'Accounting for Share Capital' },
                            { name: 'Debentures' },
                            { name: 'Financial Statements of Companies' },
                            { name: 'Cash Flow Statement' }
                        ]
                    },
                    {
                        name: 'Business Studies',
                        topics: [
                            { name: 'Nature and Significance of Management' },
                            { name: 'Principles of Management' },
                            { name: 'Business Environment' },
                            { name: 'Planning and Organizing' },
                            { name: 'Staffing and Directing' },
                            { name: 'Controlling' },
                            { name: 'Financial Management' },
                            { name: 'Marketing Management' }
                        ]
                    },
                    {
                        name: 'Economics',
                        topics: [
                            { name: 'Introduction to Macroeconomics' },
                            { name: 'National Income Accounting' },
                            { name: 'Money and Banking' },
                            { name: 'Determination of Income' },
                            { name: 'Government Budget' },
                            { name: 'Balance of Payments' },
                            { name: 'Indian Economy' }
                        ]
                    },
                    {
                        name: 'Mathematics',
                        topics: [
                            { name: 'Relations and Functions' },
                            { name: 'Matrices and Determinants' },
                            { name: 'Calculus' },
                            { name: 'Probability Distributions' },
                            { name: 'Linear Programming' }
                        ]
                    }
                ]
            }
        ]
    },
    // Senior Secondary - Arts/Humanities Stream (11-12)
    {
        className: 'Senior Secondary - Arts',
        grades: [
            {
                grade: 'Class 11',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Hornbill - Prose' },
                            { name: 'Hornbill - Poetry' },
                            { name: 'Snapshots' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar' }
                        ]
                    },
                    {
                        name: 'History',
                        topics: [
                            { name: 'Early Societies' },
                            { name: 'Empires' },
                            { name: 'Nomadic Empires' },
                            { name: 'The Three Orders' },
                            { name: 'Changing Cultural Traditions' }
                        ]
                    },
                    {
                        name: 'Political Science',
                        topics: [
                            { name: 'Constitution as a Living Document' },
                            { name: 'Rights in the Constitution' },
                            { name: 'Election and Representation' },
                            { name: 'Executive and Legislature' },
                            { name: 'Judiciary' }
                        ]
                    },
                    {
                        name: 'Geography',
                        topics: [
                            { name: 'Geography as a Discipline' },
                            { name: 'The Earth' },
                            { name: 'Landforms' },
                            { name: 'Climate' },
                            { name: 'Water' },
                            { name: 'Natural Vegetation' }
                        ]
                    },
                    {
                        name: 'Economics',
                        topics: [
                            { name: 'Introduction to Economics' },
                            { name: 'Collection of Data' },
                            { name: 'Organization of Data' },
                            { name: 'Presentation of Data' },
                            { name: 'Measures of Central Tendency' }
                        ]
                    },
                    {
                        name: 'Psychology',
                        topics: [
                            { name: 'What is Psychology' },
                            { name: 'Methods of Psychology' },
                            { name: 'Biological Basis of Behavior' },
                            { name: 'Human Development' },
                            { name: 'Sensory and Perceptual Processes' }
                        ]
                    }
                ]
            },
            {
                grade: 'Class 12',
                subjects: [
                    {
                        name: 'English',
                        topics: [
                            { name: 'Flamingo - Prose' },
                            { name: 'Flamingo - Poetry' },
                            { name: 'Vistas' },
                            { name: 'Writing Skills' },
                            { name: 'Grammar and Literature' }
                        ]
                    },
                    {
                        name: 'History',
                        topics: [
                            { name: 'Bricks, Beads and Bones' },
                            { name: 'Kings, Farmers and Towns' },
                            { name: 'An Imperial Capital' },
                            { name: 'Rebels and the Raj' },
                            { name: 'Colonialism and the Countryside' },
                            { name: 'Mahatma Gandhi and Nationalist Movement' }
                        ]
                    },
                    {
                        name: 'Political Science',
                        topics: [
                            { name: 'Cold War Era' },
                            { name: 'End of Bipolarity' },
                            { name: 'US Hegemony' },
                            { name: 'Alternative Centres of Power' },
                            { name: 'Contemporary South Asia' },
                            { name: 'International Organizations' }
                        ]
                    },
                    {
                        name: 'Geography',
                        topics: [
                            { name: 'Human Geography' },
                            { name: 'Population' },
                            { name: 'Migration' },
                            { name: 'Human Settlements' },
                            { name: 'Resources and Development' },
                            { name: 'Transport and Communication' }
                        ]
                    },
                    {
                        name: 'Economics',
                        topics: [
                            { name: 'Introduction to Macroeconomics' },
                            { name: 'National Income' },
                            { name: 'Money and Banking' },
                            { name: 'Government Budget' },
                            { name: 'Balance of Payments' },
                            { name: 'Development Experience of India' }
                        ]
                    },
                    {
                        name: 'Psychology',
                        topics: [
                            { name: 'Variations in Psychological Attributes' },
                            { name: 'Self and Personality' },
                            { name: 'Meeting Life Challenges' },
                            { name: 'Psychological Disorders' },
                            { name: 'Therapeutic Approaches' },
                            { name: 'Attitude and Social Cognition' }
                        ]
                    }
                ]
            }
        ]
    }
];

// Helper functions to extract data
export const getClasses = (): string[] => {
    return cbseCurriculum.map(c => c.className);
};

export const getGrades = (className: string): string[] => {
    const classData = cbseCurriculum.find(c => c.className === className);
    return classData ? classData.grades.map(g => g.grade) : [];
};

export const getSubjects = (className: string, grade: string): string[] => {
    const classData = cbseCurriculum.find(c => c.className === className);
    if (!classData) return [];

    const gradeData = classData.grades.find(g => g.grade === grade);
    return gradeData ? gradeData.subjects.map(s => s.name) : [];
};

export const getTopics = (className: string, grade: string, subject: string): string[] => {
    const classData = cbseCurriculum.find(c => c.className === className);
    if (!classData) return [];

    const gradeData = classData.grades.find(g => g.grade === grade);
    if (!gradeData) return [];

    const subjectData = gradeData.subjects.find(s => s.name === subject);
    return subjectData ? subjectData.topics.map(t => t.name) : [];
};

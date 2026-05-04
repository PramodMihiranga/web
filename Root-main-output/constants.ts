
import { Stream, Subject } from './types';

const currentYear = new Date().getFullYear();
export const EXAM_DATE = new Date(`${currentYear + 1}-08-05T08:30:00`);

// --- 1. PHYSICAL SCIENCE / MATHS SUBJECTS ---

const COMBINED_MATHS_SUBJECT: Subject = {
  id: 'cm-pure-applied',
  name: 'Combined Mathematics',
  progress: 0,
  color: 'bg-blue-600',
  units: [
    // Pure Mathematics
    { id: 'cm-p1', name: 'Pure: Number Systems & Real Numbers', completed: false },
    { id: 'cm-p2', name: 'Pure: Polynomials & Rational Functions', completed: false },
    { id: 'cm-p3', name: 'Pure: Quadratic Equations & Expressions', completed: false },
    { id: 'cm-p4', name: 'Pure: Partial Fractions', completed: false },
    { id: 'cm-p5', name: 'Pure: Indices, Logarithms & Progressions', completed: false },
    { id: 'cm-p6', name: 'Pure: Inequalities', completed: false },
    { id: 'cm-p7', name: 'Pure: Limits & Basic Differentiation', completed: false },
    { id: 'cm-p8', name: 'Pure: Integration (Calculus)', completed: false },
    { id: 'cm-p9', name: 'Pure: Trigonometry (Ratios & Identities)', completed: false },
    { id: 'cm-p10', name: 'Pure: Straight Lines & Circles', completed: false },
    { id: 'cm-p11', name: 'Pure: Vectors', completed: false },
    { id: 'cm-p12', name: 'Pure: Complex Numbers', completed: false },
    { id: 'cm-p13', name: 'Pure: Binomial Expansion', completed: false },
    { id: 'cm-p14', name: 'Pure: Matrices & Determinants', completed: false },
    { id: 'cm-p15', name: 'Pure: Permutations & Combinations', completed: false },
    // Applied Mathematics
    { id: 'cm-a1', name: 'Applied: Resultants of Concurrent Forces', completed: false },
    { id: 'cm-a2', name: 'Applied: Equilibrium of a Particle', completed: false },
    { id: 'cm-a3', name: 'Applied: Parallel Forces & Couples', completed: false },
    { id: 'cm-a4', name: 'Applied: Equilibrium of a Rigid Body', completed: false },
    { id: 'cm-a5', name: 'Applied: Friction', completed: false },
    { id: 'cm-a6', name: 'Applied: Center of Gravity', completed: false },
    { id: 'cm-a7', name: 'Applied: Kinematics in a Straight Line', completed: false },
    { id: 'cm-a8', name: 'Applied: Relative Velocity', completed: false },
    { id: 'cm-a9', name: 'Applied: Newton Laws of Motion', completed: false },
    { id: 'cm-a10', name: 'Applied: Work, Energy & Power', completed: false },
    { id: 'cm-a11', name: 'Applied: Impulse & Impact', completed: false },
    { id: 'cm-a12', name: 'Applied: Projectiles', completed: false },
    { id: 'cm-a13', name: 'Applied: Circular Motion', completed: false },
    { id: 'cm-a14', name: 'Applied: Simple Harmonic Motion', completed: false },
    { id: 'cm-a15', name: 'Applied: Statistics & Probability', completed: false }
  ]
};

const PHYSICS_SUBJECT: Subject = {
  id: 'ph-gen',
  name: 'Physics',
  progress: 0,
  color: 'bg-cyan-500',
  units: [
    { id: 'ph-u1', name: 'Measurement', completed: false },
    { id: 'ph-u2', name: 'Mechanics (Statics, Dynamics, Fluids)', completed: false },
    { id: 'ph-u3', name: 'Oscillations and Waves', completed: false },
    { id: 'ph-u4', name: 'Thermal Physics', completed: false },
    { id: 'ph-u5', name: 'Gravitational Fields', completed: false },
    { id: 'ph-u6', name: 'Electrostatic Fields', completed: false },
    { id: 'ph-u7', name: 'Magnetic Fields', completed: false },
    { id: 'ph-u8', name: 'Current Electricity', completed: false },
    { id: 'ph-u9', name: 'Electronics', completed: false },
    { id: 'ph-u10', name: 'Mechanical Properties of Matter', completed: false },
    { id: 'ph-u11', name: 'Radiation and Nuclear Physics', completed: false }
  ]
};

const CHEMISTRY_SUBJECT: Subject = {
  id: 'ch-gen',
  name: 'Chemistry',
  progress: 0,
  color: 'bg-emerald-500',
  units: [
    { id: 'ch-u1', name: 'Atomic Structure', completed: false },
    { id: 'ch-u2', name: 'Structure and Bonding', completed: false },
    { id: 'ch-u3', name: 'Chemical Calculations (The Mole)', completed: false },
    { id: 'ch-u4', name: 'Gaseous State of Matter', completed: false },
    { id: 'ch-u5', name: 'Energetics (Thermodynamics)', completed: false },
    { id: 'ch-u6', name: 'Chemistry of S, P & D Block Elements', completed: false },
    { id: 'ch-u7', name: 'Basic Concepts of Organic Chemistry', completed: false },
    { id: 'ch-u8', name: 'Reaction of Organic Compounds', completed: false },
    { id: 'ch-u9', name: 'Chemical Kinetics', completed: false },
    { id: 'ch-u10', name: 'Chemical Equilibrium', completed: false },
    { id: 'ch-u11', name: 'Ionic Equilibrium', completed: false },
    { id: 'ch-u12', name: 'Electrochemistry', completed: false },
    { id: 'ch-u13', name: 'Industrial Chemistry', completed: false },
    { id: 'ch-u14', name: 'Environmental Chemistry', completed: false }
  ]
};

// --- 2. BIOLOGICAL SCIENCE SUBJECTS ---

const BIOLOGY_SUBJECT: Subject = {
  id: 'bi-gen',
  name: 'Biology',
  progress: 0,
  color: 'bg-green-600',
  units: [
    { id: 'bi-u1', name: 'Introduction to Biology', completed: false },
    { id: 'bi-u2', name: 'Chemical and Cellular Basis of Life', completed: false },
    { id: 'bi-u3', name: 'Evolution and Diversity of Organisms', completed: false },
    { id: 'bi-u4', name: 'Plant Form and Function', completed: false },
    { id: 'bi-u5', name: 'Animal Form and Function', completed: false },
    { id: 'bi-u6', name: 'Genetics', completed: false },
    { id: 'bi-u7', name: 'Molecular Biology & Recombinant DNA', completed: false },
    { id: 'bi-u8', name: 'Environmental Biology', completed: false },
    { id: 'bi-u9', name: 'Microbiology', completed: false },
    { id: 'bi-u10', name: 'Applied Biology', completed: false }
  ]
};

const AGRI_SUBJECT: Subject = {
  id: 'ag-gen',
  name: 'Agricultural Science',
  progress: 0,
  color: 'bg-lime-600',
  units: [
    { id: 'ag-u1', name: 'Agriculture & World Food Crisis', completed: false },
    { id: 'ag-u2', name: 'Climate & Weather in Agriculture', completed: false },
    { id: 'ag-u3', name: 'Soil Science', completed: false },
    { id: 'ag-u4', name: 'Plant Nutrition', completed: false },
    { id: 'ag-u5', name: 'Crop Production & Physiology', completed: false },
    { id: 'ag-u6', name: 'Forestry & Agroforestry', completed: false },
    { id: 'ag-u7', name: 'Pest & Disease Management', completed: false },
    { id: 'ag-u8', name: 'Animal Husbandry', completed: false },
    { id: 'ag-u9', name: 'Farm Power & Machinery', completed: false },
    { id: 'ag-u10', name: 'Post-harvest Technology', completed: false }
  ]
};

// --- 3. COMMERCE SUBJECTS ---

const ECON_SUBJECT: Subject = {
  id: 'ec-gen',
  name: 'Economics',
  progress: 0,
  color: 'bg-amber-500',
  units: [
    { id: 'ec-u1', name: 'Introduction to Economics', completed: false },
    { id: 'ec-u2', name: 'Price Theory & Market Mechanism', completed: false },
    { id: 'ec-u3', name: 'Theory of Production & Costs', completed: false },
    { id: 'ec-u4', name: 'Introduction to Macroeconomics', completed: false },
    { id: 'ec-u5', name: 'Money, Banking & Price Level', completed: false },
    { id: 'ec-u6', name: 'Government Revenue & Expenditure', completed: false },
    { id: 'ec-u7', name: 'International Trade & Payments', completed: false },
    { id: 'ec-u8', name: 'The Economy of Sri Lanka', completed: false }
  ]
};

const BS_SUBJECT: Subject = {
  id: 'bs-gen',
  name: 'Business Studies',
  progress: 0,
  color: 'bg-pink-500',
  units: [
    { id: 'bs-u1', name: 'Business & Business Environment', completed: false },
    { id: 'bs-u2', name: 'Business Ethics & Social Responsibility', completed: false },
    { id: 'bs-u3', name: 'Small Business & Entrepreneurship', completed: false },
    { id: 'bs-u4', name: 'Management Concepts & Functions', completed: false },
    { id: 'bs-u5', name: 'Operational Management', completed: false },
    { id: 'bs-u6', name: 'Marketing Management', completed: false },
    { id: 'bs-u7', name: 'Financial Management', completed: false },
    { id: 'bs-u8', name: 'Human Resource Management', completed: false },
    { id: 'bs-u9', name: 'Information Systems in Business', completed: false }
  ]
};

const ACC_SUBJECT: Subject = {
  id: 'ac-gen',
  name: 'Accounting',
  progress: 0,
  color: 'bg-purple-600',
  units: [
    { id: 'ac-u1', name: 'Introduction to Accounting', completed: false },
    { id: 'ac-u2', name: 'Accounting Equation & System', completed: false },
    { id: 'ac-u3', name: 'Accounting for Prime Entry & Ledger', completed: false },
    { id: 'ac-u4', name: 'Financial Statements of Sole Proprietorship', completed: false },
    { id: 'ac-u5', name: 'Non-profit Organization Accounting', completed: false },
    { id: 'ac-u6', name: 'Partnership Accounting', completed: false },
    { id: 'ac-u7', name: 'Company Accounting', completed: false },
    { id: 'ac-u8', name: 'Management Accounting & Ratios', completed: false },
    { id: 'ac-u9', name: 'Cost Accounting Fundamentals', completed: false }
  ]
};

// --- 4. TECHNOLOGY SUBJECTS ---

const ENG_TECH_SUBJECT: Subject = {
  id: 'et-gen',
  name: 'Engineering Technology',
  progress: 0,
  color: 'bg-orange-600',
  units: [
    { id: 'et-u1', name: 'Civil Engineering Fundamentals', completed: false },
    { id: 'et-u2', name: 'Mechanical Engineering Fundamentals', completed: false },
    { id: 'et-u3', name: 'Electrical Engineering Fundamentals', completed: false },
    { id: 'et-u4', name: 'Electronic Engineering Fundamentals', completed: false },
    { id: 'et-u5', name: 'Production & Manufacturing Systems', completed: false },
    { id: 'et-u6', name: 'Automobile Engineering', completed: false }
  ]
};

const BIO_SYSTEMS_SUBJECT: Subject = {
  id: 'bt-gen',
  name: 'Biosystems Technology',
  progress: 0,
  color: 'bg-lime-500',
  units: [
    { id: 'bt-u1', name: 'Biosystems & Hydrology', completed: false },
    { id: 'bt-u2', name: 'Agri-Biosystems Engineering', completed: false },
    { id: 'bt-u3', name: 'Post-harvest Technology', completed: false },
    { id: 'bt-u4', name: 'Food Technology', completed: false },
    { id: 'bt-u5', name: 'Environmental Management', completed: false }
  ]
};

const SCIENCE_FOR_TECH_SUBJECT: Subject = {
  id: 'st-gen',
  name: 'Science for Technology',
  progress: 0,
  color: 'bg-teal-600',
  units: [
    { id: 'st-u1', name: 'Biology for Technology', completed: false },
    { id: 'st-u2', name: 'Chemistry for Technology', completed: false },
    { id: 'st-u3', name: 'Physics for Technology', completed: false },
    { id: 'st-u4', name: 'Mathematics for Technology', completed: false },
    { id: 'st-u5', name: 'ICT for Technology', completed: false }
  ]
};

// --- 5. COMMON / ARTS SUBJECTS ---

const ICT_SUBJECT: Subject = {
  id: 'gen-ict',
  name: 'Information & Communication Technology',
  progress: 0,
  color: 'bg-indigo-600',
  units: [
    { id: 'ict-u1', name: 'Basic Concepts of ICT', completed: false },
    { id: 'ict-u2', name: 'Data Representation', completed: false },
    { id: 'ict-u3', name: 'Computer Architecture', completed: false },
    { id: 'ict-u4', name: 'Operating Systems', completed: false },
    { id: 'ict-u5', name: 'Networking & Communication', completed: false },
    { id: 'ict-u6', name: 'Database Management Systems', completed: false },
    { id: 'ict-u7', name: 'Systems Analysis and Design', completed: false },
    { id: 'ict-u8', name: 'Programming Concepts (Python)', completed: false },
    { id: 'ict-u9', name: 'Web Development (HTML/PHP)', completed: false },
    { id: 'ict-u10', name: 'E-Commerce & Emerging Trends', completed: false }
  ]
};

const LOGIC_SUBJECT: Subject = {
  id: 'lo-gen',
  name: 'Logic & Scientific Method',
  progress: 0,
  color: 'bg-violet-600',
  units: [
    { id: 'lo-u1', name: 'Traditional Logic', completed: false },
    { id: 'lo-u2', name: 'Symbolic Logic', completed: false },
    { id: 'lo-u3', name: 'Propositional Logic', completed: false },
    { id: 'lo-u4', name: 'Predicate Logic', completed: false },
    { id: 'lo-u5', name: 'Scientific Method', completed: false }
  ]
};

const POLITICAL_SUBJECT: Subject = {
  id: 'ps-gen',
  name: 'Political Science',
  progress: 0,
  color: 'bg-red-600',
  units: [
    { id: 'ps-u1', name: 'Political Systems', completed: false },
    { id: 'ps-u2', name: 'State & Sovereignty', completed: false },
    { id: 'ps-u3', name: 'Constitutional Development in SL', completed: false },
    { id: 'ps-u4', name: 'Global Political Dynamics', completed: false }
  ]
};

// --- STREAMS DEFINITIONS ---

export const AL_STREAMS: Stream[] = [
  {
    id: 'physical-science',
    name: 'Physical Science (Maths)',
    subjects: [COMBINED_MATHS_SUBJECT, PHYSICS_SUBJECT, CHEMISTRY_SUBJECT, ICT_SUBJECT]
  },
  {
    id: 'biological-science',
    name: 'Biological Science (Bio)',
    subjects: [BIOLOGY_SUBJECT, CHEMISTRY_SUBJECT, PHYSICS_SUBJECT, AGRI_SUBJECT, ICT_SUBJECT]
  },
  {
    id: 'commerce',
    name: 'Commerce',
    subjects: [ECON_SUBJECT, BS_SUBJECT, ACC_SUBJECT, ICT_SUBJECT]
  },
  {
    id: 'technology-engineering',
    name: 'Engineering Technology',
    subjects: [ENG_TECH_SUBJECT, SCIENCE_FOR_TECH_SUBJECT, ICT_SUBJECT]
  },
  {
    id: 'technology-biosystems',
    name: 'Biosystems Technology',
    subjects: [BIO_SYSTEMS_SUBJECT, SCIENCE_FOR_TECH_SUBJECT, ICT_SUBJECT]
  },
  {
    id: 'arts',
    name: 'Arts',
    subjects: [ECON_SUBJECT, LOGIC_SUBJECT, POLITICAL_SUBJECT, ICT_SUBJECT]
  }
];

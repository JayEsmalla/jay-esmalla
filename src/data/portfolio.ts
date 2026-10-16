export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: "flutter" | "mobile" | "web" | "other";
  technologies: string[];
  image: string;
  imageSrcSet?: string;
  fullImage?: string;
  imageAlt?: string;
  imageFit?: "contain";
  imageBackground?: string;
  preview: "screen" | "mobile-flow" | "simulation-flow";
  previewLabel: string;
  proofPoints: string[];
  liveUrl?: string;
  githubUrl?: string;
  role: string;
  problemSolved: string;
  outcome: string;
}

export interface Skill {
  name: string;
  level: number;
  category: "frontend" | "mobile" | "backend" | "tools";
}

export const projects: Project[] = [
  {
    id: "vulshop",
    title: "1561 VULSHOP",
    summary: "Workshop jobs, inventory, crew payroll, and cash flow in one operations system.",
    description: "A full-stack operations platform for a custom fabrication and vulcanizing workshop, connecting job orders, material tracking, customers, attendance, payroll, and shop finances.",
    category: "web",
    technologies: ["TypeScript", "React 19", "TanStack Start", "TanStack Router", "Tailwind CSS v4", "MySQL 8", "mysql2"],
    image: "/projects/vulshop-800.webp",
    imageSrcSet: "/projects/vulshop-480.webp 480w, /projects/vulshop-800.webp 800w, /projects/vulshop-1200.webp 1200w",
    fullImage: "/projects/vulshop-full.webp",
    imageAlt: "1561 VULSHOP dashboard showing job orders, low-stock alerts, outstanding payments, net profit, and inventory value in a laptop mockup",
    imageFit: "contain",
    imageBackground: "#e5e7e9",
    preview: "screen",
    previewLabel: "WORKSHOP OPERATIONS & CASH FLOW",
    proofPoints: ["Four-stage job queue & split payments", "Transactional stock deductions & audited reversals", "Attendance, cash advances & payroll"],
    role: "Full-Stack Developer",
    problemSolved: "Paper job records, missing material counts, untracked downpayments, and crew cash advances made it difficult to coordinate workshop work and understand actual earnings.",
    outcome: "Built a workshop control center with a four-stage job queue, split payments, transaction-based inventory deductions and reversals, customer and vehicle history, attendance-based payroll with overtime and cash advances, and income, expense, and net-profit reporting.",
  },
  {
    id: "lolas-kusina",
    title: "LolasKusina",
    summary: "Catering packages, online ordering, and customer request management.",
    description: "A food package ordering system for browsing catering options, placing orders, and managing customer requests.",
    category: "web",
    technologies: ["PHP", "JavaScript", "Python", "Docker"],
    image: "/projects/lolas-kusina-800.webp",
    imageSrcSet: "/projects/lolas-kusina-480.webp 480w, /projects/lolas-kusina-800.webp 800w, /projects/lolas-kusina-1200.webp 1200w",
    fullImage: "/lolas-kusina-auth-gate.webp",
    imageAlt: "LolasKusina sign-in and guest browsing screen",
    imageFit: "contain",
    preview: "screen",
    previewLabel: "AUTHENTICATION & ORDER ENTRY",
    proofPoints: ["Guest browsing", "Package booking", "Order history"],
    role: "Lead Web Developer & System Architect",
    problemSolved: "Managing custom catering orders, menu packages, and client requests manually was prone to errors, communication delays, and order mix-ups for the local kitchen.",
    outcome: "Built a structured ordering and management workflow that centralizes menu packages, customer requests, and order handling in one system.",
  },
  {
    id: "thryfto",
    title: "Thryfto",
    summary: "A local thrift marketplace connecting buyers and sellers of pre-loved items.",
    description: "A peer-to-peer thrift marketplace for listing pre-loved items, discovering local finds, and connecting buyers with sellers.",
    category: "flutter",
    technologies: ["Flutter", "Dart", "Firebase"],
    image: "/projects/thryfto-800.webp",
    imageSrcSet: "/projects/thryfto-480.webp 480w, /projects/thryfto-800.webp 800w, /projects/thryfto-1200.webp 1200w",
    fullImage: "/thryfto.png",
    imageAlt: "Thryfto mobile app login screen presented in a phone mockup",
    imageFit: "contain",
    preview: "screen",
    previewLabel: "MOBILE APP / LOGIN",
    proofPoints: ["Real-time feed", "Listing uploads", "Buyer-seller chat"],
    githubUrl: "https://github.com/JayEsmalla/thryfto-app",
    role: "Full-Stack Mobile Developer",
    problemSolved: "Existing peer-to-peer thrift sales on social media lacked structure, searchability, and secure communication channels, causing friction for both buyers and sellers.",
    outcome: "Developed a cross-platform marketplace with structured listings, discovery tools, Firebase-backed interactions, and features designed around local peer-to-peer thrift transactions.",
  },
  {
    id: "prism",
    title: "PRISM",
    summary: "Payroll, attendance, and staff management for Tagum Doctors Hospital.",
    description: "A centralized payroll and staff-management system for Tagum Doctors Hospital, connecting attendance verification, employee records, and leave administration.",
    category: "web",
    technologies: ["React 19", "Node.js 20", "Express 5", "MySQL 8"],
    image: "/projects/prism-800.webp",
    imageSrcSet: "/projects/prism-480.webp 480w, /projects/prism-800.webp 800w, /projects/prism-1200.webp 1200w",
    fullImage: "/prism.png",
    imageAlt: "PRISM payroll and staff-management landing page for Tagum Doctors Hospital",
    imageFit: "contain",
    preview: "screen",
    previewLabel: "PAYROLL & STAFF MANAGEMENT",
    proofPoints: ["Attendance verification", "Payroll reconciliation", "Staff records & leave"],
    role: "Full-Stack Developer",
    problemSolved: "Bring payroll, verified attendance, employee records, and leave administration together for fixed office schedules and rotating medical shifts at Tagum Doctors Hospital.",
    outcome: "Built PRISM (Payroll Reconciliation and Integrated Staff Management System) around one centrally managed application and one MySQL database on the hospital LAN. Normal operations do not require public internet access. The README identifies outstanding payroll formulas and operational rules that require hospital approval before production use.",
  },
  {
    id: "simulation-comlab-v3",
    title: "ComLab V3 Egress Simulation",
    summary: "Compare lab layouts and evacuation outcomes with an agent-based simulator.",
    description: "A Python-powered agent-based emergency egress simulator for comparing the current ComLab V3 layout with a safer modified layout.",
    category: "web",
    technologies: ["Python", "JavaScript", "HTML5 Canvas", "Vercel"],
    image: "/projects/simulation-comlab-v3-800.webp",
    imageSrcSet: "/projects/simulation-comlab-v3-480.webp 480w, /projects/simulation-comlab-v3-800.webp 800w, /projects/simulation-comlab-v3-1200.webp 1200w",
    fullImage: "/comlab-egress.png",
    imageBackground: "#080f1b",
    imageAlt: "ComLab V3 emergency egress simulation showing the laboratory layout, 41 agents, and live evacuation metrics",
    imageFit: "contain",
    preview: "screen",
    previewLabel: "EMERGENCY EGRESS SIMULATION",
    proofPoints: ["Agent simulation", "Layout comparison", "Egress metrics"],
    liveUrl: "https://simulation-comlab-v3.vercel.app/",
    githubUrl: "https://github.com/JayEsmalla/simulation_comlabV3",
    role: "Full-Stack Simulation Developer",
    problemSolved: "The current computer-laboratory layout needed a repeatable way to evaluate how locker placement, crowd behavior, and different incident origins affect evacuation safety.",
    outcome: "Built a deterministic 41-agent simulation with pathfinding, panic and fire scenarios, congestion heatmaps, evacuation metrics, and side-by-side layout comparisons.",
  },
  {
    id: "aralytics",
    title: "Aralytics",
    summary: "A study workspace for learning materials, flashcards, and progress tracking.",
    description: "A responsive study workspace for organizing learning materials, practicing flashcards, and tracking study progress.",
    category: "web",
    technologies: ["TypeScript", "PostgreSQL", "CSS", "JavaScript"],
    image: "/projects/aralytics-800.webp",
    imageSrcSet: "/projects/aralytics-480.webp 480w, /projects/aralytics-800.webp 800w, /projects/aralytics-1200.webp 1200w",
    fullImage: "/aralytics-portfolio.png",
    imageAlt: "Aralytics study library on a laptop alongside mobile flashcard practice",
    imageFit: "contain",
    imageBackground: "#e6ede7",
    preview: "screen",
    previewLabel: "STUDY LIBRARY & FLASHCARDS",
    proofPoints: ["Study set library", "Flashcard practice", "Progress tracking"],
    role: "Solo Full-Stack Developer",
    problemSolved: "Students need a clear way to organize study materials by subject and move from reading to regular recall practice.",
    outcome: "Created a study workspace that brings a searchable library, study sets, flashcard review, and progress into a responsive desktop and mobile interface.",
  },
  {
    id: "lakbai",
    title: "LakBai",
    summary: "Discover destinations, save places, and plan trips around Davao del Norte.",
    description: "A mobile tourism app for discovering destinations in Davao del Norte, saving places offline, and planning trips.",
    category: "mobile",
    technologies: ["React Native", "Expo"],
    image: "/projects/lakbai-800.webp",
    imageSrcSet: "/projects/lakbai-480.webp 480w, /projects/lakbai-800.webp 800w, /projects/lakbai-1200.webp 1200w",
    fullImage: "/lakbai-portfolio-landscape.png",
    imageAlt: "LakBai mobile app showing its home screen, destination explorer, and trip planner for Davao del Norte",
    imageFit: "contain",
    imageBackground: "#f6f3ea",
    preview: "screen",
    previewLabel: "DESTINATION DISCOVERY & TRIP PLANNING",
    proofPoints: ["Destination discovery", "Offline saved places", "Trip planning"],
    role: "Mobile App Developer",
    problemSolved: "Travelers exploring Davao del Norte need local destination information and a practical way to organize their stops, including when connectivity is limited.",
    outcome: "Built an offline-first tourism experience with destination browsing, saved places, and a trip planner for arranging travel dates, stops, and notes.",
  },
];

export const skills: Skill[] = [
  { name: "Flutter", level: 95, category: "mobile" },
  { name: "Dart", level: 90, category: "mobile" },
  { name: "React", level: 88, category: "frontend" },
  { name: "TypeScript", level: 85, category: "frontend" },
  { name: "Tailwind CSS", level: 90, category: "frontend" },
  { name: "Next.js", level: 80, category: "frontend" },
  { name: "Node.js", level: 75, category: "backend" },
  { name: "Firebase", level: 85, category: "backend" },
  { name: "Supabase", level: 80, category: "backend" },
  { name: "Git", level: 88, category: "tools" },
  { name: "Figma", level: 70, category: "tools" },
  { name: "Docker", level: 65, category: "tools" },
];

export const socialLinks = {
  github: "https://github.com/JayEsmalla",
  linkedin: "https://www.linkedin.com/in/jay-esmalla-1703bb381/",
  twitter: "",
  email: "jaesmalla1@gmail.com",
};

/* ─────────────────────────────────────────────────────────
   CERTIFICATIONS
   Add new entries to the certifications array below.
   The grid layout adjusts automatically for 1, 2, 3+ cards.
───────────────────────────────────────────────────────── */
export interface Certification {
  id: string;
  name: string;
  type: "Certification" | "Participation" | "Team participation";
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  recognition?: string;
  image: string;
  imageSrcSet: string;
  fullImage: string;
  imageAlt: string;
}

export const certifications: Certification[] = [
  {
    id: "its-databases-2026",
    name: "IT Specialist — Databases",
    type: "Certification",
    issuer: "Certiport · CertNexus · Pearson VUE",
    issuedDate: "July 3, 2026",
    expiryDate: "July 3, 2031",
    image: "/credentials/database-800.webp",
    imageSrcSet: "/credentials/database-480.webp 480w, /credentials/database-800.webp 800w, /credentials/database-1200.webp 1200w",
    fullImage: "/credentials/database.jpg",
    imageAlt: "IT Specialist Databases certificate awarded to Jay Factolarin Esmalla on July 3, 2026, valid for five years",
  },
  {
    id: "innovathon-2026",
    name: "Innovathon 2026",
    type: "Participation",
    issuer: "City Government of Tagum",
    issuedDate: "September 24, 2026",
    image: "/credentials/innovathon-800.webp",
    imageSrcSet: "/credentials/innovathon-480.webp 480w, /credentials/innovathon-800.webp 800w, /credentials/innovathon-1200.webp 1200w",
    fullImage: "/credentials/innovathon.jpg",
    imageAlt: "Innovathon 2026 certificate of participation presented to Jay Esmalla on September 24, 2026",
  },
  {
    id: "start-in-davnor-2026",
    name: "Start in DavNor",
    type: "Team participation",
    issuer: "Province of Davao del Norte",
    issuedDate: "October 9, 2026",
    recognition: "GridPulse team · Top 12 finalist",
    image: "/credentials/onedavnor-800.webp",
    imageSrcSet: "/credentials/onedavnor-480.webp 480w, /credentials/onedavnor-800.webp 800w, /credentials/onedavnor-1200.webp 1200w",
    fullImage: "/credentials/onedavnor.jpg",
    imageAlt: "Certificate of participation awarded to the GridPulse team, one of the Top 12 Finalists of the Start in DavNor Startup Development Challenge, on October 9, 2026",
  },
];

/* ─────────────────────────────────────────────────────────
   GITHUB SECTION CONFIG
   Change only this object when customising the embed theme.
───────────────────────────────────────────────────────── */
export const githubConfig = {
  username: "JayEsmalla",
  profileUrl: "https://github.com/JayEsmalla",
  /** Hex colours (no #) passed to the embed APIs */
  theme: {
    bg: "101010",
    titleColor: "f3f3f3",
    textColor: "9c9c9c",
    iconColor: "6f6759",
    border: "212121",
  },
};


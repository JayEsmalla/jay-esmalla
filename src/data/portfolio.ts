export interface Project {
  id: string;
  title: string;
  description: string;
  category: "flutter" | "web" | "other";
  technologies: string[];
  image: string;
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

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  /** Add only after the author approves the quote, attribution, and project association. */
  approvedContext?: {
    projectId: string;
    name: string;
    role: string;
  };
}

export const projects: Project[] = [
  {
    id: "lolas-kusina",
    title: "LolasKusina",
    description: "A food package ordering system for browsing catering options, placing orders, and managing customer requests.",
    category: "web",
    technologies: ["PHP", "JavaScript", "Python", "Docker"],
    image: "/lolas-kusina-auth-gate.webp",
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
    description: "A peer-to-peer thrift marketplace for listing pre-loved items, discovering local finds, and connecting buyers with sellers.",
    category: "flutter",
    technologies: ["Flutter", "Dart", "Firebase", "Marketplace"],
    image: "/thryfto.png",
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
    description: "A centralized payroll and staff-management system for Tagum Doctors Hospital, connecting attendance verification, employee records, and leave administration.",
    category: "web",
    technologies: ["React 19", "Node.js 20", "Express 5", "MySQL 8"],
    image: "/prism.png",
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
    description: "A Python-powered agent-based emergency egress simulator for comparing the current ComLab V3 layout with a safer modified layout.",
    category: "web",
    technologies: ["Python", "JavaScript", "HTML5 Canvas", "Vercel"],
    image: "/comlab-egress.png",
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
];

export const testimonials: Testimonial[] = [
  {
    id: "client-1",
    name: "M. Santos",
    role: "Small Business Owner",
    quote: "The app felt simple, fast, and easy to understand. It turned our ordering process into something customers could use without asking for help.",
  },
  {
    id: "client-2",
    name: "D. Reyes",
    role: "Project Collaborator",
    quote: "Jae is thoughtful with both design and implementation. The final interface looked polished while still keeping the user flow clear.",
  },
  {
    id: "client-3",
    name: "A. Cruz",
    role: "Beta Tester",
    quote: "Everything was organized and responsive. The experience felt smooth on mobile, which made the project much easier to test.",
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
  /** Official certificate title */
  name: string;
  /** Specialisation / subject domain shown on the cert */
  domain: string;
  /** Issuing body name(s) */
  issuer: string;
  /** Short issuer acronym for the badge chip */
  issuerTag: string;
  /** ISO date string used for display, e.g. "July 3, 2026" */
  issuedDate: string;
  /** Optional expiry, e.g. "July 3, 2031" */
  expiryDate?: string;
  /** URL that opens the verifier page */
  verificationUrl?: string;
  /** The credential/serial code to paste into the verifier */
  verificationCode?: string;
  /** Tailwind-compatible accent color key: "pink" | "cyan" | "purple" */
  accent: "pink" | "cyan" | "purple";
  /** Lucide icon name to use as a badge icon */
  iconName: string;
  /** Optional path to certificate badge/image */
  image?: string;
}

export const certifications: Certification[] = [
  {
    id: "its-databases-2026",
    name: "IT Specialist — Databases",
    domain: "Databases",
    issuer: "Certiport · CertNexus · Pearson VUE",
    issuerTag: "CERTIPORT",
    issuedDate: "July 3, 2026",
    expiryDate: "July 3, 2031",
    verificationUrl: "https://verify.certiport.com",
    verificationCode: "wBTT6-2FvB",
    accent: "cyan",
    iconName: "Database",
    image: "/its-databases-cert.jpg",
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


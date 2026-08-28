export interface Project {
  id: string;
  title: string;
  description: string;
  category: "flutter" | "web" | "other";
  technologies: string[];
  image: string;
  preview: "screen" | "mobile-flow" | "order-flow";
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
    image: "",
    preview: "mobile-flow",
    previewLabel: "COMMUNITY MARKETPLACE FLOW",
    proofPoints: ["Real-time feed", "Listing uploads", "Buyer-seller chat"],
    githubUrl: "https://github.com/JayEsmalla/thryfto-app",
    role: "Full-Stack Mobile Developer",
    problemSolved: "Existing peer-to-peer thrift sales on social media lacked structure, searchability, and secure communication channels, causing friction for both buyers and sellers.",
    outcome: "Developed a cross-platform marketplace with structured listings, discovery tools, Firebase-backed interactions, and features designed around local peer-to-peer thrift transactions.",
  },
  {
    id: "rimworks",
    title: "RimWorks PH",
    description: "A full-stack custom rim ordering platform for browsing products, configuring an order, uploading payment proof, and tracking fulfillment.",
    category: "web",
    technologies: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
    image: "",
    preview: "order-flow",
    previewLabel: "CUSTOM ORDER WORKFLOW",
    proofPoints: ["Product filtering", "Payment proof", "Status tracking"],
    githubUrl: "https://github.com/JayEsmalla/rim-works",
    role: "Full-Stack Web Developer",
    problemSolved: "Custom rim buyers and shop staff needed one clear workflow for product discovery, order configuration, downpayment review, and fulfillment tracking.",
    outcome: "Built customer and staff experiences around a shared Supabase backend, including role-based access, order snapshots, payment-proof uploads, and status history.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "client-1",
    name: "Maria Santos",
    role: "Small Business Owner",
    quote: "The app felt simple, fast, and easy to understand. It turned our ordering process into something customers could use without asking for help.",
  },
  {
    id: "client-2",
    name: "Daniel Reyes",
    role: "Project Collaborator",
    quote: "Jae is thoughtful with both design and implementation. The final interface looked polished while still keeping the user flow clear.",
  },
  {
    id: "client-3",
    name: "Alyssa Cruz",
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


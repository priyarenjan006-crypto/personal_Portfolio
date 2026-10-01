/** All editable portfolio content lives here. */

export const profile = {
  name: "priyarenjan",
  role: "Full-Stack Developer · Digital Builder",
  location: "Coimbatore, Tamil Nadu",
  email: "priyarenjan006@gmail.com",
  available: "Open to internships — 2026",
  resumeUrl: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/priyarenjan006-crypto" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/priyarenjan-s" },
    { label: "Instagram", href: "https://www.instagram.com/webinnovex__/" },
  ],
} as const;

export const about = {
  statement:
    "I build things from an idea to a working experience.",
  body: [
    "I’m a BCA student and aspiring full-stack developer who loves turning ideas into real, interactive products.",
    "I build modern web applications with 3D visuals, smooth animations, and engaging interfaces.",
    "I’m also exploring AI and data to bring smarter possibilities into what I create.",
    "For me, it’s not just about making something work — it’s about making people remember it."
  ],
  stats: [
    { value: "3+", label: "Projects shipped" },
    { value: "2+", label: "Years building" },
    { value: "6+", label: "Events organised" },
  ],
};

export type Project = {
  title: string;
  year: string;
  summary: string;
  tags: string[];
  href: string;
  videoUrl?: string;
  cropTop?: boolean;
};

export const projects: Project[] = [
  {
    title: "PRIMO",
    year: "2026",
    summary:
      "A 3D animated promotional website for a strawberry milkshake, featuring immersive interactive visuals and smooth scroll animations.",
    tags: ["3D", "Web Animation", "React", "Three.js"],
    href: "#",
    videoUrl: "/primo.mp4",
    cropTop: true,
  },
  {
    title: "Lead Step",
    year: "2026",
    summary:
      "A full-stack lead generating platform featuring dedicated role-based portals for users, admins, and shop owners.",
    tags: ["Full-Stack", "Auth", "Lead Generation"],
    href: "#",
    videoUrl: "/lead-step.mp4",
    cropTop: true,
  },
  {
    title: "Personal Portfolio",
    year: "2026",
    summary:
      "My personal digital portfolio showcasing my projects and skills with an interactive, animated, and immersive dark-mode design.",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    href: "#",
    videoUrl: "/portfolio.mp4",
    cropTop: true,
  },
];

export const capabilities = [
  {
    title: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "Bootstrap", "Tailwind CSS"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "Backend Integration", "Authentication"],
  },
  {
    title: "Database",
    items: ["MySQL", "SQL", "Database Design", "CRUD Operations", "Data Management"],
  },
  {
    title: "Tools & AI",
    items: ["Git & GitHub", "Google Antigravity", "VS Code", "Prompt Engineering", "AI-Assisted Development"],
  },
];

export const timeline = [
  {
    period: "2026 — PRESENT",
    title: "Full-Stack Developer",
    org: "Web Development",
    detail: "Building modern web experiences from frontend to backend.",
  },
  {
    period: "2026 — PRESENT",
    title: "AI & Technology",
    org: "Exploration",
    detail: "Exploring AI tools, APIs, automation, and emerging technologies.",
  },
  {
    period: "2025 — PRESENT",
    title: "Project Builder",
    org: "Hands-on Experience",
    detail: "Turning ideas into real-world projects through hands-on development.",
  },
  {
    period: "2025 — PRESENT",
    title: "Continuous Learner",
    org: "Growth",
    detail: "Learning, experimenting, and improving through every project I build.",
  },
];

export const marqueeWords = [
  "HTML",
  "CSS",
  "JavaScript",
  "Tailwind CSS",
  "React JS",
  "Next JS",
  "REST API",
  "MySQL",
  "Python"
];

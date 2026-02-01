"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useCallback, useState } from "react";

// Intersection Observer hook for scroll animations
function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // Small delay to ensure DOM is ready, then observe elements
    setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-fade, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .scroll-bounce");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, []);
}

// Spotlight component
function Spotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-100"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.18), transparent 40%)`,
      }}
    />
  );
}

// Star Trail Effect - generates falling stars from cursor
function StarTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const throttleRef = useRef(false);

  const stars = ["✦", "✧", "•", "+", "*"];
  const colors = ["#E8A5A5", "#D68F8F", "#0a0a0a", "#EACDD0", "#c97878"];

  const createStar = useCallback((x: number, y: number) => {
    if (!containerRef.current) return;

    const star = document.createElement("span");
    star.textContent = stars[Math.floor(Math.random() * stars.length)];

    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 14 + 8; // 8-22px
    const drift = (Math.random() - 0.5) * 60; // horizontal drift while falling
    const fallDistance = Math.random() * 80 + 60; // 60-140px fall
    const duration = Math.random() * 800 + 600; // 600-1400ms
    const rotation = Math.random() * 360;

    star.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      font-size: ${size}px;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) rotate(${rotation}deg);
      opacity: 1;
      transition: transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms ease-out;
    `;

    containerRef.current.appendChild(star);

    // Trigger falling animation
    requestAnimationFrame(() => {
      star.style.transform = `translate(calc(-50% + ${drift}px), calc(-50% + ${fallDistance}px)) rotate(${rotation + 180}deg) scale(0.3)`;
      star.style.opacity = "0";
    });

    // Remove after animation
    setTimeout(() => star.remove(), duration);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle for performance
      if (throttleRef.current) return;
      throttleRef.current = true;
      setTimeout(() => { throttleRef.current = false; }, 20);

      // Only create stars if mouse moved enough
      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 4) {
        createStar(e.clientX, e.clientY);
        lastPosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [createStar]);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" />;
}

// Icons as simple SVG components
const StarIcon = () => (
  <span className="text-black">✦</span>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const WebIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

// Data
const experience = [
  {
    company: "Bilio AI",
    role: "Co-Founder & CEO",
    period: "Feb 2025 - Presente",
    type: "Self-employed",
  },
  {
    company: "Cofoundy",
    role: "Cofounder | Software Developer",
    period: "Jun 2025 - Presente",
    type: "Full-time",
  },
  {
    company: "NTT DATA Europe & Latam",
    role: "Junior Software Engineer",
    period: "Sep 2024 - Mar 2025",
    type: "Full-time",
  },
  {
    company: "SKYTECH",
    role: "Frontend Web Developer",
    period: "1 año 6 meses",
    type: "Part-time",
  },
];

const projects = [
  {
    name: "InfoJobs",
    description: "Landing page para el portal de empleo #1 de Europa",
    tech: "Astro + Tailwind CSS",
  },
  {
    name: "Warmi Ventures",
    description: "Incubadora de startups para emprendedoras",
    tech: "Astro + React",
  },
  {
    name: "Genera",
    description: "Materiales educativos con inteligencia artificial",
    tech: "NextJS",
  },
  {
    name: "Ecommerce",
    description: "Plataforma de comercio electrónico completa",
    tech: "React",
  },
  {
    name: "Acecom",
    description: "Web de asociación estudiantil UNI",
    tech: "Remix",
  },
  {
    name: "Cepre Smart",
    description: "Startup de educación preuniversitaria",
    tech: "HTML, CSS, Bootstrap",
  },
];

const skills = [
  { name: "React.js", level: 90 },
  { name: "NextJS", level: 85 },
  { name: "TypeScript", level: 80 },
  { name: "Tailwind CSS", level: 90 },
  { name: "Node.js", level: 75 },
  { name: "Java", level: 70 },
];

const languages = [
  { name: "Español", level: 100, label: "Nativo" },
  { name: "Inglés", level: 80, label: "C1 Advanced" },
];

const certifications = [
  { name: "EF SET English Certificate", issuer: "EF SET", level: "C1 Advanced (64/100)" },
  { name: "LangChain for LLM Application Development", issuer: "DeepLearning.AI", level: "" },
];

export default function Home() {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-[#F5E6E8] relative overflow-hidden">
      {/* Cursor effects */}
      <Spotlight />
      <StarTrail />

      {/* Floating decorative elements */}
      <div className="decoration-star top-8 left-8 hidden md:block float-animate">✦</div>
      <div className="decoration-star top-12 right-12 hidden md:block float-animate-slow" style={{ animationDelay: "0.5s" }}>✦</div>
      <div className="decoration-star top-40 left-16 hidden md:block float-animate-fast" style={{ animationDelay: "1s" }}>✧</div>
      <div className="decoration-star top-60 right-20 hidden md:block float-animate" style={{ animationDelay: "1.5s" }}>•</div>
      <div className="decoration-dot top-20 left-20 hidden md:block float-animate-slow" />
      <div className="decoration-dot top-16 right-24 hidden md:block float-animate" />

      {/* Decorative SVG lines that draw themselves */}
      <svg className="hidden md:block absolute top-0 left-1/4 w-px h-32" viewBox="0 0 1 128">
        <line x1="0.5" y1="0" x2="0.5" y2="128" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="line-draw" />
      </svg>
      <svg className="hidden md:block absolute top-0 right-1/4 w-px h-24" viewBox="0 0 1 96">
        <line x1="0.5" y1="0" x2="0.5" y2="96" stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="line-draw" style={{ transitionDelay: "0.3s" }} />
      </svg>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 md:gap-8 mb-6 md:mb-12">
          {/* Left Column - Photo & Contact */}
          <div className="space-y-6">
            {/* Profile Photo with Parallax */}
            <div className="hero-animate hero-delay-1 relative parallax-container">
              <div className="frame overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src="./images/profile-1-final.png"
                  alt="Melissa Iman Noriega"
                  width={300}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <span className="decoration-star -top-4 -left-4 float-animate">✦</span>
              <span className="decoration-star -bottom-4 -right-4 float-animate-slow" style={{ animationDelay: "0.7s" }}>✦</span>
            </div>

            {/* Contact Info */}
            <div className="hero-animate hero-delay-2 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <StarIcon />
                <span className="font-semibold">UBICACIÓN:</span>
              </div>
              <p className="pl-5 flex items-center gap-2">
                <LocationIcon />
                Lima, Perú
              </p>

              <div className="flex items-center gap-2 mt-4">
                <StarIcon />
                <span className="font-semibold">CONTACTO:</span>
              </div>
              <a href="mailto:melissa@melissaiman.com" className="pl-5 flex items-center gap-2 hover:underline">
                <EmailIcon />
                melissa@melissaiman.com
              </a>

              <div className="flex items-center gap-2 mt-4">
                <StarIcon />
                <span className="font-semibold">WEB:</span>
              </div>
              <a href="https://melissaiman.com" target="_blank" rel="noopener noreferrer" className="pl-5 flex items-center gap-2 hover:underline">
                <WebIcon />
                melissaiman.com
              </a>
            </div>
          </div>

          {/* Right Column - Name & About */}
          <div className="space-y-6">
            {/* Name */}
            <div className="hero-animate hero-delay-1">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Melissa
              </h1>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold italic ml-4 sm:ml-6 md:ml-10"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Iman Noriega
              </h2>
            </div>

            {/* Headline */}
            <p className="hero-animate hero-delay-2 text-lg font-medium">
              Software Developer | CEO @ Bilio AI | Cofoundy | Maker Fellow | Computer Science @ UNI
            </p>

            {/* About Me */}
            <div className="hero-animate hero-delay-3">
              <div className="section-box mb-4">SOBRE MÍ</div>
              <p className="text-sm leading-relaxed">
                Hola, soy Melissa, desarrolladora de software y emprendedora apasionada por la tecnología.
                Actualmente soy CEO de Bilio AI y Cofounder de Cofoundy. Estudio Ciencias de la Computación
                en la Universidad Nacional de Ingeniería (UNI). Me encanta crear soluciones tecnológicas que
                generen impacto real, y siempre estoy en constante aprendizaje para mejorar mis habilidades.
              </p>
            </div>

            {/* Socials */}
            <div className="hero-animate hero-delay-4">
              <div className="section-box mb-4">REDES</div>
              <div className="flex gap-4">
                <a
                  href="https://linkedin.com/in/melissa-iman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <LinkedInIcon />
                  <span className="text-sm">linkedin.com/in/melissa-iman</span>
                </a>
                <a
                  href="https://github.com/melissaiman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <GitHubIcon />
                  <span className="text-sm">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Education & Languages Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-12">
          {/* Education */}
          <div className="scroll-slide-left">
            <div className="section-box mb-4">EDUCACIÓN</div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <StarIcon />
                <div>
                  <p className="font-semibold">Universidad Nacional de Ingeniería (UNI)</p>
                  <p className="text-sm text-gray-700">Ciencias de la Computación</p>
                  <p className="text-sm text-gray-500">2022 - 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="scroll-slide-right">
            <div className="section-box mb-4">IDIOMAS</div>
            <div className="space-y-4">
              {languages.map((lang, i) => (
                <div key={lang.name} className="space-y-1" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-2">
                    <StarIcon />
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-gray-600">({lang.label})</span>
                    <span className="ml-auto font-semibold">{lang.level}%</span>
                  </div>
                  <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full progress-bar-fill"
                      style={{ width: `${lang.level}%`, transitionDelay: `${i * 0.2}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-6 md:mb-12">
          <div className="section-box mb-4 md:mb-6">EXPERIENCIA</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {experience.map((exp, i) => (
              <div
                key={exp.company}
                className="frame bg-white/50 p-4 card-hover scroll-scale"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-2">
                  <StarIcon />
                  <div>
                    <p className="font-bold">{exp.company}</p>
                    <p className="text-sm font-medium">{exp.role}</p>
                    <p className="text-xs text-gray-600">{exp.period} · {exp.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-6 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Technical Skills */}
            <div className="scroll-slide-left">
              <div className="section-box mb-4">SKILLS</div>
              <div className="space-y-3">
                {skills.map((skill, i) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StarIcon />
                      <span className="font-medium text-sm">{skill.name}</span>
                      <span className="ml-auto text-sm font-semibold">{skill.level}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full progress-bar-fill"
                        style={{ width: `${skill.level}%`, transitionDelay: `${i * 0.1}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Circles */}
            <div className="scroll-slide-right">
              <div className="section-box mb-4">HERRAMIENTAS</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {[
                  { name: "React", level: 90, color: "#E8A5A5" },
                  { name: "NextJS", level: 85, color: "#D68F8F" },
                  { name: "Tailwind", level: 90, color: "#E8A5A5" },
                  { name: "Astro", level: 80, color: "#EACDD0" },
                  { name: "Node.js", level: 75, color: "#D68F8F" },
                  { name: "Git", level: 85, color: "#E8A5A5" },
                ].map((tool) => (
                  <div key={tool.name} className="text-center">
                    <div
                      className="skill-circle mx-auto mb-2"
                      style={{
                        background: `conic-gradient(${tool.color} ${tool.level}%, #e5e5e5 ${tool.level}%)`,
                        border: "2px solid black"
                      }}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F5E6E8] rounded-full flex items-center justify-center text-xs sm:text-sm">
                        {tool.level}%
                      </div>
                    </div>
                    <p className="text-xs font-medium">{tool.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-6 md:mb-12">
          <div className="section-box mb-4 md:mb-6">PROYECTOS</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {projects.map((project, i) => (
              <div
                key={project.name}
                className="frame bg-white/50 p-4 card-hover scroll-bounce"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <StarIcon />
                  <p className="font-bold">{project.name}</p>
                </div>
                <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                <p className="text-xs font-mono bg-black/10 inline-block px-2 py-1 rounded">
                  {project.tech}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications & Highlight */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-12">
          {/* Certifications */}
          <div className="scroll-slide-left">
            <div className="section-box mb-4">CERTIFICACIONES</div>
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-start gap-2">
                  <StarIcon />
                  <div>
                    <p className="font-semibold text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-600">{cert.issuer} {cert.level && `· ${cert.level}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlight */}
          <div className="scroll-slide-right">
            <div className="section-box mb-4">LOGRO DESTACADO</div>
            <div className="frame bg-white/50 p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-bold">Seleccionada por midudev</p>
                  <p className="text-sm text-gray-700">
                    Entre <span className="font-bold">7,000 postulantes</span> para desarrollar
                    la landing page de InfoJobs junto a un equipo internacional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organizations */}
        <section className="mb-6 md:mb-12">
          <div className="section-box mb-4">ORGANIZACIONES</div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              "Acecom - Asoc. Científica Especializada en Computación",
              "Comunidad Académica DSC UNI - IBM",
              "Área de Desarrollo Web",
              "Área de Robótica Competitiva",
            ].map((org, i) => (
              <div
                key={org}
                className="flex items-center gap-2 bg-white/50 px-3 py-2 border-2 border-black text-sm scroll-scale"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <StarIcon />
                {org}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section with Second Photo */}
        <section className="mb-6 md:mb-12 scroll-scale">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 md:gap-8 items-center">
            {/* CTA Content */}
            <div className="frame bg-white/50 p-4 sm:p-6 md:p-8">
              <h3
                className="text-xl sm:text-2xl md:text-3xl font-bold italic mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                ¿Trabajamos juntos?
              </h3>
              <p className="text-gray-700 mb-6">
                Siempre estoy abierta a nuevas oportunidades y colaboraciones.
                Si tienes un proyecto interesante o simplemente quieres conectar,
                no dudes en contactarme.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="mailto:melissa@melissaiman.com"
                  className="btn-primary"
                >
                  Contáctame
                </a>
                <a
                  href="https://linkedin.com/in/melissa-iman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Second Photo */}
            <div className="hidden md:block">
              <div className="frame overflow-hidden">
                <img
                  src="./images/profile-2-final.png"
                  alt="Melissa Iman Noriega"
                  width={280}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t-2 border-black/20">
          <p className="text-sm text-gray-600">
            © 2025 Melissa Iman Noriega
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <span className="decoration-star">✦</span>
            <span className="decoration-star">✦</span>
            <span className="decoration-star">✦</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

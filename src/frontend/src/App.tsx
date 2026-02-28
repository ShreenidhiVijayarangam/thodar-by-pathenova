import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RegistryAndAnalyticsSections } from "./RegistrySections";

// Intersection Observer hook for fade-in animations
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={`fade-in-section ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Active Section Detection Hook ──────────────────────────────────────────
function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;

      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          }
        },
        { threshold: 0.2 },
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => {
      for (const obs of observers) {
        obs.disconnect();
      }
    };
  }, [ids]);

  return activeId;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Overview", href: "#hero" },
  { label: "Problem", href: "#clinical-problem" },
  { label: "Platform", href: "#platform" },
  { label: "Vision", href: "#vision" },
  { label: "Team", href: "#team" },
  { label: "Clinical", href: "#clinical-problem-registry" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Registry", href: "#registry" },
  { label: "Analytics", href: "#analytics" },
  { label: "Comparison", href: "#comparison" },
  { label: "Governance", href: "#governance" },
  { label: "Audit", href: "#audit" },
  { label: "Pilot Scope", href: "#pilot-scope" },
  { label: "Pathway", href: "#implementation" },
  { label: "Scope", href: "#scope" },
  { label: "Compliance", href: "#compliance" },
  { label: "Collaboration", href: "#collaboration" },
] as const;

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

function Navigation() {
  const activeId = useActiveSection(SECTION_IDS);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileOpen(false);
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "var(--thodar-surface)",
        borderBottom: "1px solid var(--thodar-border)",
      }}
    >
      {/* Main bar */}
      <div
        className="max-w-7xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "56px" }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <span
            className="font-cormorant font-light"
            style={{
              fontSize: "17px",
              letterSpacing: "-0.01em",
              color: "var(--thodar-text-primary)",
            }}
          >
            Thodar
          </span>
          <span style={{ color: "var(--thodar-separator)", fontSize: "10px" }}>
            —
          </span>
          <span
            className="font-inter font-light tracking-[0.18em] uppercase"
            style={{ fontSize: "9px", color: "var(--thodar-text-muted)" }}
          >
            Pathenova
          </span>
        </div>

        {/* Desktop links */}
        <div
          className="nav-links-scroll hidden lg:flex items-center gap-6 ml-8 flex-1"
          style={{ overflowX: "auto", paddingBottom: "1px" }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.slice(1);
            const isActive = activeId === id;
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                className="font-inter font-light tracking-[0.14em] uppercase whitespace-nowrap transition-colors duration-150"
                style={{
                  fontSize: "10px",
                  color: isActive
                    ? "var(--thodar-teal)"
                    : "var(--thodar-text-muted)",
                  fontWeight: isActive ? 500 : 300,
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Hamburger button (mobile) */}
        <button
          type="button"
          className="lg:hidden flex flex-col justify-center items-center gap-1.5 p-2 transition-opacity hover:opacity-60 focus-visible:outline-none"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
        >
          <span
            className="block"
            style={{
              width: "20px",
              height: "1px",
              backgroundColor: "var(--thodar-text-secondary)",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: mobileOpen ? "translateY(5px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block"
            style={{
              width: "20px",
              height: "1px",
              backgroundColor: "var(--thodar-text-secondary)",
              opacity: mobileOpen ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          />
          <span
            className="block"
            style={{
              width: "20px",
              height: "1px",
              backgroundColor: "var(--thodar-text-secondary)",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: mobileOpen
                ? "translateY(-5px) rotate(-45deg)"
                : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            backgroundColor: "var(--thodar-surface)",
            borderTop: "1px solid var(--thodar-border)",
            borderBottom: "1px solid var(--thodar-border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-0">
            {NAV_LINKS.map(({ label, href }) => {
              const id = href.slice(1);
              const isActive = activeId === id;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className="font-inter tracking-[0.14em] uppercase py-3 transition-colors duration-150"
                  style={{
                    fontSize: "11px",
                    color: isActive
                      ? "var(--thodar-teal)"
                      : "var(--thodar-text-muted)",
                    fontWeight: isActive ? 500 : 300,
                    textDecoration: "none",
                    borderBottom: "1px solid var(--thodar-border)",
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section
      id="hero"
      className="flex flex-col items-center justify-center text-center px-8"
      style={{
        minHeight: "92vh",
        paddingTop: "80px",
        backgroundColor: "var(--thodar-surface)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Label above wordmark */}
        <p
          className="font-inter font-medium tracking-[0.32em] uppercase mb-10"
          style={{ fontSize: "10px", color: "var(--thodar-text-muted)" }}
        >
          Pathenova
        </p>

        {/* Primary wordmark — Cormorant for refined authority */}
        <h1
          className="font-cormorant font-light leading-none mb-3"
          style={{
            fontSize: "clamp(80px, 12vw, 136px)",
            letterSpacing: "-0.02em",
            color: "var(--thodar-text-primary)",
          }}
        >
          Thodar
        </h1>

        {/* Thin ornamental rule */}
        <div className="flex items-center justify-center gap-5 mb-10">
          <hr
            style={{
              width: "40px",
              border: "none",
              borderTop: "1px solid var(--thodar-separator)",
            }}
          />
          <span
            className="font-inter font-light tracking-[0.2em] uppercase"
            style={{
              fontSize: "9px",
              color: "var(--thodar-teal)",
              letterSpacing: "0.22em",
            }}
          >
            Continuity of Care
          </span>
          <hr
            style={{
              width: "40px",
              border: "none",
              borderTop: "1px solid var(--thodar-separator)",
            }}
          />
        </div>

        <p
          className="font-cormorant font-light leading-relaxed"
          style={{
            fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "var(--thodar-text-secondary)",
            maxWidth: "520px",
            margin: "0 auto",
            fontStyle: "italic",
            letterSpacing: "0.01em",
          }}
        >
          Long-term monitoring and lifecycle management of medical implants and
          post-operative devices.
        </p>
      </div>
    </section>
  );
}

// Problem Section
function ProblemSection() {
  const gaps = [
    {
      title: "Centralized implant lifecycle tracking",
      description:
        "No unified registry to monitor implant status, history, or expiry across care settings.",
    },
    {
      title: "Automated monitoring and alert systems",
      description:
        "Follow-up schedules remain manual, prone to delay, and disconnected from device timelines.",
    },
    {
      title: "Integrated long-term patient data continuity",
      description:
        "Patient records fragment across providers, creating blind spots in post-operative history.",
    },
    {
      title: "Predictive follow-up intelligence",
      description:
        "Clinical teams lack tools to anticipate device-related complications before symptoms emerge.",
    },
  ];

  return (
    <section
      id="clinical-problem"
      className="px-8 py-24 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="font-inter font-medium tracking-[0.2em] uppercase mb-8"
            style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
          >
            The Problem
          </p>
        </FadeIn>

        <FadeIn delay={80}>
          <h2
            className="font-playfair font-normal leading-tight mb-8"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--thodar-text-primary)",
              maxWidth: "640px",
            }}
          >
            Modern surgical care ends at discharge.
          </h2>
        </FadeIn>

        <FadeIn delay={160}>
          <p
            className="font-inter font-light leading-relaxed mb-16"
            style={{
              fontSize: "16px",
              color: "var(--thodar-text-secondary)",
              maxWidth: "600px",
            }}
          >
            Implants and post-operative devices require structured long-term
            monitoring, periodic assessment, and in some cases scheduled
            replacement. Healthcare systems currently lack the infrastructure to
            support this. The result is a systemic gap in post-operative care.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gaps.map((gap, index) => (
            <FadeIn key={gap.title} delay={index * 80}>
              <div
                className="pl-5 py-1"
                style={{ borderLeft: "2px solid var(--thodar-teal)" }}
              >
                <p
                  className="font-inter font-medium mb-2"
                  style={{
                    fontSize: "15px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  {gap.title}
                </p>
                <p
                  className="font-inter font-light leading-relaxed"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-muted)",
                  }}
                >
                  {gap.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Platform Section
function PlatformSection() {
  const pillars = [
    {
      number: "01",
      name: "Implant Lifecycle Tracking",
      description:
        "Full device history from implant to end-of-life, including batch records, regulatory identifiers, and replacement timelines.",
    },
    {
      number: "02",
      name: "Automated Monitoring",
      description:
        "Rule-based alerts and scheduled follow-up workflows that trigger based on device age, patient history, and clinical protocols.",
    },
    {
      number: "03",
      name: "Patient Data Continuity",
      description:
        "Longitudinal records accessible across care transitions, ensuring clinical context is never lost between providers.",
    },
    {
      number: "04",
      name: "Predictive Intelligence",
      description:
        "Data-informed follow-up scheduling and risk flagging to surface emerging concerns before they reach clinical urgency.",
    },
  ];

  return (
    <section
      id="platform"
      className="px-8 py-24 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="font-inter font-medium tracking-[0.2em] uppercase mb-8"
            style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
          >
            The Platform
          </p>
        </FadeIn>

        <FadeIn delay={80}>
          <h2
            className="font-playfair font-normal leading-tight mb-16"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--thodar-text-primary)",
              maxWidth: "600px",
            }}
          >
            Structured digital continuity for post-operative care.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {pillars.map((pillar, index) => (
            <FadeIn key={pillar.number} delay={index * 80}>
              <div
                className="pt-6 pr-8 pb-8"
                style={{ borderTop: "1px solid var(--thodar-border)" }}
              >
                <p
                  className="font-inter font-light mb-4"
                  style={{ fontSize: "12px", color: "var(--thodar-teal)" }}
                >
                  {pillar.number}
                </p>
                <p
                  className="font-inter font-semibold mb-3 leading-snug"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  {pillar.name}
                </p>
                <p
                  className="font-inter font-light leading-relaxed"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-muted)",
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Vision Section — charcoal reversal, the emotional climax
function VisionSection() {
  return (
    <section
      id="vision"
      className="px-8"
      style={{
        backgroundColor: "var(--thodar-footer-bg)",
        paddingTop: "clamp(72px, 10vw, 140px)",
        paddingBottom: "clamp(72px, 10vw, 140px)",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <p
            className="font-inter font-medium tracking-[0.28em] uppercase mb-14"
            style={{ fontSize: "10px", color: "oklch(0.55 0.06 186)" }}
          >
            Vision
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <blockquote
            className="font-cormorant font-light leading-snug mb-14"
            style={{
              fontSize: "clamp(28px, 4.5vw, 52px)",
              color: "oklch(0.96 0 0)",
              letterSpacing: "-0.01em",
              maxWidth: "840px",
              margin: "0 auto 3.5rem auto",
            }}
          >
            To redefine post-surgical care from episodic treatment to
            continuous, intelligent healthcare monitoring.
          </blockquote>
        </FadeIn>

        <FadeIn delay={220}>
          <div className="flex items-center justify-center gap-4">
            <hr
              style={{
                width: "32px",
                border: "none",
                borderTop: "1px solid oklch(0.35 0 0)",
              }}
            />
            <p
              className="font-inter font-light tracking-[0.18em] uppercase"
              style={{ fontSize: "10px", color: "oklch(0.45 0 0)" }}
            >
              Pathenova, 2024
            </p>
            <hr
              style={{
                width: "32px",
                border: "none",
                borderTop: "1px solid oklch(0.35 0 0)",
              }}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  const founders = [
    {
      name: "Shreenidhi Vijayarangam",
      title: "Founder & CEO",
      role: "Clinical Research, Product Architecture & Strategic Direction",
    },
    {
      name: "Joe Mahizhan",
      title: "Co-Founder & CTO",
      role: "Platform Development, Systems Engineering & Technical Strategy",
    },
  ];

  return (
    <section
      id="team"
      className="px-8 py-24 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="font-inter font-medium tracking-[0.2em] uppercase mb-8"
            style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
          >
            The Team
          </p>
        </FadeIn>

        <FadeIn delay={80}>
          <p
            className="font-inter font-light leading-relaxed mb-16"
            style={{
              fontSize: "16px",
              color: "var(--thodar-text-secondary)",
              maxWidth: "580px",
            }}
          >
            Pathenova is an early-stage health technology initiative founded by
            two biomedical engineering students. Driven by clinical curiosity
            and systems thinking, the team is building Thodar to create a
            structured, technology-enabled approach to long-term implant
            monitoring and patient follow-up.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-16">
          {founders.map((founder, index) => (
            <FadeIn key={founder.name} delay={index * 120}>
              <div
                className="pt-8 pr-12 pb-10"
                style={{ borderTop: "1px solid var(--thodar-border)" }}
              >
                <p
                  className="font-cormorant font-light leading-tight mb-1"
                  style={{
                    fontSize: "clamp(22px, 3vw, 28px)",
                    color: "var(--thodar-text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {founder.name}
                </p>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-5"
                  style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
                >
                  {founder.title}
                </p>
                <p
                  className="font-inter font-light leading-relaxed"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-muted)",
                    maxWidth: "320px",
                  }}
                >
                  {founder.role}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={280}>
          <p
            className="font-inter font-light leading-relaxed"
            style={{
              fontSize: "15px",
              color: "var(--thodar-text-secondary)",
              maxWidth: "520px",
            }}
          >
            Building a research-informed platform to strengthen patient safety
            and modernize post-operative monitoring.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="px-8 py-12 border-t"
      style={{
        backgroundColor: "var(--thodar-footer-bg)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Top row: wordmark */}
        <div
          className="flex items-center gap-4 mb-8 pb-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span
            className="font-cormorant font-light"
            style={{
              fontSize: "17px",
              letterSpacing: "-0.01em",
              color: "oklch(0.92 0 0)",
            }}
          >
            Thodar
          </span>
          <span style={{ color: "oklch(0.40 0 0)", fontSize: "10px" }}>—</span>
          <span
            className="font-inter font-light tracking-[0.18em] uppercase"
            style={{ fontSize: "9px", color: "oklch(0.52 0 0)" }}
          >
            Pathenova
          </span>
        </div>

        {/* Two-column info row */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 pb-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Left: institution + team */}
          <div>
            <p
              className="font-inter font-light mb-5"
              style={{ fontSize: "12px", color: "oklch(0.55 0 0)" }}
            >
              Pathenova Health Initiative&nbsp;&nbsp;|&nbsp;&nbsp;Tamil Nadu,
              India
            </p>
            <div className="space-y-4">
              {[
                { name: "Shreenidhi Vijayarangam", title: "Founder & CEO" },
                { name: "Joe Mahizhan", title: "Co-Founder & CTO" },
              ].map((person) => (
                <div key={person.name}>
                  <p
                    className="font-inter font-light"
                    style={{ fontSize: "13px", color: "oklch(0.72 0.06 186)" }}
                  >
                    {person.name}
                  </p>
                  <p
                    className="font-inter font-light"
                    style={{
                      fontSize: "11px",
                      color: "oklch(0.48 0 0)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {person.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: contact */}
          <div>
            <p
              className="font-inter font-light mb-2"
              style={{ fontSize: "12px", color: "oklch(0.55 0 0)" }}
            >
              Institutional Enquiries
            </p>
            <a
              href="mailto:pathenova.health@gmail.com?subject=Institutional%20Enquiry%20%E2%80%93%20Thodar%20Pilot%20Framework"
              className="font-inter font-light transition-opacity hover:opacity-70"
              style={{
                fontSize: "14px",
                color: "oklch(0.72 0.06 186)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              pathenova.health@gmail.com
            </a>
            <p
              className="font-inter font-light mt-2"
              style={{
                fontSize: "11px",
                color: "oklch(0.42 0 0)",
                fontStyle: "italic",
              }}
            >
              Subject: "Institutional Enquiry – Thodar Pilot Framework"
            </p>
          </div>
        </div>

        {/* Bottom row: disclaimer + copyright + caffeine */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p
            className="font-inter font-light leading-relaxed"
            style={{
              fontSize: "11px",
              color: "oklch(0.40 0 0)",
              fontStyle: "italic",
              maxWidth: "480px",
            }}
          >
            All data displayed is simulated for concept validation. This
            platform is in structured prototype phase.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 shrink-0">
            <p
              className="font-inter font-light"
              style={{ fontSize: "11px", color: "oklch(0.38 0 0)" }}
            >
              &copy; {currentYear} Pathenova
            </p>
            <p
              className="font-inter font-light"
              style={{ fontSize: "11px", color: "oklch(0.35 0 0)" }}
            >
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70"
                style={{ color: "oklch(0.48 0 0)" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App
export default function App() {
  return (
    <div className="bg-thodar-bg min-h-screen">
      <Navigation />
      <main style={{ paddingTop: "56px" }}>
        <HeroSection />
        <ProblemSection />
        <PlatformSection />
        <VisionSection />
        <TeamSection />
        <RegistryAndAnalyticsSections />
      </main>
      <Footer />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ImplantRecord,
  REGISTRY_DATA,
  getImplantDuration,
} from "./registryData";

// ─── Local FadeIn (mirrors App.tsx pattern) ────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
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

// ─── Section label helper ───────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-inter font-medium tracking-[0.2em] uppercase mb-8"
      style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
    >
      {children}
    </p>
  );
}

function SectionTitle({
  children,
  maxWidth = "640px",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <h2
      className="font-playfair font-normal leading-tight mb-8"
      style={{
        fontSize: "clamp(26px, 3.5vw, 42px)",
        color: "var(--thodar-text-primary)",
        maxWidth,
      }}
    >
      {children}
    </h2>
  );
}

// ─── Alert Level Badge ───────────────────────────────────────────────────────
function AlertBadge({ level }: { level: "stable" | "review" | "attention" }) {
  const config = {
    stable: {
      dot: "#16a34a",
      text: "Stable Monitoring",
      bg: "rgba(22,163,74,0.07)",
      border: "rgba(22,163,74,0.25)",
      color: "#15803d",
    },
    review: {
      dot: "#d97706",
      text: "Review Pending",
      bg: "rgba(217,119,6,0.07)",
      border: "rgba(217,119,6,0.25)",
      color: "#b45309",
    },
    attention: {
      dot: "#dc2626",
      text: "Clinical Attention",
      bg: "rgba(220,38,38,0.07)",
      border: "rgba(220,38,38,0.25)",
      color: "#b91c1c",
    },
  };
  const c = config[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 font-inter"
      style={{
        fontSize: "11px",
        fontWeight: 500,
        borderRadius: "2px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: c.dot,
          flexShrink: 0,
        }}
      />
      {c.text}
    </span>
  );
}

// ─── Follow-up Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string }> = {
    Scheduled: {
      bg: "rgba(67,122,168,0.07)",
      border: "rgba(67,122,168,0.25)",
      color: "var(--thodar-blue)",
    },
    Overdue: {
      bg: "rgba(220,38,38,0.07)",
      border: "rgba(220,38,38,0.25)",
      color: "#b91c1c",
    },
    Completed: {
      bg: "rgba(22,163,74,0.07)",
      border: "rgba(22,163,74,0.25)",
      color: "#15803d",
    },
  };
  const c = map[status] ?? map.Scheduled;
  return (
    <span
      className="font-inter"
      style={{
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: "2px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      {status}
    </span>
  );
}

// ─── Risk Level Badge ────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: "Low" | "Moderate" | "High" }) {
  const map = {
    Low: {
      bg: "rgba(22,163,74,0.07)",
      border: "rgba(22,163,74,0.25)",
      color: "#15803d",
    },
    Moderate: {
      bg: "rgba(217,119,6,0.07)",
      border: "rgba(217,119,6,0.25)",
      color: "#b45309",
    },
    High: {
      bg: "rgba(220,38,38,0.07)",
      border: "rgba(220,38,38,0.25)",
      color: "#b91c1c",
    },
  };
  const c = map[level];
  return (
    <span
      className="font-inter font-medium"
      style={{
        fontSize: "11px",
        padding: "2px 7px",
        borderRadius: "2px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      {level}
    </span>
  );
}

// ─── Field Row for detail panel ──────────────────────────────────────────────
function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p
        className="font-inter font-medium uppercase tracking-wide mb-1"
        style={{
          fontSize: "10px",
          color: "var(--thodar-text-muted)",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </p>
      <p
        className="font-inter font-light leading-snug"
        style={{ fontSize: "13px", color: "var(--thodar-text-secondary)" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Case Review Panel ───────────────────────────────────────────────────────
function CaseReviewPanel({
  record,
  onClose,
}: {
  record: ImplantRecord;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(20,20,20,0.35)" }}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        aria-hidden="true"
      />
      {/* Panel */}
      <dialog
        open
        aria-modal="true"
        aria-label="Clinical Case Review"
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-y-auto"
        style={{
          width: "min(520px, 100vw)",
          backgroundColor: "var(--thodar-surface)",
          borderLeft: "1px solid var(--thodar-border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          margin: 0,
          padding: 0,
          border: "none",
          left: "auto",
          maxHeight: "100vh",
          maxWidth: "100vw",
        }}
      >
        {/* Panel Header */}
        <div
          className="flex items-start justify-between px-8 py-6 sticky top-0"
          style={{
            backgroundColor: "var(--thodar-surface)",
            borderBottom: "1px solid var(--thodar-border)",
            zIndex: 1,
          }}
        >
          <div>
            <p
              className="font-inter font-medium tracking-[0.18em] uppercase mb-1"
              style={{ fontSize: "9px", color: "var(--thodar-teal)" }}
            >
              Clinical Case Review
            </p>
            <h3
              className="font-playfair font-normal"
              style={{ fontSize: "20px", color: "var(--thodar-text-primary)" }}
            >
              Detailed Summary — {record.patientId}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-inter font-light transition-opacity hover:opacity-50 focus-visible:outline-none focus-visible:ring-2"
            style={{
              fontSize: "20px",
              color: "var(--thodar-text-muted)",
              lineHeight: 1,
              marginTop: "2px",
            }}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className="px-8 pb-10 flex-1">
          {/* Patient Clinical Overview */}
          <div
            className="py-7"
            style={{ borderBottom: "1px solid var(--thodar-border)" }}
          >
            <p
              className="font-inter font-medium tracking-[0.16em] uppercase mb-5"
              style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
            >
              Patient Clinical Overview
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <DetailField
                label="Patient Identifier"
                value={record.patientId}
              />
              <DetailField label="Age" value={`${record.age} years`} />
              <DetailField label="Sex" value={record.sex} />
              <DetailField
                label="Primary Diagnosis"
                value={record.primaryDiagnosis}
              />
              <div className="col-span-2">
                <DetailField
                  label="Relevant Comorbidities"
                  value={record.comorbidities}
                />
              </div>
              <div className="col-span-2">
                <DetailField
                  label="Operating Institution"
                  value={record.institution}
                />
              </div>
            </div>
          </div>

          {/* Implant Device Specifications */}
          <div
            className="py-7"
            style={{ borderBottom: "1px solid var(--thodar-border)" }}
          >
            <p
              className="font-inter font-medium tracking-[0.16em] uppercase mb-5"
              style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
            >
              Implant Device Specifications
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <DetailField
                label="Implant Category"
                value={record.implantCategory}
              />
              <DetailField label="Manufacturer" value={record.manufacturer} />
              <div className="col-span-2">
                <DetailField label="Model Reference" value={record.modelRef} />
              </div>
              <DetailField
                label="Lot / Batch Number"
                value={record.lotNumber}
              />
              <DetailField
                label="Material Composition"
                value={record.material}
              />
              <DetailField label="Fixation Type" value={record.fixationType} />
              <DetailField
                label="Anatomical Site"
                value={record.anatomicalSite}
              />
              <DetailField label="Laterality" value={record.laterality} />
            </div>
            <p
              className="font-inter font-light mt-5 pt-5"
              style={{
                fontSize: "11px",
                color: "var(--thodar-text-muted)",
                borderTop: "1px solid var(--thodar-border)",
                fontStyle: "italic",
              }}
            >
              Device metadata simulated for pilot demonstration.
            </p>
          </div>

          {/* Surgical & Monitoring Data */}
          <div className="py-7">
            <p
              className="font-inter font-medium tracking-[0.16em] uppercase mb-5"
              style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
            >
              Surgical &amp; Monitoring Data
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <DetailField
                label="Date of Implantation"
                value={record.surgeryDate}
              />
              <DetailField
                label="Implant Duration"
                value={getImplantDuration(record.surgeryDate)}
              />
              <div className="col-span-2">
                <DetailField
                  label="Revision History"
                  value={record.revisionHistory}
                />
              </div>
              <DetailField
                label="Complication Reports"
                value={`${record.complicationsLogged} logged`}
              />
              <DetailField
                label="Last Clinical Review"
                value={record.lastReview}
              />
              <DetailField
                label="Scheduled Next Review"
                value={record.nextReview}
              />
              <div className="col-span-2 flex items-start gap-3">
                <div className="flex-1">
                  <p
                    className="font-inter font-medium uppercase tracking-wide mb-2"
                    style={{
                      fontSize: "10px",
                      color: "var(--thodar-text-muted)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Risk Stratification
                  </p>
                  <RiskBadge level={record.riskLevel} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

// ─── 1. ClinicalProblemStatementSection ─────────────────────────────────────
export function ClinicalProblemStatementSection() {
  return (
    <section
      id="clinical-problem-registry"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Clinical Context</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle maxWidth="720px">
            Need for Structured Orthopedic Implant Lifecycle Monitoring
          </SectionTitle>
        </FadeIn>
        <div className="max-w-3xl space-y-6">
          {(
            [
              {
                id: "cp-1",
                text: "Orthopedic implant volumes continue to increase globally, with many devices remaining in situ for extended durations requiring structured long-term follow-up. In many institutional settings, post-operative continuity is dependent on manual scheduling systems and department-level tracking practices that are not designed to scale with growing patient populations.",
              },
              {
                id: "cp-2",
                text: "Loss to follow-up, fragmented documentation, and the absence of structured lifecycle visualization may limit proactive review of aging implants and systematic revision risk evaluation. Without a centralized registry framework, identifying patients at risk of device-related complications requires considerable manual effort and is susceptible to delays.",
              },
              {
                id: "cp-3",
                text: "Globally, structured implant registries such as the National Joint Registry (United Kingdom) and the Australian Orthopaedic Association National Joint Replacement Registry have demonstrated the clinical and administrative value of organized implant tracking frameworks. These systems have enabled population-level outcome monitoring, early detection of device failures, and evidence-based revision planning.",
              },
              {
                id: "cp-4",
                text: "Thodar is conceptualized as a regional orthopedic implant registry pilot framework designed to support structured lifecycle monitoring and compliance visualization at the institutional level. This prototype demonstrates core registry capabilities using simulated data and is intended to support informed discussions around departmental adoption and structured pilot evaluation.",
              },
            ] as Array<{ id: string; text: string }>
          ).map((para, i) => (
            <FadeIn key={para.id} delay={160 + i * 60}>
              <p
                className="font-inter font-light leading-relaxed"
                style={{
                  fontSize: "15px",
                  color: "var(--thodar-text-secondary)",
                }}
              >
                {para.text}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({ value, label }: { value: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="p-5 summary-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--thodar-surface)",
        border: `1px solid ${hovered ? "var(--thodar-teal)" : "var(--thodar-border)"}`,
        boxShadow: hovered
          ? "0 4px 12px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        transition:
          "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <p
        className="font-playfair font-normal mb-2 leading-none"
        style={{
          fontSize: "clamp(26px, 3vw, 34px)",
          color: "var(--thodar-teal)",
        }}
      >
        {value}
      </p>
      <p
        className="font-inter font-light leading-snug"
        style={{ fontSize: "12px", color: "var(--thodar-text-muted)" }}
      >
        {label}
      </p>
    </article>
  );
}

// ─── 2. RegistryDashboardSection ─────────────────────────────────────────────
export function RegistryDashboardSection({
  onSelectRecord,
}: {
  onSelectRecord: (record: ImplantRecord) => void;
}) {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const summaryCards = [
    { value: "10", label: "Total Active Implant Cases" },
    { value: "4", label: "Upcoming Follow-Ups" },
    { value: "2", label: "Replacement Evaluation Alerts" },
    { value: "1", label: "Patients Lost to Follow-Up" },
    { value: "78%", label: "Follow-Up Compliance Rate" },
    { value: "3", label: "Cases Under Revision Monitoring" },
    { value: "4.2 yrs", label: "Average Implant Duration" },
  ];

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert(
          "A maximum of 3 implant cases may be selected for comparative review.",
        );
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    }
  }

  const selectedRecords = REGISTRY_DATA.filter((r) =>
    selectedIds.includes(r.id),
  );

  return (
    <section
      id="dashboard"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn>
          <SectionLabel>Regional Orthopedic Implant Registry</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <h2
            className="font-playfair font-normal leading-tight mb-3"
            style={{
              fontSize: "clamp(26px, 3.5vw, 42px)",
              color: "var(--thodar-text-primary)",
              maxWidth: "720px",
            }}
          >
            Structured Implant Lifecycle &amp; Compliance Monitoring System
          </h2>
        </FadeIn>
        <FadeIn delay={120}>
          <p
            className="font-inter font-medium tracking-[0.14em] uppercase mb-12"
            style={{ fontSize: "10px", color: "var(--thodar-text-muted)" }}
          >
            Pilot Demonstration Environment – Simulated Dataset
          </p>
        </FadeIn>

        {/* Summary Cards */}
        <FadeIn delay={160}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                value={card.value}
                label={card.label}
              />
            ))}
          </div>
          <p
            className="font-inter font-light mb-14"
            style={{
              fontSize: "11px",
              color: "var(--thodar-text-muted)",
              fontStyle: "italic",
            }}
          >
            Metrics derived from simulated registry dataset for prototype
            validation.
          </p>
        </FadeIn>

        {/* Table Header */}
        <FadeIn delay={200}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p
                className="font-inter font-medium tracking-[0.2em] uppercase mb-1"
                style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
              >
                Registered Cases
              </p>
              <h3
                className="font-playfair font-normal"
                style={{
                  fontSize: "22px",
                  color: "var(--thodar-text-primary)",
                }}
              >
                Regional Implant Registry Records
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="comparison-mode"
                checked={comparisonMode}
                onCheckedChange={(val) => {
                  setComparisonMode(val);
                  if (!val) {
                    setSelectedIds([]);
                    setShowComparison(false);
                  }
                }}
              />
              <Label
                htmlFor="comparison-mode"
                className="font-inter font-light cursor-pointer"
                style={{
                  fontSize: "13px",
                  color: "var(--thodar-text-secondary)",
                }}
              >
                Enable Comparative Review Mode
              </Label>
            </div>
          </div>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={240}>
          <div
            id="registry"
            style={{
              border: "1px solid var(--thodar-border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", minWidth: "760px" }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--thodar-border)",
                    backgroundColor: "var(--thodar-bg)",
                  }}
                >
                  {comparisonMode && <th style={{ width: "40px" }} />}
                  {[
                    "Patient ID",
                    "Implant Category",
                    "Manufacturer",
                    "Surgeon",
                    "Surgery Date",
                    "Duration",
                    "Follow-Up Status",
                    "Alert Level",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-inter font-medium tracking-wide text-left"
                      style={{
                        fontSize: "10px",
                        color: "var(--thodar-text-muted)",
                        padding: "10px 14px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGISTRY_DATA.map((record, idx) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr
                      key={record.id}
                      onClick={() => {
                        if (comparisonMode) {
                          toggleSelection(record.id);
                        } else {
                          onSelectRecord(record);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (comparisonMode) {
                            toggleSelection(record.id);
                          } else {
                            onSelectRecord(record);
                          }
                        }
                      }}
                      tabIndex={0}
                      style={{
                        borderBottom:
                          idx < REGISTRY_DATA.length - 1
                            ? "1px solid var(--thodar-border)"
                            : undefined,
                        backgroundColor: isSelected
                          ? "var(--thodar-teal-light)"
                          : "var(--thodar-surface)",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "var(--thodar-bg)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "var(--thodar-surface)";
                      }}
                    >
                      {comparisonMode && (
                        <td
                          style={{ padding: "12px 14px", paddingLeft: "16px" }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(record.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${record.patientId}`}
                          />
                        </td>
                      )}
                      <td
                        className="font-inter font-medium"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.patientId}
                      </td>
                      <td
                        className="font-inter font-light"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-secondary)",
                        }}
                      >
                        {record.implantCategory}
                      </td>
                      <td
                        className="font-inter font-light"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.manufacturer}
                      </td>
                      <td
                        className="font-inter font-light"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.operatingSurgeon}
                      </td>
                      <td
                        className="font-inter font-light"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.surgeryDate}
                      </td>
                      <td
                        className="font-inter font-light"
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "var(--thodar-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getImplantDuration(record.surgeryDate)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={record.followUpStatus} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <AlertBadge level={record.alertLevel} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Comparison Mode Controls */}
        {comparisonMode && (
          <FadeIn delay={60}>
            <div className="mt-4 flex items-center gap-4">
              <p
                className="font-inter font-light"
                style={{ fontSize: "12px", color: "var(--thodar-text-muted)" }}
              >
                {selectedIds.length} of 3 cases selected
              </p>
              {selectedIds.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  className="font-inter font-medium"
                  style={{ fontSize: "12px" }}
                >
                  Compare Selected
                </Button>
              )}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    setShowComparison(false);
                  }}
                  className="font-inter font-light transition-opacity hover:opacity-60"
                  style={{
                    fontSize: "12px",
                    color: "var(--thodar-text-muted)",
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </FadeIn>
        )}

        {/* Comparison Panel */}
        {comparisonMode && showComparison && selectedRecords.length >= 2 && (
          <FadeIn delay={80}>
            <div
              id="comparison"
              className="mt-8 p-6"
              style={{
                border: "1px solid var(--thodar-border)",
                backgroundColor: "var(--thodar-surface)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p
                    className="font-inter font-medium tracking-[0.16em] uppercase mb-1"
                    style={{ fontSize: "10px", color: "var(--thodar-teal)" }}
                  >
                    Multi-Implant Comparative Review
                  </p>
                  <h4
                    className="font-playfair font-normal"
                    style={{
                      fontSize: "19px",
                      color: "var(--thodar-text-primary)",
                    }}
                  >
                    Comparative Clinical Review Mode
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowComparison(false)}
                  className="font-inter font-light hover:opacity-50 transition-opacity"
                  style={{
                    fontSize: "18px",
                    color: "var(--thodar-text-muted)",
                  }}
                  aria-label="Close comparison"
                >
                  ×
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid var(--thodar-border)" }}
                    >
                      <th
                        className="font-inter font-medium text-left"
                        style={{
                          fontSize: "10px",
                          color: "var(--thodar-text-muted)",
                          padding: "8px 12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Attribute
                      </th>
                      {selectedRecords.map((r) => (
                        <th
                          key={r.id}
                          className="font-inter font-medium text-left"
                          style={{
                            fontSize: "10px",
                            color: "var(--thodar-teal)",
                            padding: "8px 12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {r.patientId}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Implant Category",
                        key: "implantCategory" as keyof ImplantRecord,
                      },
                      {
                        label: "Implant Duration",
                        key: "surgeryDate" as keyof ImplantRecord,
                      },
                      {
                        label: "Alert Level",
                        key: "alertLevel" as keyof ImplantRecord,
                      },
                      {
                        label: "Follow-Up Status",
                        key: "followUpStatus" as keyof ImplantRecord,
                      },
                      {
                        label: "Revision History",
                        key: "revisionHistory" as keyof ImplantRecord,
                      },
                      {
                        label: "Complication Events",
                        key: "complicationsLogged" as keyof ImplantRecord,
                      },
                    ].map(({ label, key }, i) => (
                      <tr
                        key={key}
                        style={{
                          borderBottom:
                            i < 5
                              ? "1px solid var(--thodar-border)"
                              : undefined,
                          backgroundColor:
                            i % 2 === 0
                              ? "var(--thodar-bg)"
                              : "var(--thodar-surface)",
                        }}
                      >
                        <td
                          className="font-inter font-medium"
                          style={{
                            padding: "10px 12px",
                            fontSize: "12px",
                            color: "var(--thodar-text-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </td>
                        {selectedRecords.map((r) => {
                          let displayVal: ReactNode = String(r[key]);
                          if (key === "surgeryDate")
                            displayVal = getImplantDuration(r.surgeryDate);
                          if (key === "alertLevel")
                            displayVal = <AlertBadge level={r.alertLevel} />;
                          if (key === "followUpStatus")
                            displayVal = (
                              <StatusBadge status={r.followUpStatus} />
                            );
                          return (
                            <td
                              key={r.id}
                              className="font-inter font-light"
                              style={{
                                padding: "10px 12px",
                                fontSize: "13px",
                                color: "var(--thodar-text-secondary)",
                              }}
                            >
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                className="font-inter font-light mt-4"
                style={{
                  fontSize: "11px",
                  color: "var(--thodar-text-muted)",
                  fontStyle: "italic",
                }}
              >
                Designed for multidisciplinary review meetings.
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

// ─── 3. LifecycleAnalyticsSection ────────────────────────────────────────────
const TEAL = "#3D8B82";
const AMBER = "#D97706";
const RED = "#DC2626";

const ageDistData = [
  { label: "0–2 yrs", count: 3 },
  { label: "2–5 yrs", count: 4 },
  { label: "5–10 yrs", count: 2 },
  { label: "10+ yrs", count: 1 },
];

const complianceTrendData = [
  { quarter: "Q1", pct: 65 },
  { quarter: "Q2", pct: 68 },
  { quarter: "Q3", pct: 72 },
  { quarter: "Q4", pct: 70 },
  { quarter: "Q5", pct: 74 },
  { quarter: "Q6", pct: 76 },
  { quarter: "Q7", pct: 78 },
  { quarter: "Q8", pct: 78 },
];

const alertStratData = [
  { name: "Stable", value: 6 },
  { name: "Review Pending", value: 3 },
  { name: "Revision Evaluation", value: 1 },
];
const pieColors = [TEAL, AMBER, RED];

export function LifecycleAnalyticsSection() {
  return (
    <section
      id="analytics"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Lifecycle Analytics</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle maxWidth="560px">
            Lifecycle Analytics &amp; Compliance Monitoring
          </SectionTitle>
        </FadeIn>

        {/* Bar Chart — full width */}
        <FadeIn delay={140}>
          <div
            className="mb-6 p-6"
            style={{
              border: "1px solid var(--thodar-border)",
              backgroundColor: "var(--thodar-bg)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="font-inter font-medium mb-5"
              style={{ fontSize: "13px", color: "var(--thodar-text-primary)" }}
            >
              Implant Age Distribution
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={ageDistData}
                barSize={32}
                margin={{ top: 0, right: 20, bottom: 0, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--thodar-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    fill: "var(--thodar-text-muted)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontFamily: "Inter",
                    fontSize: 11,
                    fill: "var(--thodar-text-muted)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    border: "1px solid var(--thodar-border)",
                    borderRadius: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    backgroundColor: "var(--thodar-surface)",
                    color: "var(--thodar-text-primary)",
                  }}
                  cursor={{ fill: "rgba(61,139,130,0.06)" }}
                />
                <Bar dataKey="count" name="Cases" fill={TEAL} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Line + Pie side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={200}>
            <div
              className="p-6"
              style={{
                border: "1px solid var(--thodar-border)",
                backgroundColor: "var(--thodar-bg)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <p
                className="font-inter font-medium mb-5"
                style={{
                  fontSize: "13px",
                  color: "var(--thodar-text-primary)",
                }}
              >
                Follow-Up Compliance Trend
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={complianceTrendData}
                  margin={{ top: 0, right: 20, bottom: 0, left: -10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--thodar-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="quarter"
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      fill: "var(--thodar-text-muted)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[55, 85]}
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      fill: "var(--thodar-text-muted)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Compliance"]}
                    contentStyle={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      border: "1px solid var(--thodar-border)",
                      borderRadius: 0,
                      backgroundColor: "var(--thodar-surface)",
                      color: "var(--thodar-text-primary)",
                    }}
                    cursor={{
                      stroke: TEAL,
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pct"
                    name="Compliance %"
                    stroke={TEAL}
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: TEAL, strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>

          <FadeIn delay={260}>
            <div
              className="p-6"
              style={{
                border: "1px solid var(--thodar-border)",
                backgroundColor: "var(--thodar-bg)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <p
                className="font-inter font-medium mb-5"
                style={{
                  fontSize: "13px",
                  color: "var(--thodar-text-primary)",
                }}
              >
                Alert Stratification Overview
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={alertStratData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {alertStratData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      border: "1px solid var(--thodar-border)",
                      borderRadius: 0,
                      backgroundColor: "var(--thodar-surface)",
                      color: "var(--thodar-text-primary)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{
                      fontFamily: "Inter",
                      fontSize: "11px",
                      color: "var(--thodar-text-muted)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={320}>
          <p
            className="font-inter font-light mt-5"
            style={{
              fontSize: "11px",
              color: "var(--thodar-text-muted)",
              fontStyle: "italic",
            }}
          >
            Prototype Data – Simulated for Concept Validation Only.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 4. GovernanceSection ────────────────────────────────────────────────────
export function GovernanceSection() {
  const roles: Array<{ role: string; access: string; description: string }> = [
    {
      role: "Orthopedic Surgeon",
      access: "Full Case Review Access",
      description:
        "View individual case records, device specifications, surgical data, and clinical alerts.",
    },
    {
      role: "Department Head",
      access: "Registry Overview & Compliance Metrics",
      description: "Access aggregate dashboard and compliance reporting.",
    },
    {
      role: "Quality Officer",
      access: "Follow-Up Compliance Analytics",
      description: "Monitor follow-up trends and compliance metrics.",
    },
    {
      role: "Administrator",
      access: "Audit & Monitoring Controls",
      description: "Full audit trail access and system administration.",
    },
  ];
  return (
    <section
      id="governance"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Governance</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>System Governance – Prototype Framework</SectionTitle>
        </FadeIn>
        <FadeIn delay={140}>
          <div
            style={{
              border: "1px solid var(--thodar-border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", minWidth: "560px" }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--thodar-border)",
                    backgroundColor: "var(--thodar-surface)",
                  }}
                >
                  {["Role", "Access Level", "Description"].map((h) => (
                    <th
                      key={h}
                      className="font-inter font-medium text-left tracking-wide uppercase"
                      style={{
                        fontSize: "10px",
                        color: "var(--thodar-text-muted)",
                        padding: "10px 16px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr
                    key={r.role}
                    style={{
                      borderBottom:
                        i < roles.length - 1
                          ? "1px solid var(--thodar-border)"
                          : undefined,
                      backgroundColor:
                        i % 2 === 0
                          ? "var(--thodar-bg)"
                          : "var(--thodar-surface)",
                    }}
                  >
                    <td
                      className="font-inter font-medium"
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "var(--thodar-text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.role}
                    </td>
                    <td
                      className="font-inter font-light"
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "var(--thodar-teal)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.access}
                    </td>
                    <td
                      className="font-inter font-light leading-relaxed"
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "var(--thodar-text-secondary)",
                      }}
                    >
                      {r.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className="font-inter font-light mt-4"
            style={{
              fontSize: "11px",
              color: "var(--thodar-text-muted)",
              fontStyle: "italic",
            }}
          >
            Role architecture conceptualized for future production deployment.
            Not active in prototype phase.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 5. AuditTraceabilitySection ─────────────────────────────────────────────
export function AuditTraceabilitySection() {
  const auditLog: Array<{
    role: string;
    action: string;
    timestamp: string;
    caseRef: string;
  }> = [
    {
      role: "Administrator",
      action: "Registry accessed",
      timestamp: "2026-02-27 09:14",
      caseRef: "—",
    },
    {
      role: "Orthopedic Surgeon",
      action: "Case record viewed",
      timestamp: "2026-02-27 09:16",
      caseRef: "TH-004",
    },
    {
      role: "Quality Officer",
      action: "Compliance report generated",
      timestamp: "2026-02-27 09:22",
      caseRef: "—",
    },
    {
      role: "Department Head",
      action: "Dashboard accessed",
      timestamp: "2026-02-27 09:30",
      caseRef: "—",
    },
    {
      role: "Orthopedic Surgeon",
      action: "Case record viewed",
      timestamp: "2026-02-27 09:45",
      caseRef: "TH-007",
    },
    {
      role: "Administrator",
      action: "Audit log reviewed",
      timestamp: "2026-02-27 10:02",
      caseRef: "—",
    },
    {
      role: "Quality Officer",
      action: "Follow-up alert acknowledged",
      timestamp: "2026-02-27 10:15",
      caseRef: "TH-002",
    },
    {
      role: "Orthopedic Surgeon",
      action: "Comparison mode activated",
      timestamp: "2026-02-27 10:31",
      caseRef: "—",
    },
  ];
  return (
    <section
      id="audit"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Audit</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>
            Clinical Audit &amp; Traceability Framework
          </SectionTitle>
        </FadeIn>
        <FadeIn delay={140}>
          <div
            style={{
              border: "1px solid var(--thodar-border)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", minWidth: "560px" }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--thodar-border)",
                    backgroundColor: "var(--thodar-bg)",
                  }}
                >
                  {[
                    "User Role",
                    "Action Performed",
                    "Timestamp",
                    "Case Reference",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-inter font-medium text-left tracking-wide uppercase"
                      style={{
                        fontSize: "10px",
                        color: "var(--thodar-text-muted)",
                        padding: "10px 16px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((row, i) => (
                  <tr
                    key={row.timestamp}
                    style={{
                      borderBottom:
                        i < auditLog.length - 1
                          ? "1px solid var(--thodar-border)"
                          : undefined,
                      backgroundColor:
                        i % 2 === 0
                          ? "var(--thodar-surface)"
                          : "var(--thodar-bg)",
                    }}
                  >
                    <td
                      className="font-inter font-light"
                      style={{
                        padding: "11px 16px",
                        fontSize: "13px",
                        color: "var(--thodar-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.role}
                    </td>
                    <td
                      className="font-inter font-light"
                      style={{
                        padding: "11px 16px",
                        fontSize: "13px",
                        color: "var(--thodar-text-secondary)",
                      }}
                    >
                      {row.action}
                    </td>
                    <td
                      className="font-inter font-light"
                      style={{
                        padding: "11px 16px",
                        fontSize: "12px",
                        color: "var(--thodar-text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.timestamp}
                    </td>
                    <td
                      className="font-inter font-medium"
                      style={{
                        padding: "11px 16px",
                        fontSize: "12px",
                        color:
                          row.caseRef === "—"
                            ? "var(--thodar-text-muted)"
                            : "var(--thodar-teal)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.caseRef}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className="font-inter font-light mt-4"
            style={{
              fontSize: "11px",
              color: "var(--thodar-text-muted)",
              fontStyle: "italic",
            }}
          >
            Audit logging designed to support institutional accountability and
            regulatory traceability.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 6. PilotScopeSection ────────────────────────────────────────────────────
export function PilotScopeSection() {
  const items: string[] = [
    "Retrospective anonymized dataset (20–50 cases)",
    "No live EMR integration in pilot phase",
    "Department-level workflow review",
    "Structured feedback sessions",
    "No patient-facing deployment",
  ];
  return (
    <section
      id="pilot-scope"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Pilot Scope</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>Proposed Pilot Scope</SectionTitle>
        </FadeIn>
        <FadeIn delay={120}>
          <p
            className="font-inter font-light mb-8"
            style={{
              fontSize: "13px",
              color: "var(--thodar-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Limited &amp; Non-Disruptive
          </p>
        </FadeIn>
        <div className="space-y-4 max-w-2xl">
          {items.map((item, i) => (
            <FadeIn key={item} delay={160 + i * 60}>
              <div
                className="pl-5 py-3"
                style={{
                  borderLeft: "2px solid var(--thodar-teal)",
                  backgroundColor: "var(--thodar-surface)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  className="font-inter font-light leading-snug"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  {item}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. ImplementationPathwaySection ─────────────────────────────────────────
export function ImplementationPathwaySection() {
  const steps: Array<{ num: string; name: string }> = [
    { num: "01", name: "Departmental Review" },
    { num: "02", name: "Limited Retrospective Dataset Evaluation" },
    { num: "03", name: "Workflow Feedback" },
    { num: "04", name: "Dashboard Refinement" },
    { num: "05", name: "Institutional Decision" },
  ];
  return (
    <section
      id="implementation"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Implementation</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>Implementation Pathway</SectionTitle>
        </FadeIn>
        <FadeIn delay={140}>
          {/* Desktop: horizontal steps with connecting line */}
          <div className="hidden md:block">
            <div className="relative flex items-start">
              {/* Connecting line */}
              <div
                className="absolute top-5"
                style={{
                  left: "20px",
                  right: "20px",
                  height: "1px",
                  backgroundColor: "var(--thodar-border)",
                }}
              />
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="flex-1 flex flex-col items-center relative z-10"
                >
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid var(--thodar-teal)",
                      backgroundColor: "var(--thodar-surface)",
                    }}
                  >
                    <span
                      className="font-inter font-medium"
                      style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p
                    className="font-inter font-light text-center leading-snug"
                    style={{
                      fontSize: "12px",
                      color: "var(--thodar-text-secondary)",
                      maxWidth: "100px",
                    }}
                  >
                    {step.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile: vertical */}
          <div className="md:hidden space-y-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid var(--thodar-teal)",
                      backgroundColor: "var(--thodar-surface)",
                    }}
                  >
                    <span
                      className="font-inter font-medium"
                      style={{ fontSize: "11px", color: "var(--thodar-teal)" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: "1px",
                        flex: 1,
                        minHeight: "24px",
                        backgroundColor: "var(--thodar-border)",
                      }}
                    />
                  )}
                </div>
                <div className="pb-5 pt-2">
                  <p
                    className="font-inter font-light leading-snug"
                    style={{
                      fontSize: "13px",
                      color: "var(--thodar-text-secondary)",
                    }}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 8. ScopeBoundariesSection ───────────────────────────────────────────────
export function ScopeBoundariesSection() {
  const items: string[] = [
    "Not a diagnostic system",
    "Not a treatment recommendation platform",
    "Does not replace clinical judgment",
    "No real patient data used in demonstration",
  ];
  return (
    <section
      id="scope"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Scope</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>Scope Boundaries – Prototype Phase</SectionTitle>
        </FadeIn>
        <FadeIn delay={140}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {items.map((item) => (
              <div
                key={item}
                className="py-4 pl-5"
                style={{
                  borderLeft: "2px solid var(--thodar-separator)",
                  backgroundColor: "var(--thodar-surface)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  className="font-inter font-light leading-snug"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 9. DataComplianceSection ────────────────────────────────────────────────
export function DataComplianceSection() {
  const futureItems: string[] = [
    "Encrypted data handling",
    "Structured audit logs",
    "Role-based access control",
    "Alignment with applicable healthcare data protection regulations",
  ];
  return (
    <section
      id="compliance"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Compliance</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionTitle>Data Integrity &amp; Compliance</SectionTitle>
        </FadeIn>
        <FadeIn delay={140}>
          <p
            className="font-inter font-light leading-relaxed mb-10"
            style={{
              fontSize: "15px",
              color: "var(--thodar-text-secondary)",
              maxWidth: "620px",
            }}
          >
            All data displayed within this prototype reflects simulated datasets
            generated for concept validation purposes only.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p
            className="font-inter font-medium tracking-[0.12em] uppercase mb-5"
            style={{ fontSize: "11px", color: "var(--thodar-text-primary)" }}
          >
            Future Production Deployment
          </p>
          <div className="space-y-3 max-w-xl">
            {futureItems.map((item) => (
              <div
                key={item}
                className="pl-4 py-3"
                style={{
                  borderLeft: "2px solid var(--thodar-teal)",
                  backgroundColor: "var(--thodar-bg)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <p
                  className="font-inter font-light"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 10. CollaborationSection ────────────────────────────────────────────────
export function CollaborationSection() {
  return (
    <section
      id="collaboration"
      className="px-8 py-20 border-t border-thodar"
      style={{ backgroundColor: "var(--thodar-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <SectionLabel>Collaboration</SectionLabel>
        </FadeIn>
        <FadeIn delay={80}>
          <h2
            className="font-playfair font-normal leading-tight mb-3"
            style={{
              fontSize: "clamp(24px, 3.2vw, 38px)",
              color: "var(--thodar-text-primary)",
            }}
          >
            Clinical Collaboration &amp; Institutional Enquiries
          </h2>
        </FadeIn>
        <FadeIn delay={120}>
          <p
            className="font-inter font-light tracking-[0.12em] uppercase mb-8"
            style={{ fontSize: "11px", color: "var(--thodar-text-muted)" }}
          >
            Regional Orthopedic Implant Registry – Pilot Framework
          </p>
        </FadeIn>
        <FadeIn delay={160}>
          <p
            className="font-inter font-light leading-relaxed mb-12"
            style={{
              fontSize: "15px",
              color: "var(--thodar-text-secondary)",
              maxWidth: "580px",
            }}
          >
            Thodar is currently in early-stage prototype validation as a
            regional orthopedic implant lifecycle monitoring framework.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left column */}
            <div className="space-y-8">
              <div>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-4"
                  style={{
                    fontSize: "11px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  We Welcome
                </p>
                <ul className="space-y-2">
                  {[
                    "Orthopedic Departments",
                    "Hospital Administrators",
                    "Medical Superintendents",
                    "Clinical Quality Officers",
                    "Institutional Review Committees",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          backgroundColor: "var(--thodar-teal)",
                          flexShrink: 0,
                          marginTop: "8px",
                        }}
                      />
                      <span
                        className="font-inter font-light"
                        style={{
                          fontSize: "14px",
                          color: "var(--thodar-text-secondary)",
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-4"
                  style={{
                    fontSize: "11px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  Purpose of Engagement
                </p>
                <ul className="space-y-2">
                  {[
                    "Workflow feedback",
                    "Registry framework review",
                    "Limited pilot evaluation",
                    "Department-level discussion",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          backgroundColor: "var(--thodar-teal)",
                          flexShrink: 0,
                          marginTop: "8px",
                        }}
                      />
                      <span
                        className="font-inter font-light"
                        style={{
                          fontSize: "14px",
                          color: "var(--thodar-text-secondary)",
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
              <div>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-4"
                  style={{
                    fontSize: "11px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  General Institutional Contact
                </p>
                <p
                  className="font-inter font-light mb-1"
                  style={{
                    fontSize: "14px",
                    color: "var(--thodar-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  Pathenova Health Initiative
                </p>
                <p
                  className="font-inter font-light mb-1"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  Email:{" "}
                  <a
                    href="mailto:pathenova.health@gmail.com"
                    className="transition-opacity hover:opacity-60"
                    style={{
                      color: "var(--thodar-teal)",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    pathenova.health@gmail.com
                  </a>
                </p>
                <p
                  className="font-inter font-light"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  Location: Tamil Nadu, India
                </p>
              </div>

              <div>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-4"
                  style={{
                    fontSize: "11px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  Founding Team
                </p>
                {[
                  { name: "Shreenidhi Vijayarangam", title: "Founder & CEO" },
                  { name: "Joe Mahizhan", title: "Co-Founder & CTO" },
                ].map((person) => (
                  <div key={person.name} className="mb-4">
                    <p
                      className="font-inter font-medium mb-0.5"
                      style={{
                        fontSize: "13px",
                        color: "var(--thodar-text-primary)",
                      }}
                    >
                      {person.name}
                    </p>
                    <p
                      className="font-inter font-light mb-0.5"
                      style={{
                        fontSize: "12px",
                        color: "var(--thodar-text-muted)",
                      }}
                    >
                      {person.title}
                    </p>
                    <a
                      href="mailto:pathenova.health@gmail.com"
                      className="font-inter font-light transition-opacity hover:opacity-60"
                      style={{
                        fontSize: "12px",
                        color: "var(--thodar-teal)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      pathenova.health@gmail.com
                    </a>
                  </div>
                ))}
              </div>

              <div>
                <p
                  className="font-inter font-medium tracking-[0.12em] uppercase mb-4"
                  style={{
                    fontSize: "11px",
                    color: "var(--thodar-text-primary)",
                  }}
                >
                  Investor &amp; Strategic Partnership Enquiries
                </p>
                <p
                  className="font-inter font-light leading-relaxed mb-3"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  For early-stage collaboration discussions, incubation
                  partnerships, or structured pilot support:
                </p>
                <p
                  className="font-inter font-light mb-2"
                  style={{
                    fontSize: "13px",
                    color: "var(--thodar-text-secondary)",
                  }}
                >
                  Email:{" "}
                  <a
                    href="mailto:pathenova.health@gmail.com?subject=Institutional%20Enquiry%20%E2%80%93%20Thodar%20Pilot%20Framework"
                    className="transition-opacity hover:opacity-60"
                    style={{
                      color: "var(--thodar-teal)",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                    }}
                  >
                    pathenova.health@gmail.com
                  </a>
                </p>
                <p
                  className="font-inter font-light"
                  style={{
                    fontSize: "12px",
                    color: "var(--thodar-text-muted)",
                  }}
                >
                  Suggested Subject Line: "Institutional Enquiry – Thodar Pilot
                  Framework"
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Footer note */}
        <FadeIn delay={280}>
          <div
            className="mt-12 pt-8"
            style={{ borderTop: "1px solid var(--thodar-border)" }}
          >
            <p
              className="font-inter font-light leading-relaxed"
              style={{
                fontSize: "12px",
                color: "var(--thodar-text-muted)",
                maxWidth: "680px",
                fontStyle: "italic",
              }}
            >
              This platform is currently in structured prototype phase and is
              seeking institutional collaboration for pilot validation and
              workflow refinement. All demonstration data displayed within the
              platform reflects simulated datasets.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Main export: all new sections wired together ───────────────────────────
export function RegistryAndAnalyticsSections() {
  const [selectedRecord, setSelectedRecord] = useState<ImplantRecord | null>(
    null,
  );

  return (
    <>
      <ClinicalProblemStatementSection />
      <RegistryDashboardSection onSelectRecord={setSelectedRecord} />
      <LifecycleAnalyticsSection />
      <GovernanceSection />
      <AuditTraceabilitySection />
      <PilotScopeSection />
      <ImplementationPathwaySection />
      <ScopeBoundariesSection />
      <DataComplianceSection />
      <CollaborationSection />
      {selectedRecord && (
        <CaseReviewPanel
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
}

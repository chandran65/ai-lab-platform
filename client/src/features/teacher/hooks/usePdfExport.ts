/**
 * usePdfExport — Generates a professional PDF report of teacher analytics data.
 * Uses jsPDF for document generation and jspdf-autotable for data tables.
 */

import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useTeacherOverview,
  useTeacherStudents,
  useSkillHeatmap,
  usePerformanceTrends,
  useLearningGaps,
  useAIReadiness,
} from "./useTeacherAnalytics";
import { useAuth } from "../../../context/AuthContext";

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();

  // Fetch all data (enabled only when exporting, via refetch)
  const overview = useTeacherOverview();
  const students = useTeacherStudents();
  const heatmap = useSkillHeatmap();
  const trends = usePerformanceTrends();
  const gaps = useLearningGaps();
  const readiness = useAIReadiness();

  const generatePdf = useCallback(async () => {
    setExporting(true);
    try {
      // Refetch all data to ensure latest
      const [overviewRes, studentsRes, heatmapRes, trendsRes, gapsRes, readinessRes] =
        await Promise.all([
          overview.refetch(),
          students.refetch(),
          heatmap.refetch(),
          trends.refetch(),
          gaps.refetch(),
          readiness.refetch(),
        ]);

      const overviewData = overviewRes.data;
      const studentsData = studentsRes.data ?? [];
      const heatmapData = heatmapRes.data;
      const trendsData = trendsRes.data ?? [];
      const gapsData = gapsRes.data ?? [];
      const readinessData = readinessRes.data ?? [];

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // ── Helper functions ──────────────────────────────────────

      const addSectionTitle = (text: string) => {
        // Check page break
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        // Underline
        doc.text(text, margin, y);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y + 1, pageWidth - margin, y + 1);
        y += 8;
      };

      const addBody = (text: string) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 4 + 3;
      };

      // ════════════════════════════════════════════════════════════
      // COVER PAGE
      // ════════════════════════════════════════════════════════════

      // Brand header
      doc.setFillColor(94, 45, 139);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Mindora", margin + 5, 26);

      // Title
      y = 65;
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Teacher Analytics Report", margin, y);
      y += 12;

      // Meta info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated: ${dateStr}`, margin, y);
      y += 6;
      doc.text(`Teacher: ${user?.full_name || "N/A"}`, margin, y);
      y += 6;
      if (overviewData) {
        doc.text(
          `Classes: ${overviewData.total_classes}  |  Students: ${overviewData.total_students}`,
          margin,
          y,
        );
        y += 6;
      }
      y += 10;

      // Divider
      doc.setDrawColor(94, 45, 139);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // ════════════════════════════════════════════════════════════
      // SECTION 1: CLASS OVERVIEW
      // ════════════════════════════════════════════════════════════

      if (overviewData) {
        addSectionTitle("1. Class Overview");

        // Stats cards as a table
        autoTable(doc, {
          startY: y,
          head: [["Metric", "Value"]],
          body: [
            ["Total Students", String(overviewData.total_students)],
            ["Total Classes", String(overviewData.total_classes)],
            ["Average Completion", `${overviewData.average_completion}%`],
          ],
          theme: "grid",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 }, 1: { cellWidth: 40 } },
          margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 8;

        // Class breakdown table
        if (overviewData.classes.length > 0) {
          addBody("Class Breakdown:");
          autoTable(doc, {
            startY: y,
            head: [["Class", "Grade", "Students", "Avg Completion", "Total XP"]],
            body: overviewData.classes.map((c) => [
              c.name,
              `Grade ${c.grade_level}`,
              String(c.student_count),
              `${c.avg_completion}%`,
              c.total_xp.toLocaleString(),
            ]),
            theme: "striped",
            headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 2: STUDENT PROGRESS
      // ════════════════════════════════════════════════════════════

      if (studentsData.length > 0) {
        addSectionTitle("2. Student Progress");

        autoTable(doc, {
          startY: y,
          head: [["Student", "Email", "XP", "Badges", "Top Skill", "Score", "Worlds"]],
          body: studentsData.map((s) => {
            const topSkill =
              s.skills.length > 0
                ? s.skills.reduce((a, b) => (a.score > b.score ? a : b))
                : null;
            return [
              s.name,
              s.email,
              s.total_xp.toLocaleString(),
              String(s.badges_count),
              topSkill ? topSkill.name : "—",
              topSkill ? `${Math.round(topSkill.score)}` : "—",
              String(s.worlds_completed.length),
            ];
          }),
          theme: "striped",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
          bodyStyles: { fontSize: 7 },
          margin: { left: margin, right: margin },
        });          y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 3: SKILL HEATMAP
      // ════════════════════════════════════════════════════════════

      if (heatmapData && heatmapData.skills.length > 0 && heatmapData.students.length > 0) {
        addSectionTitle("3. Skill Heatmap");

        const head = ["Student", ...heatmapData.skills, "Avg"];
        const body = heatmapData.students.map((s) => [
          s.student_name,
          ...heatmapData.skills.map((sk) => {
            const score = s.scores[sk] ?? 0;
            return String(Math.round(score));
          }),
          String(
            Math.round(
              heatmapData.skills.reduce((sum, sk) => sum + (s.scores[sk] ?? 0), 0) /
                Math.max(heatmapData.skills.length, 1),
            ),
          ),
        ]);

        // Add class averages row
        body.push([
          "Class Avg",
          ...heatmapData.skills.map((sk) =>
            ((heatmapData.class_averages[sk] ?? 0)).toFixed(1),
          ),
          (
            Object.values(heatmapData.class_averages).reduce((a, b) => a + b, 0) /
            Math.max(Object.keys(heatmapData.class_averages).length, 1)
          ).toFixed(1),
        ]);

        autoTable(doc, {
          startY: y,
          head: [head],
          body,
          theme: "striped",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
          bodyStyles: { fontSize: 7 },
          margin: { left: margin, right: margin },
        });          y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 4: PERFORMANCE TRENDS
      // ════════════════════════════════════════════════════════════

      if (trendsData.length > 0) {
        addSectionTitle("4. Performance Trends (Past 6 Months)");

        autoTable(doc, {
          startY: y,
          head: [["Month", "Avg XP", "Avg Completion", "Active Students"]],
          body: trendsData.map((t) => [
            t.month_name,
            String(t.avg_xp.toLocaleString()),
            `${t.avg_completion}%`,
            `${t.active_students}/${t.total_students}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });          y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 5: LEARNING GAPS
      // ════════════════════════════════════════════════════════════

      if (gapsData.length > 0) {
        addSectionTitle("5. Learning Gaps");

        autoTable(doc, {
          startY: y,
          head: [["Skill", "Avg Score", "Students Below", "Gap %", "Status"]],
          body: gapsData.map((g) => [
            g.skill_name,
            String(g.average_score),
            `${g.students_below_threshold}/${g.total_students}`,
            `${g.gap_percentage}%`,
            g.gap_percentage >= 50 ? "🔴 Critical" : g.gap_percentage >= 25 ? "🟡 Warning" : "🟢 Healthy",
          ]),
          theme: "striped",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });          y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ════════════════════════════════════════════════════════════
      // SECTION 6: AI READINESS
      // ════════════════════════════════════════════════════════════

      if (readinessData.length > 0) {
        addSectionTitle("6. AI Readiness");

        // Distribution summary
        const advanced = readinessData.filter((r) => r.level === "Advanced").length;
        const intermediate = readinessData.filter((r) => r.level === "Intermediate").length;
        const developing = readinessData.filter((r) => r.level === "Developing").length;
        const beginning = readinessData.filter((r) => r.level === "Beginning").length;
        const avgScore =
          readinessData.reduce((s, r) => s + r.score, 0) / readinessData.length;

        autoTable(doc, {
          startY: y,
          head: [["Level", "Students"]],
          body: [
            ["Advanced", String(advanced)],
            ["Intermediate", String(intermediate)],
            ["Developing", String(developing)],
            ["Beginning", String(beginning)],
            ["Class Average Score", avgScore.toFixed(1)],
          ],
          theme: "grid",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 8;

        // Per-student readiness
        autoTable(doc, {
          startY: y,
          head: [["Student", "Score", "Level", "Avg Skill", "Completion"]],
          body: readinessData.map((r) => [
            r.student_name,
            String(Math.round(r.score)),
            r.level,
            String(r.avg_skill_score),
            `${r.completion_pct}%`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [94, 45, 139], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
        });          y = (doc as any).lastAutoTable.finalY + 8;
      }

      // ════════════════════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════════════════════

      // Add page numbers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" },
        );
        doc.text("Mindora — Teacher Analytics Report", margin, pageHeight - 10);
      }

      // ════════════════════════════════════════════════════════════
      // DOWNLOAD
      // ════════════════════════════════════════════════════════════

      const filename = `mindora-teacher-report-${dateStr.replace(/\s/g, "-").toLowerCase()}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  }, [overview, students, heatmap, trends, gaps, readiness, user]);

  return { generatePdf, exporting };
}

import { jsPDF } from 'jspdf';
import { Candidate, Experience, Education, Skill } from '../types';

export function generateCandidatePdf(
  candidate: Candidate,
  experiences: Experience[] = [],
  education: Education[] = [],
  skills: Skill[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 155);
    doc.text(`MIHORA TECH — CANDIDATE DOSSIER: ${candidate.reference_code}`, margin, y - 5);
    doc.setDrawColor(220, 226, 235);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
  };

  // Header Banner
  doc.setFillColor(10, 28, 61); // #0A1C3D Dark Navy
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MIHORA', margin + 6, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(0, 102, 255); // Electric Blue
  doc.text('— TECH —', margin + 35, y + 12);

  // Reference Code Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(candidate.reference_code || 'MIH-CND-000000', pageWidth - margin - 6, y + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 215);
  doc.text('CANDIDATE PROFILE DOSSIER', pageWidth - margin - 6, y + 18, { align: 'right' });

  y += 30;

  // Candidate Name & Key Role
  const fullName = `${candidate.first_name || ''} ${candidate.middle_name || ''} ${candidate.last_name || ''}`.replace(/\s+/g, ' ').trim() || 'Candidate Name';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName, margin, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 102, 255);
  const roleText = `${candidate.primary_role || 'Role Not Specified'}${candidate.seniority_level ? ` · ${candidate.seniority_level}` : ''}`;
  doc.text(roleText, margin, y);
  y += 8;

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Col 1: Contact
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT DETAILS', margin + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Email: ${candidate.email || 'N/A'}`, margin + 5, y + 12);
  doc.text(`Phone: ${candidate.phone || 'N/A'}`, margin + 5, y + 17);
  doc.text(`Location: ${candidate.current_city || 'N/A'}, ${candidate.current_country || 'N/A'}`, margin + 5, y + 22);

  // Col 2: Availability & Compensation
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS & COMPENSATION', margin + 75, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const statusStr = (candidate.employment_status || 'available').replace(/_/g, ' ').toUpperCase();
  doc.text(`Status: ${statusStr}`, margin + 75, y + 12);
  doc.text(`Notice Period: ${candidate.notice_period_days || 0} days`, margin + 75, y + 17);
  const compStr = candidate.expected_compensation_amount
    ? `${candidate.expected_compensation_amount.toLocaleString()} ${candidate.compensation_currency || 'PKR'} / ${candidate.compensation_period || 'month'}`
    : 'Not specified';
  doc.text(`Expected: ${compStr}`, margin + 75, y + 22);

  // Col 3: Experience & Deployment
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPERIENCE & DEPLOYMENT', margin + 135, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Exp: ${candidate.total_experience_years || 0} Years`, margin + 135, y + 12);
  doc.text(`Work Mode: ${candidate.work_modes || 'Flexible'}`, margin + 135, y + 17);
  const accomm = candidate.accommodation_status === 'required_beyond_distance'
    ? `Required beyond ${candidate.accommodation_beyond_km || 50}km`
    : (candidate.accommodation_status || 'Not Required').replace(/_/g, ' ');
  doc.text(`Accommodation: ${accomm}`, margin + 135, y + 22);

  y += 33;

  // Section 1: Professional Summary
  if (candidate.professional_summary) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 28, 61);
    doc.text('PROFESSIONAL SUMMARY', margin, y);
    doc.setDrawColor(0, 102, 255);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 40, y + 2);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(candidate.professional_summary, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 4;
  }

  // Section 2: Work Experience
  if (experiences.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 28, 61);
    doc.text('WORK EXPERIENCE', margin, y);
    doc.setDrawColor(0, 102, 255);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 35, y + 2);
    y += 8;

    experiences.forEach((exp) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.job_title, margin, y);

      const periodText = `${exp.start_date || ''} - ${exp.is_current ? 'Present' : exp.end_date || ''}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(periodText, pageWidth - margin, y, { align: 'right' });
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 102, 255);
      doc.text(`${exp.company_name}${exp.location ? ` · ${exp.location}` : ''}`, margin, y);
      y += 4.5;

      if (exp.responsibilities) {
        doc.setTextColor(71, 85, 105);
        const splitResp = doc.splitTextToSize(exp.responsibilities, contentWidth - 4);
        doc.text(splitResp, margin + 2, y);
        y += splitResp.length * 4 + 2;
      }

      if (exp.technologies) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Technologies: ', margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(exp.technologies, margin + 22, y);
        y += 5;
      }

      y += 2;
    });
  }

  // Section 3: Education
  if (education.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 28, 61);
    doc.text('EDUCATION & QUALIFICATIONS', margin, y);
    doc.setDrawColor(0, 102, 255);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 50, y + 2);
    y += 8;

    education.forEach((edu) => {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${edu.qualification}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}`, margin, y);

      const yearsText = `${edu.start_year || ''} - ${edu.is_current ? 'Present' : edu.completion_year || ''}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(yearsText, pageWidth - margin, y, { align: 'right' });
      y += 4.5;

      doc.setTextColor(51, 65, 85);
      doc.text(`${edu.institution}${edu.country ? `, ${edu.country}` : ''}${edu.grade_gpa ? ` (Grade: ${edu.grade_gpa})` : ''}`, margin, y);
      y += 6;
    });
  }

  // Section 4: Skills
  if (skills.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 28, 61);
    doc.text('TECHNICAL & PROFESSIONAL SKILLS', margin, y);
    doc.setDrawColor(0, 102, 255);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 55, y + 2);
    y += 8;

    const skillStrings = skills.map(
      (s) => `${s.skill_name} (${s.proficiency_level || 'Proficient'}${s.years_of_experience ? `, ${s.years_of_experience} yrs` : ''})`
    );
    const joinedSkills = skillStrings.join('   •   ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSkills = doc.splitTextToSize(joinedSkills, contentWidth);
    doc.text(splitSkills, margin, y);
    y += splitSkills.length * 4.5 + 6;
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);
    doc.text('MIHORA Tech Candidate Management System — Confidential', margin, pageHeight - margin);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
  }

  // Trigger browser download
  const filename = `MIHORA_${candidate.reference_code || 'Candidate'}_Profile.pdf`;
  doc.save(filename);
}

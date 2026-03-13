'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { getAnalyticsExportData } from '@/app/(dashboard)/analytics/actions';
import { toast } from 'sonner';

interface DownloadPdfButtonProps {
  surveyId: string;
}

export function DownloadPdfButton({ surveyId }: DownloadPdfButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const data = await getAnalyticsExportData(surveyId);

      if (!data) {
        toast.error('Survey not found.');
        return;
      }

      if (data.responseCount === 0) {
        toast.error('No response data found to export.');
        return;
      }

      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;

      // 1. Header Section
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text(data.surveyTitle, margin, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Analytics Report - Generated on ${new Date().toLocaleString()}`, margin, 38);
      
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, 42, pageWidth - margin, 42);

      // 2. Summary Boxes
      doc.setFontSize(9);
      doc.text('TOTAL RESPONSES', margin, 52);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(String(data.responseCount), margin, 60);

      let currentY = 75;

      // 3. Questions Detailed Analysis
      data.stats.forEach((q, idx) => {
        // Check for page overflow
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        // Question Heading
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(`${idx + 1}. ${q.question_text}`, margin, currentY);
        currentY += 6;
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${q.question_type.replace('_', ' ').toUpperCase()} • ${q.answerCount} answers`, margin, currentY);
        currentY += 8;

        if (q.chartData && q.chartData.length > 0) {
          const tableData = q.chartData.map(d => [d.name, d.value, d.percentage]);
          
          autoTable(doc, {
            startY: currentY,
            head: [['Option', 'Count', 'Percentage']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 129, 189], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
            margin: { left: margin, right: margin },
            didDrawPage: (dataArg) => {
              currentY = dataArg.cursor ? dataArg.cursor.y + 15 : currentY + 40;
            }
          });
          
          // Force update currentY after autotable (autotable handles its own page breaks)
          // @ts-ignore - jspdf-autotable adds lastAutoTable to doc
          currentY = doc.lastAutoTable.finalY + 15;
        } else if (q.rawAnswers.length > 0) {
          const rawTableData = q.rawAnswers.map(ans => [ans]);
          autoTable(doc, {
            startY: currentY,
            head: [['Response Details']],
            body: rawTableData,
            theme: 'striped',
            headStyles: { fillColor: [200, 200, 200], textColor: [50, 50, 50], fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin }
          });
          // @ts-ignore
          currentY = doc.lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('No answers recorded for this question.', margin + 5, currentY + 5);
          currentY += 20;
        }
      });

      // 4. Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 15, doc.internal.pageSize.getHeight() - 10);
        doc.text('Survey Platform Analytics Export', margin, doc.internal.pageSize.getHeight() - 10);
      }

      const safeTitle = (data.surveyTitle || 'Survey').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeTitle}_analytics_report.pdf`);
      
      toast.success('PDF Report downloaded successfully!');
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-white dark:bg-gray-800/40 px-5 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[130px] flex-1 text-left transition-all hover:border-blue-500/50 hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex flex-col justify-center"
    >
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Download</p>
      <div className="flex items-center gap-1.5">
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
        )}
        <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">PDF Report</p>
      </div>
    </button>
  );
}

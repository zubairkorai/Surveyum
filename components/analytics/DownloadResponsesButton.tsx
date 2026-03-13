'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { getAnalyticsExportData } from '@/app/(dashboard)/analytics/actions';
import { toast } from 'sonner';

interface DownloadResponsesButtonProps {
  surveyId: string;
}

export function DownloadResponsesButton({ surveyId }: DownloadResponsesButtonProps) {
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

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Survey Platform';
      workbook.lastModifiedBy = 'Survey Platform';
      workbook.created = new Date();

      // 1. Overview Sheet
      const overviewSheet = workbook.addWorksheet('Overview');
      overviewSheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 40 }
      ];

      overviewSheet.addRow({ metric: 'Survey Title', value: data.surveyTitle });
      overviewSheet.addRow({ metric: 'Total Responses', value: data.responseCount });
      overviewSheet.addRow({ metric: 'Export Date', value: new Date().toLocaleString() });
      
      overviewSheet.getRow(1).font = { bold: true };
      overviewSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // 2. Questions Sheets
      data.stats.forEach((q, idx) => {
        // Excel sheet names cannot exceed 31 chars and cannot have special chars
        const sheetName = `Q${idx + 1} - ${q.question_text.substring(0, 20)}`.replace(/[*?:\\/\[\]]/g, '');
        const sheet = workbook.addWorksheet(sheetName);

        // Styling Title
        sheet.mergeCells('A1:C1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = q.question_text;
        titleCell.font = { size: 14, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        sheet.addRow(['Type:', q.question_type.replace('_', ' ').toUpperCase()]);
        sheet.addRow(['Total Answers:', q.answerCount]);
        sheet.addRow([]); // Spacer

        if (q.chartData && q.chartData.length > 0) {
          // Table Header
          const headerRow = sheet.addRow(['Option', 'Count', 'Percentage']);
          headerRow.font = { bold: true };
          headerRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF4F81BD' }
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          // Add Data Rows
          q.chartData.forEach(d => {
            const row = sheet.addRow([d.name, d.value, d.percentage]);
            row.eachCell((cell) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
          });

          // Set column widths
          sheet.getColumn(1).width = 40;
          sheet.getColumn(2).width = 15;
          sheet.getColumn(3).width = 15;

          sheet.addRow([]);
          sheet.addRow(['[Note: Select the table above and use "Insert > Chart" in Excel to visualize as ' + 
            (q.question_type === 'multiple_choice' ? 'Pie Chart' : 
             q.question_type === 'checkbox' ? 'Bar Chart' : 'Column Chart') + ']']);
        } else if (q.rawAnswers.length > 0) {
          sheet.addRow(['Recent Answers:']);
          q.rawAnswers.forEach(ans => {
            sheet.addRow([ans]);
          });
          sheet.getColumn(1).width = 60;
        }
      });

      // 3. Buffer and Trigger Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const safeTitle = (data.surveyTitle || 'Survey').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      anchor.download = `${safeTitle}_analytics_report.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Professional Analytics Report exported!');
    } catch (error: any) {
      console.error('Export Error:', error);
      toast.error(error.message || 'Export failed');
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
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Export</p>
      <div className="flex items-center gap-1.5">
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-green-600 group-hover:scale-110 transition-transform" />
        )}
        <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">Excel .xlsx</p>
      </div>
    </button>
  );
}

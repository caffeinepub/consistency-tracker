import type { ExportData } from '../backend';
import { format } from 'date-fns';
import { formatHabitUnit } from './exportFormatters';

// Simple PDF generation using browser print functionality
// Creates an HTML document and triggers print dialog
export async function exportToPdf(data: ExportData, startDate: Date, endDate: Date): Promise<void> {
  const dateRangeStart = format(startDate, 'MMM d, yyyy');
  const dateRangeEnd = format(endDate, 'MMM d, yyyy');

  // Create HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Data Export Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #8b5cf6;
          padding-bottom: 10px;
        }
        h2 {
          color: #555;
          margin-top: 30px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .date-range {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #8b5cf6;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .entry {
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .entry-date {
          font-weight: bold;
          color: #8b5cf6;
        }
        .entry-title {
          font-weight: bold;
          margin: 5px 0;
        }
        .entry-content {
          color: #666;
          white-space: pre-wrap;
        }
        .empty-state {
          color: #999;
          font-style: italic;
          padding: 20px;
          text-align: center;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Data Export Report</h1>
      <div class="date-range">Date Range: ${dateRangeStart} - ${dateRangeEnd}</div>
  `;

  // Section 1: Daily Reflections
  htmlContent += '<h2>Daily Reflections</h2>';
  if (data.diaryEntries.length > 0) {
    data.diaryEntries.forEach(([date, entry]) => {
      htmlContent += `
        <div class="entry">
          <div class="entry-date">${date}</div>
          <div class="entry-title">${entry.title || 'Untitled'}</div>
          <div class="entry-content">${(entry.content || 'No content').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      `;
    });
  } else {
    htmlContent += '<div class="empty-state">No reflections in this date range</div>';
  }

  // Section 2: Habit Records
  htmlContent += '<h2>Habit Records</h2>';
  if (data.habitRecords.length > 0) {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Habit</th>
            <th>Amount</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.habitRecords.forEach((record) => {
      const date = `${record.year}-${String(record.month).padStart(2, '0')}-${String(record.day).padStart(2, '0')}`;
      const amount = record.amount !== undefined && record.amount !== null ? String(record.amount) : '—';
      htmlContent += `
        <tr>
          <td>${date}</td>
          <td>${record.habitName}</td>
          <td>${amount}</td>
          <td>${formatHabitUnit(record.unit)}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';
  } else {
    htmlContent += '<div class="empty-state">No habit records in this date range</div>';
  }

  // Section 3: Investment Goals
  htmlContent += '<h2>Investment Goals</h2>';
  if (data.investmentGoals.length > 0) {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Currently Held</th>
            <th>Target</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.investmentGoals.forEach((goal) => {
      const progress = goal.target > 0n ? Math.round((Number(goal.currentlyHeld) / Number(goal.target)) * 100) : 0;
      htmlContent += `
        <tr>
          <td>${goal.asset}</td>
          <td>${Number(goal.currentlyHeld).toLocaleString()}</td>
          <td>${Number(goal.target).toLocaleString()}</td>
          <td>${progress}%</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';
  } else {
    htmlContent += '<div class="empty-state">No investment goals</div>';
  }

  // Section 4: Investment Diary Entries
  htmlContent += '<h2>Investment Diary Entries</h2>';
  if (data.investmentDiaryEntries.length > 0) {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Asset</th>
            <th>Amount</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.investmentDiaryEntries.forEach((entry) => {
      htmlContent += `
        <tr>
          <td>${String(entry.date)}</td>
          <td>${entry.asset}</td>
          <td>${Number(entry.amount).toLocaleString()}</td>
          <td>${entry.notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';
  } else {
    htmlContent += '<div class="empty-state">No investment diary entries in this date range</div>';
  }

  htmlContent += `
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 100);
        };
      </script>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback: download as HTML file
    const filenameStart = format(startDate, 'yyyy-MM-dd');
    const filenameEnd = format(endDate, 'yyyy-MM-dd');
    const filename = `export_${filenameStart}_to_${filenameEnd}.html`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

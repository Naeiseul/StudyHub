/**
 * Utility for parsing CSV, TSV, and Excel spreadsheet data for Student Bulk Import
 */

export interface ParsedStudentRow {
  name: string;
  email: string;
  isValid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses raw text from CSV, TSV, or spreadsheet copy-paste.
 */
export function parseSpreadsheetText(text: string): ParsedStudentRow[] {
  if (!text || !text.trim()) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Determine delimiter: tab, comma, or semicolon
  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes("\t")) {
    delimiter = "\t";
  } else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ";";
  }

  // Parse lines into tokens handling quotes
  const rows = lines.map((line) => splitLine(line, delimiter));

  // Detect header row
  let headerIndex = -1;
  let nameCol = 0;
  let emailCol = 1;

  for (let i = 0; i < Math.min(rows.length, 3); i++) {
    const rowLower = rows[i].map((c) => c.toLowerCase().trim());
    const nIdx = rowLower.findIndex((c) =>
      ["name", "full name", "fullname", "student name", "student", "first name", "learner"].includes(c)
    );
    const eIdx = rowLower.findIndex((c) =>
      ["email", "student email", "e-mail", "mail", "parent email"].includes(c)
    );

    if (nIdx !== -1 && eIdx !== -1) {
      headerIndex = i;
      nameCol = nIdx;
      emailCol = eIdx;
      break;
    }
  }

  const dataRows = headerIndex !== -1 ? rows.slice(headerIndex + 1) : rows;
  const results: ParsedStudentRow[] = [];

  for (const row of dataRows) {
    if (row.length < 2) continue;

    let rawName = (row[nameCol] || "").trim();
    let rawEmail = (row[emailCol] || "").trim().toLowerCase();

    // If columns seem swapped (e.g. email in name column)
    if (EMAIL_REGEX.test(rawName) && !EMAIL_REGEX.test(rawEmail)) {
      const temp = rawName;
      rawName = rawEmail;
      rawEmail = temp;
    }

    if (!rawName && !rawEmail) continue;

    let isValid = true;
    let error: string | undefined;

    if (!rawName) {
      isValid = false;
      error = "Missing student name";
    } else if (!rawEmail) {
      isValid = false;
      error = "Missing student email";
    } else if (!EMAIL_REGEX.test(rawEmail)) {
      isValid = false;
      error = "Invalid email format";
    }

    results.push({
      name: rawName,
      email: rawEmail,
      isValid,
      error,
    });
  }

  return results;
}

/**
 * Splits a CSV/TSV line respecting quotes.
 */
function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Dynamically parses an Excel file (.xlsx, .xls) using SheetJS loaded on-demand.
 */
export async function parseExcelFile(file: File): Promise<ParsedStudentRow[]> {
  // If it's a CSV or TSV, parse directly as text
  if (file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".txt")) {
    const text = await file.text();
    return parseSpreadsheetText(text);
  }

  // Load SheetJS dynamically if not already available
  if (typeof window !== "undefined" && !(window as any).XLSX) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Excel parser library"));
      document.head.appendChild(script);
    });
  }

  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    throw new Error("Excel parsing engine unavailable");
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csvText = XLSX.utils.sheet_to_csv(worksheet);

  return parseSpreadsheetText(csvText);
}

/**
 * Generates and triggers download of a sample CSV template for teachers.
 */
export function downloadSampleCsvTemplate() {
  const csvContent = "Student Full Name,Student Email\nJohn Doe,john.doe@example.com\nJane Smith,jane.smith@example.com\nAlex Khumalo,alex.khumalo@example.com\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "studyhub_student_import_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

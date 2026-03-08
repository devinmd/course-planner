export const DEPARTMENTS_API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSClKPEjEg2djEbpHddne0HNGufpExL014vJjJPAwED6JhZG8rL-FyDpaaaAUhLPFJOPO8cIhzbSLr/pub?output=csv"; // TODO: replace with actual endpoint
export const CLASSES_API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkCiaL5UUs-X8IC7tbO3oRfZuXw84fu5gomC67K6XrDN0FO1gbNBRTcklIrtowqrEUmkfL59ikAq-L/pub?output=csv"; // TODO: fill in the real endpoint

// helper utilities for parsing CSV responses into usable objects

export interface ClassDataObject {
  // visual metadata
  color?: string;
  name: string;
  ap: boolean;
  credit: number;
  department: number;
  shorthand?: string;

  // new API per-grade availability flags (true/false or 1/0)
  allowed9?: boolean | number;
  allowed10?: boolean | number;
  allowed11?: boolean | number;
  allowed12?: boolean | number;
  length?: number; // course duration in years
  required?: boolean | number; // mark a class as required

  // legacy fields (may still appear in some datasets)
  allowed_years?: number[];
  course_length?: number;
  hide_id?: boolean;
  prerequisites?: string[][];
}

// convert encoded url parameter to nested array
export function decodeClasses(encoded: string): string[][][] {
  const decodedSplit = encoded.replace(/b/g, "nn").match(/\d{4}|\d{1,3}|[a-zA-Z]/g) || [];
  let decodedFinal: string[][][] = new Array(4).fill([]).map(() => new Array(8).fill(0).map(() => new Array(2).fill("")));
  let currentIndex = [0, 0, 0];
  try {
    for (let i of decodedSplit) {
      if (i.length == 4) {
        decodedFinal[currentIndex[2]][currentIndex[1]][currentIndex[0]] = i;
      }
      if (currentIndex[0] >= 1) {
        currentIndex[1]++;
        currentIndex[0] = 0;
      } else {
        currentIndex[0] += 1;
      }
      if (currentIndex[1] >= 8) {
        currentIndex[2]++;
        currentIndex[1] = 0;
      }
    }
  } catch {
    return [] as any;
  }
  return decodedFinal;
}

// encode nested array for url parameter
export function encodeClasses(assignedClasses: string[][][]): string {
  return JSON.stringify(assignedClasses)
    .replace(/\["",""\]/g, "b")
    .replace(/""/g, "n")
    .replace(/["\[\],]/g, "");
}

export interface Department {
  id: number;
  name: string;
  color: string;
  required_credits: number;
}

// simple CSV line splitter honoring quotes
function splitLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

export function parseCsvToClasses(csv: string): Record<string, ClassDataObject> {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return {};
  const headers = splitLine(lines[0]).map((h) => h.trim());
  const res: Record<string, ClassDataObject> = {};
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cols = splitLine(lines[i]);
    const obj: any = {};
    for (let j = 0; j < headers.length; j++) {
      let val = cols[j] ? cols[j].trim() : "";
      if (val === "") continue;
      const lower = val.toLowerCase();
      if (lower === "true" || lower === "false") {
        obj[headers[j]] = lower === "true";
      } else if (!isNaN(Number(val))) {
        obj[headers[j]] = Number(val);
      } else if (val.startsWith("[") || val.startsWith("{")) {
        try {
          obj[headers[j]] = JSON.parse(val);
        } catch {
          obj[headers[j]] = val;
        }
      } else {
        obj[headers[j]] = val;
      }
    }
    // normalize property names and compute derived fields
    // map new `length` field to course_length for backwards compatibility
    if (obj.length !== undefined) {
      obj.course_length = obj.length;
      delete obj.length;
    }

    // CSV now has allowed9..allowed12 columns instead of a single allowed_years array
    const allowedYears: number[] = [];
    [9, 10, 11, 12].forEach((year) => {
      const key = `allowed${year}`;
      if (obj[key]) {
        // truthy means allowed; could be boolean or number (1)
        allowedYears.push(year);
      }
      delete obj[key];
    });
    if (allowedYears.length) {
      obj.allowed_years = allowedYears;
    }

    const id = obj.id || obj.classId || obj.courseId || obj.code;
    if (id) {
      delete obj.id;
      delete obj.classId;
      delete obj.courseId;
      delete obj.code;
      res[id.toString()] = obj as ClassDataObject;
    }
  }

  return res;
}

// return list of class IDs belonging to given department index
export function getDeptClassIds(classes: Record<string, ClassDataObject>, deptIndex: number): string[] {
  return Object.keys(classes).filter((id) => classes[id].department === deptIndex);
}

export function parseCsvToDepartments(csv: string): Department[] {
  // format expected:
  // department,name,required_credits,color
  // 0,English,4,purple
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitLine(lines[0]).map((h) => h.trim());
  const res: Department[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cols = splitLine(lines[i]);
    const row: any = {};
    for (let j = 0; j < headers.length; j++) {
      let val = cols[j] ? cols[j].trim() : "";
      if (val === "") continue;
      row[headers[j]] = val;
    }
    // map to Department interface
    const id = Number(row.department);
    if (isNaN(id)) continue;
    const dept: Department = {
      id,
      name: row.name || "",
      color: row.color || "",
      required_credits: row.required_credits ? Number(row.required_credits) : 0,
    };
    res.push(dept);
  }
  return res;
}

export interface GradeResult {
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  gradePoint: number;
  remark: string;
}

export const GRADING_SCALE = [
  { min: 70, max: 100, grade: "A" as const, gradePoint: 5.0, remark: "Excellent" },
  { min: 60, max: 69.99, grade: "B" as const, gradePoint: 4.0, remark: "Very Good" },
  { min: 50, max: 59.99, grade: "C" as const, gradePoint: 3.0, remark: "Good" },
  { min: 45, max: 49.99, grade: "D" as const, gradePoint: 2.0, remark: "Fair" },
  { min: 40, max: 44.99, grade: "E" as const, gradePoint: 1.0, remark: "Pass" },
  { min: 0, max: 39.99, grade: "F" as const, gradePoint: 0.0, remark: "Fail" },
];

/**
 * Calculates letter grade and grade points for a given total score (0 - 100)
 */
export function calculateGradeAndPoint(totalScore: number): GradeResult {
  const score = Math.max(0, Math.min(100, Math.round(totalScore * 100) / 100));

  for (const scale of GRADING_SCALE) {
    if (score >= scale.min && score <= scale.max) {
      return {
        grade: scale.grade,
        gradePoint: scale.gradePoint,
        remark: scale.remark,
      };
    }
  }

  return { grade: "F", gradePoint: 0.0, remark: "Fail" };
}

/**
 * Calculates GPA from an array of registered course results
 * Formula: Sum(creditUnit * gradePoint) / Sum(creditUnit)
 */
export function calculateGPA(
  records: Array<{ creditUnit: number; gradePoint: number }>,
): { gpa: number; totalUnits: number; totalPoints: number } {
  let totalUnits = 0;
  let totalPoints = 0;

  for (const record of records) {
    if (record.creditUnit > 0) {
      totalUnits += record.creditUnit;
      totalPoints += record.creditUnit * record.gradePoint;
    }
  }

  const gpa = totalUnits > 0 ? Math.round((totalPoints / totalUnits) * 100) / 100 : 0.0;

  return {
    gpa,
    totalUnits,
    totalPoints: Math.round(totalPoints * 100) / 100,
  };
}

/**
 * Calculates Cumulative GPA (CGPA) across multiple semester totals
 */
export function calculateCGPA(
  semesterTotals: Array<{ totalUnits: number; totalPoints: number }>,
): number {
  let cumulativeUnits = 0;
  let cumulativePoints = 0;

  for (const sem of semesterTotals) {
    cumulativeUnits += sem.totalUnits;
    cumulativePoints += sem.totalPoints;
  }

  return cumulativeUnits > 0
    ? Math.round((cumulativePoints / cumulativeUnits) * 100) / 100
    : 0.0;
}

/**
 * Returns degree classification based on standard Nigerian university 5.0 scale
 */
export function getDegreeClassification(cgpa: number): string {
  if (cgpa >= 4.5) return "First Class Honours";
  if (cgpa >= 3.5) return "Second Class Honours (Upper Division)";
  if (cgpa >= 2.4) return "Second Class Honours (Lower Division)";
  if (cgpa >= 1.5) return "Third Class Honours";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

/**
 * Formats matriculation numbers consistently
 */
export function formatMatricNumber(raw: string): string {
  return raw.trim().toUpperCase();
}

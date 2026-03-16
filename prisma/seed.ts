/**
 * Seed: CBSE Class 10 Mathematics
 * 1 Chapter · 5 Concepts · 4 MCQ questions each = 20 questions
 *
 * Uses stable UUIDs so the seed is idempotent — safe to run multiple times.
 */

import { db } from "@/lib/db";

// Stable seed IDs
const CHAPTER_ID = "c1000000-0000-4000-8000-000000000001";

const CONCEPT_IDS = {
  quadratic: "cc000001-0000-4000-8000-000000000001",
  ap: "cc000002-0000-4000-8000-000000000001",
  triangles: "cc000003-0000-4000-8000-000000000001",
  coordinate: "cc000004-0000-4000-8000-000000000001",
  trigonometry: "cc000005-0000-4000-8000-000000000001",
};

// 20 stable question IDs (4 per concept)
const Q = (n: number) => `q0${String(n).padStart(6, "0")}-0000-4000-8000-000000000001`;

async function main() {
  // 1. Chapter
  await db.chapter.upsert({
    where: { id: CHAPTER_ID },
    update: {},
    create: {
      id: CHAPTER_ID,
      name: "CBSE Class 10 Mathematics",
      board: "CBSE",
      classYear: 10,
      subject: "Mathematics",
    },
  });

  // 2. Concepts
  const concepts = [
    {
      id: CONCEPT_IDS.quadratic,
      name: "Quadratic Equations",
      boardExamWeight: 0.2,
    },
    {
      id: CONCEPT_IDS.ap,
      name: "Arithmetic Progressions",
      boardExamWeight: 0.2,
    },
    {
      id: CONCEPT_IDS.triangles,
      name: "Triangles",
      boardExamWeight: 0.2,
    },
    {
      id: CONCEPT_IDS.coordinate,
      name: "Coordinate Geometry",
      boardExamWeight: 0.2,
    },
    {
      id: CONCEPT_IDS.trigonometry,
      name: "Introduction to Trigonometry",
      boardExamWeight: 0.2,
    },
  ];

  for (const c of concepts) {
    await db.concept.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        board: "CBSE",
        classYear: 10,
        subject: "Mathematics",
        chapterId: CHAPTER_ID,
        prerequisiteConceptIds: [],
        boardExamWeight: c.boardExamWeight,
      },
    });
  }

  // 3. Questions (4 per concept)
  const questions = [
    // ── Quadratic Equations ─────────────────────────────────────────────────
    {
      id: Q(1),
      conceptId: CONCEPT_IDS.quadratic,
      difficultyLevel: "easy",
      questionText: "Which of the following is a quadratic equation?",
      options: [
        { id: "a", text: "x³ + 2x + 1 = 0" },
        { id: "b", text: "x² + 3x − 4 = 0" },
        { id: "c", text: "2x + 5 = 0" },
        { id: "d", text: "x + 1/x = 2" },
      ],
      correctOptionId: "b",
      explanation:
        "A quadratic equation has the form ax² + bx + c = 0 with a ≠ 0. Option b fits this form.",
    },
    {
      id: Q(2),
      conceptId: CONCEPT_IDS.quadratic,
      difficultyLevel: "easy",
      questionText:
        "The roots of the equation x² − 5x + 6 = 0 are:",
      options: [
        { id: "a", text: "2 and 3" },
        { id: "b", text: "−2 and −3" },
        { id: "c", text: "1 and 6" },
        { id: "d", text: "−1 and 6" },
      ],
      correctOptionId: "a",
      explanation:
        "Factorising: (x − 2)(x − 3) = 0, so x = 2 or x = 3.",
    },
    {
      id: Q(3),
      conceptId: CONCEPT_IDS.quadratic,
      difficultyLevel: "medium",
      questionText:
        "The discriminant of 2x² − 4x + 3 = 0 is:",
      options: [
        { id: "a", text: "8" },
        { id: "b", text: "−8" },
        { id: "c", text: "16" },
        { id: "d", text: "−16" },
      ],
      correctOptionId: "b",
      explanation:
        "Discriminant = b² − 4ac = (−4)² − 4(2)(3) = 16 − 24 = −8.",
    },
    {
      id: Q(4),
      conceptId: CONCEPT_IDS.quadratic,
      difficultyLevel: "medium",
      questionText:
        "If one root of x² − 3x + k = 0 is 2, find k.",
      options: [
        { id: "a", text: "2" },
        { id: "b", text: "−2" },
        { id: "c", text: "5" },
        { id: "d", text: "−5" },
      ],
      correctOptionId: "a",
      explanation:
        "Substituting x = 2: 4 − 6 + k = 0 ⟹ k = 2.",
    },

    // ── Arithmetic Progressions ─────────────────────────────────────────────
    {
      id: Q(5),
      conceptId: CONCEPT_IDS.ap,
      difficultyLevel: "easy",
      questionText:
        "The common difference of the AP 3, 7, 11, 15, … is:",
      options: [
        { id: "a", text: "3" },
        { id: "b", text: "4" },
        { id: "c", text: "7" },
        { id: "d", text: "11" },
      ],
      correctOptionId: "b",
      explanation: "d = 7 − 3 = 4.",
    },
    {
      id: Q(6),
      conceptId: CONCEPT_IDS.ap,
      difficultyLevel: "easy",
      questionText:
        "The 10th term of the AP 2, 5, 8, 11, … is:",
      options: [
        { id: "a", text: "26" },
        { id: "b", text: "29" },
        { id: "c", text: "32" },
        { id: "d", text: "35" },
      ],
      correctOptionId: "b",
      explanation:
        "aₙ = a + (n−1)d = 2 + 9×3 = 29.",
    },
    {
      id: Q(7),
      conceptId: CONCEPT_IDS.ap,
      difficultyLevel: "medium",
      questionText:
        "The sum of the first 20 terms of the AP 1, 3, 5, 7, … is:",
      options: [
        { id: "a", text: "380" },
        { id: "b", text: "390" },
        { id: "c", text: "400" },
        { id: "d", text: "420" },
      ],
      correctOptionId: "c",
      explanation:
        "Sₙ = n/2 × [2a + (n−1)d] = 20/2 × [2 + 19×2] = 10 × 40 = 400.",
    },
    {
      id: Q(8),
      conceptId: CONCEPT_IDS.ap,
      difficultyLevel: "medium",
      questionText:
        "How many terms of the AP 9, 17, 25, … must be taken to give a sum of 636?",
      options: [
        { id: "a", text: "10" },
        { id: "b", text: "11" },
        { id: "c", text: "12" },
        { id: "d", text: "13" },
      ],
      correctOptionId: "c",
      explanation:
        "636 = n/2[18 + (n−1)8] ⟹ 636 = n(9 + 4n−4) = n(4n+5). 4n²+5n−636=0 ⟹ n=12.",
    },

    // ── Triangles ────────────────────────────────────────────────────────────
    {
      id: Q(9),
      conceptId: CONCEPT_IDS.triangles,
      difficultyLevel: "easy",
      questionText:
        "If △ABC ~ △PQR and AB/PQ = 2/3, then Area(△ABC)/Area(△PQR) is:",
      options: [
        { id: "a", text: "2/3" },
        { id: "b", text: "4/9" },
        { id: "c", text: "3/2" },
        { id: "d", text: "9/4" },
      ],
      correctOptionId: "b",
      explanation:
        "The ratio of areas of similar triangles equals the square of the ratio of corresponding sides: (2/3)² = 4/9.",
    },
    {
      id: Q(10),
      conceptId: CONCEPT_IDS.triangles,
      difficultyLevel: "easy",
      questionText:
        "In a right triangle with hypotenuse 13 cm and one leg 5 cm, the other leg is:",
      options: [
        { id: "a", text: "8 cm" },
        { id: "b", text: "10 cm" },
        { id: "c", text: "12 cm" },
        { id: "d", text: "11 cm" },
      ],
      correctOptionId: "c",
      explanation:
        "By Pythagoras: leg = √(13² − 5²) = √(169 − 25) = √144 = 12 cm.",
    },
    {
      id: Q(11),
      conceptId: CONCEPT_IDS.triangles,
      difficultyLevel: "medium",
      questionText:
        "In △ABC, DE ∥ BC and AD/DB = 3/5. If AC = 4.8 cm, then AE = ?",
      options: [
        { id: "a", text: "1.8 cm" },
        { id: "b", text: "2.0 cm" },
        { id: "c", text: "3.0 cm" },
        { id: "d", text: "3.6 cm" },
      ],
      correctOptionId: "a",
      explanation:
        "By BPT: AE/EC = AD/DB = 3/5 ⟹ AE = (3/8) × 4.8 = 1.8 cm.",
    },
    {
      id: Q(12),
      conceptId: CONCEPT_IDS.triangles,
      difficultyLevel: "medium",
      questionText:
        "The sides of two similar triangles are in the ratio 4 : 9. The ratio of their perimeters is:",
      options: [
        { id: "a", text: "4 : 9" },
        { id: "b", text: "16 : 81" },
        { id: "c", text: "2 : 3" },
        { id: "d", text: "9 : 4" },
      ],
      correctOptionId: "a",
      explanation:
        "Perimeters of similar triangles are in the same ratio as their corresponding sides: 4 : 9.",
    },

    // ── Coordinate Geometry ──────────────────────────────────────────────────
    {
      id: Q(13),
      conceptId: CONCEPT_IDS.coordinate,
      difficultyLevel: "easy",
      questionText:
        "The distance between points A(3, 4) and B(0, 0) is:",
      options: [
        { id: "a", text: "3" },
        { id: "b", text: "4" },
        { id: "c", text: "5" },
        { id: "d", text: "7" },
      ],
      correctOptionId: "c",
      explanation:
        "Distance = √(3² + 4²) = √(9 + 16) = √25 = 5.",
    },
    {
      id: Q(14),
      conceptId: CONCEPT_IDS.coordinate,
      difficultyLevel: "easy",
      questionText:
        "The mid-point of the segment joining A(2, 6) and B(8, 4) is:",
      options: [
        { id: "a", text: "(4, 5)" },
        { id: "b", text: "(5, 5)" },
        { id: "c", text: "(5, 4)" },
        { id: "d", text: "(3, 5)" },
      ],
      correctOptionId: "b",
      explanation:
        "Mid-point = ((2+8)/2, (6+4)/2) = (5, 5).",
    },
    {
      id: Q(15),
      conceptId: CONCEPT_IDS.coordinate,
      difficultyLevel: "medium",
      questionText:
        "If the point P(x, y) divides the line joining A(1, 3) and B(5, 7) in the ratio 1 : 3 internally, then x =",
      options: [
        { id: "a", text: "2" },
        { id: "b", text: "3" },
        { id: "c", text: "4" },
        { id: "d", text: "1" },
      ],
      correctOptionId: "a",
      explanation:
        "Section formula: x = (1×5 + 3×1)/(1+3) = (5+3)/4 = 2.",
    },
    {
      id: Q(16),
      conceptId: CONCEPT_IDS.coordinate,
      difficultyLevel: "medium",
      questionText:
        "The area of a triangle with vertices (0, 0), (4, 0), and (0, 3) is:",
      options: [
        { id: "a", text: "6 sq. units" },
        { id: "b", text: "7 sq. units" },
        { id: "c", text: "12 sq. units" },
        { id: "d", text: "24 sq. units" },
      ],
      correctOptionId: "a",
      explanation:
        "Area = ½|x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)| = ½|0 + 4×3 + 0| = 6.",
    },

    // ── Introduction to Trigonometry ─────────────────────────────────────────
    {
      id: Q(17),
      conceptId: CONCEPT_IDS.trigonometry,
      difficultyLevel: "easy",
      questionText: "sin 30° + cos 60° =",
      options: [
        { id: "a", text: "√3" },
        { id: "b", text: "1" },
        { id: "c", text: "0" },
        { id: "d", text: "2" },
      ],
      correctOptionId: "b",
      explanation:
        "sin 30° = 1/2, cos 60° = 1/2 ⟹ sum = 1.",
    },
    {
      id: Q(18),
      conceptId: CONCEPT_IDS.trigonometry,
      difficultyLevel: "easy",
      questionText: "The value of tan 45° is:",
      options: [
        { id: "a", text: "0" },
        { id: "b", text: "1/√2" },
        { id: "c", text: "1" },
        { id: "d", text: "√3" },
      ],
      correctOptionId: "c",
      explanation: "tan 45° = sin 45°/cos 45° = 1.",
    },
    {
      id: Q(19),
      conceptId: CONCEPT_IDS.trigonometry,
      difficultyLevel: "medium",
      questionText:
        "If sin A = 3/5, then cos A =",
      options: [
        { id: "a", text: "4/5" },
        { id: "b", text: "3/4" },
        { id: "c", text: "5/4" },
        { id: "d", text: "5/3" },
      ],
      correctOptionId: "a",
      explanation:
        "cos A = √(1 − sin²A) = √(1 − 9/25) = √(16/25) = 4/5.",
    },
    {
      id: Q(20),
      conceptId: CONCEPT_IDS.trigonometry,
      difficultyLevel: "medium",
      questionText:
        "(sin²θ + cos²θ) + (tan²θ − sec²θ) =",
      options: [
        { id: "a", text: "2" },
        { id: "b", text: "0" },
        { id: "c", text: "1" },
        { id: "d", text: "−1" },
      ],
      correctOptionId: "b",
      explanation:
        "sin²θ + cos²θ = 1 and tan²θ − sec²θ = −1, so total = 1 + (−1) = 0.",
    },
  ];

  for (const q of questions) {
    await db.contentObject.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        type: "practice_question",
        conceptId: q.conceptId,
        board: "CBSE",
        classYear: 10,
        difficultyLevel: q.difficultyLevel as "easy" | "medium" | "hard" | "board_authentic",
        productionStatus: "live",
        syllabusVersion: "2025-26",
        questionText: q.questionText,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
      },
    });
  }

  console.log(
    `✅  Seeded: 1 chapter, ${concepts.length} concepts, ${questions.length} questions`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

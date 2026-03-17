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

// 20 stable question IDs (4 per concept) — proper v4-compatible UUIDs
const Q = (n: number) => `a${String(n).padStart(7, "0")}-0000-4000-8000-000000000001`;

// Stable tutor user/tutor IDs (use hex digits only for valid UUIDs)
const TUTOR_USER_IDS = {
  priya: "a0000001-0000-4000-8000-000000000001",
  rahul: "a0000002-0000-4000-8000-000000000001",
  sneha: "a0000003-0000-4000-8000-000000000001",
  amit: "a0000004-0000-4000-8000-000000000001",
  kavita: "a0000005-0000-4000-8000-000000000001",
  vikram: "a0000006-0000-4000-8000-000000000001",
};

const TUTOR_IDS = {
  priya: "b0000001-0000-4000-8000-000000000001",
  rahul: "b0000002-0000-4000-8000-000000000001",
  sneha: "b0000003-0000-4000-8000-000000000001",
  amit: "b0000004-0000-4000-8000-000000000001",
  kavita: "b0000005-0000-4000-8000-000000000001",
  vikram: "b0000006-0000-4000-8000-000000000001",
};

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

  // 4. Tutor Users & Tutors
  const tutorData: Array<{
    userId: string;
    tutorId: string;
    email: string;
    phone: string;
    clerkId: string;
    displayName: string;
    tpsTier: "platinum" | "gold" | "silver" | "bronze" | "under_review";
    tpsScore: number;
    hourlyRateMin: number;
    hourlyRateMax: number;
    subjects: string[];
    boards: ("CBSE" | "ICSE" | "Maharashtra" | "UP_Board")[];
    classYears: number[];
    bio: string;
  }> = [
    {
      userId: TUTOR_USER_IDS.priya,
      tutorId: TUTOR_IDS.priya,
      email: "priya.sharma@example.com",
      phone: "+919876543001",
      clerkId: "seed_tutor_priya",
      displayName: "Priya Sharma",
      tpsTier: "platinum",
      tpsScore: 92.5,
      hourlyRateMin: 800,
      hourlyRateMax: 1200,
      subjects: ["Mathematics", "Physics"],
      boards: ["CBSE", "ICSE"],
      classYears: [9, 10, 11, 12],
      bio: "IIT Delhi graduate with 8+ years of teaching experience. Specialized in board exam preparation and competitive exams (JEE Main/Advanced). I believe in building strong fundamentals and making complex concepts simple. My students have consistently scored 95%+ in board exams.\n\nTeaching Philosophy:\n• Focus on conceptual clarity over rote learning\n• Regular practice tests and doubt resolution\n• Personalized attention to each student's learning pace",
    },
    {
      userId: TUTOR_USER_IDS.rahul,
      tutorId: TUTOR_IDS.rahul,
      email: "rahul.verma@example.com",
      phone: "+919876543002",
      clerkId: "seed_tutor_rahul",
      displayName: "Rahul Verma",
      tpsTier: "gold",
      tpsScore: 85.3,
      hourlyRateMin: 500,
      hourlyRateMax: 800,
      subjects: ["Chemistry", "Biology"],
      boards: ["CBSE", "Maharashtra"],
      classYears: [10, 11, 12],
      bio: "MSc Chemistry from Mumbai University. 5 years of experience teaching CBSE and Maharashtra board students. Expert in organic chemistry and NEET preparation.\n\nI use visual diagrams, molecular models, and real-world examples to make chemistry come alive. Biology taught with medical entrance exam focus.",
    },
    {
      userId: TUTOR_USER_IDS.sneha,
      tutorId: TUTOR_IDS.sneha,
      email: "sneha.gupta@example.com",
      phone: "+919876543003",
      clerkId: "seed_tutor_sneha",
      displayName: "Sneha Gupta",
      tpsTier: "gold",
      tpsScore: 81.7,
      hourlyRateMin: 400,
      hourlyRateMax: 600,
      subjects: ["English", "Hindi", "Social Science"],
      boards: ["CBSE", "UP_Board"],
      classYears: [6, 7, 8, 9, 10],
      bio: "MA English Literature with B.Ed. 6 years teaching in reputed CBSE schools. Passionate about language learning and creative writing.\n\nSpecialties:\n• Grammar and composition\n• Literature analysis\n• Essay and letter writing\n• Speaking and comprehension skills",
    },
    {
      userId: TUTOR_USER_IDS.amit,
      tutorId: TUTOR_IDS.amit,
      email: "amit.singh@example.com",
      phone: "+919876543004",
      clerkId: "seed_tutor_amit",
      displayName: "Amit Singh",
      tpsTier: "silver",
      tpsScore: 72.4,
      hourlyRateMin: 350,
      hourlyRateMax: 500,
      subjects: ["Mathematics", "Computer Science"],
      boards: ["CBSE"],
      classYears: [8, 9, 10, 11, 12],
      bio: "B.Tech Computer Science, 3 years tutoring experience. I make mathematics and programming fun and accessible.\n\nStrong focus on:\n• Python and C++ programming\n• Data structures basics\n• Logical reasoning\n• Board exam mathematics",
    },
    {
      userId: TUTOR_USER_IDS.kavita,
      tutorId: TUTOR_IDS.kavita,
      email: "kavita.reddy@example.com",
      phone: "+919876543005",
      clerkId: "seed_tutor_kavita",
      displayName: "Kavita Reddy",
      tpsTier: "silver",
      tpsScore: 68.9,
      hourlyRateMin: 300,
      hourlyRateMax: 450,
      subjects: ["Physics", "Mathematics"],
      boards: ["CBSE", "ICSE", "Maharashtra"],
      classYears: [6, 7, 8, 9],
      bio: "BSc Physics with 4 years of home tutoring experience. Specialized in building strong foundations for middle school students preparing for high school.\n\nI focus on:\n• Clear explanations of basic concepts\n• Lots of practice problems\n• Building confidence in STEM subjects",
    },
    {
      userId: TUTOR_USER_IDS.vikram,
      tutorId: TUTOR_IDS.vikram,
      email: "vikram.joshi@example.com",
      phone: "+919876543006",
      clerkId: "seed_tutor_vikram",
      displayName: "Vikram Joshi",
      tpsTier: "bronze",
      tpsScore: 55.2,
      hourlyRateMin: 250,
      hourlyRateMax: 350,
      subjects: ["Accountancy", "Economics", "Business Studies"],
      boards: ["CBSE"],
      classYears: [11, 12],
      bio: "B.Com with CA Intermediate. New to online tutoring but experienced in commerce subjects. I help students understand practical applications of accounting and economics.\n\nIdeal for students who find commerce subjects challenging or need last-minute exam preparation.",
    },
  ];

  for (const t of tutorData) {
    // Create User for Tutor
    await db.user.upsert({
      where: { id: t.userId },
      update: {},
      create: {
        id: t.userId,
        email: t.email,
        phoneNumber: t.phone,
        clerkId: t.clerkId,
        role: "tutor",
        accountStatus: "active",
      },
    });

    // Create Tutor
    await db.tutor.upsert({
      where: { id: t.tutorId },
      update: {},
      create: {
        id: t.tutorId,
        userId: t.userId,
        displayName: t.displayName,
        tutorType: "marketplace",
        accountStatus: "active",
        tpsScore: t.tpsScore,
        tpsTier: t.tpsTier,
        hourlyRateMin: t.hourlyRateMin,
        hourlyRateMax: t.hourlyRateMax,
        subjects: t.subjects,
        boards: t.boards,
        classYears: t.classYears,
        bio: t.bio,
        backgroundCheckStatus: "passed",
      },
    });
  }

  console.log(`✅  Seeded: ${tutorData.length} tutors`);

  // 5. Generate availability slots for each tutor (next 14 days)
  // Slot IDs use stable format with hex digits only for valid UUIDs
  const SLOT_BASE = "d0000000-0000-4000-8000-";
  let slotCount = 0;

  const tutorIds = Object.values(TUTOR_IDS);
  for (let tutorIdx = 0; tutorIdx < tutorIds.length; tutorIdx++) {
    const tutorId = tutorIds[tutorIdx];
    
    // Each tutor gets slots on different days to simulate variety
    // Days offset: tutor 0 gets days 0,2,4,6..., tutor 1 gets days 1,3,5,7...
    const startOffset = tutorIdx % 2;
    
    for (let dayOffset = startOffset; dayOffset < 14; dayOffset += 2) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + dayOffset);
      
      // Generate 3-5 slots per day (starting at different times)
      const baseHour = 9 + (tutorIdx % 4) * 2; // 9, 11, 13, 15 depending on tutor
      const numSlots = 3 + (tutorIdx % 3); // 3-5 slots
      
      for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
        const slotHour = baseHour + slotIdx * 2; // 2 hour gaps
        if (slotHour >= 20) continue; // Don't go past 8 PM
        
        const slotStart = new Date(date);
        slotStart.setHours(slotHour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(30); // 30-minute slots
        
        // Skip if slot is in the past
        if (slotStart <= new Date()) continue;
        
        // Generate valid UUID: d0000000-0000-4000-8000-00TTDDSS0000 (TT=tutor, DD=day, SS=slot, 12 chars total)
        const slotId = `d0000000-0000-4000-8000-00${String(tutorIdx).padStart(2, '0')}${String(dayOffset).padStart(2, '0')}${String(slotIdx).padStart(2, '0')}0000`;
        
        await db.tutorAvailabilitySlot.upsert({
          where: { id: slotId },
          update: {},
          create: {
            id: slotId,
            tutorId,
            slotStart,
            slotEnd,
            state: "available",
          },
        });
        slotCount++;
      }
    }
  }

  console.log(`✅  Seeded: ${slotCount} availability slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

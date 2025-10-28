import { getDb } from "./db";
import { recognizedTests } from "../drizzle/schema";

const testsData = [
  // 표준 지능 검사
  {
    category: "표준 지능 검사",
    testName: "RIQ Admission Test, SD15 135",
    description: "RIQ Society 공식 입회 시험",
    requiredScore: "IQ 135 이상",
    displayOrder: 1,
  },
  {
    category: "표준 지능 검사",
    testName: "Cattell, IQ 156",
    description: "Cattell Culture Fair Intelligence Test",
    requiredScore: "IQ 156 이상",
    displayOrder: 2,
  },
  {
    category: "표준 지능 검사",
    testName: "California Test of Mental Maturity (CTMM), IQ 137",
    description: "California Test of Mental Maturity",
    requiredScore: "IQ 137 이상",
    displayOrder: 3,
  },
  {
    category: "표준 지능 검사",
    testName: "Mensa Admission Test, 99%",
    description: "Mensa 입회 시험",
    requiredScore: "99 percentile 이상",
    displayOrder: 4,
  },
  {
    category: "표준 지능 검사",
    testName: "Reynolds Adaptive Intelligence Test (RAIT), IQ 135",
    description: "Reynolds Adaptive Intelligence Test",
    requiredScore: "IQ 135 이상",
    displayOrder: 5,
  },
  {
    category: "표준 지능 검사",
    testName: "Reynolds Intellectual Assessment Scales (RIAS), IQ 135",
    description: "Reynolds Intellectual Assessment Scales",
    requiredScore: "IQ 135 이상",
    displayOrder: 6,
  },
  {
    category: "표준 지능 검사",
    testName: "Stanford-Binet, IQ 137",
    description: "Stanford-Binet Intelligence Scale",
    requiredScore: "IQ 137 이상",
    displayOrder: 7,
  },
  {
    category: "표준 지능 검사",
    testName: "Stanford-Binet 5, IQ 135",
    description: "Stanford-Binet Intelligence Scale, Fifth Edition",
    requiredScore: "IQ 135 이상",
    displayOrder: 8,
  },
  {
    category: "표준 지능 검사",
    testName: "Wechsler Intelligence Scale (WAIS, WISC, WPPSI), IQ 135",
    description: "Wechsler Adult Intelligence Scale, Wechsler Intelligence Scale for Children, Wechsler Preschool and Primary Scale of Intelligence",
    requiredScore: "IQ 135 이상",
    displayOrder: 9,
  },
  {
    category: "표준 지능 검사",
    testName: "Woodcock-Johnson (I, II, III) Tests of Cognitive Abilities, IQ 137",
    description: "Woodcock-Johnson Tests of Cognitive Abilities (I, II, III)",
    requiredScore: "IQ 137 이상",
    displayOrder: 10,
  },
  {
    category: "표준 지능 검사",
    testName: "Woodcock-Johnson IV Tests of Cognitive Abilities, IQ 135",
    description: "Woodcock-Johnson IV Tests of Cognitive Abilities",
    requiredScore: "IQ 135 이상",
    displayOrder: 11,
  },
  
  // 학업 및 인지 능력 검사
  {
    category: "학업 및 인지 능력 검사",
    testName: "Cognitive Abilities Test (CogAT), 99%",
    description: "Cognitive Abilities Test",
    requiredScore: "99 percentile 이상",
    displayOrder: 12,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Differential Ability Scales (DAS), GCA 137",
    description: "Differential Ability Scales",
    requiredScore: "GCA 137 이상",
    displayOrder: 13,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Differential Ability Scales - Second Edition (DAS-II), GCA 135",
    description: "Differential Ability Scales Second Edition",
    requiredScore: "GCA 135 이상",
    displayOrder: 14,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Naglieri Nonverbal Ability Test (NNAT), 99%",
    description: "Naglieri Nonverbal Ability Test",
    requiredScore: "99 percentile 이상",
    displayOrder: 15,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Naglieri Nonverbal Ability Test 2 & 3 (NNAT2/NNAT3), 99%",
    description: "Naglieri Nonverbal Ability Test 2 & 3",
    requiredScore: "99 percentile 이상",
    displayOrder: 16,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Otis Lennon School Abilities Test (OLSAT), Total SAI 138",
    description: "Otis Lennon School Abilities Test",
    requiredScore: "Total SAI 138 이상",
    displayOrder: 17,
  },
  {
    category: "학업 및 인지 능력 검사",
    testName: "Miller Analogies Test (MAT), 99%",
    description: "Miller Analogies Test",
    requiredScore: "99 percentile 이상",
    displayOrder: 18,
  },
  
  // 대학 및 대학원 진학 시험
  {
    category: "대학 및 대학원 진학 시험",
    testName: "American College Testing Program (ACT), 34",
    description: "ACT (administered on or after October 1989)",
    requiredScore: "34점 이상",
    displayOrder: 19,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "American College Testing Program (ACT), 32",
    description: "ACT (administered prior to October 1989)",
    requiredScore: "32점 이상",
    displayOrder: 20,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Graduate Record Exam (GRE) (V + Q), 327",
    description: "GRE (administered on or after August 2011)",
    requiredScore: "327점 이상",
    displayOrder: 21,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Graduate Record Exam (GRE) (V + Q + A), 1950",
    description: "GRE (administered prior to October 2001)",
    requiredScore: "1950점 이상",
    displayOrder: 22,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Graduate Record Exam (GRE) (V + Q), 1300",
    description: "GRE (administered prior to October 2001)",
    requiredScore: "1300점 이상",
    displayOrder: 23,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Graduate Management Admission Test (GMAT), 760",
    description: "GMAT (administered prior to 1 February 2024)",
    requiredScore: "760점 이상",
    displayOrder: 24,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Graduate Management Admission Test Focus Edition (GMAT Focus Edition), 715",
    description: "GMAT Focus Edition (administered on or after 1 February 2024)",
    requiredScore: "715점 이상",
    displayOrder: 25,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Law School Admission Test (LSAT), 172",
    description: "LSAT (administered on or after June 1991)",
    requiredScore: "172점 이상",
    displayOrder: 26,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Law School Admission Test (LSAT), 41",
    description: "LSAT (99th percentile) (administered between 1982 and 1991)",
    requiredScore: "41점 이상 (99th percentile)",
    displayOrder: 27,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Law School Admission Test (LSAT), 694",
    description: "LSAT (administered prior to June 1982)",
    requiredScore: "694점 이상",
    displayOrder: 28,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Scholastic Aptitude Test (SAT), 1370",
    description: "SAT (administered between 1995 and 2005)",
    requiredScore: "1370점 이상",
    displayOrder: 29,
  },
  {
    category: "대학 및 대학원 진학 시험",
    testName: "Scholastic Aptitude Test (SAT), 1330",
    description: "SAT (administered prior to April 1995)",
    requiredScore: "1330점 이상",
    displayOrder: 30,
  },
  
  // 기타 시험 (표준 지능 검사만)
  {
    category: "표준 지능 검사",
    testName: "기타 시험",
    description: "위 목록에 없는 표준 지능 검사",
    requiredScore: "해당 시험의 상위 2% 이상",
    displayOrder: 999,
  },
];

export async function seedRecognizedTests() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    return;
  }

  console.log("Seeding recognized tests...");
  
  // Delete existing tests
  await db.delete(recognizedTests);
  
  // Insert new tests
  await db.insert(recognizedTests).values(testsData);
  
  console.log(`✓ ${testsData.length} recognized tests seeded successfully!`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRecognizedTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding tests:", error);
      process.exit(1);
    });
}


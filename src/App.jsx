import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Home, Calendar, BarChart3, AlertTriangle, CheckCircle2, Circle, ChevronDown, ChevronRight,
  ChevronLeft, Clock, Target, TrendingUp, BookOpen, Flame, X, Plus, Trash2, Info, Rocket,
  GraduationCap, ListChecks, ClipboardCheck, MoreHorizontal, RefreshCw, PlayCircle, ExternalLink,
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  bg: "#0F1319",
  panel: "#171D26",
  panelRaised: "#212934",
  line: "#2A3340",
  lineLight: "#3A4552",
  text: "#EDF1F5",
  textMuted: "#93A0AD",
  textFaint: "#5E6975",
  amber: "#F2B33B",
  amberSoft: "rgba(242,179,59,0.14)",
  cyan: "#3FC7C2",
  cyanSoft: "rgba(63,199,194,0.14)",
  violet: "#8B93F5",
  violetSoft: "rgba(139,147,245,0.14)",
  danger: "#E5573F",
  dangerSoft: "rgba(229,87,63,0.14)",
  success: "#5FBF7B",
  successSoft: "rgba(95,191,123,0.14)",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
.font-display{font-family:'Chakra Petch',sans-serif;}
.font-body{font-family:'IBM Plex Sans Thai','Chakra Petch',sans-serif;}
.font-mono{font-family:'JetBrains Mono',monospace;}
*{box-sizing:border-box;}
body{-webkit-tap-highlight-color:transparent;}
input[type=number]::-webkit-inner-spin-button{opacity:1;}
::selection{background:${C.amber};color:#0F1319;}
`;

/* ============================== EXAM STRUCTURE DATA (ทปอ / myTCAS) ============================== */
const TOTAL_DAYS = 160;
const START_DATE = new Date(2026, 7, 23); // 23 ส.ค. 2569
const EXAM_START = new Date(2027, 0, 30); // 30 ม.ค. 2570

const TPAT3_SECTIONS = [
  { key: "numerical", label: "ด้านตัวเลข (Numerical Reasoning)", short: "ตัวเลข", part: 1, q: 15, pt: 20,
    topics: ["อนุกรมตัวเลข (บวก/คูณ/ยกกำลัง)", "อัตราส่วน สัดส่วน เปอร์เซ็นต์", "การอ่านกราฟและตาราง", "โจทย์ปัญหาคณิตในชีวิตประจำวัน", "ความน่าจะเป็นเบื้องต้น", "อสมการและค่าวิกฤต", "อนุกรมรูปภาพผสมตัวเลข"] },
  { key: "diagrammatic", label: "ด้านมิติสัมพันธ์ (Diagrammatic Reasoning)", short: "มิติสัมพันธ์", part: 1, q: 15, pt: 20,
    topics: ["มองภาพ 3 มิติจากภาพ 2 มิติ", "การพับ-คลี่กล่องกระดาษ", "การหมุนและสะท้อนวัตถุ", "อนุกรมรูปภาพ (Pattern)", "ภาพเงาและมุมมองวัตถุ", "การนับจำนวนบล็อก/ชิ้นส่วน"] },
  { key: "mechanical", label: "ด้านเชิงกลและฟิสิกส์ (Mechanical & Physics)", short: "เชิงกล-ฟิสิกส์", part: 1, q: 15, pt: 20,
    topics: ["แรง มวล ความเร่ง", "งานและพลังงาน", "คาน รอก เฟือง", "วงจรไฟฟ้าเบื้องต้น", "ของไหลและแรงดัน", "การเคลื่อนที่และแรงเสียดทาน"] },
  { key: "scithink", label: "ความคิดเชิงวิทย์-เทคโน-วิศวะ (Sci/Tech/Eng Thinking)", short: "คิดเชิงวิศวะ", part: 2, q: 15, pt: 20,
    topics: ["กระบวนการออกแบบเชิงวิศวกรรม", "การให้เหตุผลเชิงวิทยาศาสตร์จากสถานการณ์", "วิเคราะห์ข้อดี-ข้อเสียของนวัตกรรม", "จริยธรรมและผลกระทบทางวิศวกรรม", "การแก้ปัญหาเชิงระบบ (Systems Thinking)"] },
  { key: "news", label: "ข่าวสารวิทย์-เทคโน-วิศวะ (Sci/Tech News & Interest)", short: "ข่าวสาร", part: 2, q: 10, pt: 20,
    topics: ["ข่าว AI และ Machine Learning", "ข่าวความมั่นคงปลอดภัยไซเบอร์ (เน้นพิเศษ ตรงสาขา)", "นวัตกรรมหุ่นยนต์และระบบอัตโนมัติ", "พลังงานทดแทนและสิ่งแวดล้อม", "เทคโนโลยีอวกาศ", "เทคโนโลยีชีวภาพและวัสดุใหม่"] },
];

const TGAT_PARTS = [
  { key: "tgat1", label: "TGAT1 การสื่อสารภาษาอังกฤษ", short: "TGAT1 English", q: 60, min: 60, pt: 100,
    topics: ["Vocabulary เชิงวิชาการ/เทคโนโลยี", "Grammar in Context", "Reading Comprehension", "Cloze / Contextual Completion", "Conversation Completion", "Speed Reading", "เทคนิคตัดตัวเลือก"] },
  { key: "tgat2", label: "TGAT2 การคิดอย่างมีเหตุผล", short: "TGAT2 Logic", q: 80, min: 60, pt: 100,
    topics: ["การวิเคราะห์ข้อมูล", "อนุกรมตัวเลข/รูปภาพเชิงตรรกะ", "การอ่านตารางและกราฟ", "โจทย์เงื่อนไข (Logic Puzzle)", "เหตุผลแบบนิรนัย-อุปนัย", "Numerical Reasoning เชิงเหตุผล"] },
  { key: "tgat3", label: "TGAT3 สมรรถนะการทำงาน", short: "TGAT3 Future Comp.", q: 60, min: 60, pt: 100,
    topics: ["การสร้างคุณค่าและนวัตกรรม", "การแก้ปัญหาที่ซับซ้อน", "การบริหารจัดการอารมณ์", "การทำงานร่วมกับผู้อื่น", "ความเป็นพลเมืองที่มีส่วนร่วม", "สถานการณ์จำลอง (Situational Judgment)"] },
];

const ERROR_CATEGORIES = ["ไม่รู้เนื้อหา", "จำไม่ได้", "อ่านโจทย์ผิด", "คิดเลขผิด", "วิเคราะห์ผิด", "ตีความผิด", "รีบเกินไป", "ใช้เวลานานเกินไป", "เดา", "ไม่รู้เทคนิค"];

const PHASES = [
  { id: 1, name: "Foundation", th: "ปูพื้นฐาน", startDay: 1, endDay: 28, targetMin: 50, targetMax: 60,
    rationale: "สร้างพื้นฐานความรู้และความคุ้นเคยกับรูปแบบข้อสอบทุกหมวดก่อน เน้นความเข้าใจให้ถูกก่อนความเร็ว ยังไม่จับเวลาเข้มงวด (ตัดสั้นลง 1 สัปดาห์เพื่อให้พอดี 160 วัน)" },
  { id: 2, name: "Skill Building", th: "สร้างทักษะ", startDay: 29, endDay: 68, targetMin: 65, targetMax: 75,
    rationale: "เพิ่มปริมาณโจทย์และเริ่มจับเวลาใกล้เคียงจริง ฝึกความแม่นยำภายใต้เวลาจำกัด เริ่ม Mini Mock ทุกสัปดาห์" },
  { id: 3, name: "Intensive Practice", th: "ฝึกเข้มข้น", startDay: 69, endDay: 113, targetMin: 75, targetMax: 85,
    rationale: "อัดโจทย์ปริมาณสูงขึ้น ผสมหมวดแบบสอบจริง เริ่ม Section Mock เต็มพาร์ททุกสัปดาห์" },
  { id: 4, name: "Exam Simulation", th: "จำลองสนามสอบ", startDay: 114, endDay: 143, targetMin: 85, targetMax: 90,
    rationale: "จำลองสภาวะสนามสอบจริงทุกมิติ ทั้งเวลา ความกดดัน และกระดาษคำตอบ (ปีนี้สอบกระดาษล้วน ไม่มี CBT)" },
  { id: 5, name: "Final Push", th: "โค้งสุดท้าย", startDay: 144, endDay: 160, targetMin: 90, targetMax: 95,
    rationale: "รักษาคะแนน 90+ ให้นิ่งในหลาย Full Mock ติดกัน ลดเนื้อหาใหม่ เน้นซ่อมจุดอ่อนและพักผ่อนอย่างมีเป้าหมาย" },
];

const MOCK_DEFS = {
  tpat3_mini: { label: "Mini Mock: TPAT3 (เลือกหมวด)", q: 20, min: 30, subject: "TPAT3" },
  tgat_mini: { label: "Mini Mock: TGAT (เลือกพาร์ท)", q: 25, min: 30, subject: "TGAT" },
  tpat3_p1: { label: "Section Mock: TPAT3 พาร์ท 1 (ความถนัด)", q: 45, min: 115, subject: "TPAT3" },
  tpat3_p2: { label: "Section Mock: TPAT3 พาร์ท 2 (ความคิด-ความสนใจ)", q: 25, min: 65, subject: "TPAT3" },
  tgat1_full: { label: "Section Mock: TGAT1 เต็มพาร์ท", q: 60, min: 60, subject: "TGAT" },
  tgat2_full: { label: "Section Mock: TGAT2 เต็มพาร์ท", q: 80, min: 60, subject: "TGAT" },
  tgat3_full: { label: "Section Mock: TGAT3 เต็มพาร์ท", q: 60, min: 60, subject: "TGAT" },
  tpat3_full: { label: "Full Mock: TPAT3 ทั้งฉบับ", q: 70, min: 180, subject: "TPAT3" },
  tgat_full: { label: "Full Mock: TGAT ทั้งฉบับ (3 พาร์ท)", q: 200, min: 180, subject: "TGAT" },
};

function getMockForDay(phaseId, counter) {
  if (phaseId <= 2) return MOCK_DEFS[["tpat3_mini", "tgat_mini"][counter % 2]];
  if (phaseId === 3) return MOCK_DEFS[["tpat3_p1", "tgat1_full", "tpat3_p2", "tgat2_full", "tpat3_p1", "tgat3_full"][counter % 6]];
  return MOCK_DEFS[["tpat3_full", "tgat_full", "tpat3_full"][counter % 3]];
}

const FINAL_WEEK_SCHEDULE = [
  { dayType: "mock", subjectKey: "TGAT", sectionLabel: "Full Mock TGAT", topic: "Full Mock TGAT ทั้ง 3 พาร์ท", questionCount: 200, timeMinutes: 180, scoreTarget: 90,
    todos: ["ทำ Full Mock TGAT ครบ 3 พาร์ท จับเวลาจริง 180 นาที", "ตรวจและวิเคราะห์ข้อผิดทุกข้อทันที", "บันทึกผลลง Weekly Tracker", "สรุปจุดอ่อนที่เหลือ 3 อันดับแรก"] },
  { dayType: "mock", subjectKey: "TPAT3", sectionLabel: "Full Mock TPAT3", topic: "Full Mock TPAT3 ทั้งฉบับ", questionCount: 70, timeMinutes: 180, scoreTarget: 90,
    todos: ["ทำ Full Mock TPAT3 ครบ 70 ข้อ จับเวลาจริง 180 นาที", "ตรวจและวิเคราะห์ข้อผิดทุกข้อทันที", "บันทึกผลลง Weekly Tracker", "สรุปจุดอ่อนที่เหลือ 3 อันดับแรก"] },
  { dayType: "fix", subjectKey: "Mixed", sectionLabel: "ซ่อมจุดอ่อน", topic: "ซ่อมจุดอ่อนเฉพาะจุดจาก Mock 2 ครั้งล่าสุด", questionCount: 30, timeMinutes: 40, scoreTarget: 90,
    todos: ["ไล่แก้ทีละจุดอ่อนจาก Error Log ของ 2 Mock ล่าสุด", "ทำโจทย์เฉพาะจุดอ่อน 30 ข้อ", "ทบทวน Flashcard คำศัพท์ที่ยังไม่แม่น", "นอนให้เพียงพอ"] },
  { dayType: "mock", subjectKey: "Mixed", sectionLabel: "Full Mock รวม", topic: "Full Mock รวม TGAT + TPAT3 (จำลองสนามสอบเต็มวัน)", questionCount: 270, timeMinutes: 360, scoreTarget: 90,
    todos: ["จำลองสนามสอบเต็มวัน: TGAT 180 นาที พัก แล้วต่อ TPAT3 180 นาที", "วิเคราะห์ภาพรวมทั้งวัน: ความอึด สมาธิ การบริหารเวลา", "บันทึกผลลง Weekly Tracker", "เตรียมเอกสาร/อุปกรณ์สำหรับวันสอบจริงล่วงหน้า"] },
  { dayType: "review", subjectKey: "Mixed", sectionLabel: "ทบทวนรวบยอด", topic: "ทบทวน Flashcard และสรุปสูตร/เทคนิคทั้งหมด", questionCount: 0, timeMinutes: 60, scoreTarget: 90,
    todos: ["ทบทวน Flashcard คำศัพท์ทั้งหมดที่สะสมมา", "อ่านสรุปสูตร/เทคนิคของทุกหมวด TPAT3 และ TGAT", "ห้ามทำโจทย์ใหม่ที่ไม่เคยเจอ", "นอนให้ครบ 7–8 ชั่วโมง"] },
  { dayType: "light", subjectKey: "Mixed", sectionLabel: "ฝึกเบา", topic: "ฝึกเบาเฉพาะหมวดที่ยังไม่มั่นใจ + เตรียมของสอบ", questionCount: 15, timeMinutes: 20, scoreTarget: 90,
    todos: ["ทำโจทย์เบา ๆ 15 ข้อ เฉพาะหมวดที่ยังไม่มั่นใจที่สุด", "เช็กบัตรประชาชน บัตรที่นั่งสอบ เครื่องเขียน", "เช็กสถานที่สอบและเส้นทางเดินทางล่วงหน้า", "นอนให้ครบ 7–8 ชั่วโมง"] },
  { dayType: "rest", subjectKey: "Mixed", sectionLabel: "พักผ่อน", topic: "พักผ่อนเต็มที่ ก่อนสอบวันพรุ่งนี้", questionCount: 0, timeMinutes: 0, scoreTarget: 90,
    todos: ["ห้ามทำโจทย์ใหม่หรืออ่านเนื้อหาหนัก", "ดู Error Log ผ่านตาเบา ๆ ได้ (ไม่เกิน 15 นาที)", "เตรียมกระเป๋าสอบให้พร้อมตั้งแต่เย็น", "นอนเร็ว ตั้งนาฬิกาปลุกสำรอง"] },
];

const DAY_TYPE_META = {
  learn: { label: "เรียน+ฝึก", color: C.cyan },
  timed: { label: "จับเวลา", color: C.violet },
  mock: { label: "Mock", color: C.amber },
  recovery: { label: "ทบทวนเบา", color: C.success },
  fix: { label: "ซ่อมจุดอ่อน", color: C.danger },
  review: { label: "ทบทวนรวบยอด", color: C.success },
  light: { label: "ฝึกเบา", color: C.success },
  rest: { label: "พักผ่อน", color: C.textMuted },
};

const SUBJECT_COLOR = { TPAT3: C.amber, TGAT: C.violet, Mixed: C.cyan };

const EXAM_DAY_CHECKLIST = [
  "บัตรประจำตัวประชาชนตัวจริง (ใบเดียวที่ใช้ได้)",
  "บัตรที่นั่งสอบ (พิมพ์จากระบบ myTCAS ล่วงหน้า)",
  "ดินสอ 2B อย่างน้อย 2–3 แท่ง + กบเหลาดินสอ",
  "ยางลบดินสอ 1–2 ก้อน",
  "ปากกาสำรอง",
  "นาฬิกาข้อมือธรรมดา (ไม่ใช่สมาร์ทวอทช์)",
  "เช็กสนามสอบ ห้องสอบ วันเวลาสอบจริงของตัวเองใน myTCAS ล่วงหน้า (ปีนี้ TGAT/TPAT2-5 กระจายอยู่ช่วง 30 ม.ค.–1 ก.พ. 2570)",
  "ไปถึงสนามสอบก่อนเวลาอย่างน้อย 30–60 นาที",
  "เผื่อเวลาสำรองกรณีรถติด/ฝนตก",
  "กินอิ่มพอดี ไม่อิ่มเกินไปก่อนสอบ",
  "ปีนี้สอบกระดาษล้วนทุกวิชา (ยกเลิกระบบคอมพิวเตอร์) เตรียมใจฝนกระดาษคำตอบให้ชัวร์",
  "จำสัดส่วนเวลา: TGAT1/2/3 พาร์ทละ 60 นาที · TPAT3 รวม 180 นาที (พาร์ท 1 ~115 นาที / พาร์ท 2 ~65 นาที)",
  "นอนให้ครบ 7–8 ชั่วโมงคืนก่อนสอบ",
];

const ADJUSTMENT_RULES = [
  { situation: "คะแนนสัปดาห์นี้ต่ำกว่าเป้าหมาย Phase", action: "วิเคราะห์ข้อผิด → หาสาเหตุ → เพิ่มโจทย์เฉพาะจุดอ่อน → ทดสอบซ้ำภายใน 3–7 วัน" },
  { situation: "หมวดเดิมคะแนนต่ำติดต่อกัน 2 สัปดาห์", action: "ลดเวลาหมวดที่แข็งแรงลง โยกเวลาทั้งหมดไปแก้จุดอ่อนหมวดนั้นทันที" },
  { situation: "TPAT3 ต่ำกว่าเป้ามากกว่า TGAT", action: "เพิ่มสัดส่วนเวลาให้ TPAT3 เกิน 70% ชั่วคราว (เพราะน้ำหนักการคัดเลือก 70%)" },
  { situation: "คะแนนแกว่งมาก ไม่นิ่ง", action: "ลดปริมาณโจทย์ใหม่ เพิ่มรอบทบทวนโจทย์เดิม/Error Log แทนการลุยโจทย์ใหม่" },
  { situation: "Mock ถึงเป้าหมาย 2 ครั้งติด", action: "เพิ่มความยากขึ้นหนึ่งระดับ หรือลดเวลาทำโจทย์ลง 10% เพื่อฝึกความเร็ว" },
];

// แหล่งเรียนจริง ตรวจสอบผ่านการค้นหาเว็บ (ช่องฟรี/คลังข้อสอบฟรีที่มีผู้แนะนำซ้ำๆ จากหลายแหล่งอิสระ ณ ปี 2569)
const OFFICIAL_RESOURCE = { name: "myTCAS Blueprint (ทปอ. อย่างเป็นทางการ)", desc: "โครงสร้างข้อสอบจริง + ตัวอย่างข้อสอบพร้อมเฉลยทุกวิชา ประกาศสำหรับ TCAS70 โดยตรง ใช้ยึดเป็นหลักก่อนแหล่งอื่นเสมอ", url: "https://blueprint.mytcas.com/" };

const RESOURCES = {
  numerical: [
    { name: "SmartMathPro", desc: "คลิปติวฟรี + คลังข้อสอบเก่า TGAT/TPAT3 อิงตาม Test Blueprint ปีล่าสุด", url: "https://www.smartmathpro.com/exam-free/tgat/" },
    { name: "Physics Blueprint (พี่ตั้ว)", desc: "โจทย์อนุกรม/สัดส่วนแนว TPAT3 พร้อมเฉลยละเอียด" },
  ],
  diagrammatic: [
    { name: "Physics Blueprint (พี่ตั้ว)", desc: "สอนเทคนิคพับกล่อง หมุนภาพ 3 มิติ ประกอบภาพ ตรงหัวข้อนี้โดยเฉพาะ" },
    { name: "SmartMathPro", desc: "สรุปเทคนิค + โจทย์มิติสัมพันธ์ (บทความ TGAT2 Diagrammatic Reasoning)" },
  ],
  mechanical: [
    { name: "Physics Blueprint (พี่ตั้ว)", desc: "ผู้เชี่ยวชาญเฉพาะทางฟิสิกส์/เชิงกล มีคลังข้อสอบย้อนหลังกว่า 3,500 ข้อให้ฝึกฟรี", url: "https://www.physicsblueprint.com/physics-exams/tpat3/" },
  ],
  scithink: [
    { name: "Physics Blueprint (พี่ตั้ว)", desc: "แนวคิดเชิงวิศวกรรมและวิทยาศาสตร์ประยุกต์ สไตล์ข้อสอบ TPAT3 พาร์ท 2" },
    { name: "OnDemand", desc: "สรุปแนวข้อสอบความคิดเชิงวิศวกรรมและตัวอย่างข้อสอบ" },
  ],
  news: [
    { name: "ข่าว AI / เทคโนโลยี / Cybersecurity", desc: "ติดตามข่าวเทคโนโลยีรายสัปดาห์ (Blognone ภาษาไทยอ่านง่าย) เน้น AI และความมั่นคงปลอดภัยไซเบอร์เป็นพิเศษ เพราะตรงสาขาที่จะเข้า" },
  ],
  tgat1: [
    { name: "OpenDurian", desc: "คอร์สและคลิป TGAT English ครบเนื้อหา พร้อมตัวอย่างข้อสอบจริง" },
    { name: "SmartMathPro", desc: "คลังข้อสอบเก่า TGAT1 พร้อมเฉลยละเอียดทุกข้อ ดาวน์โหลดฟรี", url: "https://www.smartmathpro.com/exam-free/tgat/" },
  ],
  tgat2: [
    { name: "Aj Klui (อ.ขลุ่ย)", desc: "ผู้เชี่ยวชาญเฉพาะทาง TGAT2-3 ปูพื้นฐาน + ตะลุยโจทย์ครบทุกพาร์ท" },
    { name: "SmartMathPro", desc: "ตะลุยโจทย์เชิงตรรกะ/ตัวเลข/มิติสัมพันธ์ของ TGAT2" },
  ],
  tgat3: [
    { name: "Aj Klui (อ.ขลุ่ย)", desc: "สอน TGAT3 ละเอียด ช่วยจับรูปแบบคำตอบที่ข้อสอบให้คะแนน (0/0.25/0.5/0.75/1)" },
    { name: "OBEC Channel (สพฐ.)", desc: "ติวสดฟรีจากภาครัฐ ครบทุกพาร์ท TGAT/TPAT ถ่ายทอดผ่าน YouTube/Facebook Live" },
  ],
  examBanks: [
    { name: "SmartMathPro คลังข้อสอบ", desc: "ข้อสอบเก่า TGAT1/2/3 ทุกปี พร้อมเฉลยละเอียด ดาวน์โหลดฟรี", url: "https://www.smartmathpro.com/exam-free/tgat/" },
    { name: "Physics Blueprint คลังข้อสอบ", desc: "ข้อสอบเก่า TPAT3/ฟิสิกส์ทุกสนามสอบ ย้อนหลังถึงปี 2555", url: "https://www.physicsblueprint.com/physics-exams/" },
    { name: "TCASter", desc: "ฝึกทำโจทย์แบบเกม + Mock Exam จับเวลาออนไลน์ฟรี ครบ TGAT/TPAT" },
  ],
};


/* ============================== DATE / GENERAL HELPERS ============================== */
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
function formatThaiDate(date) { return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`; }
function dateKeyOf(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function getTodayDayNumber() {
  const now = new Date();
  const s = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((t - s) / 86400000) + 1;
}
function getPhase(dayNumber) { return PHASES.find((p) => dayNumber >= p.startDay && dayNumber <= p.endDay) || PHASES[PHASES.length - 1]; }
const PHASE_FACTOR = { 1: 0.6, 2: 0.8, 3: 1.0, 4: 1.15, 5: 1.3 };

/* ============================== TODOS BUILDER ============================== */
function buildTodos({ dayType, subjectKey, topic, questionCount, timeMinutes, mockLabel, sectionLabel }) {
  if (dayType === "learn") {
    return [
      `เรียนเนื้อหา ${subjectKey}: ${topic}`,
      `ทำโจทย์ ${questionCount} ข้อ จับเวลา ${timeMinutes} นาที`,
      "วิเคราะห์ข้อผิดทุกข้อ แยกประเภทลง Error Log",
      "Flashcard คำศัพท์อังกฤษ 15 คำ",
      "บันทึกคะแนน/ผลวันนี้",
    ];
  }
  if (dayType === "timed") {
    return [
      `Timed Practice ${questionCount} ข้อ / ${timeMinutes} นาที (${sectionLabel})`,
      "เช็ก Speed vs Accuracy แยกเป็นหมวดย่อย",
      "บันทึกข้อผิดลง Error Log ตามประเภท",
      "Flashcard คำศัพท์อังกฤษ 15 คำ",
    ];
  }
  if (dayType === "recovery") {
    return [
      "ทบทวน Flashcard สะสมทั้งหมด (ไม่เรียนเนื้อหาใหม่)",
      "อ่านข่าววิทยาศาสตร์ / เทคโนโลยี / วิศวกรรม 15–20 นาที",
      "ทบทวน Error Log ของสัปดาห์ที่ผ่านมา",
      "ทำโจทย์เก่าที่เคยผิดซ้ำ 10 ข้อ (ไม่จับเวลา)",
      "พักสมอง / ยืดเส้นยืดสาย",
    ];
  }
  return [
    `${mockLabel}: ${questionCount} ข้อ / ${timeMinutes} นาที (จับเวลาจริงเป๊ะ ห้ามหยุดกลางคัน)`,
    "ตรวจคำตอบและวิเคราะห์ข้อผิดทุกข้อ แยกตามหมวด + ประเภทข้อผิด",
    "กรอกผลลง Weekly Tracker (คะแนน / จุดอ่อน / Accuracy)",
    "ตั้งเป้าหมายจุดที่ต้องแก้ของสัปดาห์ถัดไป",
  ];
}

/* ============================== CURRICULUM GENERATOR ============================== */
function generateCurriculum() {
  const days = [];
  let tpat3Counter = 0, tgatCounter = 0, mockCounter = 0;
  const tpat3TopicCounters = {}; TPAT3_SECTIONS.forEach((s) => (tpat3TopicCounters[s.key] = 0));
  const tgatTopicCounters = {}; TGAT_PARTS.forEach((p) => (tgatTopicCounters[p.key] = 0));

  for (let dayNumber = 1; dayNumber <= TOTAL_DAYS; dayNumber++) {
    const date = addDays(START_DATE, dayNumber - 1);
    const phase = getPhase(dayNumber);
    const weekNumber = Math.ceil(dayNumber / 7);
    const cyclePos = ((dayNumber - 1) % 7) + 1;
    const isFinal30 = dayNumber >= 131;
    const isFinal7 = dayNumber >= 154;

    if (isFinal7) {
      const fw = FINAL_WEEK_SCHEDULE[dayNumber - 154];
      days.push({
        dayNumber, date, dateStr: formatThaiDate(date), dateKey: dateKeyOf(date),
        phaseId: phase.id, phaseName: phase.th, weekNumber, cyclePos,
        dayType: fw.dayType, subjectKey: fw.subjectKey, sectionLabel: fw.sectionLabel, topic: fw.topic,
        questionCount: fw.questionCount, timeMinutes: fw.timeMinutes, scoreTarget: fw.scoreTarget,
        todos: fw.todos, isFinal30, isFinal7, daysToExam: 161 - dayNumber,
      });
      continue;
    }

    const isRecovery = weekNumber % 2 === 0 && cyclePos === 5;
    let dayType = isRecovery ? "recovery" : cyclePos <= 5 ? "learn" : cyclePos === 6 ? "timed" : "mock";
    if (isFinal30 && cyclePos === 3 && dayType === "learn") dayType = "mock";

    let subjectKey, sectionLabel, sectionKey, topic, questionCount, timeMinutes, mockLabel;
    const pf = PHASE_FACTOR[phase.id];

    if (dayType === "learn") {
      const pattern = ["TPAT3", "TPAT3", "TGAT", "TPAT3", "TPAT3"];
      const chosen = pattern[cyclePos - 1];
      if (chosen === "TPAT3") {
        const section = TPAT3_SECTIONS[tpat3Counter % TPAT3_SECTIONS.length];
        const idx = tpat3TopicCounters[section.key] % section.topics.length;
        topic = section.topics[idx]; tpat3TopicCounters[section.key]++; tpat3Counter++;
        subjectKey = "TPAT3"; sectionLabel = section.label; sectionKey = section.key;
      } else {
        const part = TGAT_PARTS[tgatCounter % TGAT_PARTS.length];
        const idx = tgatTopicCounters[part.key] % part.topics.length;
        topic = part.topics[idx]; tgatTopicCounters[part.key]++; tgatCounter++;
        subjectKey = "TGAT"; sectionLabel = part.label; sectionKey = part.key;
      }
      const baseQ = subjectKey === "TPAT3" ? 20 : 25;
      const baseT = subjectKey === "TPAT3" ? 24 : 28;
      questionCount = Math.round(baseQ * pf); timeMinutes = Math.round(baseT * pf);
    } else if (dayType === "timed") {
      subjectKey = "Mixed"; sectionLabel = "คละหมวด เน้น TPAT3 (สัดส่วน ~7:3)";
      topic = "Timed Practice คละหมวด";
      questionCount = Math.round(30 * pf); timeMinutes = Math.round(34 * pf);
    } else if (dayType === "recovery") {
      subjectKey = "Mixed"; sectionLabel = "ทบทวนเบา (Active Recovery)";
      topic = "ทบทวน Flashcard / Error Log / ข่าววิทย์-เทคโน";
      questionCount = 10; timeMinutes = 20;
    } else {
      const mock = getMockForDay(phase.id, mockCounter); mockCounter++;
      subjectKey = mock.subject; sectionLabel = mock.label; topic = mock.label;
      questionCount = mock.q; timeMinutes = mock.min; mockLabel = mock.label;
    }

    const phaseProgress = (dayNumber - phase.startDay) / Math.max(1, phase.endDay - phase.startDay);
    const scoreTarget = Math.round(phase.targetMin + (phase.targetMax - phase.targetMin) * phaseProgress);
    const todos = buildTodos({ dayType, subjectKey, topic, questionCount, timeMinutes, mockLabel, sectionLabel });

    days.push({
      dayNumber, date, dateStr: formatThaiDate(date), dateKey: dateKeyOf(date),
      phaseId: phase.id, phaseName: phase.th, weekNumber, cyclePos, dayType,
      subjectKey, sectionLabel, sectionKey, topic, questionCount, timeMinutes, scoreTarget, todos,
      isFinal30, isFinal7, daysToExam: 161 - dayNumber,
    });
  }
  return days;
}

function suggestAdjustment(entry, phase, prevEntry) {
  if (!entry) return "";
  const lowThreshold = phase.targetMin - 5;
  const msgs = [];
  if (entry.tpat3 !== "" && Number(entry.tpat3) < lowThreshold) msgs.push("TPAT3 ต่ำกว่าเป้ามาก → เพิ่มสัดส่วนเวลาให้ TPAT3 เกิน 70% ชั่วคราว และวิเคราะห์ Error Log หาสาเหตุหลัก");
  if (entry.tgat !== "" && Number(entry.tgat) < lowThreshold) msgs.push("TGAT ต่ำกว่าเป้า → เพิ่มวัน TGAT อีก 1 วัน/สัปดาห์ชั่วคราว อย่าปล่อยจนตก");
  if (prevEntry && entry.weakPoint && prevEntry.weakPoint && entry.weakPoint.trim() && entry.weakPoint.trim() === prevEntry.weakPoint.trim()) {
    msgs.push(`จุดอ่อน "${entry.weakPoint}" ซ้ำ 2 สัปดาห์ติด → ลดเวลาหมวดที่แข็งแรงลง โยกเวลาทั้งหมดมาแก้จุดนี้ 3–7 วัน`);
  }
  if (msgs.length === 0) {
    if (Number(entry.tgat) >= phase.targetMin && Number(entry.tpat3) >= phase.targetMin) msgs.push("อยู่ในเป้าหมายของ Phase นี้ → รักษาจังหวะเดิม เพิ่มความยาก/ความเร็วอีกขั้นสัปดาห์หน้า");
    else msgs.push("ใกล้เป้าหมาย → เพิ่มโจทย์ในหมวดที่ยังต่ำกว่าค่าเฉลี่ยอีก ~20%");
  }
  return msgs.join(" ");
}

/* ============================== SMALL UI ATOMS ============================== */
function Card({ children, style, className = "" }) {
  return <div className={`rounded-lg p-4 ${className}`} style={{ background: C.panel, border: `1px solid ${C.line}`, ...style }}>{children}</div>;
}
function Eyebrow({ children, color }) {
  return <div className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: "0.12em", color: color || C.textFaint }}>{children}</div>;
}
function Badge({ children, color }) {
  return <span className="font-mono inline-block rounded px-2 py-0.5" style={{ fontSize: 11, background: `${color}22`, color, border: `1px solid ${color}55` }}>{children}</span>;
}
function ProgressBar({ pct, color = C.amber, height = 6 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: C.panelRaised, height }}>
      <div className="h-full rounded-full" style={{ width: `${clamp(pct, 0, 100)}%`, background: color, transition: "width .4s" }} />
    </div>
  );
}
function CheckRow({ text, done, onToggle }) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-2.5 text-left py-2 active:opacity-70" style={{ minHeight: 40 }}>
      {done ? <CheckCircle2 size={20} style={{ color: C.success, flexShrink: 0, marginTop: 1 }} /> : <Circle size={20} style={{ color: C.textFaint, flexShrink: 0, marginTop: 1 }} />}
      <span className="font-body text-sm leading-snug" style={{ color: done ? C.textFaint : C.text, textDecoration: done ? "line-through" : "none" }}>{text}</span>
    </button>
  );
}
function ResourceHint({ sectionKey }) {
  const list = RESOURCES[sectionKey];
  if (!list || list.length === 0) return null;
  return (
    <div className="rounded-md p-2 mt-2" style={{ background: C.cyanSoft }}>
      <div className="flex items-center gap-1 mb-1"><PlayCircle size={12} style={{ color: C.cyan }} /><span className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.08em", color: C.cyan }}>แหล่งเรียนแนะนำ</span></div>
      {list.map((r, i) => (
        <div key={i} className="text-xs mb-1 last:mb-0" style={{ color: C.textMuted }}>
          <span className="font-semibold" style={{ color: C.text }}>{r.name}</span> — {r.desc}
        </div>
      ))}
    </div>
  );
}
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={18} style={{ color: C.amber }} />}
      <div>
        <div className="font-display font-semibold" style={{ fontSize: 16, color: C.text }}>{title}</div>
        {subtitle && <div className="text-xs" style={{ color: C.textMuted }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* ============================== SIGNATURE ELEMENT: PHASE RAIL ============================== */
function PhaseRail({ todayNum }) {
  const pos = clamp(((todayNum - 1) / TOTAL_DAYS) * 100, 0, 100);
  return (
    <div className="w-full">
      <div className="flex w-full rounded overflow-hidden relative" style={{ height: 12 }}>
        {PHASES.map((p) => {
          const widthPct = ((p.endDay - p.startDay + 1) / TOTAL_DAYS) * 100;
          const isCurrent = todayNum >= p.startDay && todayNum <= p.endDay;
          return <div key={p.id} style={{ width: `${widthPct}%`, background: isCurrent ? C.amber : C.panelRaised, borderRight: `2px solid ${C.bg}` }} />;
        })}
      </div>
      <div className="relative" style={{ height: 14 }}>
        <div className="absolute" style={{ left: `${pos}%`, transform: "translateX(-50%)", top: -2 }}>
          <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${C.text}` }} />
        </div>
      </div>
      <div className="flex w-full">
        {PHASES.map((p) => {
          const widthPct = ((p.endDay - p.startDay + 1) / TOTAL_DAYS) * 100;
          const isCurrent = todayNum >= p.startDay && todayNum <= p.endDay;
          return (
            <div key={p.id} style={{ width: `${widthPct}%` }} className="text-center px-0.5">
              <div className="font-mono" style={{ fontSize: 10, color: isCurrent ? C.amber : C.textFaint }}>P{p.id}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */
function DashboardView({ curriculum, todayNum, checklist, toggleTodo, setView, setSelectedDay }) {
  const today = curriculum[clamp(todayNum, 1, TOTAL_DAYS) - 1];
  const phase = getPhase(today.dayNumber);
  const beforeStart = todayNum < 1;
  const afterEnd = todayNum > TOTAL_DAYS;
  const doneCount = Object.values(checklist[today.dayNumber] || {}).filter(Boolean).length;
  const completedDays = useMemo(() => curriculum.filter((d) => {
    const st = checklist[d.dayNumber]; if (!st) return false;
    return Object.values(st).filter(Boolean).length >= d.todos.length;
  }).length, [curriculum, checklist]);

  return (
    <div className="flex flex-col gap-4">
      <Card style={{ background: `linear-gradient(135deg, ${C.panel}, ${C.panelRaised})` }}>
        <Eyebrow color={C.amber}>MISSION · สจล. วิศวกรรมคอมพิวเตอร์และความมั่นคงปลอดภัยไซเบอร์</Eyebrow>
        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="font-display font-bold" style={{ fontSize: 34, lineHeight: 1, color: C.amber }}>D-{Math.max(0, 161 - clamp(todayNum, 1, 161))}</div>
            <div className="text-xs mt-1" style={{ color: C.textMuted }}>วันสอบ TGAT/TPAT2-5: 30 ม.ค. – 1 ก.พ. 2570</div>
          </div>
          <div className="text-right">
            <div className="font-mono" style={{ fontSize: 12, color: C.text }}>วันที่ {clamp(todayNum, 1, TOTAL_DAYS)}/{TOTAL_DAYS}</div>
            <div className="text-xs" style={{ color: C.textMuted }}>Phase {phase.id} · {phase.th}</div>
          </div>
        </div>
        <div className="mt-3"><PhaseRail todayNum={clamp(todayNum, 1, TOTAL_DAYS)} /></div>
      </Card>

      {(today.isFinal7) && (
        <Card style={{ borderColor: C.danger }}>
          <div className="flex items-center gap-2"><AlertTriangle size={16} style={{ color: C.danger }} /><span className="font-semibold text-sm" style={{ color: C.danger }}>โค้งสุดท้าย 7 วัน</span></div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>เข้าสู่สัปดาห์สุดท้ายก่อนสอบ — เน้น Mock เต็มรูปแบบ + ซ่อมจุดอ่อน ห้ามอ่านเนื้อหาใหม่หนัก ดูตาราง 7 วันสุดท้ายในเมนู "เพิ่มเติม"</div>
        </Card>
      )}
      {(today.isFinal30 && !today.isFinal7) && (
        <Card style={{ borderColor: C.amber }}>
          <div className="flex items-center gap-2"><Flame size={16} style={{ color: C.amber }} /><span className="font-semibold text-sm" style={{ color: C.amber }}>ช่วง 30 วันสุดท้าย</span></div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>เพิ่มความถี่ Full Mock เป็น 2 ครั้ง/สัปดาห์ตามแผนแล้วอัตโนมัติ</div>
        </Card>
      )}

      {beforeStart ? (
        <Card><div className="text-sm" style={{ color: C.textMuted }}>แผนเริ่ม 23 ส.ค. 2569 — ยังไม่ถึงวันเริ่ม</div></Card>
      ) : afterEnd ? (
        <Card><div className="text-sm" style={{ color: C.success }}>ครบ 160 วันแล้ว ถึงเวลาลงสนามจริง โชคดีวันสอบ! 🎯</div></Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Eyebrow color={SUBJECT_COLOR[today.subjectKey]}>TODAY'S BRIEFING · {today.dateStr}</Eyebrow>
            <Badge color={DAY_TYPE_META[today.dayType].color}>{DAY_TYPE_META[today.dayType].label}</Badge>
          </div>
          <div className="font-display font-semibold" style={{ fontSize: 17, color: C.text }}>{today.topic}</div>
          <div className="text-xs mb-1" style={{ color: C.textMuted }}>{today.sectionLabel}</div>
          <div className="flex items-center gap-3 mt-2 mb-3">
            <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><Target size={13} /> เป้า {today.scoreTarget}%</span>
            {today.questionCount > 0 && <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><ListChecks size={13} /> {today.questionCount} ข้อ</span>}
            {today.timeMinutes > 0 && <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><Clock size={13} /> {today.timeMinutes} นาที</span>}
          </div>
          <div className="rounded-md p-2" style={{ background: C.panelRaised }}>
            {today.todos.map((t, i) => (
              <CheckRow key={i} text={t} done={!!(checklist[today.dayNumber] || {})[i]} onToggle={() => toggleTodo(today.dayNumber, i)} />
            ))}
          </div>
          {today.sectionKey && <ResourceHint sectionKey={today.sectionKey} />}
          <div className="text-xs mt-2" style={{ color: C.textFaint }}>{doneCount}/{today.todos.length} ทำแล้ว</div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <Eyebrow>ความคืบหน้ารวม</Eyebrow>
          <div className="font-display font-bold" style={{ fontSize: 24, color: C.text }}>{completedDays}<span className="text-sm font-normal" style={{ color: C.textFaint }}>/{TOTAL_DAYS}</span></div>
          <div className="mt-1"><ProgressBar pct={(completedDays / TOTAL_DAYS) * 100} color={C.success} /></div>
        </Card>
        <Card>
          <Eyebrow>ความคืบหน้า Phase {phase.id}</Eyebrow>
          <div className="font-display font-bold" style={{ fontSize: 24, color: C.text }}>{clamp(todayNum - phase.startDay + 1, 0, 999)}<span className="text-sm font-normal" style={{ color: C.textFaint }}>/{phase.endDay - phase.startDay + 1} วัน</span></div>
          <div className="mt-1"><ProgressBar pct={((todayNum - phase.startDay + 1) / (phase.endDay - phase.startDay + 1)) * 100} color={C.amber} /></div>
        </Card>
      </div>

      <button onClick={() => { setSelectedDay(today.dayNumber); setView("calendar"); }} className="text-sm font-medium flex items-center justify-center gap-1 py-2.5 rounded-lg active:opacity-70" style={{ color: C.bg, background: C.amber }}>
        ดูปฏิทินเต็ม 160 วัน <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ============================== CALENDAR ============================== */
function DayCard({ day, checklist, toggleTodo, expanded, onExpand }) {
  const st = checklist[day.dayNumber] || {};
  const doneCount = Object.values(st).filter(Boolean).length;
  const isDone = doneCount >= day.todos.length && day.todos.length > 0;
  return (
    <div className="rounded-md mb-2 overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.panel }}>
      <button onClick={onExpand} className="w-full flex items-center justify-between p-3 text-left active:opacity-80">
        <div className="flex items-center gap-2.5 min-w-0">
          {isDone ? <CheckCircle2 size={18} style={{ color: C.success, flexShrink: 0 }} /> : <Circle size={18} style={{ color: C.textFaint, flexShrink: 0 }} />}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono" style={{ fontSize: 11, color: C.textFaint }}>D{day.dayNumber}</span>
              <span className="text-xs" style={{ color: C.textMuted }}>{day.dateStr}</span>
              <Badge color={DAY_TYPE_META[day.dayType].color}>{DAY_TYPE_META[day.dayType].label}</Badge>
            </div>
            <div className="text-sm truncate mt-0.5" style={{ color: C.text }}>{day.topic}</div>
          </div>
        </div>
        <ChevronDown size={16} style={{ color: C.textFaint, transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
      </button>
      {expanded && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><Target size={12} /> เป้า {day.scoreTarget}%</span>
            {day.questionCount > 0 && <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><ListChecks size={12} /> {day.questionCount} ข้อ</span>}
            {day.timeMinutes > 0 && <span className="flex items-center gap-1 text-xs font-mono" style={{ color: C.textMuted }}><Clock size={12} /> {day.timeMinutes} นาที</span>}
          </div>
          <div className="rounded p-1.5" style={{ background: C.panelRaised }}>
            {day.todos.map((t, i) => <CheckRow key={i} text={t} done={!!st[i]} onToggle={() => toggleTodo(day.dayNumber, i)} />)}
          </div>
          {day.sectionKey && <ResourceHint sectionKey={day.sectionKey} />}
        </div>
      )}
    </div>
  );
}

function CalendarView({ curriculum, checklist, toggleTodo, todayNum, selectedDay, setSelectedDay }) {
  const weeksTotal = Math.ceil(TOTAL_DAYS / 7);
  const todayWeek = Math.ceil(clamp(todayNum, 1, TOTAL_DAYS) / 7);
  const [expandedWeek, setExpandedWeek] = useState(todayWeek);
  const [expandedDay, setExpandedDay] = useState(selectedDay || null);

  useEffect(() => { if (selectedDay) { setExpandedWeek(Math.ceil(selectedDay / 7)); setExpandedDay(selectedDay); setSelectedDay(null); } }, [selectedDay]);

  const weeks = useMemo(() => {
    const arr = [];
    for (let w = 1; w <= weeksTotal; w++) arr.push(curriculum.filter((d) => d.weekNumber === w));
    return arr;
  }, [curriculum, weeksTotal]);

  return (
    <div className="flex flex-col gap-2">
      <SectionHeader icon={Calendar} title="ปฏิทิน 160 วัน" subtitle="23 ส.ค. 2569 → 29 ม.ค. 2570" />
      <button onClick={() => { setExpandedWeek(todayWeek); setExpandedDay(clamp(todayNum, 1, TOTAL_DAYS)); }} className="self-start text-xs font-mono px-2.5 py-1.5 rounded mb-2 active:opacity-70" style={{ background: C.amberSoft, color: C.amber, border: `1px solid ${C.amber}55` }}>
        ไปที่วันนี้ (D{clamp(todayNum, 1, TOTAL_DAYS)})
      </button>
      {weeks.map((weekDays, wi) => {
        const w = wi + 1;
        const isOpen = expandedWeek === w;
        const first = weekDays[0], last = weekDays[weekDays.length - 1];
        const wDone = weekDays.filter((d) => { const st = checklist[d.dayNumber]; return st && Object.values(st).filter(Boolean).length >= d.todos.length; }).length;
        return (
          <div key={w} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
            <button onClick={() => setExpandedWeek(isOpen ? null : w)} className="w-full flex items-center justify-between p-3 active:opacity-80" style={{ background: isOpen ? C.panelRaised : C.panel }}>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-sm" style={{ color: C.text }}>สัปดาห์ {w}</span>
                <span className="text-xs" style={{ color: C.textFaint }}>{first.dateStr} – {last.dateStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: C.textFaint }}>{wDone}/{weekDays.length}</span>
                <ChevronDown size={16} style={{ color: C.textFaint, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>
            </button>
            {isOpen && (
              <div className="p-2" style={{ background: C.bg }}>
                {weekDays.map((d) => <DayCard key={d.dayNumber} day={d} checklist={checklist} toggleTodo={toggleTodo} expanded={expandedDay === d.dayNumber} onExpand={() => setExpandedDay(expandedDay === d.dayNumber ? null : d.dayNumber)} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== WEEKLY TRACKER ============================== */
function WeeklyTrackerView({ curriculum, weekly, persistWeekly }) {
  const weeksTotal = Math.ceil(TOTAL_DAYS / 7);
  const [editingWeek, setEditingWeek] = useState(null);
  const [form, setForm] = useState({ tgat: "", tpat3: "", weakPoint: "", errorCount: "", accuracy: "" });

  function openEdit(w) {
    const existing = weekly[w] || {};
    setForm({ tgat: existing.tgat ?? "", tpat3: existing.tpat3 ?? "", weakPoint: existing.weakPoint ?? "", errorCount: existing.errorCount ?? "", accuracy: existing.accuracy ?? "" });
    setEditingWeek(w);
  }
  function save() {
    const next = { ...weekly, [editingWeek]: { ...form } };
    persistWeekly(next);
    setEditingWeek(null);
  }

  const chartData = useMemo(() => {
    const rows = [];
    for (let w = 1; w <= weeksTotal; w++) {
      const e = weekly[w];
      if (e && (e.tgat !== "" || e.tpat3 !== "")) rows.push({ week: `W${w}`, TGAT: e.tgat === "" ? null : Number(e.tgat), TPAT3: e.tpat3 === "" ? null : Number(e.tpat3) });
    }
    return rows;
  }, [weekly, weeksTotal]);

  const inputStyle = { background: C.panelRaised, border: `1px solid ${C.lineLight}`, color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 14, width: "100%" };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader icon={BarChart3} title="ระบบวัดผลรายสัปดาห์" subtitle="กรอกทุกสัปดาห์หลัง Weekly Mock" />
      {chartData.length >= 2 && (
        <Card>
          <Eyebrow>แนวโน้มคะแนน (เป้าหมาย 90)</Eyebrow>
          <div style={{ width: "100%", height: 180 }} className="mt-2">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.line} strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fill: C.textFaint, fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: C.textFaint, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: C.panelRaised, border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={90} stroke={C.success} strokeDasharray="4 4" label={{ value: "90", fill: C.success, fontSize: 10, position: "right" }} />
                <Line type="monotone" dataKey="TGAT" stroke={C.violet} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="TPAT3" stroke={C.amber} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {Array.from({ length: weeksTotal }, (_, i) => i + 1).map((w) => {
          const e = weekly[w];
          const filled = e && (e.tgat !== "" || e.tpat3 !== "");
          const weekDays = curriculum.filter((d) => d.weekNumber === w);
          const phase = getPhase(weekDays[0].dayNumber);
          const suggestion = filled ? suggestAdjustment({ tgat: e.tgat || 0, tpat3: e.tpat3 || 0, weakPoint: e.weakPoint }, phase, weekly[w - 1]) : "";
          return (
            <Card key={w} style={{ padding: 12 }}>
              <button onClick={() => openEdit(w)} className="w-full flex items-center justify-between active:opacity-70">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm" style={{ color: C.text }}>สัปดาห์ {w}</span>
                    <span className="text-xs" style={{ color: C.textFaint }}>{weekDays[0].dateStr}</span>
                  </div>
                  {filled ? (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono" style={{ color: C.violet }}>TGAT {e.tgat || "-"}</span>
                      <span className="text-xs font-mono" style={{ color: C.amber }}>TPAT3 {e.tpat3 || "-"}</span>
                      {e.weakPoint && <span className="text-xs" style={{ color: C.textMuted }}>จุดอ่อน: {e.weakPoint}</span>}
                    </div>
                  ) : <div className="text-xs mt-1" style={{ color: C.textFaint }}>ยังไม่กรอก · เป้า Phase {phase.id}: {phase.targetMin}-{phase.targetMax}</div>}
                </div>
                <Plus size={16} style={{ color: C.textFaint }} />
              </button>
              {suggestion && (
                <div className="mt-2 text-xs rounded p-2 flex gap-1.5" style={{ background: C.amberSoft, color: C.amber }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{suggestion}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {editingWeek && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setEditingWeek(null)}>
          <div className="w-full max-w-lg rounded-t-xl p-4" style={{ background: C.panel, border: `1px solid ${C.line}`, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-semibold" style={{ color: C.text }}>สัปดาห์ {editingWeek}</div>
              <button onClick={() => setEditingWeek(null)}><X size={20} style={{ color: C.textFaint }} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs" style={{ color: C.textMuted }}>คะแนน TGAT (0-100)</label><input type="number" style={inputStyle} value={form.tgat} onChange={(e) => setForm({ ...form, tgat: e.target.value })} /></div>
              <div><label className="text-xs" style={{ color: C.textMuted }}>คะแนน TPAT3 (0-100)</label><input type="number" style={inputStyle} value={form.tpat3} onChange={(e) => setForm({ ...form, tpat3: e.target.value })} /></div>
              <div><label className="text-xs" style={{ color: C.textMuted }}>จุดอ่อนหลักของสัปดาห์นี้</label><input type="text" style={inputStyle} value={form.weakPoint} onChange={(e) => setForm({ ...form, weakPoint: e.target.value })} placeholder="เช่น มิติสัมพันธ์การพับกล่อง" /></div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-xs" style={{ color: C.textMuted }}>จำนวนข้อผิด</label><input type="number" style={inputStyle} value={form.errorCount} onChange={(e) => setForm({ ...form, errorCount: e.target.value })} /></div>
                <div className="flex-1"><label className="text-xs" style={{ color: C.textMuted }}>Accuracy (%)</label><input type="number" style={inputStyle} value={form.accuracy} onChange={(e) => setForm({ ...form, accuracy: e.target.value })} /></div>
              </div>
              <button onClick={save} className="mt-1 py-2.5 rounded-lg font-medium text-sm" style={{ background: C.amber, color: C.bg }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== ERROR LOG ============================== */
function ErrorLogView({ curriculum, todayNum, errors, persistErrors }) {
  const today = curriculum[clamp(todayNum, 1, TOTAL_DAYS) - 1];
  const [form, setForm] = useState({ subject: "TPAT3", category: ERROR_CATEGORIES[0], note: "" });

  function addEntry() {
    const entry = { id: `${Date.now()}`, date: today.dateStr, dayNumber: today.dayNumber, subject: form.subject, category: form.category, note: form.note.trim() };
    persistErrors([entry, ...errors]);
    setForm({ ...form, note: "" });
  }
  function removeEntry(id) { persistErrors(errors.filter((e) => e.id !== id)); }

  const counts = useMemo(() => {
    const c = {}; ERROR_CATEGORIES.forEach((cat) => (c[cat] = 0));
    errors.forEach((e) => { if (c[e.category] !== undefined) c[e.category]++; });
    return c;
  }, [errors]);
  const maxCount = Math.max(1, ...Object.values(counts));

  const inputStyle = { background: C.panelRaised, border: `1px solid ${C.lineLight}`, color: C.text, borderRadius: 6, padding: "8px 10px", fontSize: 14, width: "100%" };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader icon={AlertTriangle} title="Error Log" subtitle="บันทึกทุกข้อผิด วิเคราะห์ทุกสัปดาห์ว่าแพ้เพราะอะไร" />

      <Card>
        <Eyebrow>เพิ่มข้อผิดวันนี้</Eyebrow>
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex gap-2">
            {["TPAT3", "TGAT"].map((s) => (
              <button key={s} onClick={() => setForm({ ...form, subject: s })} className="flex-1 py-2 rounded text-sm font-medium" style={{ background: form.subject === s ? SUBJECT_COLOR[s] : C.panelRaised, color: form.subject === s ? C.bg : C.textMuted }}>{s}</button>
            ))}
          </div>
          <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {ERROR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" style={inputStyle} placeholder="โน้ตสั้น ๆ (ไม่บังคับ)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button onClick={addEntry} className="py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-1" style={{ background: C.amber, color: C.bg }}><Plus size={16} /> บันทึกข้อผิด</button>
        </div>
      </Card>

      {errors.length > 0 && (
        <Card>
          <Eyebrow>สรุปตามประเภท ({errors.length} รายการ)</Eyebrow>
          <div className="flex flex-col gap-1.5 mt-2">
            {ERROR_CATEGORIES.filter((c) => counts[c] > 0).sort((a, b) => counts[b] - counts[a]).map((c) => (
              <div key={c} className="flex items-center gap-2">
                <span className="text-xs w-24 flex-shrink-0 truncate" style={{ color: C.textMuted }}>{c}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: C.panelRaised }}>
                  <div style={{ width: `${(counts[c] / maxCount) * 100}%`, height: "100%", background: C.danger }} />
                </div>
                <span className="text-xs font-mono w-5 text-right" style={{ color: C.textFaint }}>{counts[c]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {errors.length === 0 && <div className="text-sm text-center py-6" style={{ color: C.textFaint }}>ยังไม่มีบันทึกข้อผิด — เริ่มบันทึกทุกครั้งที่ทำโจทย์</div>}
        {errors.map((e) => (
          <div key={e.id} className="rounded-md p-3 flex items-start justify-between gap-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge color={SUBJECT_COLOR[e.subject]}>{e.subject}</Badge>
                <Badge color={C.danger}>{e.category}</Badge>
                <span className="text-xs" style={{ color: C.textFaint }}>{e.date}</span>
              </div>
              {e.note && <div className="text-sm mt-1" style={{ color: C.text }}>{e.note}</div>}
            </div>
            <button onClick={() => removeEntry(e.id)}><Trash2 size={15} style={{ color: C.textFaint }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== MORE VIEW ============================== */
function Accordion({ title, icon: Icon, open, onToggle, children }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5 active:opacity-80" style={{ background: open ? C.panelRaised : C.panel }}>
        <div className="flex items-center gap-2"><Icon size={16} style={{ color: C.amber }} /><span className="font-display font-semibold text-sm" style={{ color: C.text }}>{title}</span></div>
        <ChevronDown size={16} style={{ color: C.textFaint, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && <div className="p-4" style={{ background: C.bg }}>{children}</div>}
    </div>
  );
}

function MoreView({ checklist, toggleTodo }) {
  const [open, setOpen] = useState("analysis");
  const toggle = (k) => setOpen(open === k ? null : k);
  const examSt = checklist["examday"] || {};

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader icon={MoreHorizontal} title="เพิ่มเติม" subtitle="วิเคราะห์สถานการณ์ · กฎการปรับแผน · โค้งสุดท้าย · วันสอบ" />

      <Accordion title="160 วันพอไหมสำหรับ 90+?" icon={Info} open={open === "analysis"} onToggle={() => toggle("analysis")}>
        <div className="text-sm leading-relaxed" style={{ color: C.text }}>
          <div className="font-semibold mb-2" style={{ color: C.success }}>สรุปสั้น: พอ — แต่ต้องวินัยเต็มร้อย ไม่มีที่ว่างให้หย่อน</div>
          <div className="font-semibold mt-3 mb-1" style={{ color: C.text }}>จุดแข็งของไทม์ไลน์นี้</div>
          <ul className="list-disc ml-4 space-y-1" style={{ color: C.textMuted }}>
            <li>TPAT3 กว่าครึ่ง (45/70 ข้อ) เป็นทักษะเชิงเหตุผล/มิติสัมพันธ์ที่ฝึกได้จริงด้วยปริมาณโจทย์ ไม่ใช่เนื้อหาที่ต้องท่องจำมาก</li>
            <li>เนื้อหาคณิต-ฟิสิกส์ที่ใช้จำกัดอยู่ระดับ ม.ต้น-ม.ปลาย ไม่ใช่เนื้อหาใหม่ทั้งหมด</li>
            <li>160 วัน ≈ 23 สัปดาห์ พอสำหรับวงจร Learn→Drill→Timed→Mock→Fix หลายรอบ (ปูพื้นฐานสั้นลง 1 สัปดาห์ แต่ Phase 2-5 ที่ตัดสินผลจริงยังยาวเท่าเดิมทุกวัน)</li>
          </ul>
          <div className="font-semibold mt-3 mb-1" style={{ color: C.danger }}>จุดเสี่ยงที่ต้องระวัง (พูดตรง ๆ)</div>
          <ul className="list-disc ml-4 space-y-1" style={{ color: C.textMuted }}>
            <li>TGAT3 ให้คะแนนแบบ 0/0.25/0.5/0.75/1 ต่อข้อ เป็นข้อสอบเชิงสถานการณ์ วัดการตัดสินใจไม่ใช่ถูก-ผิดตรงไปตรงมา ฝึกให้ชัวร์ 90+ ยากกว่าหมวดตรรกะล้วน ต้องซ้อมจับรูปแบบคำตอบจากโจทย์เก่าให้มาก</li>
            <li>ถ้าพื้นฐานภาษาอังกฤษ (TGAT1) ยังไม่แข็ง ต้องสร้าง Vocabulary ทุกวันแบบไม่ขาดจริง ๆ</li>
            <li>90+ ที่ "นิ่ง" ต้องรักษาระดับได้ใน Full Mock หลายชุดติดกันช่วงโค้งท้าย — ถ้า Phase 1-2 หย่อน จะไม่เหลือเวลาซ้อมซ้ำพอ</li>
          </ul>
          <div className="rounded-md p-3 mt-3" style={{ background: C.amberSoft }}>
            <div className="font-semibold text-xs mb-1" style={{ color: C.amber }}>ข้อมูลกลยุทธ์สำคัญ</div>
            <div className="text-xs" style={{ color: C.text }}>จากเกณฑ์ ผลงาน 10% + TGAT 20% + TPAT3 70% — คะแนน TPAT3 ที่เพิ่มขึ้น 1 แต้ม มีผลต่อคะแนนรวม <b>3.5 เท่า</b> ของ TGAT ที่เพิ่ม 1 แต้ม ถ้าเวลาชนกัน ให้เลือกฝึก TPAT3 ก่อนเสมอ</div>
          </div>
        </div>
      </Accordion>

      <Accordion title="5 Phase ของแผน" icon={TrendingUp} open={open === "phases"} onToggle={() => toggle("phases")}>
        <div className="flex flex-col gap-3">
          {PHASES.map((p) => (
            <div key={p.id} className="pb-3" style={{ borderBottom: p.id < 5 ? `1px solid ${C.line}` : "none" }}>
              <div className="flex items-center gap-2"><span className="font-mono text-xs" style={{ color: C.amber }}>P{p.id}</span><span className="font-semibold text-sm" style={{ color: C.text }}>{p.th}</span><span className="text-xs" style={{ color: C.textFaint }}>เป้า {p.targetMin}-{p.targetMax}</span></div>
              <div className="text-xs mt-0.5" style={{ color: C.textFaint }}>Day {p.startDay}-{p.endDay} ({p.endDay - p.startDay + 1} วัน)</div>
              <div className="text-xs mt-1" style={{ color: C.textMuted }}>{p.rationale}</div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="กฎการปรับแผนตามคะแนน" icon={RefreshCw} open={open === "rules"} onToggle={() => toggle("rules")}>
        <div className="flex flex-col gap-2.5">
          {ADJUSTMENT_RULES.map((r, i) => (
            <div key={i} className="rounded-md p-2.5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
              <div className="text-xs font-semibold" style={{ color: C.amber }}>{r.situation}</div>
              <div className="text-xs mt-1" style={{ color: C.textMuted }}>{r.action}</div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="โค้งสุดท้าย: 30 วัน / 7 วัน" icon={Flame} open={open === "final"} onToggle={() => toggle("final")}>
        <div className="text-sm" style={{ color: C.text }}>
          <div className="font-semibold mb-1">30 วันสุดท้าย (31 ธ.ค. 69 – 29 ม.ค. 70)</div>
          <div className="text-xs mb-3" style={{ color: C.textMuted }}>Full Mock อย่างน้อย 2 ครั้ง/สัปดาห์ (ระบบเพิ่มวัน Mock พิเศษให้อัตโนมัติในปฏิทินแล้ว) วิเคราะห์ทุก Mock แบบละเอียด ห้ามดูแค่คะแนน</div>
          <div className="font-semibold mb-1">7 วันสุดท้าย (23–29 ม.ค. 70)</div>
          <div className="flex flex-col gap-1.5">
            {FINAL_WEEK_SCHEDULE.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-mono w-9 flex-shrink-0" style={{ color: C.danger }}>D-{7 - i}</span>
                <span style={{ color: C.textMuted }}>{d.sectionLabel}: {d.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion title="เช็กลิสต์วันสอบ" icon={ClipboardCheck} open={open === "examday"} onToggle={() => toggle("examday")}>
        <div className="rounded-md p-1.5" style={{ background: C.panel }}>
          {EXAM_DAY_CHECKLIST.map((t, i) => <CheckRow key={i} text={t} done={!!examSt[i]} onToggle={() => toggleTodo("examday", i)} />)}
        </div>
      </Accordion>

      <Accordion title="อ้างอิงโครงสร้างข้อสอบจริง" icon={GraduationCap} open={open === "ref"} onToggle={() => toggle("ref")}>
        <div className="text-xs" style={{ color: C.textMuted }}>
          <div className="font-semibold mb-1" style={{ color: C.violet }}>TGAT · รวม 300 คะแนน 200 ข้อ 180 นาที</div>
          {TGAT_PARTS.map((p) => <div key={p.key} className="mb-1">• {p.label}: {p.q} ข้อ / {p.min} นาที / {p.pt} คะแนน</div>)}
          <div className="font-semibold mt-3 mb-1" style={{ color: C.amber }}>TPAT3 · รวม 100 คะแนน 70 ข้อ 180 นาที</div>
          <div className="mb-1 italic">พาร์ท 1 การทดสอบความถนัดฯ (45 ข้อ/60 คะแนน)</div>
          {TPAT3_SECTIONS.filter((s) => s.part === 1).map((s) => <div key={s.key} className="mb-1 ml-2">• {s.label}: {s.q} ข้อ / {s.pt} คะแนน</div>)}
          <div className="mb-1 italic mt-1">พาร์ท 2 การทดสอบความคิดและความสนใจฯ (25 ข้อ/40 คะแนน)</div>
          {TPAT3_SECTIONS.filter((s) => s.part === 2).map((s) => <div key={s.key} className="mb-1 ml-2">• {s.label}: {s.q} ข้อ / {s.pt} คะแนน</div>)}
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="font-semibold mb-1" style={{ color: C.danger }}>อัปเดตสำคัญของ TCAS70</div>
            <div>• สอบ TGAT/TPAT2-5: 30 ม.ค. – 1 ก.พ. 2570 (กระจาย 3 วัน เช็กวัน-เวลาสอบจริงของตัวเองใน myTCAS)</div>
            <div>• ปีนี้สอบกระดาษล้วน (PBT) ทุกวิชา ยกเลิกระบบคอมพิวเตอร์ (CBT) ที่เคยใช้กับ TPAT3</div>
          </div>
        </div>
      </Accordion>

      <Accordion title="คลิป + ข้อสอบที่ต้องดูตลอด 160 วัน" icon={PlayCircle} open={open === "resources"} onToggle={() => toggle("resources")}>
        <div className="text-xs" style={{ color: C.textMuted }}>
          <a href={OFFICIAL_RESOURCE.url} target="_blank" rel="noopener noreferrer" className="block rounded-md p-3 mb-3" style={{ background: C.amberSoft, border: `1px solid ${C.amber}55` }}>
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: C.amber }}><ExternalLink size={12} /> {OFFICIAL_RESOURCE.name}</div>
            <div className="mt-1" style={{ color: C.text }}>{OFFICIAL_RESOURCE.desc}</div>
            <div className="mt-1 font-mono" style={{ color: C.amber, fontSize: 10 }}>{OFFICIAL_RESOURCE.url}</div>
          </a>
          <div className="mb-2" style={{ color: C.textFaint }}>เริ่มจากของจริงข้างบนก่อนเสมอ แล้วค่อยใช้ช่องติวฟรีด้านล่างเสริมความเข้าใจ + สะสมโจทย์ ระบบจะแปะแหล่งที่ตรงหัวข้อไว้ในการ์ดของแต่ละวันให้อัตโนมัติแล้ว แต่รวมไว้ที่นี่เผื่ออยากไล่ดูทีเดียวทั้งหมด</div>

          <div className="font-semibold mt-3 mb-1.5" style={{ color: C.amber }}>TPAT3 (Priority #1)</div>
          {TPAT3_SECTIONS.map((s) => (
            <div key={s.key} className="mb-2.5">
              <div className="text-xs font-medium mb-1" style={{ color: C.text }}>{s.short}</div>
              {(RESOURCES[s.key] || []).map((r, i) => (
                <div key={i} className="ml-2 mb-0.5">• <span style={{ color: C.text }}>{r.name}</span> — {r.desc}</div>
              ))}
            </div>
          ))}

          <div className="font-semibold mt-3 mb-1.5" style={{ color: C.violet }}>TGAT</div>
          {TGAT_PARTS.map((p) => (
            <div key={p.key} className="mb-2.5">
              <div className="text-xs font-medium mb-1" style={{ color: C.text }}>{p.short}</div>
              {(RESOURCES[p.key] || []).map((r, i) => (
                <div key={i} className="ml-2 mb-0.5">• <span style={{ color: C.text }}>{r.name}</span> — {r.desc}</div>
              ))}
            </div>
          ))}

          <div className="font-semibold mt-3 mb-1.5" style={{ color: C.cyan }}>คลังข้อสอบฟรี (ฝึกทำจริง)</div>
          {RESOURCES.examBanks.map((r, i) => (
            <div key={i} className="mb-1">
              • <span style={{ color: C.text }}>{r.name}</span> — {r.desc}
              {r.url && <div className="ml-3 font-mono" style={{ color: C.textFaint, fontSize: 10 }}>{r.url}</div>}
            </div>
          ))}
          <div className="mt-3 pt-3 text-xs" style={{ borderTop: `1px solid ${C.line}`, color: C.textFaint }}>
            ชื่อช่อง/เว็บด้านบนมาจากการค้นหาแหล่งที่ถูกแนะนำซ้ำๆ จากผู้เตรียมสอบจริงหลายแหล่งอิสระ ไม่ใช่การรับสปอนเซอร์ — แต่ละช่องปรับเนื้อหาปีต่อปี ให้เช็กว่าคลิปที่ดูอิงปีล่าสุด (69/70) ก่อนเชื่อ 100%
          </div>
        </div>
      </Accordion>
    </div>
  );
}

/* ============================== NAV ============================== */
function BottomNav({ view, setView }) {
  const items = [
    { key: "dashboard", label: "หน้าหลัก", icon: Home },
    { key: "calendar", label: "ปฏิทิน", icon: Calendar },
    { key: "weekly", label: "รายสัปดาห์", icon: BarChart3 },
    { key: "errorlog", label: "Error Log", icon: AlertTriangle },
    { key: "more", label: "เพิ่มเติม", icon: MoreHorizontal },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40" style={{ background: C.panel, borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex max-w-lg mx-auto">
        {items.map((it) => {
          const active = view === it.key;
          const Icon = it.icon;
          return (
            <button key={it.key} onClick={() => setView(it.key)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 active:opacity-70">
              <Icon size={20} style={{ color: active ? C.amber : C.textFaint }} />
              <span className="font-mono" style={{ fontSize: 9.5, color: active ? C.amber : C.textFaint }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
export default function App() {
  const curriculum = useMemo(() => generateCurriculum(), []);
  const todayNum = useMemo(() => getTodayDayNumber(), []);
  const [view, setView] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [weekly, setWeekly] = useState({});
  const [errors, setErrors] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    try { setChecklist(JSON.parse(localStorage.getItem("checklist-state") || "{}")); } catch { setChecklist({}); }
    try { setWeekly(JSON.parse(localStorage.getItem("weekly-tracker") || "{}")); } catch { setWeekly({}); }
    try { setErrors(JSON.parse(localStorage.getItem("error-log") || "[]")); } catch { setErrors([]); }
    setLoaded(true);
  }, []);

  const persistChecklist = useCallback((next) => {
    setChecklist(next);
    try { localStorage.setItem("checklist-state", JSON.stringify(next)); } catch (err) { console.error(err); }
  }, []);
  const persistWeekly = useCallback((next) => {
    setWeekly(next);
    try { localStorage.setItem("weekly-tracker", JSON.stringify(next)); } catch (err) { console.error(err); }
  }, []);
  const persistErrors = useCallback((next) => {
    setErrors(next);
    try { localStorage.setItem("error-log", JSON.stringify(next)); } catch (err) { console.error(err); }
  }, []);

  const toggleTodo = useCallback((dayKey, idx) => {
    setChecklist((prev) => {
      const dayState = { ...(prev[dayKey] || {}) };
      dayState[idx] = !dayState[idx];
      const next = { ...prev, [dayKey]: dayState };
      try { localStorage.setItem("checklist-state", JSON.stringify(next)); } catch (err) { console.error(err); }
      return next;
    });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body" style={{ background: C.bg, color: C.textMuted }}>
        <style>{FONT_CSS}</style>
        <div className="text-center">
          <Rocket size={28} style={{ color: C.amber, margin: "0 auto 8px" }} />
          <div className="text-sm font-mono">กำลังโหลดแผนพิชิต 90+...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body" style={{ background: C.bg, color: C.text }}>
      <style>{FONT_CSS}</style>
      <main className="pb-24 px-4 pt-4 max-w-lg mx-auto">
        {view === "dashboard" && <DashboardView curriculum={curriculum} todayNum={todayNum} checklist={checklist} toggleTodo={toggleTodo} setView={setView} setSelectedDay={setSelectedDay} />}
        {view === "calendar" && <CalendarView curriculum={curriculum} checklist={checklist} toggleTodo={toggleTodo} todayNum={todayNum} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />}
        {view === "weekly" && <WeeklyTrackerView curriculum={curriculum} weekly={weekly} persistWeekly={persistWeekly} />}
        {view === "errorlog" && <ErrorLogView curriculum={curriculum} todayNum={todayNum} errors={errors} persistErrors={persistErrors} />}
        {view === "more" && <MoreView checklist={checklist} toggleTodo={toggleTodo} />}
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}

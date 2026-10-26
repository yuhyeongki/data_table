import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 사용자(상담사/교사) 테이블
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('counselor'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 학생 정보 테이블
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  studentNumber: text('student_number').notNull(), // 학번 (예: 2026-10401)
  grade: integer('grade').notNull(), // 학년
  classNumber: integer('class_number').notNull(), // 반
  gender: text('gender').notNull(), // 남, 여
  birthDate: text('birth_date'),
  contact: text('contact'),
  parentContact: text('parent_contact'),
  guardianRelation: text('guardian_relation'), // 모, 부, 조부모 등
  riskLevel: text('risk_level').default('NORMAL').notNull(), // NORMAL(일반), ATTENTION(관심), CAUTION(주의), CRITICAL(위기/집중관리)
  academicStatus: text('academic_status').default('ENROLLED').notNull(), // ENROLLED, LEAVE, GRADUATED
  specialNotes: text('special_notes'),
  counselorUid: text('counselor_uid'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 상담 일지/이력 테이블
export const consultations = pgTable('consultations', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id')
    .references(() => students.id)
    .notNull(),
  counselorUid: text('counselor_uid').notNull(),
  counselorName: text('counselor_name').notNull(),
  consultationDate: text('consultation_date').notNull(), // YYYY-MM-DD
  startTime: text('start_time'), // HH:mm
  endTime: text('end_time'),
  durationMinutes: integer('duration_minutes').default(45),
  consultationType: text('consultation_type').notNull(), // REGULAR(정기), STUDENT_REQUEST(학생요청), PARENT(학부모), TEACHER_REFERRAL(교사의뢰), EMERGENCY(위기긴급)
  category: text('category').notNull(), // CAREER(진로), ACADEMIC(학업), RELATIONSHIP(교우관계), EMOTIONAL(심리정서), FAMILY(가정), BEHAVIOR(생활지도), HEALTH(건강), OTHER(기타)
  method: text('method').default('FACE_TO_FACE').notNull(), // FACE_TO_FACE, PHONE, ONLINE, VISIT
  topic: text('topic').notNull(),
  content: text('content').notNull(),
  studentSentiment: text('student_sentiment').default('NEUTRAL').notNull(), // VERY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, VERY_POSITIVE
  followUpPlan: text('follow_up_plan'),
  nextScheduleDate: text('next_schedule_date'), // YYYY-MM-DD
  confidentialityLevel: text('confidentiality_level').default('INTERNAL').notNull(), // PUBLIC, INTERNAL, RESTRICTED
  status: text('status').default('IN_PROGRESS').notNull(), // IN_PROGRESS, RESOLVED, REFERRED
  tags: text('tags'), // 콤마 구분 태그
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 관계 정의
export const usersRelations = relations(users, ({ many }) => ({
  consultations: many(consultations),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  student: one(students, {
    fields: [consultations.studentId],
    references: [students.id],
  }),
}));

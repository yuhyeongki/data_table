import { desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { consultations, students } from './schema.ts';

export interface CreateStudentInput {
  name: string;
  studentNumber: string;
  grade: number;
  classNumber: number;
  gender: string;
  birthDate?: string;
  contact?: string;
  parentContact?: string;
  guardianRelation?: string;
  riskLevel?: 'NORMAL' | 'ATTENTION' | 'CAUTION' | 'CRITICAL';
  academicStatus?: 'ENROLLED' | 'LEAVE' | 'GRADUATED';
  specialNotes?: string;
  counselorUid?: string;
}

export interface CreateConsultationInput {
  studentId: number;
  counselorUid: string;
  counselorName: string;
  consultationDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  consultationType: string;
  category: string;
  method?: string;
  topic: string;
  content: string;
  studentSentiment?: string;
  followUpPlan?: string;
  nextScheduleDate?: string;
  confidentialityLevel?: string;
  status?: string;
  tags?: string;
}

// 학생 목록 조회 (상담 건수 포함)
export async function getStudents() {
  try {
    const list = await db
      .select({
        id: students.id,
        name: students.name,
        studentNumber: students.studentNumber,
        grade: students.grade,
        classNumber: students.classNumber,
        gender: students.gender,
        birthDate: students.birthDate,
        contact: students.contact,
        parentContact: students.parentContact,
        guardianRelation: students.guardianRelation,
        riskLevel: students.riskLevel,
        academicStatus: students.academicStatus,
        specialNotes: students.specialNotes,
        counselorUid: students.counselorUid,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        consultationCount: sql<number>`count(${consultations.id})::int`,
        latestConsultationDate: sql<string | null>`max(${consultations.consultationDate})`,
      })
      .from(students)
      .leftJoin(consultations, eq(students.id, consultations.studentId))
      .groupBy(students.id)
      .orderBy(students.grade, students.classNumber, students.name);

    return list;
  } catch (error) {
    console.error('getStudents error:', error);
    throw new Error('학생 목록을 조회하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 학생 상세 정보 및 상담 이력
export async function getStudentDetail(id: number) {
  try {
    const studentList = await db.select().from(students).where(eq(students.id, id));
    if (studentList.length === 0) {
      return null;
    }
    const student = studentList[0];

    const studentConsultations = await db
      .select()
      .from(consultations)
      .where(eq(consultations.studentId, id))
      .orderBy(desc(consultations.consultationDate), desc(consultations.id));

    return {
      ...student,
      consultations: studentConsultations,
    };
  } catch (error) {
    console.error('getStudentDetail error:', error);
    throw new Error('학생 상세 정보를 조회하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 신규 학생 등록
export async function createStudent(input: CreateStudentInput) {
  try {
    const [inserted] = await db
      .insert(students)
      .values({
        name: input.name,
        studentNumber: input.studentNumber,
        grade: input.grade,
        classNumber: input.classNumber,
        gender: input.gender,
        birthDate: input.birthDate || null,
        contact: input.contact || null,
        parentContact: input.parentContact || null,
        guardianRelation: input.guardianRelation || null,
        riskLevel: input.riskLevel || 'NORMAL',
        academicStatus: input.academicStatus || 'ENROLLED',
        specialNotes: input.specialNotes || null,
        counselorUid: input.counselorUid || null,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('createStudent error:', error);
    throw new Error('학생 등록에 실패했습니다.', { cause: error });
  }
}

// 학생 정보 수정
export async function updateStudent(id: number, input: Partial<CreateStudentInput>) {
  try {
    const [updated] = await db
      .update(students)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    return updated;
  } catch (error) {
    console.error('updateStudent error:', error);
    throw new Error('학생 정보를 수정하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 학생 삭제
export async function deleteStudent(id: number) {
  try {
    // 먼저 학생의 상담 기록 삭제
    await db.delete(consultations).where(eq(consultations.studentId, id));
    const [deleted] = await db.delete(students).where(eq(students.id, id)).returning();
    return deleted;
  } catch (error) {
    console.error('deleteStudent error:', error);
    throw new Error('학생 정보를 삭제하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 전체 상담 목록 (학생 정보 조인)
export async function getConsultations() {
  try {
    const records = await db
      .select({
        id: consultations.id,
        studentId: consultations.studentId,
        studentName: students.name,
        studentNumber: students.studentNumber,
        grade: students.grade,
        classNumber: students.classNumber,
        riskLevel: students.riskLevel,
        counselorUid: consultations.counselorUid,
        counselorName: consultations.counselorName,
        consultationDate: consultations.consultationDate,
        startTime: consultations.startTime,
        endTime: consultations.endTime,
        durationMinutes: consultations.durationMinutes,
        consultationType: consultations.consultationType,
        category: consultations.category,
        method: consultations.method,
        topic: consultations.topic,
        content: consultations.content,
        studentSentiment: consultations.studentSentiment,
        followUpPlan: consultations.followUpPlan,
        nextScheduleDate: consultations.nextScheduleDate,
        confidentialityLevel: consultations.confidentialityLevel,
        status: consultations.status,
        tags: consultations.tags,
        createdAt: consultations.createdAt,
      })
      .from(consultations)
      .innerJoin(students, eq(consultations.studentId, students.id))
      .orderBy(desc(consultations.consultationDate), desc(consultations.id));

    return records;
  } catch (error) {
    console.error('getConsultations error:', error);
    throw new Error('상담 이력을 조회하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 신규 상담 등록
export async function createConsultation(input: CreateConsultationInput) {
  try {
    const [inserted] = await db
      .insert(consultations)
      .values({
        studentId: input.studentId,
        counselorUid: input.counselorUid,
        counselorName: input.counselorName,
        consultationDate: input.consultationDate,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        durationMinutes: input.durationMinutes || 45,
        consultationType: input.consultationType,
        category: input.category,
        method: input.method || 'FACE_TO_FACE',
        topic: input.topic,
        content: input.content,
        studentSentiment: input.studentSentiment || 'NEUTRAL',
        followUpPlan: input.followUpPlan || null,
        nextScheduleDate: input.nextScheduleDate || null,
        confidentialityLevel: input.confidentialityLevel || 'INTERNAL',
        status: input.status || 'IN_PROGRESS',
        tags: input.tags || null,
      })
      .returning();

    // 학생 테이블의 updatedAt 갱신
    await db
      .update(students)
      .set({ updatedAt: new Date() })
      .where(eq(students.id, input.studentId));

    return inserted;
  } catch (error) {
    console.error('createConsultation error:', error);
    throw new Error('상담 일지를 등록하는 중 오류가 발생했습니다.', { cause: error });
  }
}

// 상담 일지 수정
export async function updateConsultation(id: number, input: Partial<CreateConsultationInput>) {
  try {
    const [updated] = await db
      .update(consultations)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(consultations.id, id))
      .returning();

    return updated;
  } catch (error) {
    console.error('updateConsultation error:', error);
    throw new Error('상담 일지 수정에 실패했습니다.', { cause: error });
  }
}

// 상담 일지 삭제
export async function deleteConsultation(id: number) {
  try {
    const [deleted] = await db.delete(consultations).where(eq(consultations.id, id)).returning();
    return deleted;
  } catch (error) {
    console.error('deleteConsultation error:', error);
    throw new Error('상담 일지 삭제에 실패했습니다.', { cause: error });
  }
}

// 대시보드 통계 데이터 집계
export async function getDashboardStats() {
  try {
    const allStudents = await db.select().from(students);
    const allConsultations = await getConsultations();

    // 위험군 통계
    const riskCounts = {
      NORMAL: 0,
      ATTENTION: 0,
      CAUTION: 0,
      CRITICAL: 0,
    };
    allStudents.forEach((s) => {
      if (s.riskLevel in riskCounts) {
        riskCounts[s.riskLevel as keyof typeof riskCounts]++;
      } else {
        riskCounts.NORMAL++;
      }
    });

    // 상담 분야(카테고리) 통계
    const categoryCounts: Record<string, number> = {};
    const sentimentCounts: Record<string, number> = {
      VERY_POSITIVE: 0,
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
      VERY_NEGATIVE: 0,
    };
    const methodCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    allConsultations.forEach((c) => {
      // 카테고리
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      // 심리 정서
      if (c.studentSentiment in sentimentCounts) {
        sentimentCounts[c.studentSentiment]++;
      }
      // 방식
      methodCounts[c.method] = (methodCounts[c.method] || 0) + 1;
      // 유형
      typeCounts[c.consultationType] = (typeCounts[c.consultationType] || 0) + 1;
    });

    // 다가오는 상담 일정
    const today = new Date().toISOString().split('T')[0];
    const upcomingSchedules = allConsultations
      .filter((c) => c.nextScheduleDate && c.nextScheduleDate >= today)
      .map((c) => ({
        id: c.id,
        studentId: c.studentId,
        studentName: c.studentName,
        grade: c.grade,
        classNumber: c.classNumber,
        scheduledDate: c.nextScheduleDate!,
        topic: c.topic,
        category: c.category,
        counselorName: c.counselorName,
      }))
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 5);

    // 요주의 및 위기 학생 리스트
    const alertStudents = allStudents
      .filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'CAUTION')
      .map((s) => ({
        id: s.id,
        name: s.name,
        studentNumber: s.studentNumber,
        grade: s.grade,
        classNumber: s.classNumber,
        riskLevel: s.riskLevel,
        specialNotes: s.specialNotes,
      }));

    return {
      summary: {
        totalStudents: allStudents.length,
        totalConsultations: allConsultations.length,
        activeCases: allConsultations.filter((c) => c.status === 'IN_PROGRESS').length,
        criticalCases: riskCounts.CRITICAL + riskCounts.CAUTION,
      },
      riskCounts,
      categoryCounts,
      sentimentCounts,
      methodCounts,
      typeCounts,
      upcomingSchedules,
      alertStudents,
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    throw new Error('대시보드 통계를 집계하는 중 오류가 발생했습니다.', { cause: error });
  }
}

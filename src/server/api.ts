import express, { Request, Response } from 'express';
import {
  createConsultation,
  createStudent,
  deleteConsultation,
  deleteStudent,
  getConsultations,
  getDashboardStats,
  getStudentDetail,
  getStudents,
  updateConsultation,
  updateStudent,
} from '../db/counseling.ts';
import { getOrCreateUser } from '../db/users.ts';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';

export function createApiApp() {
  const app = express();
  app.use(express.json());

  // 상태 체크
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      database: 'PostgreSQL (Cloud SQL / Supabase compatible)',
      timestamp: new Date().toISOString(),
    });
  });

  // 데이터베이스 연결 및 스키마 정보
  app.get('/api/db/info', (_req: Request, res: Response) => {
    res.json({
      databaseEngine: 'PostgreSQL',
      cloudInstance: 'Cloud SQL (Developer Edition)',
      supabaseCompatible: true,
      tables: ['students', 'consultations', 'users'],
      schemaVersion: '1.0.0',
    });
  });

  // 사용자 로그인 프로필 동기화
  app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { uid, email, displayName } = req.body;
      const targetUid = req.user?.uid || uid;
      const targetEmail = req.user?.email || email;

      if (!targetUid || !targetEmail) {
        return res.status(400).json({ error: 'UID와 이메일이 필요합니다.' });
      }

      const userRecord = await getOrCreateUser(targetUid, targetEmail, displayName);
      res.json(userRecord);
    } catch (error: any) {
      console.error('Auth sync error:', error);
      res.status(500).json({ error: error.message || '사용자 동기화 실패' });
    }
  });

  // 대시보드 통계
  app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Fetch stats error:', error);
      res.status(500).json({ error: error.message || '통계 조회에 실패했습니다.' });
    }
  });

  // 학생 목록
  app.get('/api/students', async (_req: Request, res: Response) => {
    try {
      const studentsList = await getStudents();
      res.json(studentsList);
    } catch (error: any) {
      console.error('Fetch students error:', error);
      res.status(500).json({ error: error.message || '학생 목록 조회 실패' });
    }
  });

  // 학생 상세
  app.get('/api/students/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효한 학생 ID가 아닙니다.' });
      }
      const student = await getStudentDetail(id);
      if (!student) {
        return res.status(404).json({ error: '해당 학생을 찾을 수 없습니다.' });
      }
      res.json(student);
    } catch (error: any) {
      console.error('Fetch student detail error:', error);
      res.status(500).json({ error: error.message || '학생 상세 조회 실패' });
    }
  });

  // 학생 등록
  app.post('/api/students', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        name,
        studentNumber,
        grade,
        classNumber,
        gender,
        birthDate,
        contact,
        parentContact,
        guardianRelation,
        riskLevel,
        academicStatus,
        specialNotes,
      } = req.body;

      if (!name || !studentNumber || grade == null || classNumber == null || !gender) {
        return res.status(400).json({ error: '이름, 학번, 학년, 반, 성별은 필수 입력값입니다.' });
      }

      const newStudent = await createStudent({
        name,
        studentNumber,
        grade: Number(grade),
        classNumber: Number(classNumber),
        gender,
        birthDate,
        contact,
        parentContact,
        guardianRelation,
        riskLevel: riskLevel || 'NORMAL',
        academicStatus: academicStatus || 'ENROLLED',
        specialNotes,
        counselorUid: req.user?.uid || 'counselor_demo',
      });

      res.status(201).json(newStudent);
    } catch (error: any) {
      console.error('Create student error:', error);
      res.status(500).json({ error: error.message || '학생 등록에 실패했습니다.' });
    }
  });

  // 학생 정보 수정
  app.put('/api/students/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효한 학생 ID가 아닙니다.' });
      }

      const updated = await updateStudent(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Update student error:', error);
      res.status(500).json({ error: error.message || '학생 정보 수정 실패' });
    }
  });

  // 학생 삭제
  app.delete('/api/students/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효한 학생 ID가 아닙니다.' });
      }

      const deleted = await deleteStudent(id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('Delete student error:', error);
      res.status(500).json({ error: error.message || '학생 삭제 실패' });
    }
  });

  // 전체 상담 목록
  app.get('/api/consultations', async (_req: Request, res: Response) => {
    try {
      const records = await getConsultations();
      res.json(records);
    } catch (error: any) {
      console.error('Fetch consultations error:', error);
      res.status(500).json({ error: error.message || '상담 이력 조회 실패' });
    }
  });

  // 신규 상담 등록
  app.post('/api/consultations', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        studentId,
        counselorName,
        consultationDate,
        startTime,
        endTime,
        durationMinutes,
        consultationType,
        category,
        method,
        topic,
        content,
        studentSentiment,
        followUpPlan,
        nextScheduleDate,
        confidentialityLevel,
        status,
        tags,
      } = req.body;

      if (!studentId || !consultationDate || !consultationType || !category || !topic || !content) {
        return res.status(400).json({
          error: '학생 선택, 상담일자, 상담유형, 상담분야, 상담주제 및 내용은 필수입니다.',
        });
      }

      const counselorUid = req.user?.uid || 'counselor_demo';
      const counselor =
        counselorName || (req.user?.name ? `${req.user.name} 상담사` : '박진우 상담교사');

      const created = await createConsultation({
        studentId: Number(studentId),
        counselorUid,
        counselorName: counselor,
        consultationDate,
        startTime,
        endTime,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 45,
        consultationType,
        category,
        method: method || 'FACE_TO_FACE',
        topic,
        content,
        studentSentiment: studentSentiment || 'NEUTRAL',
        followUpPlan,
        nextScheduleDate,
        confidentialityLevel: confidentialityLevel || 'INTERNAL',
        status: status || 'IN_PROGRESS',
        tags,
      });

      res.status(201).json(created);
    } catch (error: any) {
      console.error('Create consultation error:', error);
      res.status(500).json({ error: error.message || '상담 일지 등록 실패' });
    }
  });

  // 상담 수정
  app.put('/api/consultations/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효한 상담 ID가 아닙니다.' });
      }

      const updated = await updateConsultation(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Update consultation error:', error);
      res.status(500).json({ error: error.message || '상담 일지 수정 실패' });
    }
  });

  // 상담 삭제
  app.delete('/api/consultations/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: '유효한 상담 ID가 아닙니다.' });
      }

      const deleted = await deleteConsultation(id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('Delete consultation error:', error);
      res.status(500).json({ error: error.message || '상담 일지 삭제 실패' });
    }
  });

  return app;
}

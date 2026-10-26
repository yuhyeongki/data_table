export type RiskLevel = 'NORMAL' | 'ATTENTION' | 'CAUTION' | 'CRITICAL';
export type AcademicStatus = 'ENROLLED' | 'LEAVE' | 'GRADUATED';
export type StudentSentiment = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';
export type ConsultationType = 'REGULAR' | 'STUDENT_REQUEST' | 'PARENT' | 'TEACHER_REFERRAL' | 'EMERGENCY';
export type ConsultationCategory =
  | 'CAREER'
  | 'ACADEMIC'
  | 'RELATIONSHIP'
  | 'EMOTIONAL'
  | 'FAMILY'
  | 'BEHAVIOR'
  | 'HEALTH'
  | 'OTHER';
export type ConsultationMethod = 'FACE_TO_FACE' | 'PHONE' | 'ONLINE' | 'VISIT';
export type ConfidentialityLevel = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';
export type ConsultationStatus = 'IN_PROGRESS' | 'RESOLVED' | 'REFERRED';

export interface Student {
  id: number;
  name: string;
  studentNumber: string;
  grade: number;
  classNumber: number;
  gender: string;
  birthDate?: string | null;
  contact?: string | null;
  parentContact?: string | null;
  guardianRelation?: string | null;
  riskLevel: RiskLevel;
  academicStatus: AcademicStatus;
  specialNotes?: string | null;
  counselorUid?: string | null;
  createdAt?: string;
  updatedAt?: string;
  consultationCount?: number;
  latestConsultationDate?: string | null;
}

export interface Consultation {
  id: number;
  studentId: number;
  studentName?: string;
  studentNumber?: string;
  grade?: number;
  classNumber?: number;
  riskLevel?: RiskLevel;
  counselorUid: string;
  counselorName: string;
  consultationDate: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes: number;
  consultationType: ConsultationType;
  category: ConsultationCategory;
  method: ConsultationMethod;
  topic: string;
  content: string;
  studentSentiment: StudentSentiment;
  followUpPlan?: string | null;
  nextScheduleDate?: string | null;
  confidentialityLevel: ConfidentialityLevel;
  status: ConsultationStatus;
  tags?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  summary: {
    totalStudents: number;
    totalConsultations: number;
    activeCases: number;
    criticalCases: number;
  };
  riskCounts: Record<RiskLevel, number>;
  categoryCounts: Record<string, number>;
  sentimentCounts: Record<StudentSentiment, number>;
  methodCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  upcomingSchedules: Array<{
    id: number;
    studentId: number;
    studentName: string;
    grade: number;
    classNumber: number;
    scheduledDate: string;
    topic: string;
    category: string;
    counselorName: string;
  }>;
  alertStudents: Array<{
    id: number;
    name: string;
    studentNumber: string;
    grade: number;
    classNumber: number;
    riskLevel: RiskLevel;
    specialNotes: string | null;
  }>;
}

export const CATEGORY_LABELS: Record<ConsultationCategory, { label: string; color: string; badgeBg: string }> = {
  CAREER: { label: '진로/진학', color: '#3B82F6', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACADEMIC: { label: '학업/성적', color: '#10B981', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RELATIONSHIP: { label: '교우/대인관계', color: '#8B5CF6', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  EMOTIONAL: { label: '심리/정서', color: '#EC4899', badgeBg: 'bg-pink-50 text-pink-700 border-pink-200' },
  FAMILY: { label: '가정/부모', color: '#F59E0B', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  BEHAVIOR: { label: '생활지도/행동', color: '#6366F1', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  HEALTH: { label: '건강/신체', color: '#14B8A6', badgeBg: 'bg-teal-50 text-teal-700 border-teal-200' },
  OTHER: { label: '기타상담', color: '#6B7280', badgeBg: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export const RISK_LABELS: Record<RiskLevel, { label: string; color: string; badgeClass: string; desc: string }> = {
  NORMAL: {
    label: '일반(양호)',
    color: '#10B981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: '특이 징후 없음, 정기 상담 대상',
  },
  ATTENTION: {
    label: '관심군',
    color: '#3B82F6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: '학업/진로 스트레스 호소, 정기 모니터링',
  },
  CAUTION: {
    label: '주의군',
    color: '#F59E0B',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: '가정불화/또래갈등, 적극적 개입 필요',
  },
  CRITICAL: {
    label: '위기/집중관리',
    color: '#EF4444',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    desc: '등교거부/정서위기, 즉각 개입 및 외부연계',
  },
};

export const SENTIMENT_LABELS: Record<StudentSentiment, { label: string; icon: string; color: string }> = {
  VERY_POSITIVE: { label: '매우 긍정', icon: '😄', color: 'text-emerald-600' },
  POSITIVE: { label: '긍정적', icon: '🙂', color: 'text-teal-600' },
  NEUTRAL: { label: '보통/무난', icon: '😐', color: 'text-gray-600' },
  NEGATIVE: { label: '다소 부정', icon: '🙁', color: 'text-amber-600' },
  VERY_NEGATIVE: { label: '매우 불안/부정', icon: '😫', color: 'text-rose-600' },
};

export const TYPE_LABELS: Record<ConsultationType, string> = {
  REGULAR: '정기 상담',
  STUDENT_REQUEST: '학생 자발 요청',
  PARENT: '학부모 상담',
  TEACHER_REFERRAL: '담임/교사 의뢰',
  EMERGENCY: '위기 긴급 상담',
};

export const METHOD_LABELS: Record<ConsultationMethod, string> = {
  FACE_TO_FACE: '대면 상담 (상담실)',
  PHONE: '전화 상담',
  ONLINE: '화상/온라인',
  VISIT: '가정 방문',
};

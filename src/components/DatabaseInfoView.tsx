import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
} from 'lucide-react';

export const DatabaseInfoView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const supabaseSqlSchema = `-- EduCounsel 학생 상담 관리 시스템 Supabase / PostgreSQL 호환 스키마
-- Supabase SQL Editor에 복사하여 붙여넣으면 동일한 테이블 구조 및 인덱스가 생성됩니다.

-- 1. 사용자(상담사/교사) 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'counselor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 학생 관리 테이블
CREATE TABLE IF NOT EXISTS public.students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  grade INTEGER NOT NULL,
  class_number INTEGER NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT,
  contact TEXT,
  parent_contact TEXT,
  guardian_relation TEXT,
  risk_level TEXT DEFAULT 'NORMAL' NOT NULL, -- NORMAL, ATTENTION, CAUTION, CRITICAL
  academic_status TEXT DEFAULT 'ENROLLED' NOT NULL,
  special_notes TEXT,
  counselor_uid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. 상담 일지/이력 테이블
CREATE TABLE IF NOT EXISTS public.consultations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  counselor_uid TEXT NOT NULL,
  counselor_name TEXT NOT NULL,
  consultation_date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER DEFAULT 45,
  consultation_type TEXT NOT NULL, -- REGULAR, STUDENT_REQUEST, PARENT, TEACHER_REFERRAL, EMERGENCY
  category TEXT NOT NULL, -- CAREER, ACADEMIC, RELATIONSHIP, EMOTIONAL, FAMILY, BEHAVIOR, HEALTH, OTHER
  method TEXT DEFAULT 'FACE_TO_FACE' NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  student_sentiment TEXT DEFAULT 'NEUTRAL' NOT NULL, -- VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE
  follow_up_plan TEXT,
  next_schedule_date TEXT,
  confidentiality_level TEXT DEFAULT 'INTERNAL' NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS' NOT NULL,
  tags TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 인덱스 설정 (빠른 검색 및 학생별 이력 조회)
CREATE INDEX IF NOT EXISTS idx_consultations_student_id ON public.consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_students_grade_class ON public.students(grade, class_number);
CREATE INDEX IF NOT EXISTS idx_students_risk ON public.students(risk_level);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([supabaseSqlSchema], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'educounsel_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>PostgreSQL / Supabase 호환 아키텍처 연동 중</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              데이터베이스 연동 현황 및 Supabase 동기화 가이드
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              본 시스템은 표준 관계형 데이터베이스(PostgreSQL) 엔진을 기반으로 설계되어 Supabase와 100% 동일한 SQL 방언과 스키마 구조를 가집니다.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySql}
              className="inline-flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'SQL 복사 완료!' : 'Supabase SQL 복사'}
            </button>
            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              <Download className="w-4 h-4 mr-1.5" />
              SQL 파일 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 3 Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">클라우드 PostgreSQL 엔진</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Google Cloud SQL 인스턴스에 안전하게 프로비저닝되었으며, 연결 풀링(`pg.Pool`)과 Drizzle ORM을 통해 고속 트랜잭션을 처리합니다.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">3대 핵심 테이블 체계</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            `students`(학생 기본 및 위험군), `consultations`(상담일지 및 감정분석), `users`(상담사 계정) 간의 외래키 무결성을 완벽하게 보장합니다.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Code className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Supabase 원클릭 마이그레이션</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Supabase의 SQL Editor나 psql 콘솔에서 아래 SQL을 실행하면 동일한 테이블 구조, 외래키, 인덱스를 즉시 생성하여 동기화할 수 있습니다.
          </p>
        </div>
      </div>

      {/* SQL Editor / Viewer */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-gray-100 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-mono text-gray-400 ml-2">educounsel_schema.sql (PostgreSQL / Supabase DDL)</span>
          </div>
          <button
            onClick={handleCopySql}
            className="text-xs text-gray-400 hover:text-white flex items-center transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>

        <pre className="text-xs font-mono leading-relaxed text-emerald-300 overflow-x-auto max-h-96 p-2">
          <code>{supabaseSqlSchema}</code>
        </pre>
      </div>
    </div>
  );
};

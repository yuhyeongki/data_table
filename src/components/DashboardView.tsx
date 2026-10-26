import React from 'react';
import {
  Users,
  BookOpen,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  Compass,
} from 'lucide-react';
import {
  DashboardStats,
  CATEGORY_LABELS,
  RISK_LABELS,
  SENTIMENT_LABELS,
  ConsultationCategory,
  RiskLevel,
  StudentSentiment,
} from '../types/counseling.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onSelectStudent: (studentId: number) => void;
  onOpenNewConsultation: () => void;
  onViewAllStudents: () => void;
  onViewAllConsultations: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onSelectStudent,
  onOpenNewConsultation,
  onViewAllStudents,
  onViewAllConsultations,
}) => {
  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">상담 통계 및 학생 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  const { summary, riskCounts, categoryCounts, sentimentCounts, upcomingSchedules, alertStudents } = stats;

  const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const totalSentiments = Object.values(sentimentCounts).reduce((a, b) => a + b, 0) || 1;

  // Calculate days remaining helper
  const getDaysDiffLabel = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { text: '오늘 상담', color: 'bg-rose-100 text-rose-700 font-bold' };
    if (diff === 1) return { text: '내일 상담', color: 'bg-amber-100 text-amber-800 font-bold' };
    if (diff > 1) return { text: `D-${diff}`, color: 'bg-blue-100 text-blue-700' };
    return { text: `${Math.abs(diff)}일 전`, color: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>EduCounsel Cloud DB Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">학생 상담 모니터링 & 인사이트 대시보드</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            학생별 누적 상담 이력, 위기군 조기 발견 모니터링, 상담 영역별 통계를 PostgreSQL 클라우드 DB와 실시간 연동합니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewConsultation}
            className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow-xs transition flex items-center"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            상담 일지 작성
          </button>
          <button
            onClick={onViewAllStudents}
            className="px-4 py-2 bg-blue-800/80 hover:bg-blue-800 text-white font-medium text-xs rounded-xl border border-blue-400/30 transition flex items-center"
          >
            학생 전체 목록
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">총 관리 학생 수</p>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{summary.totalStudents}명</h3>
            <span className="text-xs font-medium text-blue-600">전체 학년 등록</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span>위험군 {summary.criticalCases}명 포함</span>
          </div>
        </div>

        {/* Card 2: Total Consultations */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">누적 상담 건수</p>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{summary.totalConsultations}건</h3>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              체계적 이력 관리
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span>학생당 평균 {(summary.totalConsultations / (summary.totalStudents || 1)).toFixed(1)}회 상담</span>
          </div>
        </div>

        {/* Card 3: Active In-Progress Cases */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">진행 중 후속 지도</p>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-900">{summary.activeCases}건</h3>
            <span className="text-xs font-medium text-indigo-600">지속 관리 중</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span>예정 상담 {upcomingSchedules.length}건 대기</span>
          </div>
        </div>

        {/* Card 4: Critical & Caution Students */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">주의/위기 집중관리</p>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-rose-600">{summary.criticalCases}명</h3>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">
              위기군 {riskCounts.CRITICAL}명
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <span>정서 불안 및 또래 관계 집중 개입</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Breakdown & Risk Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Counseling Categories */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">상담 영역/분야별 분포 현황</h3>
              </div>
              <button
                onClick={onViewAllConsultations}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                상담 일지 전체보기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              학생들이 주로 호소하는 고민과 상담 영역 통계입니다.
            </p>

            <div className="space-y-3.5">
              {(
                [
                  'CAREER',
                  'ACADEMIC',
                  'RELATIONSHIP',
                  'EMOTIONAL',
                  'FAMILY',
                  'BEHAVIOR',
                  'HEALTH',
                ] as ConsultationCategory[]
              ).map((categoryKey) => {
                const count = categoryCounts[categoryKey] || 0;
                const percentage = Math.round((count / totalCategories) * 100);
                const info = CATEGORY_LABELS[categoryKey];

                return (
                  <div key={categoryKey} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700 flex items-center">
                        <span
                          className="w-2.5 h-2.5 rounded-full mr-2 inline-block"
                          style={{ backgroundColor: info.color }}
                        />
                        {info.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{count}건</span>
                        <span className="text-gray-400 font-medium w-9 text-right">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: info.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Student Risk Level Management */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">학생 위험군 단계별 관리 현황</h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">총 {summary.totalStudents}명 대상 분류</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['NORMAL', 'ATTENTION', 'CAUTION', 'CRITICAL'] as RiskLevel[]).map((level) => {
                const count = riskCounts[level] || 0;
                const pct = Math.round((count / (summary.totalStudents || 1)) * 100);
                const labelInfo = RISK_LABELS[level];

                return (
                  <div
                    key={level}
                    className={`rounded-xl p-4 border text-left transition hover:border-gray-400 ${
                      level === 'CRITICAL'
                        ? 'bg-red-50/50 border-red-200'
                        : level === 'CAUTION'
                        ? 'bg-amber-50/50 border-amber-200'
                        : level === 'ATTENTION'
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{labelInfo.label}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: labelInfo.color }}
                      />
                    </div>
                    <div className="mt-2 text-2xl font-black text-gray-900">{count}명</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>비중 {pct}%</span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500 leading-tight">{labelInfo.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sentiment & Urgent Alerts */}
        <div className="space-y-6">
          {/* Sentiment Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">학생 정서/심리 반응 분포</h3>
            <p className="text-xs text-gray-500 mb-4">상담 과정에서 파악된 학생의 정서 상태 지표입니다.</p>

            <div className="space-y-3">
              {(
                [
                  'VERY_POSITIVE',
                  'POSITIVE',
                  'NEUTRAL',
                  'NEGATIVE',
                  'VERY_NEGATIVE',
                ] as StudentSentiment[]
              ).map((sent) => {
                const count = sentimentCounts[sent] || 0;
                const pct = Math.round((count / totalSentiments) * 100);
                const item = SENTIMENT_LABELS[sent];

                return (
                  <div key={sent} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{count}회</span>
                      <span className="text-[11px] text-gray-500 w-8 text-right">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Schedules */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">예정된 상담 일정</h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">{upcomingSchedules.length}건 대기</span>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                예정된 차기 상담 일정이 없습니다.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingSchedules.map((schedule) => {
                  const daysBadge = getDaysDiffLabel(schedule.scheduledDate);
                  return (
                    <div
                      key={schedule.id}
                      onClick={() => onSelectStudent(schedule.studentId)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-900">
                          {schedule.studentName} ({schedule.grade}학년 {schedule.classNumber}반)
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm ${daysBadge.color}`}>
                          {daysBadge.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{schedule.topic}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
                        <span>일시: {schedule.scheduledDate}</span>
                        <span>담당: {schedule.counselorName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Critical Risk Students Alert Box */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="text-sm font-bold">집중 관리 대상 학생 모니터링</h4>
            </div>
            <p className="text-xs text-red-700 mb-3">
              위기 및 주의군으로 분류되어 즉각적인 상담 및 관찰이 필요한 학생들입니다.
            </p>

            <div className="space-y-2">
              {alertStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent(st.id)}
                  className="bg-white p-2.5 rounded-lg border border-red-200 flex items-center justify-between hover:shadow-xs transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{st.name}</span>
                      <span className="text-[11px] text-gray-500">
                        {st.grade}학년 {st.classNumber}반
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                          st.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {st.riskLevel === 'CRITICAL' ? '위기군' : '주의군'}
                      </span>
                    </div>
                    {st.specialNotes && (
                      <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                        {st.specialNotes}
                      </p>
                    )}
                  </div>
                  <button className="text-xs text-blue-600 font-semibold hover:underline ml-2 shrink-0">
                    상담 이력
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

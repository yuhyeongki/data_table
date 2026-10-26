import React, { useState } from 'react';
import { X, Calendar, Clock, Sparkles, PlusCircle } from 'lucide-react';
import {
  Student,
  ConsultationCategory,
  ConsultationType,
  ConsultationMethod,
  StudentSentiment,
  RiskLevel,
} from '../types/counseling.ts';

interface NewConsultationModalProps {
  students: Student[];
  initialStudentId?: number | null;
  counselorName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  students,
  initialStudentId,
  counselorName = '박진우 상담교사',
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [studentId, setStudentId] = useState<number>(
    initialStudentId || (students[0]?.id ?? 0)
  );
  const [consultationDate, setConsultationDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [consultationType, setConsultationType] = useState<ConsultationType>('REGULAR');
  const [category, setCategory] = useState<ConsultationCategory>('ACADEMIC');
  const [method, setMethod] = useState<ConsultationMethod>('FACE_TO_FACE');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [studentSentiment, setStudentSentiment] = useState<StudentSentiment>('NEUTRAL');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [nextScheduleDate, setNextScheduleDate] = useState('');
  const [tags, setTags] = useState('');
  const [updateStudentRisk, setUpdateStudentRisk] = useState<string>('KEEP');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedStudent = students.find((s) => s.id === Number(studentId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setErrorMsg('상담 대상 학생을 선택해 주세요.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('상담 주제를 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('상담 내용을 작성해 주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: Number(studentId),
          counselorName,
          consultationDate,
          startTime,
          durationMinutes: Number(durationMinutes),
          consultationType,
          category,
          method,
          topic,
          content,
          studentSentiment,
          followUpPlan: followUpPlan || null,
          nextScheduleDate: nextScheduleDate || null,
          tags: tags || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '상담 등록에 실패했습니다.');
      }

      // Update student risk level if requested
      if (updateStudentRisk !== 'KEEP') {
        await fetch(`/api/students/${studentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riskLevel: updateStudentRisk as RiskLevel,
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '상담 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">신규 상담 일지 작성</h2>
              <p className="text-xs text-gray-500">
                학생과의 상담 내용을 클라우드 DB에 체계적으로 기록합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-xs">
              {errorMsg}
            </div>
          )}

          {/* Student Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                상담 대상 학생 <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.grade}학년 {st.classNumber}반, {st.studentNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                상담 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Time, Duration & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">소요 시간 (분)</label>
              <input
                type="number"
                min="10"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">상담 방식</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as ConsultationMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="FACE_TO_FACE">대면 상담 (상담실)</option>
                <option value="PHONE">전화 상담</option>
                <option value="ONLINE">온라인/화상</option>
                <option value="VISIT">가정 방문</option>
              </select>
            </div>
          </div>

          {/* Category & Consultation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                상담 영역/분야 <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ConsultationCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="ACADEMIC">학업/성적 (학습 부진, 시험 불안)</option>
                <option value="CAREER">진로/진학 (전공 탐색, 학종 로드맵)</option>
                <option value="RELATIONSHIP">교우/대인관계 (또래 갈등, 소외)</option>
                <option value="EMOTIONAL">심리/정서 (우울, 무기력, 분노)</option>
                <option value="FAMILY">가정/부모 (가정불화, 부모 갈등)</option>
                <option value="BEHAVIOR">생활지도/행동 (지각, 무단결석, 교칙)</option>
                <option value="HEALTH">건강/신체 (수면장애, 신체화증상)</option>
                <option value="OTHER">기타 상담</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                상담 유형 <span className="text-rose-500">*</span>
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="REGULAR">정기 상담 (학기별 정기면담)</option>
                <option value="STUDENT_REQUEST">학생 자발적 요청</option>
                <option value="TEACHER_REFERRAL">담임/교과 교사 의뢰</option>
                <option value="PARENT">학부모 상담</option>
                <option value="EMERGENCY">위기 긴급 상담</option>
              </select>
            </div>
          </div>

          {/* Consultation Topic */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              상담 주제 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 기말고사 수학 성적 하락으로 인한 학습 불안 및 오답노트 코칭"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Consultation Content */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              상담 상세 내용 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="학생의 호소 문제, 대화 요약, 관찰된 비언어적 반응(표정, 자세), 핵심 원인을 구체적으로 기록하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Sentiment & Risk Update */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <label className="block font-bold text-gray-700 mb-1">학생의 정서/심리 반응</label>
              <select
                value={studentSentiment}
                onChange={(e) => setStudentSentiment(e.target.value as StudentSentiment)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="VERY_POSITIVE">😄 매우 긍정 (해결 의지 높음)</option>
                <option value="POSITIVE">🙂 긍정적 (안도감 표현)</option>
                <option value="NEUTRAL">😐 보통 / 무난</option>
                <option value="NEGATIVE">🙁 다소 부정 (불안, 회의감)</option>
                <option value="VERY_NEGATIVE">😫 매우 불안/부정 (우울, 거부감)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                학생 위험군 등급 조정 (현재: {selectedStudent?.riskLevel})
              </label>
              <select
                value={updateStudentRisk}
                onChange={(e) => setUpdateStudentRisk(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="KEEP">현재 등급 유지</option>
                <option value="NORMAL">일반(양호)으로 변경</option>
                <option value="ATTENTION">관심군으로 상향/조정</option>
                <option value="CAUTION">주의군으로 상향/조정</option>
                <option value="CRITICAL">위기/집중관리군으로 지정</option>
              </select>
            </div>
          </div>

          {/* Follow-up Plan & Next Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">향후 지도 계획 및 후속 조치</label>
              <input
                type="text"
                placeholder="예: 담임교사 면담, 2주 후 오답노트 점검, Wee클래스 연계"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">차기 상담 예정일</label>
              <input
                type="date"
                value={nextScheduleDate}
                onChange={(e) => setNextScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">키워드 태그 (쉼표로 구분)</label>
            <input
              type="text"
              placeholder="예: 학업스트레스, 수학불안, 진로로드맵"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition disabled:opacity-50"
            >
              {submitting ? '저장 중...' : '상담 일지 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

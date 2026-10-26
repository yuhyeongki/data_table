import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Phone,
  User,
  ShieldAlert,
  PlusCircle,
  FileText,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Sparkles,
  Tag,
} from 'lucide-react';
import {
  Student,
  Consultation,
  RISK_LABELS,
  RiskLevel,
  CATEGORY_LABELS,
  SENTIMENT_LABELS,
  METHOD_LABELS,
  ConsultationCategory,
  StudentSentiment,
} from '../types/counseling.ts';

interface StudentDetailModalProps {
  studentId: number | null;
  onClose: () => void;
  onOpenNewConsultationForStudent: (studentId: number) => void;
  onDataChanged: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onOpenNewConsultationForStudent,
  onDataChanged,
}) => {
  const [student, setStudent] = useState<(Student & { consultations: Consultation[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('NORMAL');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`/api/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
        setNotes(data.specialNotes || '');
        setSelectedRisk(data.riskLevel || 'NORMAL');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) return null;

  const handleUpdateStudentProfile = async () => {
    if (!student) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskLevel: selectedRisk,
          specialNotes: notes,
        }),
      });
      if (res.ok) {
        setIsEditingNotes(false);
        setStudent({ ...student, riskLevel: selectedRisk, specialNotes: notes });
        onDataChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteConsultation = async (consultationId: number) => {
    if (!window.confirm('이 상담 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/consultations/${consultationId}`, {
        method: 'DELETE',
      });
      if (res.ok && student) {
        setStudent({
          ...student,
          consultations: student.consultations.filter((c) => c.id !== consultationId),
        });
        onDataChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;
    if (!window.confirm(`정말로 ${student.name} 학생과 관련된 모든 상담 기록을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDataChanged();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentRiskInfo = RISK_LABELS[selectedRisk] || RISK_LABELS.NORMAL;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
              {student ? student.name[0] : '학'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">{student?.name || '학생 상담 프로필'}</h2>
                <span className="text-xs text-gray-500 font-mono">({student?.studentNumber})</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${currentRiskInfo.badgeClass}`}>
                  {currentRiskInfo.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {student?.grade}학년 {student?.classNumber}반 / {student?.gender} / 누적 상담 {student?.consultations?.length || 0}회
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenNewConsultationForStudent(studentId)}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              상담 추가
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !student ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-xs text-gray-500 font-medium">학생 상담 상세 정보를 로딩 중...</p>
            </div>
          ) : (
            <>
              {/* Top Details Card: Contacts & Risk Status Setting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                {/* Col 1: Contact info */}
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-800">연락처 및 인적사항</p>
                  <p className="text-gray-600">학생 연락처: {student.contact || '미등록'}</p>
                  <p className="text-gray-600">
                    보호자({student.guardianRelation || '부모'}): {student.parentContact || '미등록'}
                  </p>
                  {student.birthDate && <p className="text-gray-500">생년월일: {student.birthDate}</p>}
                </div>

                {/* Col 2: Risk Management dropdown */}
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-800">위험군 모니터링 단계</p>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedRisk}
                      onChange={(e) => setSelectedRisk(e.target.value as RiskLevel)}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-xs font-semibold"
                    >
                      <option value="NORMAL">일반(양호)</option>
                      <option value="ATTENTION">관심군 (경미한 스트레스)</option>
                      <option value="CAUTION">주의군 (갈등 및 불안)</option>
                      <option value="CRITICAL">위기/집중관리군 (등교거부/정서위기)</option>
                    </select>
                    {selectedRisk !== student.riskLevel && (
                      <button
                        onClick={handleUpdateStudentProfile}
                        disabled={savingStatus}
                        className="px-2 py-1 bg-blue-600 text-white rounded-md text-[11px] font-semibold"
                      >
                        저장
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{currentRiskInfo.desc}</p>
                </div>

                {/* Col 3: Danger Zone (Delete) */}
                <div className="flex flex-col justify-between items-start md:items-end">
                  <span className="text-[11px] text-gray-400">등록일: {student.createdAt?.slice(0, 10)}</span>
                  <button
                    onClick={handleDeleteStudent}
                    className="inline-flex items-center text-rose-600 hover:text-rose-800 font-semibold text-xs mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    학생 프로필 삭제
                  </button>
                </div>
              </div>

              {/* Special Notes Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-blue-600" />
                    학생 종합 특이사항 및 사전 상담 메모
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      수정하기
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleUpdateStudentProfile}
                        disabled={savingStatus}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        저장완료
                      </button>
                    </div>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="성향, 건강 상태, 학업/교우 특이점 등을 입력하세요..."
                  />
                ) : (
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {student.specialNotes || '등록된 특이사항이 없습니다.'}
                  </p>
                )}
              </div>

              {/* Counseling Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                    상담 이력 타임라인 ({student.consultations?.length || 0}건)
                  </h3>
                  <button
                    onClick={() => onOpenNewConsultationForStudent(studentId)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + 신규 상담 일지 작성
                  </button>
                </div>

                {student.consultations?.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500">아직 등록된 상담 이력이 없습니다.</p>
                    <button
                      onClick={() => onOpenNewConsultationForStudent(studentId)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      첫 상담 일지 기록하기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.consultations.map((c, index) => {
                      const categoryInfo = CATEGORY_LABELS[c.category as ConsultationCategory] || CATEGORY_LABELS.OTHER;
                      const sentimentInfo = SENTIMENT_LABELS[c.studentSentiment as StudentSentiment] || SENTIMENT_LABELS.NEUTRAL;
                      const methodLabel = METHOD_LABELS[c.method] || c.method;

                      return (
                        <div
                          key={c.id}
                          className="relative pl-6 border-l-2 border-blue-200 pb-2 space-y-2 group"
                        >
                          {/* Dot on timeline */}
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-600" />

                          {/* Record Card */}
                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition space-y-3">
                            {/* Card Top: Date, Category, Sentiment */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-gray-900 flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                  {c.consultationDate}
                                </span>
                                {c.startTime && (
                                  <span className="text-xs text-gray-500 font-medium">
                                    {c.startTime} ~ {c.endTime || ''} ({c.durationMinutes}분)
                                  </span>
                                )}
                                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${categoryInfo.badgeBg}`}>
                                  {categoryInfo.label}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                  {methodLabel}
                                </span>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-semibold flex items-center text-gray-700">
                                  <span className="mr-1">{sentimentInfo.icon}</span>
                                  {sentimentInfo.label}
                                </span>
                                <button
                                  onClick={() => handleDeleteConsultation(c.id)}
                                  className="text-gray-400 hover:text-rose-600 p-1 transition"
                                  title="상담 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Topic & Content */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-1">{c.topic}</h4>
                              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                                {c.content}
                              </p>
                            </div>

                            {/* Follow up & Counselor info */}
                            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              {c.followUpPlan ? (
                                <div className="text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-md font-medium">
                                  📌 <strong>향후 지도 계획:</strong> {c.followUpPlan}
                                </div>
                              ) : (
                                <div />
                              )}

                              <div className="text-gray-400 flex items-center space-x-3">
                                {c.nextScheduleDate && (
                                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm font-semibold">
                                    차기 예정: {c.nextScheduleDate}
                                  </span>
                                )}
                                <span>상담자: {c.counselorName}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            {c.tags && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {c.tags.split(',').map((t, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                                  >
                                    #{t.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

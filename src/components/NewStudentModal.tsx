import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { RiskLevel } from '../types/counseling.ts';

interface NewStudentModalProps {
  onClose: () => void;
  onSuccess: (newStudentId?: number) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [grade, setGrade] = useState(1);
  const [classNumber, setClassNumber] = useState(1);
  const [gender, setGender] = useState('남');
  const [birthDate, setBirthDate] = useState('');
  const [contact, setContact] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('모');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('NORMAL');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('학생 이름을 입력하세요.');
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMsg('학번을 입력하세요.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          studentNumber: studentNumber.trim(),
          grade: Number(grade),
          classNumber: Number(classNumber),
          gender,
          birthDate: birthDate || null,
          contact: contact.trim() || null,
          parentContact: parentContact.trim() || null,
          guardianRelation: guardianRelation.trim() || null,
          riskLevel,
          academicStatus: 'ENROLLED',
          specialNotes: specialNotes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '학생 등록에 실패했습니다.');
      }

      const created = await res.json();
      onSuccess(created.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '학생 등록 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">신규 관리 학생 등록</h2>
              <p className="text-xs text-gray-500">상담 대상 학생의 기본 인적사항 및 초기 위험도를 설정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                학생 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                학번 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 2026-10101"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">반</label>
              <input
                type="number"
                min="1"
                max="20"
                value={classNumber}
                onChange={(e) => setClassNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">성별</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">학생 연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">생년월일</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">보호자 연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">관계</label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="모">모</option>
                <option value="부">부</option>
                <option value="조부모">조부모</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">초기 위험군 모니터링 단계</label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
            >
              <option value="NORMAL">일반(양호) - 특이 징후 없음</option>
              <option value="ATTENTION">관심군 - 학업/진로 경미 스트레스</option>
              <option value="CAUTION">주의군 - 또래갈등/가정불화/정서불안</option>
              <option value="CRITICAL">위기/집중관리군 - 등교거부/정서위기/즉각개입</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">특이사항 및 초기 관찰 메모</label>
            <textarea
              rows={3}
              placeholder="학생의 성향, 건강 상태, 주요 관심사 등을 기재하세요..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

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
              {submitting ? '등록 중...' : '학생 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

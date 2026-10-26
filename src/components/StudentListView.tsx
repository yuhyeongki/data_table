import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Users,
  BookOpen,
  Phone,
  ShieldAlert,
  ChevronRight,
  Filter,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Student, RISK_LABELS, RiskLevel } from '../types/counseling.ts';

interface StudentListViewProps {
  students: Student[];
  loading: boolean;
  onSelectStudent: (studentId: number) => void;
  onOpenNewStudent: () => void;
  onOpenNewConsultationForStudent: (studentId: number) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  loading,
  onSelectStudent,
  onOpenNewStudent,
  onOpenNewConsultationForStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.specialNotes && student.specialNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchGrade = selectedGrade === 'ALL' || student.grade === Number(selectedGrade);
      const matchRisk = selectedRisk === 'ALL' || student.riskLevel === selectedRisk;

      return matchSearch && matchGrade && matchRisk;
    });
  }, [students, searchTerm, selectedGrade, selectedRisk]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">학생별 상담 이력 관리</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              학생을 클릭하여 누적 상담 기록, 특이사항, 정서 변화 추이를 확인하거나 새로운 상담을 기록하세요.
            </p>
          </div>
          <button
            onClick={onOpenNewStudent}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            신규 학생 등록
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="학생 이름, 학번, 특이사항 키워드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Grade Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">전체 학년</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </div>

          {/* Risk Level Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">전체 위험군</option>
              <option value="NORMAL">일반(양호)</option>
              <option value="ATTENTION">관심군</option>
              <option value="CAUTION">주의군</option>
              <option value="CRITICAL">위기/집중관리군</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">해당 조건의 학생을 찾을 수 없습니다</h3>
          <p className="text-xs text-gray-500">검색어를 변경하거나 신규 학생을 등록해 보세요.</p>
          <button
            onClick={onOpenNewStudent}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            학생 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const riskInfo = RISK_LABELS[student.riskLevel as RiskLevel] || RISK_LABELS.NORMAL;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Student Info & Risk Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-gray-900">{student.name}</h3>
                        <span className="text-xs font-medium text-gray-500">
                          {student.gender} / {student.grade}학년 {student.classNumber}반
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">학번: {student.studentNumber}</p>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${riskInfo.badgeClass}`}
                    >
                      {student.riskLevel === 'CRITICAL' && (
                        <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
                      )}
                      {riskInfo.label}
                    </span>
                  </div>

                  {/* Special Notes / Summary */}
                  <div className="mt-3 bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                    <p className="line-clamp-2">
                      {student.specialNotes || '등록된 특이사항 및 사전 상담 메모가 없습니다.'}
                    </p>
                  </div>

                  {/* Contact Info Preview */}
                  <div className="mt-3 space-y-1 text-[11px] text-gray-500">
                    {student.contact && (
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>학생: {student.contact}</span>
                      </div>
                    )}
                    {student.parentContact && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-gray-400 font-medium">
                          보호자({student.guardianRelation || '부모'}):
                        </span>
                        <span>{student.parentContact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Consultation Counter & Action */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-gray-500">누적 상담: </span>
                    <span className="font-bold text-blue-600">{student.consultationCount || 0}회</span>
                    {student.latestConsultationDate && (
                      <span className="text-[10px] text-gray-400 block">
                        최근: {student.latestConsultationDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onOpenNewConsultationForStudent(student.id)}
                      title="이 학생 상담 작성"
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      + 상담작성
                    </button>
                    <button
                      onClick={() => onSelectStudent(student.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition"
                    >
                      상세 이력
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

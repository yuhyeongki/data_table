import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Consultation,
  CATEGORY_LABELS,
  SENTIMENT_LABELS,
  TYPE_LABELS,
  METHOD_LABELS,
  ConsultationCategory,
  StudentSentiment,
  ConsultationType,
} from '../types/counseling.ts';

interface ConsultationListViewProps {
  consultations: Consultation[];
  loading: boolean;
  onSelectStudent: (studentId: number) => void;
  onOpenNewConsultation: () => void;
  onDataChanged: () => void;
}

export const ConsultationListView: React.FC<ConsultationListViewProps> = ({
  consultations,
  loading,
  onSelectStudent,
  onOpenNewConsultation,
  onDataChanged,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  const filteredRecords = useMemo(() => {
    return consultations.filter((record) => {
      const matchSearch =
        record.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.studentName && record.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.tags && record.tags.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || record.category === selectedCategory;
      const matchType = selectedType === 'ALL' || record.consultationType === selectedType;
      const matchSentiment = selectedSentiment === 'ALL' || record.studentSentiment === selectedSentiment;

      return matchSearch && matchCategory && matchType && matchSentiment;
    });
  }, [consultations, searchTerm, selectedCategory, selectedType, selectedSentiment]);

  // CSV Export feature
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      '상담일자',
      '학생명',
      '학번',
      '학년반',
      '상담유형',
      '상담분야',
      '방식',
      '상담주제',
      '상담내용',
      '정서상태',
      '향후계획',
      '차기예정일',
      '상담사',
      '태그',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.consultationDate}"`,
      `"${r.studentName || ''}"`,
      `"${r.studentNumber || ''}"`,
      `"${r.grade || ''}학년 ${r.classNumber || ''}반"`,
      `"${TYPE_LABELS[r.consultationType as ConsultationType] || r.consultationType}"`,
      `"${CATEGORY_LABELS[r.category as ConsultationCategory]?.label || r.category}"`,
      `"${METHOD_LABELS[r.method] || r.method}"`,
      `"${(r.topic || '').replace(/"/g, '""')}"`,
      `"${(r.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${SENTIMENT_LABELS[r.studentSentiment as StudentSentiment]?.label || r.studentSentiment}"`,
      `"${(r.followUpPlan || '').replace(/"/g, '""')}"`,
      `"${r.nextScheduleDate || ''}"`,
      `"${r.counselorName}"`,
      `"${r.tags || ''}"`,
    ]);

    // UTF-8 BOM for Excel in Korean
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `학생상담이력_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 상담 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onDataChanged();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">전체 상담 일지 및 이력 관리</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              누적된 모든 상담 세션을 검색, 필터링하고 CSV/Excel로 내보내어 보고서 및 업무에 활용할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-xl shadow-2xs transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              CSV 엑셀 내보내기
            </button>
            <button
              onClick={onOpenNewConsultation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              신규 상담 등록
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="상담주제, 내용, 학생이름, 태그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">전체 상담 영역</option>
              <option value="CAREER">진로/진학</option>
              <option value="ACADEMIC">학업/성적</option>
              <option value="RELATIONSHIP">교우/대인관계</option>
              <option value="EMOTIONAL">심리/정서</option>
              <option value="FAMILY">가정/부모</option>
              <option value="BEHAVIOR">생활지도/행동</option>
              <option value="HEALTH">건강/신체</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">전체 상담 유형</option>
              <option value="REGULAR">정기 상담</option>
              <option value="STUDENT_REQUEST">학생 요청</option>
              <option value="PARENT">학부모 상담</option>
              <option value="TEACHER_REFERRAL">교사 의뢰</option>
              <option value="EMERGENCY">위기 긴급</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">전체 정서 반응</option>
              <option value="VERY_POSITIVE">매우 긍정</option>
              <option value="POSITIVE">긍정적</option>
              <option value="NEUTRAL">보통</option>
              <option value="NEGATIVE">다소 부정</option>
              <option value="VERY_NEGATIVE">매우 불안/부정</option>
            </select>
          </div>
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">해당 조건의 상담 일지가 없습니다</h3>
          <p className="text-xs text-gray-500">필터 조건을 재설정하거나 신규 상담 일지를 작성해 보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500 px-1 flex justify-between">
            <span>검색 결과: 총 {filteredRecords.length}건의 상담 이력</span>
          </div>

          {filteredRecords.map((record) => {
            const categoryInfo = CATEGORY_LABELS[record.category as ConsultationCategory] || CATEGORY_LABELS.OTHER;
            const sentimentInfo = SENTIMENT_LABELS[record.studentSentiment as StudentSentiment] || SENTIMENT_LABELS.NEUTRAL;
            const typeLabel = TYPE_LABELS[record.consultationType as ConsultationType] || record.consultationType;
            const methodLabel = METHOD_LABELS[record.method] || record.method;

            return (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition duration-150 space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                      {record.consultationDate}
                    </span>
                    {record.startTime && (
                      <span className="text-xs text-gray-500">
                        {record.startTime} ({record.durationMinutes}분)
                      </span>
                    )}
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => onSelectStudent(record.studentId)}
                      className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center bg-blue-50/70 px-2 py-0.5 rounded-md"
                    >
                      {record.studentName} ({record.grade}학년 {record.classNumber}반)
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${categoryInfo.badgeBg}`}>
                      {categoryInfo.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {typeLabel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold flex items-center text-gray-700">
                      <span className="mr-1">{sentimentInfo.icon}</span>
                      {sentimentInfo.label}
                    </span>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 transition"
                      title="상담 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Topic & Content */}
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">{record.topic}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                    {record.content}
                  </p>
                </div>

                {/* Follow up & details */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {record.followUpPlan ? (
                    <div className="text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-md text-xs font-medium">
                      📌 <strong>향후 지도/후속 조치:</strong> {record.followUpPlan}
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="text-gray-500 flex items-center space-x-3 text-[11px]">
                    {record.nextScheduleDate && (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm font-semibold">
                        차기 일정: {record.nextScheduleDate}
                      </span>
                    )}
                    <span>방식: {methodLabel}</span>
                    <span>담당: {record.counselorName}</span>
                  </div>
                </div>

                {/* Tags */}
                {record.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {record.tags.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

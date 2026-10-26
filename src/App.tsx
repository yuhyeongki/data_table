import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { StudentListView } from './components/StudentListView.tsx';
import { ConsultationListView } from './components/ConsultationListView.tsx';
import { DatabaseInfoView } from './components/DatabaseInfoView.tsx';
import { StudentDetailModal } from './components/StudentDetailModal.tsx';
import { NewConsultationModal } from './components/NewConsultationModal.tsx';
import { NewStudentModal } from './components/NewStudentModal.tsx';
import { Student, Consultation, DashboardStats } from './types/counseling.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'consultations' | 'db_info'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingConsultations, setLoadingConsultations] = useState(true);

  // Modals state
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [consultationStudentId, setConsultationStudentId] = useState<number | null>(null);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Fetch stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error('Fetch students error:', e);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const fetchConsultations = useCallback(async () => {
    try {
      const res = await fetch('/api/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
      }
    } catch (e) {
      console.error('Fetch consultations error:', e);
    } finally {
      setLoadingConsultations(false);
    }
  }, []);

  const refreshAllData = useCallback(() => {
    fetchStats();
    fetchStudents();
    fetchConsultations();
  }, [fetchStats, fetchStudents, fetchConsultations]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleOpenConsultationModal = (studentId?: number) => {
    setConsultationStudentId(studentId || null);
    setIsNewConsultationOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewConsultation={() => handleOpenConsultationModal()}
        onOpenNewStudent={() => setIsNewStudentOpen(true)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            loading={loadingStats}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenNewConsultation={() => handleOpenConsultationModal()}
            onViewAllStudents={() => setActiveTab('students')}
            onViewAllConsultations={() => setActiveTab('consultations')}
          />
        )}

        {activeTab === 'students' && (
          <StudentListView
            students={students}
            loading={loadingStudents}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenNewStudent={() => setIsNewStudentOpen(true)}
            onOpenNewConsultationForStudent={(id) => handleOpenConsultationModal(id)}
          />
        )}

        {activeTab === 'consultations' && (
          <ConsultationListView
            consultations={consultations}
            loading={loadingConsultations}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenNewConsultation={() => handleOpenConsultationModal()}
            onDataChanged={refreshAllData}
          />
        )}

        {activeTab === 'db_info' && <DatabaseInfoView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© 2026 EduCounsel 학생 상담 정보 시스템. PostgreSQL Cloud DB 연동 운영 중.</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('db_info')}
              className="text-blue-600 hover:underline font-medium"
            >
              Supabase / PostgreSQL 스키마 확인
            </button>
            <span>상담 데이터 암호화 및 개인정보 보호 준수</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedStudentId !== null && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onOpenNewConsultationForStudent={(id) => handleOpenConsultationModal(id)}
          onDataChanged={refreshAllData}
        />
      )}

      {isNewConsultationOpen && (
        <NewConsultationModal
          students={students}
          initialStudentId={consultationStudentId}
          counselorName={currentUser?.displayName || '박진우 상담교사'}
          onClose={() => {
            setIsNewConsultationOpen(false);
            setConsultationStudentId(null);
          }}
          onSuccess={refreshAllData}
        />
      )}

      {isNewStudentOpen && (
        <NewStudentModal
          onClose={() => setIsNewStudentOpen(false)}
          onSuccess={(newId) => {
            refreshAllData();
            if (newId) {
              setSelectedStudentId(newId);
            }
          }}
        />
      )}
    </div>
  );
}

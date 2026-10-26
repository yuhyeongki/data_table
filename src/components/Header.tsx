import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  PlusCircle,
  Database,
  UserPlus,
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'dashboard' | 'students' | 'consultations' | 'db_info';
  setActiveTab: (tab: 'dashboard' | 'students' | 'consultations' | 'db_info') => void;
  onOpenNewConsultation: () => void;
  onOpenNewStudent: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewConsultation,
  onOpenNewStudent,
  currentUser,
  setCurrentUser,
}) => {
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync with backend DB
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            }),
          });
        } catch (e) {
          console.warn('User sync skipped:', e);
        }
      }
    });
    return () => unsubscribe();
  }, [setCurrentUser]);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-gray-900 tracking-tight">EduCounsel</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  PostgreSQL Cloud 연결됨
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden md:block">
                학생별 상담 이력 체계적 관리 및 인사이트 대시보드
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'students'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 mr-1.5" />
              학생 관리
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'consultations'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              상담 일지
            </button>
            <button
              onClick={() => setActiveTab('db_info')}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'db_info'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Database className="w-4 h-4 mr-1.5" />
              DB / Supabase
            </button>
          </nav>

          {/* Right Action Buttons & Auth */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewStudent}
              className="hidden lg:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              학생 등록
            </button>
            <button
              onClick={onOpenNewConsultation}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              상담 등록
            </button>

            {/* Auth Button */}
            <div className="pl-2 border-l border-gray-200">
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || '상담사'}
                      className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0] : '교'}
                    </div>
                  )}
                  <div className="hidden xl:block text-left text-xs">
                    <p className="font-semibold text-gray-800 leading-tight">
                      {currentUser.displayName || '상담 교사'}
                    </p>
                    <p className="text-gray-500 text-[10px] truncate max-w-[100px]">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="로그아웃"
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                  title="Google 계정으로 로그인하여 상담사 프로필 연동"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  {authLoading ? '로그인 중...' : 'Google 로그인'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

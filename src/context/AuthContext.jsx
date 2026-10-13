import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hutech_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [lastUser, setLastUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hutech_last_user');
      if (stored) return JSON.parse(stored);
      const cur = localStorage.getItem('hutech_user');
      return cur ? JSON.parse(cur) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Lưu hoặc xóa user khỏi localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hutech_user', JSON.stringify(user));
      localStorage.setItem('hutech_last_user', JSON.stringify(user));
      setLastUser(user);
    } else {
      localStorage.removeItem('hutech_user');
      // Giữ lại hutech_last_user để sau khi đăng xuất vẫn nhớ MSSV từng đăng nhập và có TKB
    }
  }, [user]);

  const login = async (emailOrMssv) => {
    const trimmed = (emailOrMssv || '').trim();
    if (!trimmed) {
      throw new Error('Vui lòng nhập địa chỉ email sinh viên HUTECH.');
    }

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed, username: trimmed })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Xác thực tài khoản HUTECH không thành công.');
    }

    setUser(data.user);
    setLastUser(data.user);
    localStorage.setItem('hutech_last_user', JSON.stringify(data.user));
    setIsLoginModalOpen(false);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hutech_user');
    // KHÔNG xóa hutech_last_user để cho phép xem TKB đã lưu trước đó
  };

  const deleteAccount = async (username) => {
    try {
      await fetch(`${API_BASE}/api/user?username=${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Lỗi xóa tài khoản:', e);
    }
    // Xóa toàn bộ localStorage liên quan
    localStorage.removeItem('hutech_user');
    localStorage.removeItem('hutech_last_user');
    setUser(null);
    setLastUser(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        lastUser,
        login,
        logout,
        deleteAccount,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

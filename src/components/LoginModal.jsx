import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  X,
  LogIn,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  KeyRound
} from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successUser, setSuccessUser] = useState(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email.trim());
      setSuccessUser(user);
      setTimeout(() => {
        setSuccessUser(null);
        closeLoginModal();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Không thể tra cứu thông tin sinh viên.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#F0E0BF] shadow-2xl p-6 sm:p-7 overflow-hidden transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FFB000]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF7700]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8C7A5E] hover:text-[#1A1200] hover:bg-[#F5EAD4] transition cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9F00] to-[#FFBF33] flex items-center justify-center text-[#1A1200] shadow-md shadow-[#FFB000]/20 shrink-0">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg sm:text-xl font-black text-[#1A1200] tracking-tight">
                Đăng Nhập
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#8C7A5E] mt-0.5">
              Xác thực qua Email trường & lưu lịch sử học tập cá nhân
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successUser && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#E8F8EE] border border-[#A7E7BA] flex items-center gap-3 text-[#136C38] animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A]" />
            <div className="text-xs sm:text-sm font-bold">
              Xin chào, <span className="font-extrabold">{successUser.name}</span> (MSSV: {successUser.username})!
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#FEECEB] border border-[#FCA5A5] flex items-start gap-3 text-[#B91C1C] animate-in shake duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#DC2626]" />
            <div className="text-xs sm:text-sm font-semibold leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#665435] mb-1.5">
              Địa Chỉ Email Sinh Viên HUTECH
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A49479]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="tên+mssv@hutech.edu.vn"
                disabled={isLoading || Boolean(successUser)}
                className="w-full pl-10 pr-9 py-3 rounded-2xl bg-[#FBF7EE] border border-[#E7D6B3] text-sm sm:text-base font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-2 focus:ring-[#FFB000] focus:border-transparent transition shadow-inner"
              />
              {email && !isLoading && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A49479] hover:text-[#1A1200] p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Demo Pill */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#8C7A5E]">Gợi ý nhanh:</span>
            <button
              type="button"
              onClick={() => handleQuickFill('tên+mssv@hutech.edu.vn')}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-[#FFF2D6] hover:bg-[#FFE3A0] text-[#784C00] border border-[#F0D8A8] transition cursor-pointer"
            >
              ⚡ tên+mssv
            </button>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || Boolean(successUser)}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-[#1A1200] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#FFB000]/25 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xác thực tk...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Xác Thực Email & Đăng Nhập</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

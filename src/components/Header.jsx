import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import {
  GraduationCap,
  LogIn,
  LogOut,
  ChevronDown,
  CalendarDays,
  Menu,
  X,
  MessageSquare,
  Compass,
  Sparkles,
  Info,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function Header() {
  const [isSolid, setIsSolid] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const location = useLocation();
  const { user, openLoginModal, logout, deleteAccount } = useAuth();
  const [modelBadge, setModelBadge] = useState('Gemini 3.1 Flash-lite');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => res.json())
      .then(data => {
        if (data.displayBadge) {
          setModelBadge(data.displayBadge);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSolid(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng tất cả dropdown / menu khi chuyển trang
  useEffect(() => {
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Đóng popup khi click ngoài hoặc ấn ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowUserDropdown(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDropdown, mobileMenuOpen]);

  const isChatActive = location.pathname === '/' || location.pathname === '/chat';
  const isRoadmapActive = location.pathname === '/roadmap';
  const isTkbActive = location.pathname === '/tkb';
  const isAboutActive = location.pathname === '/about';

  return (
    <>
    <header
      id="hd"
      className={`fixed top-0 left-0 right-0 z-50 bg-[#FFFBF1]/95 backdrop-blur-md border-b border-[#F0E0BF]/80 transition-shadow duration-200 ${isSolid ? 'shadow-xs' : ''
        }`}
    >
      <div className="in max-w-6xl mx-auto h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link className="logo flex items-center gap-2 sm:gap-2.5 shrink-0" to="/">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFB000] flex items-center justify-center text-[#1A1200] shadow-xs shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base md:text-lg leading-tight text-[#1A1200] tracking-tight whitespace-nowrap">
              AI Chuyên Ngành
            </span>
            <span className="text-[10px] font-bold text-[#8C7A5E] tracking-normal leading-none hidden lg:block">
              Trợ lý học tập 24/7
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Ẩn trên mobile để không bị tràn màn hình) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF5DC] text-[#7A5B00] border border-[#F0DFBD]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{modelBadge}</span>
          </div>

          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isChatActive
              ? 'bg-[#FFB000] text-[#1A1200] shadow-xs ring-2 ring-[#FFB000]/30'
              : 'bg-black/5 hover:bg-black/10 text-[#1A1200]'
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </Link>

          <Link
            to="/roadmap"
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isRoadmapActive
              ? 'bg-[#FFB000] text-[#1A1200] shadow-xs ring-2 ring-[#FFB000]/30'
              : 'bg-black/5 hover:bg-black/10 text-[#1A1200]'
              }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Lộ trình</span>
          </Link>

          <Link
            to="/tkb"
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isTkbActive
              ? 'bg-[#FFB000] text-[#1A1200] shadow-xs ring-2 ring-[#FFB000]/30'
              : 'bg-black/5 hover:bg-black/10 text-[#1A1200]'
              }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Thời khóa biểu</span>
          </Link>
        </nav>

        {/* Right Section: Auth & Mobile Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* HUTECH User Login / Profile Badge */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FFEFC7] hover:bg-[#FFE8AE] border border-[#F0DCAC] text-[#1A1200] transition shadow-2xs cursor-pointer"
                title={`${user.name} (${user.username}) - ${user.masked_email || ''}`}
              >
                <div className="w-6 h-6 rounded-full bg-[#FF9F00] text-[#1A1200] flex items-center justify-center text-xs font-black shrink-0">
                  {user.name ? user.name.slice(-1) : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-black leading-tight max-w-[70px] sm:max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#8C7A5E] leading-none hidden sm:inline">
                    MSSV: {user.username}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8C7A5E] transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (Desktop & Mobile) */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFDF7] rounded-2xl border border-[#F0E0BF] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-[#F0E0BF]/80 mb-2">
                    <div className="text-xs font-bold text-[#8C7A5E]">Sinh viên HUTECH</div>
                    <div className="text-sm font-black text-[#1A1200]">{user.name}</div>
                    <div className="text-xs font-bold text-[#FF9F00] mt-0.5">MSSV: {user.username}</div>
                    {user.masked_email && (
                      <div className="text-[11px] text-[#8C7A5E] truncate mt-0.5">
                        {user.masked_email}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/tkb"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#7A5B00] hover:bg-[#FFF5DC] transition cursor-pointer mb-1"
                  >
                    <CalendarDays className="w-4 h-4 text-[#FFB000]" />
                    <span>Xem Thời Khóa Biểu</span>
                  </Link>

                  <Link
                    to="/roadmap"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#7A5B00] hover:bg-[#FFF5DC] transition cursor-pointer mb-1"
                  >
                    <Compass className="w-4 h-4 text-[#FFB000]" />
                    <span>Lộ trình học tập</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#B91C1C] hover:bg-[#FEECEB] transition cursor-pointer mb-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất tài khoản</span>
                  </button>

                  <div className="border-t border-[#F0E0BF]/60 my-1" />

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#7F1D1D] hover:bg-[#FEE2E2] transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa toàn bộ dữ liệu của tôi</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-[#FFB000] hover:bg-[#EAA000] active:scale-98 text-[#1A1200] shadow-xs transition cursor-pointer shrink-0"
              title="Đăng nhập tài khoản sinh viên qua Email HUTECH "
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Đăng nhập HUTECH</span>
              <span className="xs:hidden">Đăng nhập</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button (Chỉ hiển thị trên mobile < md) */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl bg-black/5 hover:bg-black/10 active:scale-95 text-[#1A1200] transition cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
            title="Menu điều hướng"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#1A1200]" />
            ) : (
              <Menu className="w-5 h-5 text-[#1A1200]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-Down Menu (Chỉ hiển thị khi bấm menu trên Mobile) */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-[#F0E0BF]/80 bg-[#FFFDF7]/98 backdrop-blur-xl px-4 py-3.5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150"
        >
          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-1.5">
            <Link
              to="/"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${isChatActive
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'bg-black/4 hover:bg-black/8 text-[#2A200A]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Chat AI Trợ Lý</span>
              </div>
              {isChatActive && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1A1200] text-[#FFB000]">
                  Đang mở
                </span>
              )}
            </Link>

            <Link
              to="/roadmap"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${isRoadmapActive
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'bg-black/4 hover:bg-black/8 text-[#2A200A]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>Lộ trình môn học</span>
              </div>
              {isRoadmapActive && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1A1200] text-[#FFB000]">
                  Đang mở
                </span>
              )}
            </Link>

            <Link
              to="/tkb"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${isTkbActive
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'bg-black/4 hover:bg-black/8 text-[#2A200A]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4" />
                <span>Thời khóa biểu SV</span>
              </div>
              {isTkbActive && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1A1200] text-[#FFB000]">
                  Đang mở
                </span>
              )}
            </Link>

            <Link
              to="/about"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${isAboutActive
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'bg-black/4 hover:bg-black/8 text-[#2A200A]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4" />
                <span>Giới thiệu đề tài</span>
              </div>
              {isAboutActive && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1A1200] text-[#FFB000]">
                  Đang mở
                </span>
              )}
            </Link>
          </div>

          {/* AI Status Badge */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FFF5DC] border border-[#F0DFBD] text-xs font-bold text-[#7A5B00]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>{modelBadge}</span>
            </div>
            <span className="text-[10px] bg-[#FFB000]/25 text-[#1A1200] px-2 py-0.5 rounded-full font-black">
              Trực tuyến 24/7
            </span>
          </div>

          {/* User Mobile Status Card */}
          {user ? (
            <div className="p-3 rounded-2xl bg-[#FFEFC7]/60 border border-[#F0DCAC] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF9F00] text-[#1A1200] flex items-center justify-center text-xs font-black">
                    {user.name ? user.name.slice(-1) : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#1A1200]">{user.name}</div>
                    <div className="text-[10px] font-bold text-[#8C7A5E]">MSSV: {user.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openLoginModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Đăng nhập Email HUTECH</span>
            </button>
          )}
        </div>
      )}
    </header>

      {/* Modal xác nhận xóa toàn bộ dữ liệu */}
      {showDeleteConfirm && user && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-100 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Xóa toàn bộ dữ liệu?</h3>
                <p className="text-xs text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 space-y-1">
              <p className="font-bold">Sẽ xóa vĩnh viễn:</p>
              <ul className="list-disc list-inside space-y-0.5 font-medium">
                <li>Toàn bộ lịch sử trò chuyện</li>
                <li>Dữ liệu thời khóa biểu đã đồng bộ</li>
                <li>Lộ trình học tập &amp; tiến độ</li>
                <li>Hồ sơ tài khoản: <span className="font-black">{user.name} ({user.username})</span></li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingAccount}
                className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  setDeletingAccount(true);
                  await deleteAccount(user.username);
                  setDeletingAccount(false);
                  setShowDeleteConfirm(false);
                }}
                disabled={deletingAccount}
                className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deletingAccount ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

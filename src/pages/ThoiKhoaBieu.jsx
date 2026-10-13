import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import {
  CalendarDays,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogIn,
  Layers,
  Calendar,
  X,
  BookOpen,
  Coffee,
  Check,
  Info
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'all', label: 'Tất cả các thứ' },
  { id: '2', label: 'Thứ 2' },
  { id: '3', label: 'Thứ 3' },
  { id: '4', label: 'Thứ 4' },
  { id: '5', label: 'Thứ 5' },
  { id: '6', label: 'Thứ 6' },
  { id: '7', label: 'Thứ 7' },
  { id: 'CN', label: 'Chủ Nhật' },
];

const HUTECH_PERIODS = {
  1: { s: '06:45', e: '07:30' },
  2: { s: '07:30', e: '08:15' },
  3: { s: '08:15', e: '09:00' },
  4: { s: '09:15', e: '10:00' },
  5: { s: '10:00', e: '10:45' },
  6: { s: '10:45', e: '11:30' },
  7: { s: '12:30', e: '13:15' },
  8: { s: '13:15', e: '14:00' },
  9: { s: '14:00', e: '14:45' },
  10: { s: '15:00', e: '15:45' },
  11: { s: '15:45', e: '16:30' },
  12: { s: '16:30', e: '17:15' },
  13: { s: '17:45', e: '18:30' },
  14: { s: '18:30', e: '19:15' },
  15: { s: '19:15', e: '20:00' },
  16: { s: '20:00', e: '20:45' },
};

function getPeriodTime(tietBd, soTiet) {
  const bd = parseInt(tietBd, 10);
  const st = parseInt(soTiet, 10) || 1;
  const kt = bd + st - 1;
  const start = HUTECH_PERIODS[bd]?.s || '';
  const end = HUTECH_PERIODS[kt]?.e || '';
  return start && end ? `${start} – ${end}` : `Tiết ${bd}`;
}

function getSessionLabel(tietBd) {
  const bd = parseInt(tietBd, 10);
  if (bd <= 6) return { label: 'Sáng', color: 'bg-amber-50 border-amber-200 text-amber-800' };
  if (bd <= 12) return { label: 'Chiều', color: 'bg-sky-50 border-sky-200 text-sky-800' };
  return { label: 'Tối', color: 'bg-violet-50 border-violet-200 text-violet-800' };
}

// Parse "DD/MM/YYYY" -> Date
function parseVNDate(str) {
  if (!str) return null;
  const parts = str.trim().split('/');
  if (parts.length < 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDateVN(date) {
  if (!date) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatShortDate(date) {
  if (!date) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

// Lấy Thứ 2 của tuần chứa date
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Trạng thái môn học theo khoảng thời gian tổng quát
function getScheduleStatus(thoiGian) {
  if (!thoiGian) return null;
  const parts = thoiGian.split('-').map(s => s.trim());
  if (parts.length < 2) return null;
  const start = parseVNDate(parts[0]);
  const end = parseVNDate(parts[1]);
  if (!start || !end) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

const STATUS_BADGE = {
  active: { label: 'Đang học', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  upcoming: { label: 'Chưa bắt đầu', cls: 'bg-blue-100 text-blue-700 border-blue-300' },
  ended: { label: 'Đã hoàn thành', cls: 'bg-gray-100 text-gray-500 border-gray-300' },
};

// ──────── CARD MÔN HỌC (Lịch Toàn Kỳ) ────────
function OverviewLessonCard({ course, lh, expandedCourseId, setExpandedCourseId, courseKey }) {
  const time = getPeriodTime(lh.tiet_bd, lh.so_tiet);
  const session = getSessionLabel(lh.tiet_bd);
  const status = getScheduleStatus(lh.thoi_gian);
  const badge = status ? STATUS_BADGE[status] : null;
  const isExpanded = expandedCourseId === courseKey;
  const isUpcoming = status === 'upcoming';
  const isEnded = status === 'ended';

  return (
    <div className={`rounded-2xl border p-4 text-xs transition duration-150 hover:shadow-xs relative ${isEnded ? 'bg-gray-50/80 border-gray-200 text-gray-500 opacity-65' :
      isUpcoming ? 'bg-blue-50/40 border-blue-200/80' :
        'bg-white border-[#F0E0BF]'
      }`}>
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#FFEFC7] text-[#7A5B00] border border-[#F0DCAC]">
            {course.ma_hp}
          </span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${session.color}`}>
            {session.label}
          </span>
          {badge && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
        <span className="font-extrabold text-[11px] text-[#1A1200] px-2 py-0.5 rounded-lg bg-[#FFF8EA] border border-[#EEDDB8]">
          {lh.phong_hoc || '–'}
        </span>
      </div>

      {/* Course Title */}
      <h3 className={`text-sm font-black leading-snug mb-1.5 ${isEnded ? 'text-gray-500' : 'text-[#1A1200]'}`}>
        {course.ten_hp}
      </h3>

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] font-bold opacity-75 mb-2 text-[#6D5D44]">
        <span>Nhóm: {course.nhom || '–'}</span>
        <span>•</span>
        <span>{course.stc} Tín chỉ</span>
      </div>

      {/* Time and period */}
      <div className="flex items-center gap-1.5 font-bold text-xs text-[#1A1200] bg-[#FFFBF0] px-2.5 py-1.5 rounded-xl border border-[#F3E7C9] mb-2">
        <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <span>Tiết {lh.tiet_bd}–{parseInt(lh.tiet_bd) + parseInt(lh.so_tiet) - 1} ({time})</span>
      </div>

      {/* Date range notice */}
      {lh.thoi_gian && (
        <div className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isUpcoming ? 'bg-blue-100/60 text-blue-800' :
          isEnded ? 'bg-gray-100 text-gray-500' :
            'bg-emerald-50 text-emerald-800'
          }`}>
          📅 {lh.thoi_gian}
          {isUpcoming && <span className="ml-1 text-[10px] font-extrabold">(Chưa đến ngày học)</span>}
          {isEnded && <span className="ml-1 text-[10px] font-extrabold">(Đã kết thúc)</span>}
        </div>
      )}

      {/* Expanded detail dates */}
      {Array.isArray(course.chi_tiet_tkb) && course.chi_tiet_tkb.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <button
            onClick={() => setExpandedCourseId(isExpanded ? null : courseKey)}
            className="text-[11px] font-extrabold text-[#92400E] hover:text-[#B45309] flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isExpanded ? 'Thu gọn lịch chi tiết' : `Xem chi tiết ${course.chi_tiet_tkb.length} buổi học cụ thể`}</span>
          </button>
          {isExpanded && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 mt-2.5">
              {course.chi_tiet_tkb.map((dt, dIdx) => (
                <div key={dIdx} className="p-2 rounded-xl bg-white border border-[#EFE2C6] text-[10px] shadow-2xs">
                  <div className="font-black text-[#1A1200]">{dt.ngay_hoc}</div>
                  <div className="text-[#8C7A5E] mt-0.5">Thứ {dt.thu} • Tiết {dt.tiet_bd}</div>
                  <div className="font-bold text-[#B45309]">{dt.phong_hoc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────── THẺ BUỔI HỌC THEO TUẦN (Weekly Session Card) ────────
function WeeklySessionCard({ item }) {
  const { course, session } = item;
  const time = getPeriodTime(session.tiet_bd, session.so_tiet);
  const sessLabel = getSessionLabel(session.tiet_bd);

  return (
    <div className={`p-3 rounded-2xl border text-xs transition duration-150 shadow-2xs hover:shadow-xs ${sessLabel.color}`}>
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/70 border border-current/20">
          {sessLabel.label}
        </span>
        <span className="font-black text-[11px] px-2 py-0.5 rounded-md bg-white/80 border border-current/20 text-[#1A1200]">
          {session.phong_hoc || '–'}
        </span>
      </div>

      <div className="font-black text-[13px] leading-snug text-[#1A1200] mb-1">
        {course.ten_hp}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold opacity-75 mb-2">
        <span>{course.ma_hp}</span>
        <span>•</span>
        <span>Nhóm {course.nhom}</span>
        <span>•</span>
        <span>{course.stc} TC</span>
      </div>

      <div className="flex items-center gap-1.5 font-black text-[11px] text-[#1A1200] bg-white/60 p-1.5 rounded-xl border border-current/10">
        <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <span>Tiết {session.tiet_bd}–{parseInt(session.tiet_bd) + parseInt(session.so_tiet) - 1} ({time})</span>
      </div>
    </div>
  );
}

export default function ThoiKhoaBieu() {
  const { user, lastUser, openLoginModal } = useAuth();

  const [tkbList, setTkbList] = useState([]);
  const [tkbSyncedAt, setTkbSyncedAt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chế độ xem: 'week' (Theo tuần học thực tế) | 'overview' (Toàn kỳ tổng quát)
  const [viewMode, setViewMode] = useState('week');

  // Điều khiển tuần
  const [selectedMonday, setSelectedMonday] = useState(() => getMonday(new Date()));
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  // Lọc cho chế độ Overview
  const [overviewDay, setOverviewDay] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'ended'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal đồng bộ TKB
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMssv, setSyncMssv] = useState('');
  const [syncPassword, setSyncPassword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Tải TKB đã lưu khi user hoặc lastUser thay đổi
  useEffect(() => {
    const activeUsername = user?.username || lastUser?.username;
    if (activeUsername) {
      setSyncMssv(activeUsername);
      loadSavedTkb(activeUsername);
    } else {
      setTkbList([]);
      setTkbSyncedAt(null);
    }
  }, [user, lastUser]);

  const loadSavedTkb = async (username) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tkb?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.thoiKhoaBieu)) {
        setTkbList(data.thoiKhoaBieu);
        setTkbSyncedAt(data.tkbSyncedAt);
      } else {
        setTkbList([]);
      }
    } catch (err) {
      console.error('Lỗi tải TKB:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!syncMssv.trim() || !syncPassword || syncing) return;

    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/tkb/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: syncMssv.trim(),
          password: syncPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi đồng bộ thời khóa biểu.');
      }

      setTkbList(data.thoiKhoaBieu || []);
      setTkbSyncedAt(data.tkbSyncedAt);
      setSyncSuccess(true);

      setTimeout(() => {
        setShowSyncModal(false);
        setSyncSuccess(false);
        setSyncPassword('');
      }, 1200);
    } catch (err) {
      setSyncError(err.message || 'Không thể đồng bộ TKB.');
    } finally {
      setSyncing(false);
    }
  };

  // Tính tổng số tín chỉ
  const totalCredits = tkbList.reduce((acc, cur) => acc + (parseInt(cur.stc, 10) || 0), 0);

  // Tính các tuần học trong toàn kỳ dựa vào dữ liệu sinh viên
  const semesterWeeks = useMemo(() => {
    const dates = [];
    tkbList.forEach(course => {
      (course.chi_tiet_tkb || []).forEach(b => {
        const dt = parseVNDate(b.ngay_hoc);
        if (dt) dates.push(dt);
      });
    });

    if (dates.length === 0) {
      const currentMon = getMonday(new Date());
      return [{
        weekNum: 1,
        monday: currentMon,
        label: `Tuần 1: ${formatShortDate(currentMon)} – ${formatShortDate(new Date(currentMon.getTime() + 6 * 86400000))}`
      }];
    }

    dates.sort((a, b) => a - b);
    const minMon = getMonday(dates[0]);
    const maxMon = getMonday(dates[dates.length - 1]);

    const weeks = [];
    let curMon = new Date(minMon);
    let index = 1;

    while (curMon <= maxMon || weeks.length < 1) {
      const sun = new Date(curMon.getTime() + 6 * 86400000);
      weeks.push({
        weekNum: index,
        monday: new Date(curMon),
        label: `Tuần ${index} (${formatShortDate(curMon)} - ${formatShortDate(sun)})`
      });
      curMon = new Date(curMon.getTime() + 7 * 86400000);
      index++;
    }

    return weeks;
  }, [tkbList]);

  // Danh sách 7 ngày của tuần đang chọn
  const currentWeekDays = useMemo(() => {
    const todayStr = formatDateVN(new Date());
    const days = [
      { id: '2', name: 'Thứ 2', offset: 0 },
      { id: '3', name: 'Thứ 3', offset: 1 },
      { id: '4', name: 'Thứ 4', offset: 2 },
      { id: '5', name: 'Thứ 5', offset: 3 },
      { id: '6', name: 'Thứ 6', offset: 4 },
      { id: '7', name: 'Thứ 7', offset: 5 },
      { id: 'CN', name: 'Chủ Nhật', offset: 6 },
    ];

    return days.map(day => {
      const dayDate = new Date(selectedMonday.getTime() + day.offset * 86400000);
      const dateStr = formatDateVN(dayDate);
      const isToday = dateStr === todayStr;

      // Tìm tất cả các buổi học diễn ra vào ngày này
      const sessions = [];
      tkbList.forEach(course => {
        const matchesInDetail = (course.chi_tiet_tkb || []).filter(b => b.ngay_hoc === dateStr);
        if (matchesInDetail.length > 0) {
          matchesInDetail.forEach(session => {
            sessions.push({ course, session });
          });
        } else if (!course.chi_tiet_tkb || course.chi_tiet_tkb.length === 0) {
          // Fallback nếu không có chi tiết: kiểm tra thứ và khoảng thời gian
          (course.lich_hoc || []).forEach(lh => {
            const thu = String(lh.thu);
            const matchThu = thu === day.id || (day.id === 'CN' && (thu === 'CN' || thu === '1' || thu === '8'));
            if (matchThu) {
              const status = getScheduleStatus(lh.thoi_gian);
              if (status === 'active') {
                sessions.push({ course, session: lh });
              }
            }
          });
        }
      });

      // Sắp xếp theo tiết bắt đầu
      sessions.sort((a, b) => parseInt(a.session.tiet_bd) - parseInt(b.session.tiet_bd));

      return {
        ...day,
        date: dayDate,
        dateStr,
        shortDateStr: formatShortDate(dayDate),
        isToday,
        sessions
      };
    });
  }, [selectedMonday, tkbList]);

  // Thông tin ngày hôm nay và buổi học tiếp theo
  const todayBannerInfo = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateVN(today);
    const dayIndex = today.getDay(); // 0: CN, 1: T2, ...
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const todayName = dayNames[dayIndex];

    const todaySessions = [];
    const allFutureSessions = [];

    tkbList.forEach(course => {
      (course.chi_tiet_tkb || []).forEach(b => {
        const bDate = parseVNDate(b.ngay_hoc);
        if (b.ngay_hoc === todayStr) {
          todaySessions.push({ course, session: b });
        } else if (bDate && bDate > today) {
          allFutureSessions.push({ course, session: b, dateObj: bDate });
        }
      });
    });

    todaySessions.sort((a, b) => parseInt(a.session.tiet_bd) - parseInt(b.session.tiet_bd));
    allFutureSessions.sort((a, b) => {
      if (a.dateObj.getTime() !== b.dateObj.getTime()) return a.dateObj - b.dateObj;
      return parseInt(a.session.tiet_bd) - parseInt(b.session.tiet_bd);
    });

    return {
      todayName,
      todayStr,
      todaySessions,
      nextSession: allFutureSessions[0] || null
    };
  }, [tkbList]);

  // Phân loại đếm số lượng môn theo trạng thái
  const courseStatusCounts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let ended = 0;

    tkbList.forEach(c => {
      const status = getScheduleStatus(c.lich_hoc?.[0]?.thoi_gian);
      if (status === 'active') active++;
      else if (status === 'upcoming') upcoming++;
      else if (status === 'ended') ended++;
    });

    return { total: tkbList.length, active, upcoming, ended };
  }, [tkbList]);

  // Danh sách môn cho Overview View
  const overviewFilteredCourses = useMemo(() => {
    return tkbList.filter(course => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== 'all') {
        const st = getScheduleStatus(course.lich_hoc?.[0]?.thoi_gian);
        if (st !== statusFilter) return false;
      }

      // 2. Lọc theo thứ
      if (overviewDay !== 'all') {
        const hasDay = (course.lich_hoc || []).some(
          lh => String(lh.thu) === String(overviewDay) || (overviewDay === 'CN' && (lh.thu === 'CN' || lh.thu === '1' || lh.thu === '8'))
        );
        if (!hasDay) return false;
      }

      // 3. Lọc theo tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (course.ten_hp || '').toLowerCase().includes(q);
        const matchCode = (course.ma_hp || '').toLowerCase().includes(q);
        const matchRoom = (course.lich_hoc || []).some(lh => (lh.phong_hoc || '').toLowerCase().includes(q));
        if (!matchName && !matchCode && !matchRoom) return false;
      }

      return true;
    });
  }, [tkbList, overviewDay, statusFilter, searchTerm]);

  // Chuyển tuần trước / tuần sau
  const handlePrevWeek = () => {
    setSelectedMonday(new Date(selectedMonday.getTime() - 7 * 86400000));
  };

  const handleNextWeek = () => {
    setSelectedMonday(new Date(selectedMonday.getTime() + 7 * 86400000));
  };

  const handleCurrentWeek = () => {
    setSelectedMonday(getMonday(new Date()));
  };

  const isCurrentWeekSelected = formatDateVN(selectedMonday) === formatDateVN(getMonday(new Date()));
  const totalWeekSessions = currentWeekDays.reduce((acc, d) => acc + d.sessions.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fadeIn pb-16">
      {/* ──────── HEADER ──────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#F0E0BF]/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFB000] flex items-center justify-center text-[#1A1200] shadow-md shadow-[#FFB000]/25 shrink-0">
            <CalendarDays className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1200] tracking-tight">
                Thời Khóa Biểu Sinh Viên
              </h1>

            </div>
            <p className="text-xs font-semibold text-[#8C7A5E] mt-0.5">
              Tự động phân tách lịch học theo tuần thực tế và lịch toàn kỳ
            </p>
          </div>
        </div>

        {/* Nút thao tác Header */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => {
                setSyncMssv(user.username);
                setShowSyncModal(true);
                setSyncError(null);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] active:scale-98 text-[#1A1200] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              <span>{tkbList.length > 0 ? 'Đồng Bộ Lại TKB' : 'Lấy Thời Khóa Biểu'}</span>
            </button>
          ) : lastUser && tkbList.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSyncMssv(lastUser.username);
                  setShowSyncModal(true);
                  setSyncError(null);
                }}
                className="px-3 sm:px-4 py-2 rounded-2xl bg-[#FFEFC7] hover:bg-[#FFE8AE] border border-[#F0DCAC] text-[#1A1200] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#B45309]" />
                <span>Đồng Bộ Lại</span>
              </button>
              <button
                onClick={openLoginModal}
                className="px-3 sm:px-4 py-2 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Đăng nhập</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="px-4 py-2 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Đăng nhập để xem TKB</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Banner */}
      {!user && (
        <div className="my-5 p-4 rounded-3xl bg-[#FFF6DE] border border-[#F3DFB5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 text-[#7A5B00] font-bold text-xs sm:text-sm">
            <Sparkles className="w-5 h-5 text-[#D97706] shrink-0" />
            <span>
              {lastUser && tkbList.length > 0
                ? `Bạn đang xem lịch học đã lưu của sinh viên ${lastUser.name} (MSSV: ${lastUser.username}). Đăng nhập để đồng bộ mới.`
                : 'Bạn chưa đăng nhập. Vui lòng đăng nhập hoặc nhập mật khẩu để lấy thời khóa biểu cá nhân.'}
            </span>
          </div>
          <button
            onClick={openLoginModal}
            className="px-4 py-1.5 rounded-xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs shrink-0 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>
        </div>
      )}

      {/* User Stats Card */}
      {(user || lastUser) && tkbList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 my-4 sm:my-5">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6] shadow-2xs">
            <div className="text-[11px] font-bold text-[#8C7A5E] uppercase tracking-wider">Sinh Viên</div>
            <div className="text-sm sm:text-base font-black text-[#1A1200] truncate mt-0.5">{(user || lastUser).name}</div>
            <div className="text-[10px] font-extrabold text-[#C27803]">MSSV: {(user || lastUser).username}</div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6] shadow-2xs">
            <div className="text-[11px] font-bold text-[#8C7A5E] uppercase tracking-wider">Tổng Môn Học</div>
            <div className="text-lg sm:text-xl font-black text-[#1A1200] mt-0.5">
              {tkbList.length} <span className="text-xs font-bold text-[#8C7A5E]">môn</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {courseStatusCounts.active} môn đang trong kỳ
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6] shadow-2xs">
            <div className="text-[11px] font-bold text-[#8C7A5E] uppercase tracking-wider">Tổng Tín Chỉ</div>
            <div className="text-lg sm:text-xl font-black text-[#1A1200] mt-0.5">
              {totalCredits} <span className="text-xs font-bold text-[#8C7A5E]">tín chỉ</span>
            </div>
            <div className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {courseStatusCounts.upcoming} môn chưa đến ngày
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6] shadow-2xs">
            <div className="text-[11px] font-bold text-[#8C7A5E] uppercase tracking-wider">Cập Nhật</div>
            <div className="text-xs sm:text-sm font-black text-[#1A1200] mt-1 truncate">
              {tkbSyncedAt ? new Date(tkbSyncedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Chưa có'}
            </div>
            <div className="text-[10px] font-bold text-[#8C7A5E]">Đồng bộ tự động</div>
          </div>
        </div>
      )}

      {/* ──────── TODAY HERO BANNER ──────── */}
      {user && tkbList.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF6E3] via-[#FFF9ED] to-[#FFF0D4] border border-[#F3DEB0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFB000] text-[#1A1200] text-[10px] font-black uppercase tracking-wider">
                Hôm nay
              </span>
              <span className="text-xs sm:text-sm font-black text-[#1A1200]">
                {todayBannerInfo.todayName}, ngày {todayBannerInfo.todayStr}
              </span>
            </div>

            {todayBannerInfo.todaySessions.length > 0 ? (
              <div className="pt-1">
                <p className="text-xs font-black text-[#92400E]">
                  🎯 Bạn có {todayBannerInfo.todaySessions.length} buổi học hôm nay:
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {todayBannerInfo.todaySessions.map((item, idx) => (
                    <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EED9AF] text-xs shadow-2xs">
                      <span className="font-black text-[#1A1200]">{item.course.ten_hp}</span>
                      <span className="text-[#8C7A5E]">Tiết {item.session.tiet_bd} ({getPeriodTime(item.session.tiet_bd, item.session.so_tiet)})</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FFEFC7] text-[#7A5B00] font-black text-[10px]">
                        {item.session.phong_hoc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A5B00] pt-1">
                <Coffee className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>Hôm nay bạn không có lịch học nào. Tận hưởng thời gian tự học & nghỉ ngơi! 🎉</span>
              </div>
            )}
          </div>

          {/* Buổi học kế tiếp nếu hôm nay không có lớp */}
          {todayBannerInfo.todaySessions.length === 0 && todayBannerInfo.nextSession && (
            <div className="p-3 rounded-2xl bg-white/80 border border-[#EED9AF] shrink-0 text-xs">
              <div className="text-[10px] font-bold text-[#8C7A5E] uppercase tracking-wider">Buổi học kế tiếp</div>
              <div className="font-black text-[#1A1200] mt-0.5">{todayBannerInfo.nextSession.course.ten_hp}</div>
              <div className="text-[11px] font-bold text-[#92400E] mt-0.5">
                📅 {todayBannerInfo.nextSession.session.ngay_hoc} (Thứ {todayBannerInfo.nextSession.session.thu}) • Phòng {todayBannerInfo.nextSession.session.phong_hoc}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────── VIEW MODE TOGGLE & CONTROLS ──────── */}
      {user && tkbList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 p-2 rounded-2xl bg-[#FFF9ED] border border-[#F0E0BF]">
          {/* Switch giữa Xem Theo Tuần và Toàn Kỳ */}
          <div className="flex items-center p-1 rounded-xl bg-[#FFF0CE] border border-[#EEDBB0]">
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${viewMode === 'week'
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'text-[#7A6A4E] hover:text-[#1A1200]'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch Tuần Học Thực Tế</span>
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${viewMode === 'overview'
                ? 'bg-[#FFB000] text-[#1A1200] shadow-xs'
                : 'text-[#7A6A4E] hover:text-[#1A1200]'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lịch Toàn Kỳ (Tổng Quát)</span>
            </button>
          </div>

          {/* Quick Notice */}
          <div className="text-[11px] font-bold text-[#8C7A5E] flex items-center gap-1.5 px-2">
            <Info className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>
              {viewMode === 'week'
                ? 'Chỉ hiển thị các môn thực sự có lịch học trong tuần được chọn'
                : 'Xem tổng quan tất cả môn học trong kỳ kèm trạng thái bắt đầu'}
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CHẾ ĐỘ 1: XEM THEO TUẦN THỰC TẾ (WEEK VIEW)
      ══════════════════════════════════════════════ */}
      {user && tkbList.length > 0 && viewMode === 'week' && (
        <div className="space-y-4">
          {/* Tuần Selector Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6]">
            {/* Nút lùi/tiến tuần */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-xl border border-[#E6D4B2] bg-white hover:bg-[#FFF4DC] text-[#1A1200] transition cursor-pointer"
                title="Tuần trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleCurrentWeek}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${isCurrentWeekSelected
                  ? 'bg-[#FFB000] text-[#1A1200] border-[#EAA000] shadow-2xs'
                  : 'bg-white hover:bg-[#FFF4DC] text-[#7A6A4E] border-[#E6D4B2]'
                  }`}
              >
                Hôm Nay
              </button>

              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-xl border border-[#E6D4B2] bg-white hover:bg-[#FFF4DC] text-[#1A1200] transition cursor-pointer"
                title="Tuần sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown chọn tuần học trong kỳ */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
              <select
                value={formatDateVN(selectedMonday)}
                onChange={(e) => {
                  const targetMon = parseVNDate(e.target.value);
                  if (targetMon) setSelectedMonday(targetMon);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E6D4B2] text-xs font-black text-[#1A1200] focus:outline-none focus:ring-2 focus:ring-[#FFB000] cursor-pointer"
              >
                {semesterWeeks.map((w) => {
                  const monStr = formatDateVN(w.monday);
                  const isCur = monStr === formatDateVN(getMonday(new Date()));
                  return (
                    <option key={monStr} value={monStr}>
                      {w.label} {isCur ? '⭐ (Hiện tại)' : ''}
                    </option>
                  );
                })}
              </select>

              <div className="text-xs font-extrabold text-[#92400E] px-2.5 py-1 rounded-xl bg-[#FFF0CE] border border-[#EEDBB0]">
                {totalWeekSessions} buổi học
              </div>
            </div>
          </div>

          {/* Lưới 7 Ngày trong tuần */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {currentWeekDays.map((day) => {
              return (
                <div
                  key={day.id}
                  className={`flex flex-col rounded-2xl border p-2.5 transition duration-150 ${day.isToday
                    ? 'bg-[#FFF9ED] border-[#FFB000] ring-2 ring-[#FFB000]/30 shadow-xs'
                    : 'bg-[#FFFDF7] border-[#EFE2C6]'
                    }`}
                >
                  {/* Day Header */}
                  <div className={`flex items-center justify-between pb-2 mb-2 border-b ${day.isToday ? 'border-[#FFB000]/30' : 'border-[#F0E0BF]/60'
                    }`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${day.isToday ? 'text-[#92400E]' : 'text-[#1A1200]'}`}>
                          {day.name}
                        </span>
                        {day.isToday && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#FFB000] text-[#1A1200]">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-[#8C7A5E]">
                        {day.shortDateStr}
                      </div>
                    </div>
                    {day.sessions.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFEFC7] text-[#92400E] border border-[#F0DCAC]">
                        {day.sessions.length}
                      </span>
                    )}
                  </div>

                  {/* Danh sách các buổi học trong ngày */}
                  <div className="flex-1 space-y-2">
                    {day.sessions.length > 0 ? (
                      day.sessions.map((item, idx) => (
                        <WeeklySessionCard key={idx} item={item} />
                      ))
                    ) : (
                      <div className="py-8 text-center text-[11px] font-bold text-[#A49479] flex flex-col items-center justify-center gap-1">
                        <Coffee className="w-4 h-4 opacity-40 text-[#8C7A5E]" />
                        <span>Nghỉ học</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CHẾ ĐỘ 2: XEM TOÀN KỲ TỔNG QUÁT (OVERVIEW VIEW)
      ══════════════════════════════════════════════ */}
      {user && tkbList.length > 0 && viewMode === 'overview' && (
        <div className="space-y-4">
          {/* Bộ lọc trạng thái môn học */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFFDF7] border border-[#EFE2C6]">
            {/* Filter trạng thái */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <span className="text-xs font-bold text-[#8C7A5E] mr-1">Trạng thái:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${statusFilter === 'all'
                  ? 'bg-[#FFB000] text-[#1A1200]'
                  : 'bg-white text-[#7A6A4E] border border-[#E6D4B2] hover:bg-[#FFF4DC]'
                  }`}
              >
                Tất cả ({courseStatusCounts.total})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Đang học ({courseStatusCounts.active})
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${statusFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Chưa đến ngày ({courseStatusCounts.upcoming})
              </button>
              <button
                onClick={() => setStatusFilter('ended')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${statusFilter === 'ended'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Đã xong ({courseStatusCounts.ended})
              </button>
            </div>

            {/* Ô tìm kiếm môn học */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A49479]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm môn học, phòng..."
                className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white border border-[#E6D4B2] text-xs font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-2 focus:ring-[#FFB000]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A49479] hover:text-[#1A1200]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter theo thứ trong tuần */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = overviewDay === day.id;
              const count = day.id === 'all'
                ? overviewFilteredCourses.length
                : overviewFilteredCourses.filter(c =>
                  (c.lich_hoc || []).some(lh => String(lh.thu) === day.id || (day.id === 'CN' && (lh.thu === 'CN' || lh.thu === '1' || lh.thu === '8')))
                ).length;

              return (
                <button
                  key={day.id}
                  onClick={() => setOverviewDay(day.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${isActive
                    ? 'bg-[#FFB000] text-[#1A1200] shadow-sm ring-2 ring-[#FFB000]/30'
                    : 'bg-[#FFF8EA] text-[#7A6A4E] hover:bg-[#FFEEC7] border border-[#F0DFBE]'
                    }`}
                >
                  {day.label}
                  {count > 0 && (
                    <span className={`ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#1A1200]/15 text-[#1A1200]' : 'bg-[#FFB000]/20 text-[#92400E]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Danh sách thẻ môn học Toàn Kỳ */}
          {overviewFilteredCourses.length === 0 ? (
            <div className="text-center py-12 text-xs font-bold text-[#8C7A5E] bg-[#FFFDF7] rounded-3xl border border-[#EFE2C6]">
              Không tìm thấy môn học nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {overviewFilteredCourses.flatMap((course, cIdx) =>
                (course.lich_hoc || []).map((lh, lIdx) => {
                  const courseKey = `${course.ma_hp}-${course.nhom || cIdx}-${lh.tiet_bd}-${lIdx}`;
                  return (
                    <OverviewLessonCard
                      key={courseKey}
                      course={course}
                      lh={lh}
                      courseKey={courseKey}
                      expandedCourseId={expandedCourseId}
                      setExpandedCourseId={setExpandedCourseId}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center text-xs font-bold text-[#8C7A5E]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FFB000] mb-2" />
          <span>Đang tải thông tin thời khóa biểu...</span>
        </div>
      )}

      {/* Empty state khi chưa có TKB */}
      {!loading && (user || lastUser) && tkbList.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#FFFDF7] rounded-3xl border border-[#EFE2C6] space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF2D6] text-[#FFB000] flex items-center justify-center mx-auto border border-[#F0DCAC]">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-[#1A1200]">Chưa Có Dữ Liệu Thời Khóa Biểu</h3>
          <p className="text-xs text-[#8C7A5E] max-w-md mx-auto">
            Hệ thống chưa đồng bộ lịch học từ cổng HUTECH. Bấm nút dưới để kết nối tài khoản sinh viên!
          </p>
          <button
            onClick={() => { setSyncMssv((user || lastUser)?.username || ''); setShowSyncModal(true); }}
            className="px-5 py-2.5 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] active:scale-98 text-[#1A1200] font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            <span>Lấy Thời Khóa Biểu Ngay</span>
          </button>
        </div>
      )}

      {/* ──────── MODAL ĐỒNG BỘ TKB ──────── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#F0E0BF] shadow-2xl p-6 sm:p-7 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#8C7A5E] hover:text-[#1A1200] hover:bg-[#F5EAD4] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF9F00] to-[#FFBF33] flex items-center justify-center text-[#1A1200] shadow-md shadow-[#FFB000]/20 shrink-0">
                <CalendarDays className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1A1200]">
                  Đồng Bộ Thời Khóa Biểu
                </h3>
                <p className="text-xs text-[#8C7A5E]">
                  Kết nối trực tiếp cổng sinh viên HUTECH
                </p>
              </div>
            </div>

            {syncSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-[#E8F8EE] border border-[#A7E7BA] flex items-center gap-2.5 text-[#136C38] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Đã lấy thành công thời khóa biểu! Đang cập nhật...</span>
              </div>
            )}

            {syncError && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FEECEB] border border-[#FCA5A5] flex items-start gap-2.5 text-[#B91C1C] text-xs font-semibold leading-relaxed">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{syncError}</span>
              </div>
            )}

            <form onSubmit={handleSyncSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-[#665435] mb-1">
                  Mã Số Sinh Viên (MSSV)
                </label>
                <input
                  type="text"
                  value={syncMssv}
                  onChange={(e) => setSyncMssv(e.target.value)}
                  placeholder="VD: 26800600218"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF8EA] border border-[#F0DFBE] text-xs font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-2 focus:ring-[#FFB000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#665435] mb-1">
                  Mật khẩu Sinh Viên
                </label>
                <input
                  type="password"
                  value={syncPassword}
                  onChange={(e) => setSyncPassword(e.target.value)}
                  placeholder="Mật khẩu đăng nhập sinhvien.hutech.edu.vn"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF8EA] border border-[#F0DFBE] text-xs font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-2 focus:ring-[#FFB000]"
                />
                <p className="text-[11px] text-[#8C7A5E] mt-1 font-medium">
                  🔒 Mật khẩu chỉ dùng để xác thực tức thì và hoàn toàn không được lưu trữ.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#1A1200] font-black text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={syncing}
                  className="px-5 py-2 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kết nối ...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đồng Bộ Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

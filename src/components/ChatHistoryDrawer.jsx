import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  Clock,
  Search,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function ChatHistoryDrawer({
  isOpen,
  onClose,
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  user,
  isLoading
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.preview && s.preview.toLowerCase().includes(q))
    );
  });

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#FFFDF7] border-r border-[#F0E0BF] shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0E0BF]/80 bg-[#FFF9EC]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFB000] flex items-center justify-center text-[#1A1200] shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#1A1200] leading-tight">
                Lịch Sử Hội Thoại
              </h3>
              <p className="text-[11px] font-bold text-[#8C7A5E]">
                {user ? `${user.name} (${user.username})` : 'Chế độ Khách'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C7A5E] hover:text-[#1A1200] hover:bg-[#F3E7CF] transition cursor-pointer"
            title="Đóng bảng lịch sử"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 sm:p-4 border-b border-[#F0E0BF]/60 space-y-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFB000] hover:bg-[#EAA000] active:scale-98 text-[#1A1200] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo Cuộc Trò Chuyện Mới</span>
          </button>

          {/* Search Box */}
          {sessions.length > 3 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A49479]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm hội thoại..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F8F2E2] border border-[#E9DABE] text-xs font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-1 focus:ring-[#FFB000]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A49479] hover:text-[#1A1200]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-[#EAD7B2]">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-[#8C7A5E] font-bold">
              Đang tải lịch sử trò chuyện...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5DC] text-[#FFB000] flex items-center justify-center mx-auto border border-[#F0DFBD]">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#6B5A40]">
                {search ? 'Không tìm thấy cuộc trò chuyện phù hợp.' : 'Chưa có lịch sử hội thoại nào.'}
              </p>
              <p className="text-[11px] text-[#8C7A5E]">
                Khi bạn gửi câu hỏi, hệ thống sẽ tự động lưu lại phiên trò chuyện vào tài khoản của bạn.
              </p>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isCurrent = s.id === currentSessionId;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    onClose();
                  }}
                  className={`group relative flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#FFF2D4] border-[#FFB000] shadow-2xs ring-1 ring-[#FFB000]/30'
                      : 'bg-[#FFFDF7] hover:bg-[#FFF8EA] border-[#EFE2C6]'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#FFB000] shrink-0" />
                      )}
                      <h4 className="text-xs font-black text-[#1A1200] truncate">
                        {s.title || 'Cuộc trò chuyện'}
                      </h4>
                    </div>

                    {s.preview && (
                      <p className="text-[11px] text-[#7A6A4E] truncate mb-1">
                        {s.preview}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-[#A49479] font-bold">
                      <span>{formatDate(s.updatedAt || s.createdAt)}</span>
                      <span>•</span>
                      <span>{s.messageCount || 0} tin nhắn</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Bạn có chắc muốn xóa cuộc trò chuyện "${s.title}"?`)) {
                        onDeleteSession(s.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#C4A97A] hover:text-[#DC2626] hover:bg-[#FEE2E2] opacity-0 group-hover:opacity-100 transition cursor-pointer shrink-0"
                    title="Xóa đoạn chat này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-[#F0E0BF]/80 bg-[#FFF9EC]/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C7A5E]">
              Tổng cộng: {sessions.length} phiên
            </span>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa TOÀN BỘ lịch sử chat của bạn?')) {
                  onClearAll();
                }
              }}
              className="text-[11px] font-black text-[#B91C1C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ lịch sử</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

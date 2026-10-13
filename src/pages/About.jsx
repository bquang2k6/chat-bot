import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Compass,
  Clock,
  Search,
  Users,
  Target,
  Workflow,
  Server,
  Zap,
  Flame,
  Check
} from 'lucide-react';

export default function About() {
  const [activeSlide, setActiveSlide] = useState(1);

  const slides = [
    { id: 1, title: 'Tổng quan đề tài', badge: 'Slide 1' },
    { id: 2, title: 'Lý do & Mục tiêu', badge: 'Slide 2' },
    { id: 3, title: 'Cách hoạt động', badge: 'Slide 3' },
    { id: 4, title: 'Công nghệ sử dụng', badge: 'Slide 4' },
    { id: 5, title: 'Ưu & Nhược điểm', badge: 'Slide 5' },
    { id: 6, title: 'Kết luận', badge: 'Slide 6' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-8 animate-fadeIn">
      {/* Banner Tiêu Đề Bài Thuyết Trình */}
      <div className="bg-[#FFF8EA] border border-[#F0DFBE] rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFB000]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0CB] border border-[#EED79E] text-xs font-black text-[#694E00] mb-2">
              <GraduationCap className="w-4 h-4 text-[#FFB000]" />
              <span>NỘI DUNG BÁO CÁO & THUYẾT TRÌNH ĐỀ TÀI</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-[#1A1200] tracking-tight">
              Tạo Chatbot AI Hỗ Trợ Học Chuyên Ngành
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A4E] mt-1.5 max-w-xl">
              Hệ thống trợ lý học tập cá nhân hóa 24/7 ứng dụng Trí tuệ nhân tạo (AI) và kiến trúc RAG
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/chat"
              className="px-4 py-2.5 rounded-2xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] font-black text-xs sm:text-sm transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Vào Khung Chat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/roadmap"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF5DC] text-[#1A1200] font-black text-xs sm:text-sm transition border border-[#EADBBD] flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#FFB000]" />
              <span>Lộ Trình</span>
            </Link>
          </div>
        </div>

        {/* Thanh điều hướng nhanh giữa 6 slide */}
        <div className="mt-6 pt-5 border-t border-[#F0E0BF] flex flex-wrap gap-2">
          {slides.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSlide(s.id);
                const el = document.getElementById(`slide-${s.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSlide === s.id
                  ? 'bg-[#1A1200] text-[#FFFDF7] shadow-xs'
                  : 'bg-white/80 hover:bg-white text-[#7A6A4E] border border-[#EADBBD]'
              }`}
            >
              <span className="text-[10px] opacity-75 font-bold">{s.badge}:</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SLIDE 1: Tên đề tài & Giới thiệu tổng quan */}
      {/* ============================================================== */}
      <section id="slide-1" className="bg-white border border-[#EADBBD] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F5EACB] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB000] text-[#1A1200] text-xs font-black">
              SLIDE 1
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1200]">
              Tên Đề Tài &amp; Giới Thiệu Tổng Quan
            </h2>
          </div>
          <Sparkles className="w-5 h-5 text-[#FFB000]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFF8EA] border border-[#F0DFBE] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0CB] text-[#694E00] flex items-center justify-center font-black">
              🎯
            </div>
            <h3 className="font-extrabold text-sm text-[#1A1200]">Tên Đề Tài</h3>
            <p className="text-xs sm:text-sm text-[#6B5A3F] leading-relaxed">
              <b>Tạo Chatbot AI Hỗ Trợ Học Chuyên Ngành</b> (Trọng tâm: Cơ sở dữ liệu &amp; Công nghệ thông tin).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center font-black">
              🤖
            </div>
            <h3 className="font-extrabold text-sm text-[#1A1200]">Khái Niệm</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Xây dựng <b>trợ lý ảo cá nhân hóa</b> dựa trên trí tuệ nhân tạo, đồng hành hỗ trợ sinh viên học tập chuyên ngành <b>24/7</b>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-black">
              💡
            </div>
            <h3 className="font-extrabold text-sm text-[#1A1200]">Ý Nghĩa Đề Tài</h3>
            <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
              Giải đáp thắc mắc tức thì, định hướng lộ trình học tập bài bản và tối ưu hóa năng lực <b>tự học độc lập</b> của sinh viên.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SLIDE 2: Lý do làm về đề tài này */}
      {/* ============================================================== */}
      <section id="slide-2" className="bg-white border border-[#EADBBD] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F5EACB] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB000] text-[#1A1200] text-xs font-black">
              SLIDE 2
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1200]">
              Lý Do Làm Về Đề Tài Này
            </h2>
          </div>
          <Target className="w-5 h-5 text-[#FFB000]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vấn đề hiện nay */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] space-y-3">
            <h3 className="font-black text-sm text-[#991B1B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span>Vấn đề hiện nay của sinh viên:</span>
            </h3>
            <ul className="text-xs sm:text-sm text-[#7F1D1D] space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FCA5A5] text-[#7F1D1D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                <span><b>Kiến thức phức tạp:</b> Khái niệm chuyên ngành (SQL, Chuẩn hóa dữ liệu, B-Tree, ACID) rất khó tiếp thu trọn vẹn ngay trên lớp.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FCA5A5] text-[#7F1D1D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                <span><b>Giảng viên quá tải:</b> Thầy cô không đủ thời gian giải đáp thắc mắc tỉ mỉ cho từng sinh viên mọi lúc.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FCA5A5] text-[#7F1D1D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
                <span><b>Tài liệu phân tán:</b> Slide, sách giáo trình, đề cương nằm rải rác ở nhiều file, khó tra cứu chuẩn xác và tốn thời gian.</span>
              </li>
            </ul>
          </div>

          {/* Mục tiêu đề tài */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-3">
            <h3 className="font-black text-sm text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Mục tiêu giải pháp đạt được:</span>
            </h3>
            <ul className="text-xs sm:text-sm text-[#14532D] space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#86EFAC] text-[#14532D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span><b>Hỗ trợ liên tục 24/7:</b> Trợ lý trực tuyến sẵn sàng giải đáp bất cứ khi nào sinh viên tự học hoặc làm bài tập đêm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#86EFAC] text-[#14532D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span><b>Tiết kiệm thời gian &amp; Hệ thống hóa:</b> Tìm nhanh định nghĩa, trích đoạn chính xác từ giáo trình kèm số trang cụ thể.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#86EFAC] text-[#14532D] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <span><b>Cá nhân hóa theo trình độ:</b> Tùy biến lời giải thích từ cơ bản trực quan đến nâng cao chuyên sâu.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SLIDE 3: Cách hoạt động (Quy trình 5 bước) */}
      {/* ============================================================== */}
      <section id="slide-3" className="bg-white border border-[#EADBBD] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F5EACB] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB000] text-[#1A1200] text-xs font-black">
              SLIDE 3
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1200]">
              Cách Hoạt Động Của Hệ Thống (Workflow)
            </h2>
          </div>
          <Workflow className="w-5 h-5 text-[#FFB000]" />
        </div>

        <p className="text-xs sm:text-sm text-[#7A6A4E] italic">
          "AI sẽ nhận diện câu hỏi và so sánh với dữ liệu đã được đăng ký, nếu phù hợp hệ thống sẽ đưa ra câu trả lời."
        </p>

        {/* Quy trình 5 bước tương tác */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
          {/* Bước 1 */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8EA] border border-[#F0DFBE] flex flex-col justify-between text-center relative group">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#FFB000] text-[#1A1200] font-black flex items-center justify-center text-xs mb-2">
              1
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#1A1200]">Câu hỏi sinh viên</h4>
            <p className="text-[11px] text-[#7A6A4E] mt-1">Sinh viên nhập câu hỏi về bài tập hoặc lý thuyết</p>
          </div>

          {/* Bước 2 */}
          <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex flex-col justify-between text-center relative group">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#3B82F6] text-white font-black flex items-center justify-center text-xs mb-2">
              2
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#1E40AF]">AI phân tích ngữ cảnh</h4>
            <p className="text-[11px] text-[#475569] mt-1">Chuyển câu hỏi thành vector ngữ nghĩa (Embedding)</p>
          </div>

          {/* Bước 3 */}
          <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex flex-col justify-between text-center relative group">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#F59E0B] text-[#1A1200] font-black flex items-center justify-center text-xs mb-2">
              3
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#92400E]">So sánh với dữ liệu</h4>
            <p className="text-[11px] text-[#78350F] mt-1">Đối chiếu Cosine trong Vector DB với giáo trình đã nạp</p>
          </div>

          {/* Bước 4 */}
          <div className="p-3.5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex flex-col justify-between text-center relative group">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#8B5CF6] text-white font-black flex items-center justify-center text-xs mb-2">
              4
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#5B21B6]">Xác nhận kiến thức</h4>
            <p className="text-[11px] text-[#4C1D95] mt-1">Kiểm tra ngưỡng tương đồng &amp; lọc bỏ ảo giác</p>
          </div>

          {/* Bước 5 */}
          <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col justify-between text-center relative group">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#10B981] text-white font-black flex items-center justify-center text-xs mb-2">
              5
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#065F46]">Ghi nhận &amp; Trả lời</h4>
            <p className="text-[11px] text-[#064E3B] mt-1">Sinh câu trả lời kèm trích dẫn nguồn [1], [2]</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SLIDE 4: Công nghệ sử dụng */}
      {/* ============================================================== */}
      <section id="slide-4" className="bg-white border border-[#EADBBD] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F5EACB] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB000] text-[#1A1200] text-xs font-black">
              SLIDE 4
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1200]">
              Công Nghệ Sử Dụng Trong Hệ Thống
            </h2>
          </div>
          <Cpu className="w-5 h-5 text-[#FFB000]" />
        </div>

        <p className="text-xs sm:text-sm text-[#7A6A4E]">
          (Để tạo thành một hệ sinh thái chatbot hỗ trợ học tập hoàn chỉnh, an toàn và hiệu năng cao)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#EADBBD] space-y-2">
            <div className="text-2xl">🧠</div>
            <h3 className="font-black text-sm text-[#1A1200]">Mô hình Ngôn ngữ lớn</h3>
            <p className="text-xs font-extrabold text-[#FFB000]">LLM - Google Gemini</p>
            <p className="text-xs text-[#6B5A3F] leading-relaxed">
              Mô hình <b>Gemini 3.5 Flash-lite</b> tốc độ cao, khả năng suy luận logic và giải thích sư phạm tự nhiên.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#EADBBD] space-y-2">
            <div className="text-2xl">⚡</div>
            <h3 className="font-black text-sm text-[#1A1200]">Xử lý Ngữ cảnh &amp; RAG</h3>
            <p className="text-xs font-extrabold text-[#3B82F6]">Retrieval-Augmented Generation</p>
            <p className="text-xs text-[#6B5A3F] leading-relaxed">
              Chunking thông minh 900 ký tự (overlap 150), so khớp Cosine Distance và chặn đứng nguy cơ bịa đặt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#EADBBD] space-y-2">
            <div className="text-2xl">💻</div>
            <h3 className="font-black text-sm text-[#1A1200]">Quản lý &amp; Giao diện</h3>
            <p className="text-xs font-extrabold text-[#10B981]">React + Vite &amp; Node.js Express</p>
            <p className="text-xs text-[#6B5A3F] leading-relaxed">
              Giao diện chuẩn Responsive mobile, hỗ trợ SSE Streaming mượt mà và quản lý tải tài liệu kéo-thả.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#EADBBD] space-y-2">
            <div className="text-2xl">🗄️</div>
            <h3 className="font-black text-sm text-[#1A1200]">CSDL Chuyên Ngành</h3>
            <p className="text-xs font-extrabold text-[#8B5CF6]">Vector Database</p>
            <p className="text-xs text-[#6B5A3F] leading-relaxed">
              Lưu trữ véc-tơ giáo trình môn học (`gemini-embedding-001`), hỗ trợ tra cứu ngữ nghĩa tức thì.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SLIDE 5: Ưu điểm / Nhược điểm */}
      {/* ============================================================== */}
      <section id="slide-5" className="bg-white border border-[#EADBBD] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F5EACB] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FFB000] text-[#1A1200] text-xs font-black">
              SLIDE 5
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1200]">
              Đánh Giá Ưu Điểm &amp; Nhược Điểm
            </h2>
          </div>
          <Layers className="w-5 h-5 text-[#FFB000]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Ưu điểm */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-3">
            <h3 className="font-black text-sm text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Ưu Điểm Nổi Bật:</span>
            </h3>
            <ul className="text-xs sm:text-sm text-[#14532D] space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-[#22C55E] font-black">✔</span>
                <span><b>Phản hồi nhanh 24/7:</b> Thời gian sinh từ đầu tiên (TTFT) dưới 1 giây, luôn sẵn sàng.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#22C55E] font-black">✔</span>
                <span><b>Tiết kiệm thời gian tra cứu:</b> Tìm ngay định nghĩa trong vài trăm trang tài liệu.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#22C55E] font-black">✔</span>
                <span><b>Dễ hệ thống hóa kiến thức:</b> Có lộ trình 5 chặng và chế độ tóm tắt sơ đồ cây.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#22C55E] font-black">✔</span>
                <span><b>Học tập mọi lúc, mọi nơi:</b> Tương thích hoàn toàn trên máy tính và điện thoại thông minh.</span>
              </li>
            </ul>
          </div>

          {/* Nhược điểm & Cách hệ thống khắc phục */}
          <div className="p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
            <h3 className="font-black text-sm text-[#B45309] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
              <span>Nhược Điểm &amp; Cách Đề Tài Khắc Phục:</span>
            </h3>
            <ul className="text-xs sm:text-sm text-[#78350F] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] font-black">⚠️</span>
                <div>
                  <b>AI ảo giác (câu trả lời sai):</b>
                  <p className="text-[11px] text-[#92400E] mt-0.5">
                    ➔ <i>Khắc phục bằng RAG:</i> Chỉ trả lời dựa vào giáo trình và kiên quyết từ chối câu ngoài tài liệu.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] font-black">⚠️</span>
                <div>
                  <b>Bảo vệ dữ liệu cá nhân &amp; bản quyền:</b>
                  <p className="text-[11px] text-[#92400E] mt-0.5">
                    ➔ <i>Khắc phục:</i> Dữ liệu lưu cục bộ trên máy chủ nội bộ, kiểm soát nguồn nạp.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] font-black">⚠️</span>
                <div>
                  <b>Chi phí xây dựng và duy trì:</b>
                  <p className="text-[11px] text-[#92400E] mt-0.5">
                    ➔ <i>Khắc phục:</i> Tối ưu chi phí bằng mô hình Flash-lite nhẹ và Vector Store cục bộ gọn nhẹ.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SLIDE 6: Kết luận */}
      {/* ============================================================== */}
      <section id="slide-6" className="bg-[#FFF8EA] border border-[#F0DFBE] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0CB] border border-[#EED79E] text-xs font-black text-[#694E00]">
          <Check className="w-3.5 h-3.5" />
          <span>SLIDE 6: KẾT LUẬN ĐỀ TÀI</span>
        </div>

        <blockquote className="text-base sm:text-xl font-black text-[#1A1200] max-w-2xl mx-auto leading-relaxed">
          "Trí tuệ nhân tạo (AI) kết hợp công nghệ RAG có thể giúp việc học chuyên ngành trở nên nhanh chóng, chủ động và hiệu quả hơn rất nhiều."
        </blockquote>

        <p className="text-xs sm:text-sm text-[#7A6A4E] max-w-xl mx-auto">
          Hệ thống đã chứng minh tính khả thi cao, loại bỏ nỗi lo ảo giác kiến thức và sẵn sàng mở rộng cho nhiều môn học khác trong chương trình đào tạo.
        </p>

        <div className="pt-3">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] font-black text-sm shadow-xs transition active:scale-95"
          >
            <span>Trải Nghiệm Hệ Thống Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
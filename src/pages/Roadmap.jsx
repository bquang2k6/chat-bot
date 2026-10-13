import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Circle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  User,
  Calendar,
  Flame,
  Target,
  Loader2,
  BookMarked,
  Clock,
  Sparkle,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const LEVEL_LABELS = {
  co_ban: { label: 'Low (Cơ bản)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🌱' },
  trung_binh: { label: 'Medium (Trung bình)', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '⚡' },
  nang_cao: { label: 'High (Nâng cao)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '🔥' }
};

const GOAL_OPTIONS = [
  '🎯 Đạt điểm A+ thi cuối kỳ',
  '🚀 Ôn tập cấp tốc trong 2 tuần',
  '🌱 Học từ con số 0 / Lấy lại gốc kiến thức',
  '💼 Đi làm thực tế & Làm đồ án môn học xuất sắc',
  '🧩 Luyện giải bài tập & Nắm vững thuật toán'
];

export default function Roadmap() {
  const navigate = useNavigate();
  const { user, lastUser, openLoginModal } = useAuth();
  const currentUser = user || lastUser;
  const currentMssv = currentUser?.username || null;
  const currentName = currentUser?.name || (currentMssv ? `Sinh viên ${currentMssv}` : null);

  const [roadmapData, setRoadmapData] = useState(null);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [studentLevel, setStudentLevel] = useState('trung_binh');

  // Filter tabs for roadmaps: 'all' | 'tkb' | 'custom' | 'presets'
  const [roadmapCategory, setRoadmapCategory] = useState('all');

  // Modal placement test
  const [showTestModal, setShowTestModal] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // Modal tạo lộ trình riêng bằng AI
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSubjectName, setAiSubjectName] = useState('');
  const [aiCourseCode, setAiCourseCode] = useState('');
  const [aiGoal, setAiGoal] = useState(GOAL_OPTIONS[0]);
  const [aiLevel, setAiLevel] = useState('trung_binh');
  const [aiDuration, setAiDuration] = useState('6 tuần');
  const [aiFocus, setAiFocus] = useState('Lý thuyết trọng tâm & Thực hành ứng dụng');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // Tải dữ liệu lộ trình từ backend
  const fetchRoadmap = async (targetId = null) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (currentMssv) query.set('username', currentMssv);
      if (targetId) query.set('roadmapId', targetId);

      const res = await fetch(`${API_BASE}/api/roadmap?${query.toString()}`);
      const data = await res.json();

      if (data.success || data.stages) {
        setRoadmapData(data);
        const resolvedId = data.id || data.activeRoadmapId || 'csdl';
        setActiveRoadmapId(resolvedId);

        // Khôi phục completed topics & level
        const localKey = `roadmap_completed_${currentMssv || 'guest'}_${resolvedId}`;
        const localLevelKey = `roadmap_level_${currentMssv || 'guest'}_${resolvedId}`;

        let savedCompleted = [];
        try {
          const raw = localStorage.getItem(localKey);
          if (raw) savedCompleted = JSON.parse(raw);
          else if (Array.isArray(data.completedTopics)) savedCompleted = data.completedTopics;
        } catch {
          savedCompleted = data.completedTopics || [];
        }

        const savedLevel = localStorage.getItem(localLevelKey) || data.studentLevel || 'trung_binh';

        setCompletedTopics(savedCompleted);
        setStudentLevel(savedLevel);
      }
    } catch (err) {
      console.error('Lỗi tải roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();

    // Tải Placement test
    fetch(`${API_BASE}/api/placement-test`)
      .then(res => res.json())
      .then(data => setTestQuestions(data))
      .catch(err => console.error('Lỗi tải placement test:', err));
  }, [currentMssv]);

  // Đổi lộ trình
  const handleSelectRoadmap = async (targetId) => {
    if (targetId === activeRoadmapId) return;
    await fetchRoadmap(targetId);
    if (currentMssv) {
      fetch(`${API_BASE}/api/roadmap/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentMssv, roadmapId: targetId })
      }).catch(() => { });
    }
  };

  // Toggle hoàn thành chủ đề
  const toggleTopic = (topicId) => {
    setCompletedTopics(prev => {
      const updated = prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId];

      const localKey = `roadmap_completed_${currentMssv || 'guest'}_${activeRoadmapId}`;
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch { }

      // Đồng bộ lên server
      if (currentMssv && activeRoadmapId) {
        fetch(`${API_BASE}/api/roadmap/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentMssv,
            roadmapId: activeRoadmapId,
            completedTopics: updated,
            level: studentLevel
          })
        }).catch(() => { });
      }

      return updated;
    });
  };

  // Đổi trình độ học tập
  const handleLevelChange = (newLevel) => {
    setStudentLevel(newLevel);
    const localLevelKey = `roadmap_level_${currentMssv || 'guest'}_${activeRoadmapId}`;
    try {
      localStorage.setItem(localLevelKey, newLevel);
    } catch { }

    if (currentMssv && activeRoadmapId) {
      fetch(`${API_BASE}/api/roadmap/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentMssv,
          roadmapId: activeRoadmapId,
          completedTopics,
          level: newLevel
        })
      }).catch(() => { });
    }
  };

  // Xóa lộ trình tùy chỉnh do AI tạo
  const handleDeleteCustomRoadmap = async (roadmapId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa lộ trình cá nhân hóa này không?')) return;

    try {
      if (currentMssv) {
        await fetch(`${API_BASE}/api/roadmap/custom/${roadmapId}?username=${encodeURIComponent(currentMssv)}`, {
          method: 'DELETE'
        });
      }
      // Chuyển về lộ trình CSDL mặc định
      fetchRoadmap('csdl');
    } catch (err) {
      console.error('Lỗi xóa roadmap:', err);
    }
  };

  // Hỏi Bot AI với câu hỏi gợi ý
  const handleAskBot = (prompt, stageLevel) => {
    const chosenLevel = stageLevel || studentLevel;
    navigate('/chat', {
      state: {
        initialQuestion: prompt,
        level: chosenLevel,
        subject: roadmapData?.domain || ''
      }
    });
  };

  // Nộp bài kiểm tra trình độ
  const handleSelectOption = (qId, optLetter) => {
    if (testSubmitted) return;
    setTestAnswers(prev => ({ ...prev, [qId]: optLetter }));
  };

  const handleSubmitTest = () => {
    let score = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id] === q.answer) {
        score++;
      }
    });
    setTestScore(score);
    setTestSubmitted(true);

    let assignedLevel = 'co_ban';
    if (score >= 4) {
      assignedLevel = 'nang_cao';
    } else if (score >= 2) {
      assignedLevel = 'trung_binh';
    }
    handleLevelChange(assignedLevel);
  };

  const handleResetTest = () => {
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
  };

  // Mở modal AI với môn học được chọn sẵn từ TKB
  const handleOpenAiForCourse = (course) => {
    setAiSubjectName(course.name);
    setAiCourseCode(course.code || '');
    setAiGoal(GOAL_OPTIONS[0]);
    setShowAiModal(true);
  };

  // Tạo lộ trình bằng Gemini AI
  const handleGenerateAiRoadmap = async (e) => {
    e.preventDefault();
    if (!aiSubjectName.trim()) {
      setAiError('Vui lòng nhập tên môn học hoặc chủ đề bạn muốn học.');
      return;
    }

    try {
      setIsGeneratingAi(true);
      setAiError('');

      const res = await fetch(`${API_BASE}/api/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentMssv,
          subjectName: aiSubjectName.trim(),
          courseCode: aiCourseCode.trim(),
          goal: aiGoal,
          level: aiLevel,
          duration: aiDuration,
          focus: aiFocus
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể tạo lộ trình học tập bằng AI.');
      }

      setShowAiModal(false);
      // Tự động chuyển sang lộ trình vừa tạo
      if (data.roadmap?.id) {
        await fetchRoadmap(data.roadmap.id);
      } else {
        await fetchRoadmap();
      }
    } catch (err) {
      console.error('Lỗi sinh lộ trình AI:', err);
      setAiError(err.message || 'Có lỗi xảy ra khi tạo lộ trình.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const stages = roadmapData?.stages || [];
  const allTopicIds = stages.flatMap(s => (s.topics || []).map(t => t.id));
  const totalTopics = allTopicIds.length;
  const completedCount = completedTopics.filter(id => allTopicIds.includes(id)).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const enrolledCourses = roadmapData?.enrolledCourses || [];
  const customRoadmaps = roadmapData?.customRoadmaps || [];
  const presetRoadmaps = roadmapData?.presetRoadmaps || [];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Student Identity Card / Guest Banner */}
      <div className="bg-linear-to-r from-[#FFF8E7] via-[#FFFDF9] to-[#FFF4D6] border border-[#F0DFBE] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#FFB000] to-[#E59E00] text-[#1A1200] font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              {currentUser ? (
                currentName?.charAt(0) || 'SV'
              ) : (
                <User className="w-6 h-6 text-[#1A1200]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-[#A37B12] bg-[#FFEDB3] px-2.5 py-0.5 rounded-full border border-[#E9C86A]">
                  {currentUser ? 'Lộ Trình Cá Nhân Hóa' : 'Chế Độ Khách'}
                </span>
                {currentMssv && (
                  <span className="text-xs font-bold text-[#7A6A4E] bg-white px-2 py-0.5 rounded-full border border-[#E6D7BD]">
                    MSSV: <b>{currentMssv}</b>
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[#1A1200] mt-1">
                {currentUser ? (
                  <>Hồ sơ học tập của: <span className="text-[#A16207]">{currentName}</span></>
                ) : (
                  'Lộ trình học tập sinh viên HUTECH'
                )}
              </h1>
              <p className="text-xs text-[#7A6A4E] mt-0.5">
                {currentUser
                  ? 'Mỗi môn học và tiến độ được lưu riêng biệt cho tài khoản của bạn, đồng bộ tự động theo thời khóa biểu.'
                  : 'Đăng nhập tài khoản sinh viên HUTECH để mở khóa lộ trình môn học thực tế từ TKB của bạn.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!currentUser ? (
              <button
                onClick={openLoginModal}
                className="py-2.5 px-4 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập HUTECH</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAiSubjectName('');
                  setAiCourseCode('');
                  setShowAiModal(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Tạo Lộ Trình Mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Switcher / Roadmaps Navigator */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EADBBD] p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5EAD4]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-[#A16207]" />
            <h2 className="text-sm font-extrabold text-[#1A1200]">Kho Lộ Trình & Môn Học Của Bạn</h2>
          </div>

          {/* Quick AI button */}
          <button
            onClick={() => {
              setAiSubjectName('');
              setAiCourseCode('');
              setShowAiModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF6E0] hover:bg-[#FFB000] text-[#7A5B00] hover:text-[#1A1200] border border-[#F0DEB7] text-xs font-black transition cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Tạo Lộ Trình Riêng Cho Tôi</span>
          </button>
        </div>

        {/* 1. Môn học TKB nếu có */}
        {enrolledCourses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8A734D] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Môn học từ Thời khóa biểu của bạn ({enrolledCourses.length} môn)</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {enrolledCourses.map((c) => {
                // Kiểm tra xem môn này đã có lộ trình tương ứng chưa
                const matchedPreset = presetRoadmaps.find(p =>
                  (c.code && p.courseCode && c.code.toLowerCase().includes(p.courseCode.toLowerCase())) ||
                  (c.name && p.domain.toLowerCase().includes(c.name.toLowerCase()))
                );
                const matchedCustom = customRoadmaps.find(r =>
                  (c.code && r.courseCode && c.code.toLowerCase().includes(r.courseCode.toLowerCase())) ||
                  (c.name && r.domain.toLowerCase().includes(c.name.toLowerCase()))
                );

                const targetId = matchedCustom ? matchedCustom.id : (matchedPreset ? matchedPreset.id : null);
                const isActive = activeRoadmapId === targetId && targetId !== null;

                if (targetId) {
                  return (
                    <button
                      key={c.code + c.name}
                      onClick={() => handleSelectRoadmap(targetId)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isActive
                        ? 'bg-[#FFB000] text-[#1A1200] border-[#D99500] shadow-2xs font-black ring-2 ring-[#FFB000]/30'
                        : 'bg-[#FFFDF9] hover:bg-[#FFF6E0] text-[#3D301E] border-[#EADBBD]'
                        }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#A16207]" />
                      <span>{c.code ? `${c.code}: ` : ''}{c.name}</span>
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={c.code + c.name}
                      onClick={() => handleOpenAiForCourse(c)}
                      title="Bấm để AI tạo lộ trình chuyên sâu cho môn này"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF5EB] hover:bg-[#FFF0CB] text-[#694E00] border border-dashed border-[#D4C39E] transition flex items-center gap-1.5 cursor-pointer group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB000] group-hover:scale-110 transition" />
                      <span>{c.code ? `${c.code}: ` : ''}{c.name}</span>
                      <span className="text-[10px] bg-[#FFEDB3] text-[#7A5B00] px-1.5 py-0.5 rounded-full font-black ml-1">
                        AI Tạo
                      </span>
                    </button>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* 2. Lộ trình AI tạo riêng của bạn */}
        {customRoadmaps.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8A734D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Lộ trình AI tạo riêng cho bạn ({customRoadmaps.length})</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {customRoadmaps.map((r) => {
                const isActive = activeRoadmapId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRoadmap(r.id)}
                    className={`group px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${isActive
                      ? 'bg-[#FFB000] text-[#1A1200] border-[#D99500] shadow-2xs font-black ring-2 ring-[#FFB000]/30'
                      : 'bg-[#FFFDF9] hover:bg-[#FFF6E0] text-[#3D301E] border-[#EADBBD]'
                      }`}
                  >
                    <span>{r.domain}</span>
                    {r.goal && (
                      <span className="text-[10px] opacity-75 font-normal truncate max-w-[120px]">
                        ({r.goal})
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteCustomRoadmap(r.id, e)}
                      title="Xóa lộ trình này"
                      className="opacity-40 hover:opacity-100 hover:text-red-700 transition p-0.5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Lộ trình Chuyên ngành mẫu */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#8A734D] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Chuyên ngành & Môn học phổ biến</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {presetRoadmaps.map((p) => {
              const isActive = activeRoadmapId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectRoadmap(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${isActive
                    ? 'bg-[#FFB000] text-[#1A1200] border-[#D99500] shadow-2xs font-black ring-2 ring-[#FFB000]/30'
                    : 'bg-[#FFFDF9] hover:bg-[#FFF6E0] text-[#3D301E] border-[#EADBBD]'
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>{p.domain}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Header Active Roadmap Card */}
      <div className="bg-[#FFF8EA] border border-[#F0DFBE] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#FFB000]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0CB] border border-[#EED79E] text-[11px] sm:text-xs font-black text-[#694E00]">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {roadmapData?.isCustom ? 'LỘ TRÌNH RIÊNG BIỆT (AI SINH)' : 'LỘ TRÌNH ĐANG HỌC'}
              </span>
              {roadmapData?.courseCode && (
                <span className="bg-[#FFDE8A] text-[#1A1200] px-2 py-0.2 rounded-full font-bold">
                  {roadmapData.courseCode}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#1A1200] tracking-tight">
              {roadmapData?.domain || 'Lộ trình học tập'}
            </h1>

            {roadmapData?.goal && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#A16207]">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Mục tiêu của bạn: <b>{roadmapData.goal}</b></span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#7A6A4E] max-w-xl leading-relaxed">
              {roadmapData?.description ||
                'Hệ thống tự động điều chỉnh kiến thức phù hợp theo từng môn học và trình độ của bạn.'}
            </p>
          </div>

          {/* Quick Placement & Level Card */}
          <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#EADBBD] shadow-2xs flex flex-col gap-3 w-full md:w-auto md:min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C7A5E]">Trình độ hiện tại:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${LEVEL_LABELS[studentLevel]?.color}`}>
                {LEVEL_LABELS[studentLevel]?.icon} {LEVEL_LABELS[studentLevel]?.label}
              </span>
            </div>

            {/* Selector nhanh level */}
            <div className="grid grid-cols-3 gap-1 bg-[#F5ECDA] p-1 rounded-xl">
              {(['co_ban', 'trung_binh', 'nang_cao']).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${studentLevel === lvl
                    ? 'bg-white text-[#1A1200] shadow-2xs font-black'
                    : 'text-[#7A6A4E] hover:text-[#1A1200]'
                    }`}
                >
                  {lvl === 'co_ban' ? 'Cơ bản' : lvl === 'trung_binh' ? 'Trung bình' : 'Nâng cao'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowTestModal(true);
                handleResetTest();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] font-black text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Kiểm tra xếp cấp nhanh (5 câu)</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-[#F0E0BF] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A6A4E]">
            <span>Tiến độ hoàn thành môn học</span>
            <span>{completedCount}/{totalTopics} chủ đề ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-[#EADBBD]/40 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-linear-to-r from-[#FFB000] to-[#E59E00] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-6">
        {stages.map((stage) => {
          const stageCompleted = (stage.topics || []).filter(t => completedTopics.includes(t.id)).length;
          const stageTotal = (stage.topics || []).length;
          const isCurrentTarget = stage.level === studentLevel;

          return (
            <div
              key={stage.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${isCurrentTarget ? 'border-[#FFB000] ring-2 ring-[#FFB000]/20' : 'border-[#EADBBD]'
                }`}
            >
              {/* Stage Header */}
              <div className="p-5 sm:p-6 bg-[#FFFBF1] border-b border-[#F3E5CA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFB000] text-[#1A1200] font-black text-base flex items-center justify-center shadow-xs shrink-0">
                    {stage.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-extrabold text-lg text-[#1A1200]">{stage.title}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${LEVEL_LABELS[stage.level]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {LEVEL_LABELS[stage.level]?.icon} {LEVEL_LABELS[stage.level]?.label || stage.level}
                      </span>
                      {isCurrentTarget && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFB000]/20 text-[#7A5B00] border border-[#FFB000]/40">
                          🎯 Phù hợp với bạn
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A6A4E] mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#5C4D32]">
                    {stageCompleted}/{stageTotal} hoàn thành
                  </span>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="p-4 sm:p-6 space-y-3">
                {(stage.topics || []).map((topic) => {
                  const isDone = completedTopics.includes(topic.id);
                  return (
                    <div
                      key={topic.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${isDone
                        ? 'bg-[#F2FBF5] border-[#BAE6CD]'
                        : 'bg-[#FFFDF7] border-[#F2E5CE] hover:border-[#FFB000]/50'
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="shrink-0 text-[#22C55E] hover:scale-110 transition cursor-pointer"
                          title={isDone ? 'Đánh dấu chưa học' : 'Đánh dấu đã hoàn thành'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 fill-[#22C55E] text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#C4B497] hover:text-[#FFB000]" />
                          )}
                        </button>
                        <span className={`text-xs sm:text-sm font-bold truncate ${isDone ? 'line-through text-[#6F8A77]' : 'text-[#1A1200]'}`}>
                          {topic.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAskBot(topic.prompt, stage.level)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FFF5DC] hover:bg-[#FFB000] text-[#7A5B00] hover:text-[#1A1200] border border-[#F0DFBD] text-[11px] sm:text-xs font-black transition cursor-pointer shrink-0"
                        title="Mở Chat và hỏi AI về chủ đề này"
                      >
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden xs:inline">Hỏi Bot</span>
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tạo Lộ Trình Riêng Bằng AI */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-xl bg-[#FFFBF1] rounded-2xl sm:rounded-3xl border border-[#EADBBD] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFF5DC] border-b border-[#F0E0BF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFB000] flex items-center justify-center text-[#1A1200]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1A1200]">
                    AI Tạo Lộ Trình Học Tập Cá Nhân Hóa
                  </h3>
                  <p className="text-[11px] text-[#7A6A4E]">
                    Dành riêng cho {currentName ? <b>{currentName}</b> : 'bạn'} (Gemini AI)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-lg sm:text-xl font-black text-[#6B5A3F] hover:text-[#1A1200] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGenerateAiRoadmap} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {aiError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {aiError}
                </div>
              )}

              {/* Tên môn học */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#1A1200] flex items-center justify-between">
                  <span>Tên Môn học / Chủ đề muốn học:</span>
                  {enrolledCourses.length > 0 && (
                    <span className="text-[11px] font-bold text-[#A16207]">Gợi ý từ TKB</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={aiSubjectName}
                  onChange={(e) => setAiSubjectName(e.target.value)}
                  placeholder="Ví dụ: Cơ sở lập trình C++, Tư duy thiết kế dự án, Lập trình Web..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EADBBD] text-xs font-bold text-[#1A1200] focus:outline-none focus:border-[#FFB000] focus:ring-2 focus:ring-[#FFB000]/20"
                />

                {/* Chips chọn nhanh từ TKB */}
                {enrolledCourses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {enrolledCourses.slice(0, 6).map(c => (
                      <button
                        type="button"
                        key={c.code + c.name}
                        onClick={() => {
                          setAiSubjectName(c.name);
                          setAiCourseCode(c.code || '');
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#FFF2D4] hover:bg-[#FFE39E] text-[#694E00] border border-[#E9D4A7] transition cursor-pointer"
                      >
                        + {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mục tiêu học tập cá nhân */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#1A1200]">
                  Mục tiêu học tập của bạn:
                </label>
                <div className="space-y-1.5">
                  {GOAL_OPTIONS.map((g) => (
                    <label
                      key={g}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${aiGoal === g
                        ? 'bg-[#FFEDB3] text-[#1A1200] border-[#D99500]'
                        : 'bg-white text-[#52442E] border-[#EADBBD] hover:bg-[#FFF8EA]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="aiGoal"
                        checked={aiGoal === g}
                        onChange={() => setAiGoal(g)}
                        className="accent-[#FFB000]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trình độ hiện tại & Thời lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1A1200]">Trình độ ban đầu:</label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBBD] text-xs font-bold text-[#1A1200] focus:outline-none focus:border-[#FFB000]"
                  >
                    <option value="co_ban">🌱 Cơ bản (Người mới bắt đầu)</option>
                    <option value="trung_binh">⚡ Trung bình (Đã có nền tảng)</option>
                    <option value="nang_cao">🔥 Nâng cao (Chuyên sâu)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#1A1200]">Thời lượng dự kiến:</label>
                  <select
                    value={aiDuration}
                    onChange={(e) => setAiDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBBD] text-xs font-bold text-[#1A1200] focus:outline-none focus:border-[#FFB000]"
                  >
                    <option value="2 tuần cấp tốc">🚀 2 tuần (Cấp tốc ôn thi)</option>
                    <option value="4 tuần">⏳ 4 tuần (1 tháng)</option>
                    <option value="6 tuần">📅 6 tuần (Nửa học kỳ)</option>
                    <option value="10-12 tuần">🎓 12 tuần (Trọn vẹn 1 học kỳ)</option>
                  </select>
                </div>
              </div>

              {/* Trọng tâm ưu tiên */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#1A1200]">Trọng tâm ưu tiên:</label>
                <select
                  value={aiFocus}
                  onChange={(e) => setAiFocus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBBD] text-xs font-bold text-[#1A1200] focus:outline-none focus:border-[#FFB000]"
                >
                  <option value="Lý thuyết trọng tâm & Thực hành ứng dụng">Cân bằng lý thuyết trọng tâm & thực hành</option>
                  <option value="Tập trung bài tập code & giải thuật thực chiến">Tập trung bài tập code & giải thuật</option>
                  <option value="Tập trung ôn thi trắc nghiệm & câu hỏi thi cuối kỳ">Tập trung ôn thi trắc nghiệm & đề thi</option>
                  <option value="Tập trung làm đồ án & dự án thực tế">Tập trung làm đồ án & xây dựng sản phẩm</option>
                </select>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-[#F0E0BF] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 rounded-xl border border-[#EADBBD] text-xs font-bold text-[#6B5A3F] hover:bg-white cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiSubjectName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1200]" />
                      <span>AI đang thiết kế lộ trình riêng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo Lộ Trình Bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kiểm tra xếp trình độ (Placement Test) */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-w-2xl bg-[#FFFBF1] rounded-2xl sm:rounded-3xl border border-[#EADBBD] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF5DC] border-b border-[#F0E0BF]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB000]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A1200]">
                  Kiểm tra Xếp Trình độ ({testQuestions.length || 5} Câu)
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-lg sm:text-xl font-black text-[#6B5A3F] hover:text-[#1A1200] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
              {!testSubmitted ? (
                <>
                  <p className="text-xs text-[#7A6A4E] leading-relaxed">
                    Hãy trả lời các câu hỏi nhanh dưới đây để hệ thống tự động xác định trình độ học tập của bạn
                    (<b>Cơ bản</b>, <b>Trung bình</b> hoặc <b>Nâng cao</b>), từ đó lưu riêng cho tài khoản và môn học hiện tại.
                  </p>

                  <div className="space-y-3 sm:space-y-5">
                    {testQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#EADBBD] space-y-2.5 sm:space-y-3">
                        <p className="text-xs sm:text-sm font-extrabold text-[#1A1200]">
                          Câu {idx + 1}: {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          {q.options.map((opt) => {
                            const optLetter = opt.charAt(0);
                            const isSelected = testAnswers[q.id] === optLetter;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelectOption(q.id, optLetter)}
                                className={`text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${isSelected
                                  ? 'bg-[#FFB000] text-[#1A1200] border-[#FFB000] font-bold shadow-2xs'
                                  : 'bg-[#FFFDF9] border-[#EADBBD] text-[#3D301E] hover:bg-[#FFF5DC]'
                                  }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4 sm:space-y-6 text-center py-2 sm:py-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[#FFB000] text-[#1A1200] mx-auto flex items-center justify-center text-xl sm:text-2xl font-black shadow-md">
                    {testScore}/{testQuestions.length}
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#1A1200]">Kết quả Đánh giá Trình độ</h4>
                    <p className="text-xs sm:text-sm text-[#7A6A4E] mt-1">
                      Bạn đã trả lời đúng <b>{testScore}/{testQuestions.length} câu</b>. Trình độ học tập đề xuất:
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-black text-xs sm:text-sm border mt-2.5 sm:mt-3 bg-[#FFF5DC] text-[#7A5B00] border-[#F0DFBD]">
                      <span>{LEVEL_LABELS[studentLevel]?.icon}</span>
                      <span>Trình độ {LEVEL_LABELS[studentLevel]?.label}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF5DC] border-t border-[#F0E0BF]">
              {!testSubmitted ? (
                <>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#EADBBD] text-xs font-bold text-[#6B5A3F] hover:bg-white cursor-pointer text-center"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    disabled={Object.keys(testAnswers).length < testQuestions.length}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50 text-center"
                  >
                    Nộp bài & Xếp cấp ({Object.keys(testAnswers).length}/{testQuestions.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleResetTest}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#EADBBD] text-xs font-bold text-[#6B5A3F] hover:bg-white cursor-pointer text-center"
                  >
                    Làm lại bài kiểm tra
                  </button>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] text-xs font-black transition shadow-xs cursor-pointer text-center"
                  >
                    Áp dụng trình độ này
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

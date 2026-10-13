import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send,
  Square,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  FileQuestion,
  ListTree,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  FileUp,
  Award,
  ExternalLink,
  Paperclip,
  FileSpreadsheet,
  History,
  Plus,
  LogIn,
  UserCheck,
  KeyRound,
  CalendarDays,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ChatHistoryDrawer from '../components/ChatHistoryDrawer';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const MODES = [
  { id: 'chat', label: 'Trợ lý CSDL', icon: GraduationCap, desc: 'Hỏi đáp & làm bài tập Cơ sở dữ liệu' },
  { id: 'rag', label: 'RAG Giáo trình', icon: ShieldCheck, desc: 'Chỉ trả lời dựa trên tài liệu (Chống ảo giác)' },
  { id: 'quiz', label: 'Đề trắc nghiệm', icon: FileQuestion, desc: 'Tạo 5 câu trắc nghiệm tương tác' },
  { id: 'summary', label: 'Tóm tắt sơ đồ ý', icon: ListTree, desc: 'Tóm tắt tài liệu dạng cây phân cấp' },
];

const STUDENT_LEVELS = [
  { id: 'co_ban', label: 'Low', icon: '', desc: 'Ví dụ đời thường, giải thích từng bước trực quan' },
  { id: 'trung_binh', label: 'Medium', icon: '', desc: 'Chuẩn học thuật, bản chất & cú pháp SQL' },
  { id: 'nang_cao', label: 'High', icon: '', desc: 'Chuyên sâu, tối ưu chỉ mục, ACID & tình huống' },
];

const getWelcomeMessage = (currentUser, lastSavedUser = null) => ({
  id: 'welcome',
  role: 'assistant',
  content:
    (currentUser
      ? `Xin chào **${currentUser.name}** (MSSV: \`${currentUser.username}\`)! 🎓\n\nTôi là **Trợ lý học tập Cơ sở dữ liệu** được kết nối trực tiếp với tài khoản HUTECH của bạn.\n\n`
      : lastSavedUser
        ? `Xin chào! (Đã ghi nhớ tài khoản sinh viên **${lastSavedUser.name}** - MSSV: \`${lastSavedUser.username}\` 🎓)\n\nTôi là **Trợ lý học tập Cơ sở dữ liệu** được vận hành bởi **Google Gemini** & **RAG Vector DB** 🤖\n\n*Bạn vẫn có thể hỏi về Thời khóa biểu đã lưu bất cứ lúc nào!* \n\n`
        : 'Xin chào! Tôi là **Trợ lý học tập Cơ sở dữ liệu** được vận hành bởi **Google Gemini** & **RAG Vector DB** 🤖\n\n') +
    '🌟 **Các tính năng nổi bật:**\n' +
    '- **RAG Chống ảo giác:** Trả lời chính xác theo giáo trình nạp vào và trích dẫn rõ nguồn `[1]`, `[2]`\n' +
    '- **Cá nhân hóa 3 cấp độ:** Dễ dàng chuyển đổi giữa **Cơ bản**, **Trung bình**, hoặc **Nâng cao**\n' +
    '- **Tải lên tài liệu:** Nạp file PDF, Word (`.docx`), TXT tự động cắt đoạn và Vector hóa\n' +
    '- **Tự động sinh:** Đề trắc nghiệm 5 câu hoặc tóm tắt sơ đồ ý phân cấp\n' +
    '- **Đồng bộ tài khoản HUTECH:** Tự động lưu trữ lịch sử học tập theo từng MSSV\n\n' +
    'Hãy chọn câu hỏi gợi ý bên dưới hoặc đặt câu hỏi bất kỳ nhé!',
  duration: '0.4s',
  model: 'Gemini',
  mode: 'chat',
  grounded: true
});

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, lastUser, openLoginModal } = useAuth();

  const [level, setLevel] = useState(() => {
    return localStorage.getItem('csdl_student_level') || 'trung_binh';
  });

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [messages, setMessages] = useState(() => [getWelcomeMessage(null)]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [presets, setPresets] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [sourcesList, setSourcesList] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSourceMsgId, setExpandedSourceMsgId] = useState(null);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [ingestingSample, setIngestingSample] = useState(null);

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Modal Đồng bộ / Nhập mật khẩu TKB ngay trong Chat
  const [showSyncTkbModal, setShowSyncTkbModal] = useState(false);
  const [syncMssv, setSyncMssv] = useState('');
  const [syncPassword, setSyncPassword] = useState('');
  const [syncingTkb, setSyncingTkb] = useState(false);
  const [syncTkbError, setSyncTkbError] = useState(null);
  const [syncTkbSuccess, setSyncTkbSuccess] = useState(false);

  // Cập nhật lời chào khi user đăng nhập hoặc đăng xuất (nếu chưa có tin nhắn chat)
  useEffect(() => {
    if (!currentSessionId && messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([getWelcomeMessage(user, lastUser)]);
    }
  }, [user, lastUser]);

  // Đồng bộ thời khóa biểu trực tiếp từ khung chat
  const handleSyncTkbInChat = async (e) => {
    e.preventDefault();
    const targetMssv = syncMssv.trim() || user?.username || lastUser?.username;
    if (!targetMssv || !syncPassword || syncingTkb) return;

    setSyncingTkb(true);
    setSyncTkbError(null);
    setSyncTkbSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/tkb/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetMssv,
          password: syncPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi đồng bộ thời khóa biểu.');
      }

      setSyncTkbSuccess(true);
      const studentObj = {
        username: targetMssv,
        name: data.sinhVien?.hoTen || targetMssv,
        masked_email: ''
      };
      localStorage.setItem('hutech_last_user', JSON.stringify(studentObj));

      const successMsg = {
        id: `tkb-sync-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **Đã lấy thành công Thời khóa biểu!**\n\n- Sinh viên: **${data.sinhVien?.hoTen || targetMssv}** (MSSV: \`${targetMssv}\`)\n- Tổng số môn: **${data.thoiKhoaBieu?.length || 0} môn học**\n\nBây giờ bạn có thể hỏi tôi bất kỳ câu hỏi nào về lịch học (ví dụ: *"Hôm nay học gì?", "Thời khóa biểu tuần này", "Mai có tiết không?"*) nhé! Kể cả khi bạn đăng xuất sau này, hệ thống vẫn nhớ lịch học đã lưu này của bạn.`,
        duration: '0.5s',
        model: 'Gemini',
        mode: 'chat',
        grounded: true
      };
      setMessages(prev => [...prev, successMsg]);

      setTimeout(() => {
        setShowSyncTkbModal(false);
        setSyncTkbSuccess(false);
        setSyncPassword('');
      }, 1200);
    } catch (err) {
      setSyncTkbError(err.message || 'Không thể đồng bộ thời khóa biểu.');
    } finally {
      setSyncingTkb(false);
    }
  };

  // Tải danh sách lịch sử khi user thay đổi
  const loadSessions = async (username) => {
    if (!username) {
      setSessions([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/history/sessions?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.error('Lỗi nạp lịch sử:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      loadSessions(user.username);
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [user?.username]);

  // Nạp chi tiết 1 phiên hội thoại
  const handleSelectSession = async (sessionId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/history/session/${sessionId}?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {
      console.error('Lỗi mở phiên chat:', err);
    }
  };

  // Bắt đầu phiên hội thoại mới
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([getWelcomeMessage(user)]);
  };

  // Xóa 1 phiên hội thoại
  const handleDeleteSession = async (sessionId) => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/history/session/${sessionId}?username=${encodeURIComponent(user.username)}`, {
        method: 'DELETE'
      });
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      loadSessions(user.username);
    } catch (err) {
      console.error('Lỗi xóa phiên chat:', err);
    }
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllSessions = async () => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/history?username=${encodeURIComponent(user.username)}`, {
        method: 'DELETE'
      });
      handleNewChat();
      loadSessions(user.username);
    } catch (err) {
      console.error('Lỗi xóa lịch sử:', err);
    }
  };

  // Tự động lưu phiên vào backend
  const saveSessionToBackend = async (historyMsgs, explicitSessionId = null) => {
    if (!user) return;
    const sessId = explicitSessionId || currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(sessId);
    }

    const firstUserMsg = historyMsgs.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 45) : 'Cuộc trò chuyện mới';

    try {
      await fetch(`${API_BASE}/api/history/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          session: {
            id: sessId,
            title,
            messages: historyMsgs
          }
        })
      });
      loadSessions(user.username);
    } catch (err) {
      console.error('Lỗi lưu phiên chat:', err);
    }
  };

  // Lưu level vào localStorage khi đổi
  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    localStorage.setItem('csdl_student_level', newLevel);
  };

  // Cuộn xuống tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Nạp câu hỏi presets và danh sách tài liệu
  const reloadSources = () => {
    fetch(`${API_BASE}/api/sources`)
      .then(res => res.json())
      .then(data => setSourcesList(data || {}))
      .catch(console.error);
  };

  const loadSampleFiles = () => {
    fetch(`${API_BASE}/api/sample-files`)
      .then(res => res.json())
      .then(data => setSampleFiles(data || []))
      .catch(() => { });
  };

  // Nạp nhanh file demo mẫu 1-click
  const handleIngestSample = async (filename) => {
    setIngestingSample(filename);
    setUploadMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/ingest-sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg({ type: 'success', text: `Đã nạp file "${data.filename}" (${data.chunks} đoạn vector vào DB)!` });
        reloadSources();
      } else {
        setUploadMsg({ type: 'error', text: data.error || 'Lỗi khi nạp file mẫu' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: `Lỗi kết nối: ${err.message}` });
    } finally {
      setIngestingSample(null);
    }
  };

  useEffect(() => {
    const handleOpenModal = () => {
      setShowDocModal(true);
      setUploadMsg(null);
      reloadSources();
      loadSampleFiles();
    };
    window.addEventListener('open-doc-modal', handleOpenModal);
    return () => window.removeEventListener('open-doc-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then(res => res.json())
      .then(data => setPresets(data))
      .catch(() => {
        setPresets([
          { text: "Khóa chính (primary key) là gì?", mode: "chat", tag: "Cơ bản" },
          { text: "Phân biệt khóa chính và khóa ngoại.", mode: "chat", tag: "So sánh" },
          { text: "Chuẩn hóa dữ liệu là gì và để làm gì?", mode: "chat", tag: "Lý thuyết" },
          { text: "3NF yêu cầu gì thêm so với 2NF?", mode: "rag", tag: "RAG Nâng cao" },
          { text: "Khóa chính có được để trống không?", mode: "rag", tag: "RAG" },
          { text: "GraphQL khác REST API ở những điểm nào?", mode: "rag", tag: "Ngoài tài liệu" },
        ]);
      });

    reloadSources();
  }, []);

  // Xử lý khi được điều hướng từ trang Roadmap với câu hỏi mẫu
  useEffect(() => {
    if (location.state?.initialQuestion) {
      setInput(location.state.initialQuestion);
      if (location.state.level) {
        handleLevelChange(location.state.level);
      }
    }
  }, [location.state]);

  // Tự động giãn nở chiều cao textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Xử lý tải file lên server
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg({ type: 'success', text: `Đã nạp thành công ${data.chunks} đoạn vào Vector DB!` });
        reloadSources();
      } else {
        setUploadMsg({ type: 'error', text: data.error || 'Lỗi khi tải file' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: `Lỗi kết nối máy chủ: ${err.message}` });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xóa tài liệu khỏi kho tri thức
  const handleDeleteSource = async (filename) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${filename}" khỏi Vector DB?`)) return;
    try {
      await fetch(`${API_BASE}/api/sources/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      reloadSources();
    } catch (err) {
      console.error('Lỗi xóa file:', err);
    }
  };

  // Gửi tin nhắn chat
  const handleSend = async (overrideText = null, overrideMode = null) => {
    const textToSend = overrideText !== null ? overrideText : input;
    const activeMode = overrideMode !== null ? overrideMode : mode;

    if (!textToSend.trim() || isLoading) return;

    // Yêu cầu đăng nhập MSSV trước khi chat
    if (!user) {
      openLoginModal();
      return;
    }

    const activeSessionId = currentSessionId || `session-${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      mode: activeMode,
      level,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Chuẩn bị tin nhắn Bot
    const botMessageId = `bot-${Date.now()}`;
    const botMsg = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      mode: activeMode,
      level,
      model: 'Gemini',
      duration: '...',
      ttft: null,
      sources: [],
      grounded: true,
      disclaimer: null,
      isStreaming: true
    };

    setMessages([...newHistory, botMsg]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newHistory.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
          question: textToSend.trim(),
          mode: activeMode,
          level,
          stream: true,
          username: user ? user.username : (lastUser ? lastUser.username : null),
          isLoggedIn: Boolean(user)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi máy chủ (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let streamDuration = '';
      let streamTtft = null;
      let streamSources = [];
      let streamGrounded = true;
      let streamDisclaimer = null;
      let receivedDone = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.slice(6).trim();
              if (rawData === '[DONE]') { receivedDone = true; break; }

              try {
                const parsed = JSON.parse(rawData);
                if (parsed.text) {
                  fullText += parsed.text;
                  if (parsed.ttft && streamTtft === null) streamTtft = parsed.ttft;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === botMessageId
                        ? { ...m, content: fullText, ttft: streamTtft }
                        : m
                    )
                  );
                }
                if (parsed.done) {
                  receivedDone = true;
                  if (parsed.duration) streamDuration = `${parsed.duration}s`;
                  if (parsed.ttft) streamTtft = `${parsed.ttft}s`;
                  if (parsed.sources) streamSources = parsed.sources;
                  if (parsed.grounded !== undefined) streamGrounded = parsed.grounded;
                  if (parsed.disclaimer) streamDisclaimer = parsed.disclaimer;
                }
                if (parsed.error) {
                  fullText += `\n\n⚠️ **Lỗi:** ${parsed.error}`;
                }
              } catch { }
            }
          }
        }
      } catch (readErr) {
        // EOF / network cut — vẫn tiếp tục finalise với nội dung đã nhận
        if (!fullText) {
          fullText = '⚠️ Kết nối bị gián đoạn. Vui lòng thử lại.';
        }
      }

      const finalBotMsg = {
        id: botMessageId,
        role: 'assistant',
        content: fullText || '(Không nhận được phản hồi)',
        duration: streamDuration || '1.5s',
        ttft: streamTtft,
        sources: streamSources,
        grounded: streamGrounded,
        disclaimer: streamDisclaimer,
        isStreaming: false
      };

      setMessages(prev =>
        prev.map(m => (m.id === botMessageId ? finalBotMsg : m))
      );

      // Tự động lưu phiên trò chuyện của sinh viên
      const fullSessionMsgs = [...newHistory, finalBotMsg];
      saveSessionToBackend(fullSessionMsgs, activeSessionId);
    } catch (err) {
      if (err.name === 'AbortError') {
        const stoppedMsg = {
          id: botMessageId,
          role: 'assistant',
          content: '(Đã dừng phản hồi)',
          isStreaming: false
        };
        setMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? { ...m, content: m.content + ' *(Đã dừng phản hồi)*', isStreaming: false }
              : m
          )
        );
        saveSessionToBackend([...newHistory, stoppedMsg], activeSessionId);
      } else {
        const isRateLimit = String(err.message).includes('429') || String(err.message).toLowerCase().includes('rate limit');
        const errContent = isRateLimit
          ? `⚡ **Bạn đang hỏi khá nhanh (đạt giới hạn 15 lượt/phút của gói miễn phí):**\n\nHệ thống AI trên gói Free Tier của Google giới hạn mỗi phút tối đa 15 câu hỏi. Bạn vui lòng nghỉ 10 – 15 giây rồi tiếp tục hỏi nhé!\n\n💡 *Mẹo: Bạn có thể thêm API Key dự phòng vào file \`server/.env\` (dạng \`GEMINI_API_KEY=key1,key2\`) để tự động nhân đôi hạn mức không lo bị gián đoạn.*`
          : `⚠️ **Không thể kết nối:** ${err.message}\n\n*Gợi ý: Kiểm tra server Node.js đang chạy tại cổng 3001 và GEMINI_API_KEY trong file .env.*`;

        setMessages(prev =>
          prev.map(m =>
            m.id === botMessageId
              ? {
                ...m,
                content: errContent,
                isStreaming: false
              }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có muốn tạo cuộc trò chuyện mới? (Phiên hiện tại vẫn được lưu lại)')) {
      handleNewChat();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalSourceChunks = Object.values(sourcesList).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] animate-fadeIn overflow-hidden">
      {/* Top Toolbar: Mode Switcher & Student Level Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0E0BF]/80 bg-[#FFFBF1]/60 backdrop-blur-xs shrink-0">
        {/* Modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full no-scrollbar">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-[#FFB000] text-[#1A1200] shadow-xs font-extrabold ring-2 ring-[#FFB000]/40'
                  : 'bg-[#FFF8EA] text-[#635338] hover:bg-[#FFEEC7] border border-[#F0DFBE]'
                  }`}
                title={m.desc}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Level Selector + Doc Button + Clear Button */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 w-full sm:w-auto">
          {/* Level Switcher */}
          <div className="flex items-center bg-[#FFF8EA] border border-[#F0DFBE] rounded-full p-0.5 shadow-2xs">
            {STUDENT_LEVELS.map((lvl) => {
              const isSelected = level === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelChange(lvl.id)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1 ${isSelected
                    ? 'bg-[#FFB000] text-[#1A1200] shadow-2xs'
                    : 'text-[#7A6A4E] hover:text-[#1A1200]'
                    }`}
                  title={lvl.desc}
                >
                  <span>{lvl.icon}</span>
                  <span className="text-[11px] sm:text-xs">{lvl.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Lịch sử hội thoại Button */}
            <button
              onClick={() => {
                if (!user) {
                  openLoginModal();
                } else {
                  setIsHistoryOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#FFEFC7] hover:bg-[#FFE3A0] text-[#1A1200] border border-[#F0DCAC] text-xs font-black transition shadow-2xs cursor-pointer hover:scale-102 active:scale-98"
              title={user ? 'Xem toàn bộ lịch sử hỏi đáp của bạn' : 'Đăng nhập MSSV để xem lịch sử'}
            >
              <History className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="hidden xs:inline">Lịch sử</span>
              {user && sessions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FFB000] text-[#1A1200] rounded-full text-[10px] font-black">
                  {sessions.length}
                </span>
              )}
            </button>

            {/* Doc Management & Upload Button */}
            <button
              onClick={() => {
                setShowDocModal(true);
                setUploadMsg(null);
                reloadSources();
                loadSampleFiles();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFEEC7] hover:bg-[#FFE3A0] text-[#1A1200] border-2 border-[#FFB000] text-xs font-black transition shadow-xs cursor-pointer hover:scale-102 active:scale-98"
              title="Tải lên tài liệu giáo trình & Quản lý Vector DB"
            >
              <Upload className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="hidden xs:inline">Upload Tài liệu</span>
              <span className="px-1.5 py-0.2 bg-[#FFB000] text-[#1A1200] rounded-full text-[10px] font-black">
                {Object.keys(sourcesList).length}
              </span>
            </button>

            {/* Clear / New Chat */}
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-[#FFF8EA] hover:bg-[#FFF0F0] text-[#8A3A3A] hover:text-[#B91C1C] border border-[#F0DFBE] text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Tạo cuộc trò chuyện mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đoạn mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner thông báo nếu chưa đăng nhập */}
      {!user && (
        <div className="my-1.5 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-[#FFF6DE] border border-[#F3DFB5] text-xs shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2 text-[#7A5B00] font-bold truncate">
            <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="truncate">
              {lastUser
                ? `Đang nhớ lịch học của ${lastUser.name} (${lastUser.username}). Bạn vẫn có thể hỏi Thời khóa biểu bình thường!`
                : 'Chưa đăng nhập. Nhập mật khẩu sinh viên để trợ lý lấy Thời khóa biểu cho bạn!'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setSyncMssv(lastUser?.username || '');
                setShowSyncTkbModal(true);
                setSyncTkbError(null);
                setSyncPassword('');
              }}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-[#FFEFC7] hover:bg-[#FFE8AE] border border-[#F0DCAC] text-[#1A1200] font-black text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
              title="Nhập mật khẩu sinh viên để lấy TKB"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="hidden xs:inline">Nhập MK</span>
              <span>Lấy TKB</span>
            </button>
            <button
              onClick={openLoginModal}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Đăng nhập</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 sm:py-3 space-y-3 sm:space-y-4 rounded-2xl scrollbar-thin scrollbar-thumb-[#EAD7B2]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSourcesOpen = expandedSourceMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 shadow-2xs transition-all duration-200 ${isUser
                  ? 'bg-[#1A1200] text-[#FFB000]'
                  : 'bg-[#FFB000] text-[#1A1200]'
                  } ${!isUser && msg.isStreaming ? 'ring-2 ring-[#FFB000] ring-offset-2 ring-offset-[#FFFDF7] animate-pulse shadow-md shadow-[#FFB000]/30' : ''}`}
              >
                {!isUser && msg.isStreaming ? (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1A1200] animate-spin-slow" />
                ) : (
                  isUser ? 'Bạn' : 'AI'
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[94%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Meta Header */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 px-1 text-[10px] sm:text-[11px] text-[#8F7E64]">
                  {!isUser && (
                    <>
                      <span className="font-extrabold text-[#52442C]">
                        {msg.model?.includes('kira') ? 'Kira AI' : 'Gemini'}
                      </span>
                      {msg.isStreaming && !msg.content ? (
                        <span className="bg-[#FFF4DC] px-2 py-0.5 rounded-full border border-[#F3E2BD] text-[#7A5B00] text-[10px] font-black flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000] animate-ping" />
                          Đang soạn thảo...
                        </span>
                      ) : (
                        <>
                          {msg.duration && msg.duration !== '...' && (
                            <span className="bg-[#FFF4DC] px-1.5 py-0.2 rounded border border-[#F3E2BD] text-[#7A5B00]">
                              ⚡ {msg.duration}
                            </span>
                          )}
                          {msg.ttft && (
                            <span className="bg-[#EBF7EE] px-1.5 py-0.2 rounded border border-[#CDEED5] text-[#166534] text-[10px] font-bold">
                              TTFT: {msg.ttft}s
                            </span>
                          )}
                        </>
                      )}
                      {msg.level && (
                        <span className="bg-[#FFF0CB] px-2 py-0.5 rounded-full border border-[#EED79E] text-[#694E00] uppercase text-[10px] font-black tracking-wider">
                          {msg.level === 'co_ban' || msg.level === 'low' ? 'Low' : msg.level === 'nang_cao' || msg.level === 'high' || msg.level === 'hight' ? 'High' : 'Medium'}
                        </span>
                      )}
                    </>
                  )}
                  {isUser && msg.time && <span>{msg.time}</span>}
                </div>

                {/* Content Container */}
                <div
                  className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${isUser
                    ? 'bg-[#1A1200] text-[#FFFDF7] rounded-tr-xs'
                    : 'bg-white border border-[#EADBBD] text-[#1A1200] rounded-tl-xs'
                    }`}
                >
                  {!isUser && msg.isStreaming && !msg.content ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 py-1 px-0.5 animate-fadeIn">
                      {/* 3 chấm nhảy sóng Typing Indicator */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8EA] border border-[#F0DFBE] w-fit shadow-2xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFB000] animate-typing-1 shadow-xs" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F00] animate-typing-2 shadow-xs" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF7700] animate-typing-3 shadow-xs" />
                      </div>

                      {/* Text trạng thái đang soạn */}
                      <div className="flex items-center gap-1.5 text-xs font-extrabold shimmer-text">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFB000] animate-spin-slow shrink-0" />
                        <span>
                          {msg.mode === 'quiz'
                            ? 'Trợ lý AI đang phân tích tài liệu & soạn đề trắc nghiệm...'
                            : msg.mode === 'summary'
                              ? 'Trợ lý AI đang tổng hợp sơ đồ ý phân cấp...'
                              : msg.mode === 'rag'
                                ? 'Trợ lý AI đang đối chiếu giáo trình & trích nguồn...'
                                : 'Trợ lý AI đang suy nghĩ & soạn câu trả lời...'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <MarkdownRenderer content={msg.content} />
                      {!isUser && msg.isStreaming && msg.content && (
                        <span className="inline-block w-2 h-4 ml-1.5 bg-[#FFB000] rounded-xs animate-pulse align-middle shadow-xs" />
                      )}
                    </>
                  )}

                  {/* Quick Action Button khi bot hướng dẫn nhập mật khẩu lấy TKB */}
                  {!isUser && (
                    (msg.content.toLowerCase().includes('mật khẩu') ||
                      msg.content.toLowerCase().includes('portal') ||
                      msg.content.includes('cổng thông tin sinh viên') ||
                      msg.content.includes('sinhvien.hutech.edu.vn') ||
                      msg.content.includes('Lấy Thời Khóa Biểu Ngay') ||
                      msg.content.includes('đồng bộ dữ liệu')) &&
                    (msg.content.toLowerCase().includes('thời khóa biểu') ||
                      msg.content.toLowerCase().includes('lịch học') ||
                      msg.content.toLowerCase().includes('tkb'))
                  ) && (
                      <div className="mt-3 pt-2.5 border-t border-[#F0E0BF]/80">
                        <button
                          onClick={() => {
                            const mssvMatch = msg.content.match(/\b\d{10,11}\b/);
                            setSyncMssv(mssvMatch ? mssvMatch[0] : (lastUser?.username || user?.username || ''));
                            setShowSyncTkbModal(true);
                            setSyncTkbError(null);
                            setSyncPassword('');
                          }}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs shadow-xs transition cursor-pointer active:scale-95"
                        >
                          <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Nhập mật khẩu để lấy TKB ngay</span>
                        </button>
                      </div>
                    )}

                  {/* Sources Citations Accordion */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#F0E0BF]">
                      <button
                        onClick={() => setExpandedSourceMsgId(isSourcesOpen ? null : msg.id)}
                        className="flex items-center justify-between w-full text-[11px] sm:text-xs font-black text-[#7A5B00] bg-[#FFF5DC] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#F0DFBD] hover:bg-[#FFEEC7] transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB000]" />
                          <span>Nguồn trích dẫn ({msg.sources.length} đoạn)</span>
                        </span>
                        {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isSourcesOpen && (
                        <div className="mt-2 space-y-1.5 sm:space-y-2 animate-fadeIn">
                          {msg.sources.map((src) => (
                            <div
                              key={src.index}
                              className="p-2 sm:p-2.5 rounded-xl bg-[#FFFDF7] border border-[#F0E0BF] text-[11px] sm:text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-[#694E00]">
                                <span className="truncate pr-2">[{src.index}] {src.source} {src.page ? `(Trang ${src.page})` : ''}</span>
                                <span className="text-[9px] sm:text-[10px] bg-[#FFF0CB] px-1.5 py-0.2 rounded border border-[#EED79E] shrink-0">
                                  d = {src.distance}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-[#6B5A3F] italic leading-normal">
                                "{src.snippet}..."
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Disclaimer Note */}
                  {!isUser && msg.disclaimer && (
                    <p className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-[#8C7A5E] italic border-t border-[#F5EADB] pt-2">
                      {msg.disclaimer}
                    </p>
                  )}
                </div>

                {/* Actions below bubble */}
                {!isUser && msg.content && (
                  <div className="flex items-center gap-2 mt-1 px-1 sm:px-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded-md text-[#8F7E64] hover:text-[#1A1200] hover:bg-black/5 transition cursor-pointer"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Preset Questions */}
      {presets.length > 0 && (
        <div className="py-1.5 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
          {presets.slice(0, 6).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text, p.mode || mode)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FFF8EA] hover:bg-[#FFEEC7] text-[#635338] border border-[#F0DFBE] text-[11px] sm:text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
            >
              <span className="text-[#FFB000] font-black mr-1">✦</span>
              {p.text}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Container */}
      <div className="pt-1.5 shrink-0">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#EADBBD] shadow-sm focus-within:ring-2 focus-within:ring-[#FFB000] focus-within:border-[#FFB000] transition-all flex items-center">
          {/* Nút Upload / Đính kèm tài liệu trực tiếp trên Input Box */}
          <button
            type="button"
            onClick={() => {
              setShowDocModal(true);
              setUploadMsg(null);
              reloadSources();
              loadSampleFiles();
            }}
            className="ml-2 sm:ml-3 p-2 rounded-xl text-[#8C7A5E] hover:text-[#1A1200] hover:bg-[#FFF5DC] transition cursor-pointer shrink-0"
            title="Tải lên tài liệu giáo trình (PDF, Word, TXT) để Chatbot học"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB000]" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập câu hỏi... hoặc bấm 📎 để tải lên tài liệu mới (Enter để gửi)"
            className="w-full pl-2 sm:pl-3 pr-12 sm:pr-14 py-2.5 sm:py-3.5 max-h-32 sm:max-h-44 bg-transparent resize-none text-xs sm:text-sm leading-relaxed text-[#1A1200] placeholder-[#A8987E] outline-hidden scrollbar-thin"
          />

          <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-2.5 flex items-center gap-1.5">
            {isLoading ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF4DC] border border-[#F3E2BD] text-[11px] font-extrabold text-[#7A5B00] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
                  AI đang soạn...
                </span>
                <button
                  onClick={handleStop}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center transition shadow-sm cursor-pointer"
                  title="Dừng sinh câu trả lời"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center transition cursor-pointer ${input.trim()
                  ? 'bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] shadow-sm active:scale-95'
                  : 'bg-[#F2E5CE] text-[#B0A187] cursor-not-allowed'
                  }`}
                title="Gửi câu hỏi"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Quản lý Tài liệu & Upload RAG */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-w-2xl bg-[#FFFBF1] rounded-2xl sm:rounded-3xl border border-[#EADBBD] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF5DC] border-b border-[#F0E0BF]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB000]" />
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A1200]">
                  Kho Tài Liệu Giáo Trình RAG
                </h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-lg sm:text-xl font-black text-[#6B5A3F] hover:text-[#1A1200] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-6">
              {/* Mục 1: Tài liệu mẫu Demo 1-Click */}
              <div className="bg-[#FFF5DC]/80 border border-[#F0DFBD] rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-black text-[#7A4B00] uppercase tracking-wider">
                      Tài Liệu Mẫu Đã Test Kỹ (Demo 1-Click)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C7A5E] font-medium hidden sm:inline">
                    Thư mục: demo_data/
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#6B5A3F] leading-relaxed">
                  Bạn có thể bấm nạp trực tiếp tài liệu mẫu đã chuẩn hóa sẵn hoặc chọn file từ máy tính:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {sampleFiles.map((sample) => {
                    const isIndexed = Boolean(sourcesList[sample.filename]);
                    const isIngesting = ingestingSample === sample.filename;

                    return (
                      <div
                        key={sample.filename}
                        className="p-2.5 rounded-xl bg-white border border-[#EADBBD] shadow-2xs flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${sample.type === 'PDF'
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : sample.type === 'Word'
                              ? 'bg-[#DBEAFE] text-[#2563EB]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                            }`}>
                            {sample.type === 'PDF' ? 'PDF' : sample.type === 'Word' ? 'DOC' : 'TXT'}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-bold text-[#1A1200] truncate" title={sample.filename}>
                              {sample.filename}
                            </p>
                            <p className="text-[10px] text-[#8C7A5E]">
                              {sample.sizeFormatted} • {sample.type === 'PDF' ? 'Kiến trúc CSDL & Khóa' : 'Chuẩn hóa 1NF-BCNF'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#F5EFE0]">
                          {isIndexed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#166534]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã nạp ({sourcesList[sample.filename]} đoạn)
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#A8987E] italic">
                              Chưa có trong DB
                            </span>
                          )}

                          <button
                            onClick={() => handleIngestSample(sample.filename)}
                            disabled={isIngesting || uploading}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer shrink-0 ${isIndexed
                              ? 'bg-[#FFF8EA] hover:bg-[#FFEEC7] text-[#7A5B00] border border-[#F0DFBD]'
                              : 'bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] shadow-2xs'
                              }`}
                          >
                            {isIngesting ? 'Đang nạp...' : isIndexed ? 'Nạp lại' : '⚡ Nạp vào DB'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mục 2: Upload Dropzone từ máy tính */}
              <div className="border-2 border-dashed border-[#E0CFAB] hover:border-[#FFB000] rounded-2xl p-4 sm:p-5 bg-white/70 text-center transition flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF5DC] flex items-center justify-center text-[#FFB000]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#1A1200]">
                    Kéo thả hoặc chọn file tài liệu từ máy tính của bạn
                  </p>
                  <p className="text-[11px] text-[#8C7A5E] mt-0.5">
                    Hỗ trợ: <b>PDF, Word (.docx), TXT, Markdown</b> (Tự động chunking & sinh embedding)
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || ingestingSample}
                  className="mt-1 px-4 py-2 rounded-xl bg-[#1A1200] hover:bg-[#2E2003] text-white text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FileUp className="w-4 h-4 text-[#FFB000]" />
                  <span>{uploading ? 'Đang trích xuất & Vector hóa...' : 'Chọn file từ máy tính'}</span>
                </button>
              </div>

              {uploadMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${uploadMsg.type === 'success'
                    ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                    : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                    }`}
                >
                  {uploadMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{uploadMsg.text}</span>
                </div>
              )}

              {/* Mục 3: Danh sách tài liệu đã index */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#5C4D32] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#FFB000]" />
                    Tài liệu đã index trong Vector DB ({Object.keys(sourcesList).length} file, {totalSourceChunks} đoạn)
                  </h4>
                  <button
                    onClick={reloadSources}
                    className="text-[11px] font-bold text-[#92400E] hover:underline cursor-pointer"
                  >
                    Làm mới
                  </button>
                </div>

                {Object.keys(sourcesList).length === 0 ? (
                  <p className="text-xs text-[#8C7A5E] italic text-center py-4 bg-white/50 rounded-xl">
                    Chưa có tài liệu nào trong kho tri thức. Hãy tải lên file đầu tiên!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(sourcesList).map(([name, chunks]) => {
                      const isPdf = name.toLowerCase().endsWith('.pdf');
                      const isDoc = name.toLowerCase().endsWith('.docx');

                      return (
                        <div
                          key={name}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white border border-[#EADBBD] text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${isPdf ? 'bg-[#FEE2E2] text-[#DC2626]' : isDoc ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#F3F4F6] text-[#4B5563]'
                              }`}>
                              {isPdf ? 'PDF' : isDoc ? 'DOCX' : 'TXT'}
                            </span>
                            <span className="font-bold text-[#1A1200] truncate">{name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#FFF5DC] text-[#7A5B00] border border-[#F0DFBD] text-[10px] font-black shrink-0">
                              {chunks} đoạn
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSource(name)}
                            className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition cursor-pointer shrink-0"
                            title="Xóa tài liệu khỏi Vector DB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#FFF5DC] border-t border-[#F0E0BF] gap-2">
              <span className="text-[11px] sm:text-xs text-[#7A6A4E] truncate">
                Cosine Similarity | gemini-embedding-001
              </span>
              <button
                onClick={() => setShowDocModal(false)}
                className="px-4 sm:px-5 py-2 rounded-xl bg-[#FFB000] hover:bg-[#E59E00] text-[#1A1200] text-xs font-black transition shadow-xs cursor-pointer shrink-0"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Quản lý Lịch sử Chat theo MSSV */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllSessions}
        user={user}
        isLoading={loadingHistory}
      />

      {/* ──────── MODAL ĐỒNG BỘ / NHẬP MẬT KHẨU TKB TRỰC TIẾP TRONG CHAT ──────── */}
      {showSyncTkbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#F0E0BF] shadow-2xl p-6 sm:p-7 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSyncTkbModal(false)}
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
                  Lấy Thời Khóa Biểu HUTECH
                </h3>
                <p className="text-xs text-[#8C7A5E]">
                  Nhập mật khẩu để chatbot tự động tải lịch học
                </p>
              </div>
            </div>

            {syncTkbSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-[#E8F8EE] border border-[#A7E7BA] flex items-center gap-2.5 text-[#136C38] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Đã lấy thành công thời khóa biểu! Đang cập nhật...</span>
              </div>
            )}

            {syncTkbError && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FEECEB] border border-[#FCA5A5] flex items-start gap-2.5 text-[#B91C1C] text-xs font-semibold leading-relaxed">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{syncTkbError}</span>
              </div>
            )}

            <form onSubmit={handleSyncTkbInChat} className="space-y-3.5">
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
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF8EA] border border-[#F0DFBE] text-xs font-bold text-[#1A1200] placeholder-[#A49479] focus:outline-none focus:ring-2 focus:ring-[#FFB000]"
                />
                <p className="text-[11px] text-[#8C7A5E] mt-1 font-medium">
                  🔒 Mật khẩu chỉ dùng để xác thực tức thì và hoàn toàn không được lưu trữ. Sau khi lấy một lần, bạn có thể hỏi lịch học bất cứ lúc nào!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyncTkbModal(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#1A1200] font-black text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={syncingTkb}
                  className="px-5 py-2 rounded-2xl bg-[#FFB000] hover:bg-[#EAA000] text-[#1A1200] font-black text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {syncingTkb ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kết nối...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đồng Bộ TKB Ngay</span>
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

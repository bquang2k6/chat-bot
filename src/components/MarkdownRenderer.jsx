import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function MarkdownRenderer({ content }) {
  // Kiểm tra xem nội dung có phải là JSON trắc nghiệm không
  const isQuiz = (text) => {
    try {
      const clean = text.replace(/```(?:json)?/g, '').trim();
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].options;
    } catch {
      return false;
    }
  };

  if (isQuiz(content)) {
    return <QuizRenderer content={content} />;
  }

  return (
    <div className="space-y-3 leading-relaxed text-inherit">
      {renderMarkdownText(content)}
    </div>
  );
}

function QuizRenderer({ content }) {
  let quizList = [];
  try {
    const clean = content.replace(/```(?:json)?/g, '').trim();
    quizList = JSON.parse(clean);
  } catch {
    return <div>{content}</div>;
  }

  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (qIdx, letter) => {
    // Cho phép click chọn hoặc đổi đáp án
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: letter }));
  };

  // Tính số câu đã trả lời và số câu đúng
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  quizList.forEach((item, idx) => {
    const ansMatch = String(item.answer || '').match(/[A-D]/i);
    const correctLetter = ansMatch ? ansMatch[0].toUpperCase() : '';
    if (selectedAnswers[idx] && selectedAnswers[idx] === correctLetter) {
      correctCount++;
    }
  });

  return (
    <div className="space-y-4 my-2">
      {/* Header bài trắc nghiệm kèm bộ đếm điểm */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0E0BF]">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h4 className="font-extrabold text-base sm:text-lg text-[#1A1200]">
            Bài Trắc Nghiệm Tương Tác ({quizList.length} câu)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-full bg-[#FFF5DC] text-[#7A5B00] border border-[#F0DFBD]">
            Đã làm: {answeredCount}/{quizList.length}
          </span>
          {answeredCount > 0 && (
            <span className={`px-2.5 py-1 rounded-full font-black ${
              correctCount === answeredCount 
                ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' 
                : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
            }`}>
              Đúng: {correctCount}/{answeredCount}
            </span>
          )}
        </div>
      </div>

      {quizList.map((item, idx) => {
        const selected = selectedAnswers[idx];
        const ansMatch = String(item.answer || '').match(/[A-D]/i);
        const correctLetter = ansMatch ? ansMatch[0].toUpperCase() : '';
        const isAnswered = Boolean(selected);
        const isUserCorrect = selected === correctLetter;
        const explainText = item.explanation || item.explain || '';

        return (
          <div
            key={idx}
            className={`p-3.5 sm:p-5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs space-y-3 ${
              isAnswered
                ? isUserCorrect
                  ? 'border-[#86EFAC] ring-2 ring-[#22C55E]/10 bg-[#F0FDF4]/30'
                  : 'border-[#FCA5A5] ring-2 ring-[#EF4444]/10 bg-[#FEF2F2]/30'
                : 'border-[#EADBBD]'
            }`}
          >
            {/* Câu hỏi */}
            <div className="flex items-start gap-2">
              <span className="inline-block px-2.5 py-0.5 text-xs font-black rounded-lg bg-[#FFB000] text-[#1A1200] shrink-0 mt-0.5">
                Câu {idx + 1}
              </span>
              <p className="font-extrabold text-[#1A1200] text-sm leading-snug flex-1">
                {item.question}
              </p>
            </div>

            {/* Danh sách 4 đáp án A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {item.options?.map((opt, oIdx) => {
                // Xác định ký tự phương án (A, B, C, D)
                const optMatch = String(opt).trim().match(/^[A-D]/i);
                const letter = optMatch ? optMatch[0].toUpperCase() : String.fromCharCode(65 + oIdx);
                const cleanOptText = String(opt).replace(/^[A-D][.:)\s-]+/i, '').trim();

                const isThisSelected = selected === letter;
                const isThisCorrect = letter === correctLetter;

                // Tùy biến style nút bấm và vòng tròn khoanh
                let containerClass = "border-[#EADBBD] bg-white hover:bg-[#FFF8EA] text-[#1A1200] hover:border-[#FFB000]";
                let circleClass = "border-[#C9B793] text-[#7A6A4E] bg-[#FFFBF1]";

                if (isAnswered) {
                  if (isThisCorrect) {
                    // Đáp án đúng luôn tô xanh lá nổi bật
                    containerClass = "border-[#22C55E] bg-[#DCFCE7]/70 text-[#14532D] font-bold shadow-xs";
                    circleClass = "border-[#22C55E] bg-[#22C55E] text-white";
                  } else if (isThisSelected && !isThisCorrect) {
                    // Nếu người dùng chọn sai: tô đỏ
                    containerClass = "border-[#EF4444] bg-[#FEE2E2]/70 text-[#7F1D1D] font-bold shadow-xs";
                    circleClass = "border-[#EF4444] bg-[#EF4444] text-white";
                  } else {
                    // Các câu còn lại làm mờ
                    containerClass = "border-[#EADBBD] opacity-40 bg-white";
                    circleClass = "border-[#D1C2A3] text-[#A8987E]";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelect(idx, letter)}
                    className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-start gap-2.5 cursor-pointer hover:scale-101 active:scale-99 ${containerClass}`}
                  >
                    {/* Vòng tròn khoanh đáp án */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 transition-colors ${circleClass}`}
                    >
                      {isAnswered && isThisCorrect ? (
                        '✓'
                      ) : isAnswered && isThisSelected && !isThisCorrect ? (
                        '✕'
                      ) : (
                        letter
                      )}
                    </div>

                    {/* Nội dung phương án */}
                    <span className="flex-1 leading-snug pt-0.5">
                      {cleanOptText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Phản hồi đúng/sai và giải thích chi tiết */}
            {isAnswered && (
              <div className="pt-2 animate-fadeIn space-y-2">
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  isUserCorrect 
                    ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' 
                    : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                }`}>
                  <span className="text-base">{isUserCorrect ? '🎉' : '⚠️'}</span>
                  <span>
                    {isUserCorrect 
                      ? 'Chính xác! Bạn đã chọn đúng đáp án.' 
                      : `Chưa chính xác! Đáp án đúng là phương án ${correctLetter}.`}
                  </span>
                </div>

                {explainText && (
                  <div className="text-xs p-3 rounded-xl bg-[#FFF5DC] text-[#6B4E00] border border-[#F3E2B8] leading-relaxed">
                    💡 <b>Giải thích chi tiết:</b> {explainText}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderMarkdownText(text) {
  if (!text) return null;

  // Tách các khối code block trước
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const lang = part.slice(3, firstLineEnd > 0 ? firstLineEnd : 3).trim();
      const code = firstLineEnd > 0 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);
      return <CodeBlock key={idx} code={code} lang={lang} />;
    }

    // Xử lý các dòng văn bản thông thường
    return <FormattedTextBlock key={idx} text={part} />;
  });
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-2xl overflow-hidden border border-[#EADBBD] bg-[#221A0C] text-[#FFFBF1] text-xs font-mono shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-[#2D2312] border-b border-[#3D301A] text-xs font-sans text-[#E0CFAB]">
        <span className="font-bold uppercase tracking-wider">{lang || 'CODE'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3D301A] hover:bg-[#4E3E22] transition text-[#FFFBF1] cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedTextBlock({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3 rounded-xl border border-[#F0E0BF]">
          <table className="min-w-full text-left text-sm bg-white divide-y divide-[#F0E0BF]">
            <thead className="bg-[#FFF8EA] text-[#1A1200] font-bold">
              <tr>
                {tableRows[0].map((th, i) => (
                  <th key={i} className="px-3 py-2 border-r last:border-r-0 border-[#F0E0BF]">{formatInline(th)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EAD4]">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FFFDF7]">
                  {row.map((td, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-[#F0E0BF]">{formatInline(td)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Xử lý bảng Markdown: | col 1 | col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      // Bỏ qua dòng phân cách: |---|---|
      if (cells.every(c => /^[-:]+$/.test(c))) {
        inTable = true;
        return;
      }
      tableRows.push(cells);
      inTable = true;
      return;
    } else if (inTable) {
      flushTable();
      inTable = false;
    }

    if (!trimmed) {
      elements.push(<div key={`br-${index}`} className="h-2" />);
      return;
    }

    // Tiêu đề: ### Heading
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-base font-bold text-inherit pt-2 pb-1 border-l-4 border-[#FFB000] pl-2.5">
          {formatInline(trimmed.replace(/^###\s*/, ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-lg font-black text-inherit pt-3 pb-1 border-l-4 border-[#FFB000] pl-2.5">
          {formatInline(trimmed.replace(/^##\s*/, ''))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-xl font-black text-inherit pt-3 pb-1 border-l-4 border-[#FFB000] pl-2.5">
          {formatInline(trimmed.replace(/^#\s*/, ''))}
        </h1>
      );
      return;
    }

    // Danh sách: - item hoặc * item
    if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={index} className="flex items-start gap-2 pl-2">
          <span className="text-[#FFB000] font-black leading-snug">•</span>
          <span className="flex-1">{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Danh sách số: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s+/)[1];
      elements.push(
        <div key={index} className="flex items-start gap-2 pl-2">
          <span className="font-bold text-[#FFB000] min-w-5">{num}.</span>
          <span className="flex-1">{formatInline(trimmed.replace(/^\d+\.\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Trích dẫn: > quote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={index} className="pl-3.5 border-l-3 border-[#FFB000] italic text-[#635035] bg-[#FFF9ED] py-1.5 rounded-r-lg">
          {formatInline(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
      return;
    }

    // Đoạn văn thông thường
    elements.push(
      <p key={index} className="leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });

  if (inTable) {
    flushTable();
  }

  return <>{elements}</>;
}

function formatInline(str) {
  if (!str) return '';

  // Xử lý code inline, bold, italic
  const parts = [];
  let remaining = str;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Inline code: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

    let earliestIdx = Infinity;
    let matchType = null;
    let matchResult = null;

    if (codeMatch && codeMatch.index < earliestIdx) {
      earliestIdx = codeMatch.index;
      matchType = 'code';
      matchResult = codeMatch;
    }
    if (boldMatch && boldMatch.index < earliestIdx) {
      earliestIdx = boldMatch.index;
      matchType = 'bold';
      matchResult = boldMatch;
    }

    if (matchType === null) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }

    if (matchType === 'code') {
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded-md bg-[#FCE8C3] text-[#704800] font-mono text-xs font-semibold">
          {matchResult[1]}
        </code>
      );
    } else if (matchType === 'bold') {
      parts.push(
        <strong key={keyIdx++} className="font-extrabold text-inherit">
          {matchResult[1]}
        </strong>
      );
    }

    remaining = remaining.slice(earliestIdx + matchResult[0].length);
  }

  return parts;
}

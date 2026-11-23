import React, { useState, useMemo } from 'react';
import { Entry, CardProgress } from '../types/vocab';
import {
  PracticeCategory,
  PracticeQuestion,
  buildPracticeSession
} from '../utils/practiceEngine';
import { QuestionCard } from '../components/practice/QuestionCard';
import { Button } from '../components/ui/Button';
import {
  Brain,
  RotateCcw,
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export interface PracticeProps {
  allEntries: Entry[];
  progressMap: Map<string, CardProgress>;
  onStartStudy?: () => void;
}

export const Practice: React.FC<PracticeProps> = ({
  allEntries,
  progressMap,
  onStartStudy
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PracticeCategory>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Array<{ question: PracticeQuestion; isCorrect: boolean }>>([]);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Group entries by progress status
  const categoriesData = useMemo(() => {
    const learning: Entry[] = [];
    const review: Entry[] = [];
    const mastered: Entry[] = [];
    const allStudied: Entry[] = [];

    allEntries.forEach((entry) => {
      const p = progressMap.get(entry.id);
      if (p && p.status !== 'new') {
        allStudied.push(entry);
        if (p.status === 'learning') learning.push(entry);
        else if (p.status === 'review') review.push(entry);
        else if (p.status === 'mastered') mastered.push(entry);
      }
    });

    return {
      learning,
      review,
      mastered,
      all: allStudied
    };
  }, [allEntries, progressMap]);

  // Current pool of entries for selected category
  const currentPool = categoriesData[selectedCategory];

  // Start a new practice session
  const handleStartSession = () => {
    // If user has no words in this category, allow practicing with sample cards from allEntries
    const pool = currentPool.length > 0 ? currentPool : allEntries.slice(0, 20);
    const count = Math.min(questionCount, pool.length);
    const sessionQuestions = buildPracticeSession(pool, allEntries, count);

    setQuestions(sessionQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setIsSessionActive(true);
    setIsFinished(false);
  };

  // Handle completing a question
  const handleNextQuestion = (isCorrect: boolean) => {
    const currentQ = questions[currentIndex];
    const newAnswers = [...answers, { question: currentQ, isCorrect }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSessionActive(false);
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setIsSessionActive(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setAnswers([]);
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = questions.length;
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // 1. ACTIVE PRACTICE SESSION (QUIZ RUNNER)
  if (isSessionActive && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
        {/* Top Session Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text font-medium cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Thoát bài tập</span>
          </button>
          <span className="text-xs font-bold text-text-muted">
            Đúng: <span className="text-ok font-bold">{correctCount}</span> / {currentIndex}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          onNext={handleNextQuestion}
        />
      </div>
    );
  }

  // 2. SESSION FINISHED (RESULT SUMMARY)
  if (isFinished) {
    return (
      <div className="p-5 max-w-lg mx-auto space-y-5 pb-24 animate-fadeIn">
        {/* Score Card */}
        <div className="p-6 rounded-lg bg-surface border border-border shadow-card text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary-light flex items-center justify-center text-primary">
            <Award size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text">Hoàn thành bài tập!</h2>
            <p className="text-xs text-text-muted mt-1">
              Mỗi từ đã học được luyện tập đúng 1 lần trong phiên này.
            </p>
          </div>

          <div className="py-2">
            <span className="text-4xl font-extrabold text-primary">{scorePercent}%</span>
            <p className="text-sm font-semibold text-text mt-1">
              Chính xác {correctCount} / {totalCount} câu
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-center font-bold"
              onClick={handleStartSession}
            >
              <RotateCcw size={16} className="mr-1" />
              <span>Làm lượt mới</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              className="flex-1 justify-center"
              onClick={handleRestart}
            >
              <span>Chọn nhóm khác</span>
            </Button>
          </div>
        </div>

        {/* Breakdown of Question Results */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Danh sách từ đã làm ({answers.length} từ)
          </h3>
          <div className="space-y-2">
            {answers.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-md border flex items-start justify-between gap-3 text-xs ${
                  item.isCorrect
                    ? 'bg-ok-light/50 border-ok/30'
                    : 'bg-bad-light/50 border-bad/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-text">
                      {item.question.explanation.headword}
                    </strong>
                    <span className="text-[11px] text-text-muted">
                      ({item.question.explanation.posLabel})
                    </span>
                  </div>
                  <p className="text-text font-medium mt-0.5">
                    {item.question.explanation.meaningVi}
                  </p>
                  <p className="text-text-muted text-[11px] mt-1 font-mono">
                    {item.question.fullSentenceEn}
                  </p>
                  <p className="text-text-muted text-[11px]">
                    👉 {item.question.fullSentenceVi}
                  </p>
                </div>
                {item.isCorrect ? (
                  <CheckCircle2 size={18} className="text-ok shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-bad shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. PRACTICE SETUP SCREEN (CATEGORY & COUNT SELECTOR)
  const categoryOptions = [
    {
      id: 'learning' as PracticeCategory,
      title: 'Đang nhớ',
      count: categoriesData.learning.length,
      desc: 'Các từ mới học đang trong chu kỳ ghi nhớ ban đầu'
    },
    {
      id: 'review' as PracticeCategory,
      title: 'Ôn tập',
      count: categoriesData.review.length,
      desc: 'Các từ đã qua chu kỳ ôn, cần củng cố phản xạ'
    },
    {
      id: 'mastered' as PracticeCategory,
      title: 'Đã nhớ',
      count: categoriesData.mastered.length,
      desc: 'Các từ đã thuộc vững, kiểm tra độ ghi nhớ sâu'
    },
    {
      id: 'all' as PracticeCategory,
      title: 'Tất cả đã học',
      count: categoriesData.all.length,
      desc: 'Tổng hợp toàn bộ từ vựng bạn đã từng học'
    }
  ];

  const poolCount = currentPool.length;
  const hasStudiedWords = poolCount > 0;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text flex items-center gap-2">
            <Brain size={22} className="text-primary" />
            <span>Luyện tập từ đã học</span>
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Làm bài tập trắc nghiệm câu ví dụ & giới từ cố định
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
          1. Chọn nhóm từ luyện tập:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border text-left transition-all select-none cursor-pointer ${
                  isSelected
                    ? 'bg-primary-light border-primary shadow-xs ring-1 ring-primary/30'
                    : 'bg-surface border-border hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-text'}`}>
                    {cat.title}
                  </span>
                  <span className={`text-xs px-2 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'
                  }`}>
                    {cat.count}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted line-clamp-2 leading-tight">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice if category is empty */}
      {!hasStudiedWords && (
        <div className="p-4 rounded-lg bg-accent-warn-light/70 border border-accent-warn/30 space-y-2.5">
          <div className="flex items-start gap-2">
            <HelpCircle size={18} className="text-accent-warn shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-text">Chưa có từ vựng trong nhóm này</h4>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                Bạn chưa học từ nào thuộc nhóm này. Hãy học thêm từ ở mục <strong>Học thẻ</strong> hoặc bạn có thể làm thử bài tập với từ mẫu ngẫu nhiên.
              </p>
            </div>
          </div>
          {onStartStudy && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold justify-center"
              onClick={onStartStudy}
            >
              Đến mục Học thẻ ngay
            </Button>
          )}
        </div>
      )}

      {/* Question Count Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
          2. Số lượng câu hỏi (bốc ngẫu nhiên không trùng):
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setQuestionCount(num)}
              className={`py-2 px-3 rounded-md border text-center text-xs font-bold transition-all select-none cursor-pointer ${
                questionCount === num
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-text hover:bg-surface-2'
              }`}
            >
              {num} câu
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-muted italic">
          💡 Hệ thống tự động bốc ngẫu nhiên và đảm bảo mỗi từ xuất hiện đúng 1 lần trong bài tập.
        </p>
      </div>

      {/* Start Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full justify-center font-bold text-sm shadow-md py-3.5"
        onClick={handleStartSession}
      >
        <Brain size={18} className="mr-2" />
        <span>BẮT ĐẦU LÀM BÀI TẬP ({Math.min(questionCount, poolCount || 5)} CÂU)</span>
      </Button>
    </div>
  );
};

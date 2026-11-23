import React, { useState } from 'react';
import { PracticeQuestion } from '../../utils/practiceEngine';
import { Button } from '../ui/Button';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { speak } from '../../audio/speak';

export interface QuestionCardProps {
  question: PracticeQuestion;
  questionIndex: number;
  totalQuestions: number;
  onNext: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onNext
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleNextClick = () => {
    onNext(isCorrect);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4">
      {/* Question Header & Counter */}
      <div className="flex items-center justify-between text-xs text-text-muted pb-1 border-b border-border/40">
        <span className="font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
          Câu {questionIndex + 1} / {totalQuestions}
        </span>
        <span className="text-[11px] font-medium">
          {question.kind === 'preposition' ? 'Giới từ & Cấu trúc' : 'Từ vựng theo ngữ cảnh'}
        </span>
      </div>

      {/* Question Prompt */}
      <p className="text-xs font-semibold text-text-muted">
        {question.prompt}
      </p>

      {/* Sentence Box */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-xs space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold leading-relaxed text-text">
            {isAnswered ? question.fullSentenceEn : question.sentenceWithBlank}
          </p>
          <button
            type="button"
            onClick={() => speak(question.fullSentenceEn)}
            className="p-1.5 rounded-full hover:bg-surface-2 text-text-muted hover:text-primary transition-colors shrink-0"
            title="Nghe phát âm câu"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      {/* 4 Multiple Choice Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isThisCorrect = option === question.correctAnswer;

          let btnStyle = 'bg-surface border-border hover:bg-surface-2 text-text';
          if (isAnswered) {
            if (isThisCorrect) {
              btnStyle = 'bg-ok-light border-ok text-ok font-bold ring-2 ring-ok/20';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-bad-light border-bad text-bad font-semibold';
            } else {
              btnStyle = 'bg-surface border-border opacity-50 text-text-muted';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`w-full p-3.5 rounded-md border text-left flex items-center justify-between transition-all select-none cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isAnswered && isThisCorrect
                    ? 'bg-ok text-white'
                    : isAnswered && isSelected && !isCorrect
                    ? 'bg-bad text-white'
                    : 'bg-surface-2 text-text-muted'
                }`}>
                  {optionLabels[idx]}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </div>

              {isAnswered && isThisCorrect && (
                <CheckCircle2 size={18} className="text-ok shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle size={18} className="text-bad shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Vietnamese Translation Section (Appears after selecting answer) */}
      {isAnswered && (
        <div className="space-y-3 pt-2 animate-fadeIn">
          {/* Result Alert */}
          <div className={`p-3 rounded-md flex items-center gap-2 text-xs font-bold ${
            isCorrect ? 'bg-ok-light text-ok border border-ok/30' : 'bg-bad-light text-bad border border-bad/30'
          }`}>
            {isCorrect ? (
              <>
                <CheckCircle2 size={16} />
                <span>Chính xác! Bạn đã chọn đúng đáp án: {question.correctAnswer}</span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span>Chưa đúng! Đáp án chính xác là: <strong>{question.correctAnswer}</strong></span>
              </>
            )}
          </div>

          {/* Vietnamese Translation & Meaning Box */}
          <div className="p-3.5 rounded-lg bg-surface-2/80 border border-border space-y-2.5">
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                Dịch nghĩa câu tiếng Việt:
              </span>
              <p className="text-sm font-medium text-text leading-relaxed">
                {question.fullSentenceVi}
              </p>
            </div>

            <div className="border-t border-border/50 pt-2 text-xs space-y-1">
              <div>
                <span className="font-semibold text-text">Từ vựng: </span>
                <strong className="text-primary">{question.explanation.headword}</strong>
                <span className="text-text-muted"> ({question.explanation.posLabel}): </span>
                <span className="font-medium text-text">{question.explanation.meaningVi}</span>
              </div>

              {question.explanation.pattern && (
                <div>
                  <span className="font-semibold text-text">Cấu trúc: </span>
                  <span className="font-mono text-primary font-medium">{question.explanation.pattern}</span>
                </div>
              )}

              {question.explanation.mnemonic && (
                <div className="flex items-start gap-1.5 text-text-muted text-[11px] pt-1">
                  <Sparkles size={14} className="text-accent-warn shrink-0 mt-0.5" />
                  <span>{question.explanation.mnemonic}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center text-sm font-bold shadow-md"
            onClick={handleNextClick}
          >
            <span>{questionIndex + 1 === totalQuestions ? 'Xem kết quả bài tập' : 'Câu tiếp theo'}</span>
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export interface SpeakOptions {
  accent?: 'us' | 'uk';
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let activeAudio: HTMLAudioElement | null = null;

function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
}

export function speak(
  target: string, // text or mp3 path
  options: SpeakOptions = {}
): void {
  if (typeof window === 'undefined') return;

  stopSpeaking();

  const { accent = 'us', rate = 1.0, onStart, onEnd, onError } = options;

  // Check if target is an audio file (e.g. .mp3)
  if (target.endsWith('.mp3') || target.startsWith('audio/')) {
    const audio = new Audio(target);
    activeAudio = audio;
    audio.playbackRate = rate;
    audio.onplay = () => onStart?.();
    audio.onended = () => {
      activeAudio = null;
      onEnd?.();
    };
    audio.onerror = (e) => {
      activeAudio = null;
      onError?.(e);
    };
    audio.play().catch((err) => {
      activeAudio = null;
      onError?.(err);
    });
    return;
  }

  // Fallback to SpeechSynthesis
  if (!('speechSynthesis' in window)) {
    onError?.(new Error('Trình duyệt không hỗ trợ tổng hợp giọng nói'));
    return;
  }

  const utterance = new SpeechSynthesisUtterance(target);
  utterance.rate = rate;
  utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';

  const voices = window.speechSynthesis.getVoices();
  const preferredLang = accent === 'uk' ? 'en-GB' : 'en-US';
  const matchedVoice = voices.find((v) => v.lang === preferredLang || v.lang.startsWith(preferredLang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => onError?.(e);

  window.speechSynthesis.speak(utterance);
}

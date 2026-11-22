export const STRINGS = {
  appName: 'TOEIC 700 Vocab',
  appSubtitle: 'Học từ vựng Reading & Luyện nghe thông minh',

  nav: {
    today: 'Hôm nay',
    study: 'Học',
    library: 'Thư viện',
    settings: 'Cài đặt'
  },

  today: {
    greetingMorning: 'Chào buổi sáng 👋',
    greetingAfternoon: 'Chào buổi chiều 👋',
    greetingEvening: 'Chào buổi tối 👋',
    streakCount: (count: number) => `${count} ngày liên tục`,
    streakFreezeReady: 'Có khiên đóng băng',
    streakFreezeUsed: 'Đã dùng khiên',
    dueForReview: 'Cần ôn hôm nay',
    newCards: 'Từ mới hôm nay',
    estimatedTime: (mins: number) => `~ ${mins} phút`,
    startStudy: 'BẮT ĐẦU ÔN LUYỆN',
    studyComplete: 'Bạn đã hoàn thành mục tiêu hôm nay! 🎉',
    studyMore: 'Học thêm 5 từ',
    allCaughtUp: 'Không còn thẻ nào đến hạn! Hãy duy trì phong độ nhé.'
  },

  study: {
    tapToFlip: 'Chạm hoặc bấm Space để lật mặt sau',
    flipCard: 'Lật thẻ',
    again: 'Lại',
    hard: 'Khó',
    good: 'Được',
    easy: 'Dễ',
    sessionFinished: 'Hoàn thành phiên học!',
    cardsReviewed: (n: number) => `Đã ôn ${n} từ`,
    backToHome: 'Về trang chủ',
    listenNormal: 'Nghe chuẩn (1.0×)',
    listenSlow: 'Nghe chậm (0.8×)'
  },

  card: {
    meaning: 'Nghĩa',
    specialSense: 'Nghĩa đặc biệt trong TOEIC',
    specialSenseAlert: 'Cẩn thận: Nghĩa thông thường hay là đáp án sai trong Part 7!',
    patterns: 'Cấu trúc & Giới từ đi kèm',
    collocations: 'Collocations thường gặp',
    wordFamily: 'Họ từ (Word Family)',
    examples: 'Ví dụ',
    tabToeic: 'TOEIC',
    tabDaily: 'Đời thường',
    mnemonic: 'Mẹo nhớ nhanh',
    confusable: 'Dễ nhầm lẫn với',
    synonyms: 'Từ đồng nghĩa / Paraphrase',
    weakBadge: 'Cần ôn thêm (Yếu)',
    unreviewedBadge: 'Chưa duyệt'
  },

  library: {
    searchPlaceholder: 'Tìm từ tiếng Anh hoặc nghĩa tiếng Việt (không dấu)...',
    allTypes: 'Tất cả dạng',
    filterByStatus: 'Trạng thái',
    statusAll: 'Tất cả',
    statusNew: 'Mới',
    statusLearning: 'Đang học',
    statusReview: 'Ôn tập',
    statusMastered: 'Đã thuộc',
    statusWeak: 'Từ yếu',
    foundResults: (n: number) => `Tìm thấy ${n} mục`,
    emptySearch: 'Không tìm thấy từ vựng nào khớp với từ khóa.'
  },

  settings: {
    title: 'Cài đặt học tập',
    voiceAccent: 'Giọng phát âm',
    voiceUS: 'Tiếng Anh - Mỹ (US)',
    voiceUK: 'Tiếng Anh - Anh (UK)',
    speechRate: 'Tốc độ đọc mặc định',
    autoPlay: 'Tự động phát âm thanh khi mở thẻ',
    dailyGoals: 'Mục tiêu học mỗi ngày',
    newCardsPerDay: 'Số từ mới mỗi ngày',
    maxReviewsPerDay: 'Giới hạn số thẻ ôn mỗi ngày',
    theme: 'Giao diện',
    themeLight: 'Sáng',
    themeDark: 'Tối',
    themeSystem: 'Theo hệ thống',
    backupSection: 'Sao lưu & Dữ liệu',
    backupDescription: 'Dữ liệu được lưu trong IndexedDB của trình duyệt. Hãy sao lưu định kỳ để tránh mất tiến độ.',
    exportBtn: 'Xuất file dữ liệu JSON',
    importBtn: 'Nhập file khôi phục',
    importSuccess: (n: number) => `Khôi phục thành công tiến độ của ${n} từ!`,
    importFailed: 'Nhập file thất bại. Vui lòng kiểm tra định dạng file.',
    resetDataBtn: 'Xóa toàn bộ tiến độ',
    resetConfirm: 'Bạn có chắc chắn muốn xóa toàn bộ tiến độ học không? Hành động này không thể hoàn tác!'
  }
} as const;

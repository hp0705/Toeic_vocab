# TOEIC 700 Vocab Web App

Web app tĩnh học từ vựng tiếng Anh TOEIC mục tiêu 700 (Reading 400), thiết kế mobile-first, học rảnh tay, hỗ trợ PWA offline 100%, lặp lại ngắt quãng (SRS) và phát âm chuẩn.

- **URL Trực Tuyến**: [https://hp0705.github.io/Toeic_vocab/](https://hp0705.github.io/Toeic_vocab/)
- **Repository**: [https://github.com/hp0705/Toeic_vocab](https://github.com/hp0705/Toeic_vocab)

---

## 1. Tính năng cốt lõi (Milestone 1 - MVP)

- **Thẻ từ thông minh**:
  - Giao diện 3D Flip trực quan trên mobile & desktop.
  - Hiển thị đầy đủ: Loại từ, phiên âm IPA, nghĩa tiếng Việt, nghĩa TOEIC đặc biệt, cấu trúc giới từ đi kèm, collocations, ví dụ thực tế và mẹo nhớ.
  - Phát âm tức thời qua Web Speech API (tùy chọn giọng US / UK, tốc độ 0.6× / 0.8× / 1.0×).
- **Thuật toán SRS (SM-2)**:
  - 4 nút đánh giá: **Lại** (10 phút), **Khó** (12 giờ), **Được** (1 ngày), **Dễ** (3 ngày).
  - Tự động đánh dấu từ yếu khi bị quên nhiều lần (lapses ≥ 4).
  - Giới hạn từ mới và số lượt ôn mỗi ngày để tránh quá tải.
- **Dữ liệu tĩnh & Ngoại tuyến (PWA)**:
  - 823 mục từ được trích xuất và chuẩn hóa từ `content/toeic_vocab.md`.
  - Cài đặt như ứng dụng native trên điện thoại và hoạt động 100% khi tắt mạng.
- **Bảo toàn dữ liệu người dùng**:
  - Lưu trữ trên **IndexedDB (Dexie)**, yêu cầu quyền lưu bền vững `storage.persist()`.
  - Tính năng **Xuất / Nhập JSON** một chạm với cơ chế gộp thông minh (Smart Merge).
- **Tìm kiếm tức thì**:
  - Tự động loại bỏ dấu tiếng Việt (ví dụ: gõ `hoan tien` tìm ra ngay `refund`).

---

## 2. Hướng dẫn chạy và phát triển

### Cài đặt môi trường
Yêu cầu Node.js ≥ 20.

```bash
# Cài đặt thư viện
npm install

# Parse và kiểm tra dữ liệu từ vựng
npm run parse-vocab
npm run validate-vocab

# Chạy môi trường dev
npm run dev

# Chạy kiểm thử tự động
npm run test

# Kiểm tra kiểu dữ liệu TypeScript
npm run type-check

# Kiểm tra code thừa / dead code
npm run knip

# Đóng gói bản chạy production
npm run build
```

---

## 3. Cập nhật nội dung từ vựng

1. Chỉnh sửa hoặc thêm mục trong file nguồn `content/toeic_vocab.md`.
2. Chạy lệnh:
   ```bash
   npm run parse-vocab
   npm run validate-vocab
   ```
3. Commit và đẩy lên GitHub (nhánh `main`). GitHub Actions sẽ tự động kiểm tra cú pháp, chạy test và deploy bản mới lên GitHub Pages mà không làm mất tiến độ của người học.

---

## 4. Cấu trúc thư mục

```
/
├─ content/
│  └─ toeic_vocab.md           # Nguồn tài liệu markdown chính
├─ data/
│  └─ vocab.json               # Dữ liệu từ vựng sau khi parse (823 mục)
├─ scripts/
│  ├─ parse-vocab.ts           # Script chuyển Markdown -> JSON
│  └─ validate.ts              # Script kiểm định schema Zod và kiểm tra trùng ID
├─ src/
│  ├─ types/vocab.ts           # Định nghĩa Zod Schema & TypeScript types
│  ├─ constants/
│  │  ├─ tokens.css            # Design tokens duy nhất (màu sắc, bo góc, spacing)
│  │  └─ strings.ts            # Tập trung toàn bộ chuỗi tiếng Việt giao diện
│  ├─ srs/
│  │  ├─ sm2.ts                # Thuật toán SRS hàm thuần
│  │  └─ sm2.test.ts           # Unit test cho thuật toán SM-2
│  ├─ audio/speak.ts           # Cổng âm thanh phát âm duy nhất
│  ├─ db/
│  │  ├─ index.ts              # Cấu hình Dexie IndexedDB
│  │  ├─ backup.ts             # Xuất / nhập backup JSON an toàn
│  │  └─ hooks.ts              # React hooks quản lý tiến độ, streak, hàng đợi học
│  ├─ utils/search.ts          # Chuẩn hóa tìm kiếm không dấu
│  ├─ components/
│  │  ├─ ui/                   # Button, Chip, SpeakButton, ProgressRing
│  │  ├─ card/                 # WordCard, MeaningBlock, PatternChips, ExampleList, WordFamilyTable
│  │  └─ layout/               # BottomNav
│  ├─ routes/
│  │  ├─ Today.tsx             # Màn hình hôm nay
│  │  ├─ StudySession.tsx      # Phiên học flashcard SRS
│  │  ├─ Library.tsx           # Thư viện tra cứu từ vựng
│  │  └─ Settings.tsx          # Cài đặt âm thanh, giao diện & sao lưu
│  ├─ App.tsx
│  └─ main.tsx
├─ .github/workflows/deploy.yml # Pipeline CI/CD tự động lên GitHub Pages
└─ vite.config.ts              # Cấu hình Vite PWA, base path /Toeic_vocab/
```

---

## 5. Danh sách Dependencies & Lý do lựa chọn

| Gói | Phân loại | Lý do sử dụng |
|---|---|---|
| `react`, `react-dom` | Dependency | Nền tảng xây dựng giao diện component hướng declarative |
| `dexie` | Dependency | Thư viện bọc IndexedDB nhẹ, hỗ trợ truy vấn có index, reactive queries và transaction an toàn cho PWA |
| `zod` | Dependency | Một nguồn sự thật (Single Source of Truth) định nghĩa schema dữ liệu và kiểm định file backup khi người dùng nhập vào |
| `lucide-react` | Dependency | Bộ icon SVG nhẹ, hỗ trợ tree-shaking triệt để (chỉ bundle các icon thực sự có dùng) |
| `vite` | DevDependency | Công cụ build cực nhanh, hỗ trợ HMR và tối ưu hóa production bundle |
| `vite-plugin-pwa` | DevDependency | Tự động sinh Service Worker (Workbox) và Manifest để cài đặt PWA và chạy 100% offline |
| `typescript` | DevDependency | Kiểm soát kiểu chặt chẽ (strict mode, không `any`), giảm thiểu lỗi runtime |
| `tailwindcss` | DevDependency | Tiện ích CSS ánh xạ trực tiếp từ file Design Tokens, tối ưu dung lượng CSS |
| `vitest` | DevDependency | Chạy unit test siêu nhanh cho thuật toán SRS, tìm kiếm và parser |
| `knip` | DevDependency | Công cụ tự động quét và loại bỏ toàn bộ code chết, export thừa, file không dùng |
| `tsx` | DevDependency | Thực thi trực tiếp các script TypeScript trong thư mục `scripts/` |

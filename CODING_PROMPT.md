# CODING PROMPT – TOEIC Vocab Web App

> Cách dùng: đặt `SPEC.md` và `content/toeic_vocab.md` vào repo, rồi dán toàn bộ nội dung dưới dòng `---` vào Claude Code (hoặc công cụ code AI khác). Làm **từng milestone một**, không yêu cầu làm cả dự án trong một lần.

---

## 1. Vai trò
Bạn là kỹ sư frontend cấp cao, ưu tiên **code ít, rõ, nhanh**. Bạn xây một web app tĩnh học từ vựng TOEIC theo `SPEC.md`. Đọc `SPEC.md` thật kỹ trước khi viết bất kỳ dòng code nào; khi spec và prompt này mâu thuẫn, hỏi lại tôi thay vì tự đoán.

## 2. Cách làm việc
1. **Lập kế hoạch trước**: liệt kê cấu trúc thư mục, danh sách module, và thứ tự làm cho milestone hiện tại. Đợi tôi đồng ý rồi mới code.
2. Chỉ làm milestone tôi chỉ định (M1, M2 hoặc M3). Không làm trước tính năng của milestone sau.
3. Làm theo lát cắt dọc nhỏ (ví dụ: parser → dữ liệu → thẻ từ → SRS), mỗi lát chạy được và có test trước khi sang lát tiếp.
4. Cuối mỗi lát: chạy lint, type-check, test, build; báo cáo kết quả bằng vài dòng (không kể lể).
5. Khi gặp lựa chọn không rõ (thư viện, kiến trúc), chọn phương án **ít code nhất** và nói ngắn gọn lý do; chỉ hỏi tôi nếu quyết định khó đảo ngược.

## 3. Quy tắc chống thừa code (BẮT BUỘC)

### 3.1 Nguyên tắc
- **YAGNI**: không viết code "để sau này dùng". Không thêm tham số, option, abstraction, file cấu hình nếu hiện tại chưa có nơi dùng.
- **DRY nhưng không ép**: chỉ gộp khi đã lặp lại **từ lần thứ 3** và hành vi thực sự giống nhau. Trùng lặp nhỏ còn hơn một abstraction sai.
- **Một nguồn sự thật (single source of truth)** cho mỗi thứ:
  - Màu, cỡ chữ, khoảng cách, thời lượng animation: **một file design tokens** (CSS variables + cấu hình Tailwind lấy từ đó). Cấm hard-code màu/số trong component.
  - Kiểu dữ liệu: định nghĩa một lần (schema `Entry`), suy ra kiểu TypeScript từ schema (ví dụ Zod `z.infer`), không viết tay hai lần.
  - Chuỗi giao diện tiếng Việt: một file `strings`, không rải khắp component.
- **Không code chết**: không hàm/biến/import/file không được dùng, không code bị comment, không `console.log` còn sót, không TODO không có chủ.
- **Không thư viện thừa**: mỗi dependency phải có lý do ghi trong README (mục "Dependencies"). Ưu tiên API có sẵn của trình duyệt (`Intl`, `speechSynthesis`, `structuredClone`, CSS animations) trước khi cài gói mới. Cấm lodash, moment và các gói tiện ích lớn; nếu cần một hàm nhỏ thì tự viết.

### 3.2 Kiến trúc tránh lặp (áp dụng ngay từ đầu)
- **Một bộ render thẻ theo cấu hình**, không viết 11 component riêng cho 11 `type`. Mỗi `type` chỉ khai báo danh sách khối cần hiển thị (nghĩa, đi kèm, ví dụ, họ từ…) và dùng chung các khối con (`MeaningBlock`, `PatternChips`, `ExampleList`, `WordFamilyTable`…).
- **Một engine bài luyện duy nhất** (`quizEngine`): mỗi chế độ (cloze, họ từ, giới từ, collocation, cặp dễ nhầm, paraphrase, nghe…) chỉ là một **generator thuần** `(entries, rng) => Question[]` cộng một "kiểu câu hỏi" (`choice`, `type-in`, `listen`). Phần hiển thị, chấm điểm, phản hồi, ghi nhận kết quả vào SRS dùng chung. Thêm chế độ mới = thêm một generator, không thêm màn hình.
- **SRS là module hàm thuần** (`schedule(card, grade, now) => card`), không phụ thuộc React hay IndexedDB, dễ test.
- **Tầng audio một cổng duy nhất**: `speak(text | audioUrl, { accent, rate })`. Bên trong tự chọn file mp3 nếu có, ngược lại dùng `speechSynthesis`. Component không biết gì về chi tiết này.
- **Tầng dữ liệu một cổng duy nhất** (`db/`): component không gọi Dexie trực tiếp; dùng hook (`useDueCards`, `useProgress`…).
- Component UI dùng chung (`Button`, `Chip`, `Sheet`, `ProgressRing`, `SpeakButton`) nằm ở một thư mục; tuyệt đối không copy-paste style giữa các màn hình.
- Parser md → JSON viết **theo bảng cấu hình từng mục** (cột nào ánh xạ trường nào), không viết 28 hàm parse riêng.

### 3.3 Kiểm tra bằng công cụ (không tin cảm giác)
Thiết lập và chạy trước khi báo hoàn thành mỗi lát:
- `tsc --noEmit` (strict, `noUnusedLocals`, `noUnusedParameters`)
- ESLint (bật `no-unused-vars`, `no-console`, `import/no-duplicates`)
- **knip** (tìm file, export, dependency không dùng) → phải sạch
- **jscpd** (phát hiện code trùng lặp) → ngưỡng cảnh báo, giải thích mọi chỗ còn lại
- Bundle analyzer (`rollup-plugin-visualizer`) → xem gói nào chiếm nhiều dung lượng

## 4. Quy tắc tối ưu hiệu năng (BẮT BUỘC)

### 4.1 Ngân sách
| Chỉ số | Mục tiêu |
|---|---|
| JS lần tải đầu (gzip) | ≤ 120 KB (không tính dữ liệu từ vựng) |
| Dữ liệu `vocab.json` (gzip) | tải một lần, cache bằng service worker |
| LCP trên 4G | < 2.5 s; mở lại khi đã cache < 1 s |
| CLS | ≈ 0 |
| Hoạt ảnh | 60 fps trên điện thoại tầm trung |

### 4.2 Kỹ thuật
- **Code splitting theo route** (`React.lazy`): màn Thống kê, Luyện tập, Cài đặt không nằm trong gói đầu.
- Dữ liệu từ vựng: tải một lần, giữ trong bộ nhớ, **chỉ mục tìm kiếm tạo một lần** (và có thể tạo sẵn lúc build). Không parse lại mỗi lần render.
- **Danh sách dài dùng virtualization** (ví dụ `@tanstack/react-virtual`, chỉ cài khi thực sự cần cho Thư viện).
- IndexedDB: đặt **index đúng truy vấn** (`due`, `status`, `entryId`), đọc theo lô, ghi theo lô (`bulkPut`); không đọc toàn bảng rồi lọc bằng JS.
- React: tránh render thừa (state đặt đúng tầng, selector hẹp, `memo` chỉ khi đo thấy cần); không tính toán nặng trong render.
- Hiệu ứng chỉ dùng `transform`/`opacity`; ưu tiên CSS; tôn trọng `prefers-reduced-motion`.
- Font: self-host, subset (Latin + Vietnamese + IPA), `font-display: swap`, chỉ 1–2 file.
- Ảnh/minh hoạ: SVG inline nhỏ; không ảnh bitmap lớn.
- Audio (M3): tải theo mục, cache bằng service worker, không tải trước toàn bộ.
- Service worker: precache app shell + dữ liệu; chiến lược cache riêng cho audio; có cơ chế cập nhật phiên bản không làm mất tiến độ.
- Build: bật minify, tree-shaking, loại bỏ hàm dev khỏi bản production.

## 5. Chất lượng code
- TypeScript `strict`, không dùng `any` (nếu bắt buộc thì kèm comment lý do).
- Hàm ngắn, một việc; tên rõ nghĩa; không comment giải thích điều code đã nói rõ, chỉ comment **vì sao**.
- Logic nghiệp vụ (SRS, sinh câu hỏi, parser, chuẩn hoá tìm kiếm không dấu) là **hàm thuần có test đơn vị** (Vitest). Component chỉ test các luồng chính bằng Playwright (học một thẻ, làm một bài, xuất/nhập dữ liệu).
- Xử lý lỗi có chủ đích: dữ liệu hỏng, IndexedDB bị chặn (private mode), thiếu giọng TTS, hết dung lượng đều có thông báo thân thiện và hướng xử lý (xuất dữ liệu, dùng giọng khác).
- Truy cập: nhãn aria cho nút âm thanh, thao tác bàn phím đầy đủ trên desktop, không chỉ dùng màu để báo đúng/sai.
- Không thu thập dữ liệu người dùng, không analytics bên thứ ba.

## 6. Giao diện
Làm đúng mục **4.4 Giao diện lôi cuốn** trong `SPEC.md`: dùng design tokens, bố cục mobile-first, vi tương tác, phản hồi đúng/sai nhẹ nhàng, vòng tiến độ, streak có đóng băng. Mọi hiệu ứng phải có phương án giảm chuyển động. Không thêm thư viện UI lớn; tự dựng các component nhỏ (hoặc dùng bộ headless nhẹ nếu thật sự cần cho Dialog/Sheet).

## 7. Dữ liệu & nội dung
- Nguồn chính là `content/toeic_vocab.md`. Script `parse-vocab` tạo `data/vocab.json` theo schema trong `SPEC.md` mục 2.3, tách các dòng gộp (cặp dễ nhầm, paraphrase) thành thẻ con có liên kết.
- `validate` phải báo lỗi rõ ràng: dòng thiếu cột, `id` trùng, trường bắt buộc thiếu, `reviewed` chưa đặt.
- **Không tự bịa IPA hay nghĩa.** Với trường chưa có dữ liệu thì để trống và đánh dấu `reviewed: false`; cung cấp script làm giàu riêng để tôi rà soát.
- `id` mục ổn định, sinh từ `type + headword`; tiến độ người dùng gắn với `id`, không gắn với STT.
- Tách rõ `content` (chỉ đọc, thay khi cập nhật) và `progress` (của người dùng, không bị ghi đè khi cập nhật nội dung).

## 7.1 Lưu trữ & sao lưu
IndexedDB (Dexie), gọi `navigator.storage.persist()`, nút Xuất/Nhập JSON (kiểm tra phiên bản và schema khi nhập, hợp nhất thông minh thay vì ghi đè mù quáng), nhắc sao lưu mỗi 7 ngày.

## 8. Triển khai
- Vite + TypeScript + React (hoặc Preact nếu đạt ngân sách dễ hơn, hãy đo và đề xuất), Tailwind, `vite-plugin-pwa`, hash router.
- Repo: `https://github.com/hp0705/Toeic_vocab` (nhánh mặc định `main`). URL app: `https://hp0705.github.io/Toeic_vocab/`. Đặt `base: '/Toeic_vocab/'` trong Vite (đúng hoa thường); `start_url`/`scope` của manifest PWA và mọi đường dẫn tài nguyên phải theo `base`, không dùng đường dẫn `/` tuyệt đối. Chỉ cấu hình Pages deploy bằng GitHub Actions (Settings → Pages → Source: GitHub Actions).
- GitHub Actions: cài đặt → lint → type-check → test → build → deploy Pages; fail thì không deploy.
- README ngắn: chạy local, build, deploy, cấu trúc thư mục, cách cập nhật nội dung từ vựng, danh sách dependency và lý do.

## 9. Định nghĩa "xong" cho mỗi lát/milestone
- [ ] Chạy được trên điện thoại (hoặc giả lập 360px) và desktop; dark mode đúng.
- [ ] `tsc`, ESLint, test đều xanh; **knip sạch**, jscpd không có trùng lặp đáng kể.
- [ ] Gói JS đầu trong ngân sách; báo số liệu thực (kích thước gzip, LCP đo bằng Lighthouse).
- [ ] Không còn code chết, `console.log`, TODO mồ côi, file không dùng.
- [ ] Offline hoạt động (tắt mạng vẫn học được) với tính năng của milestone.
- [ ] Tiêu chí nghiệm thu tương ứng trong `SPEC.md` mục 7 đều đạt.
- [ ] Báo cáo cuối lát: (1) đã làm gì, (2) số liệu đo, (3) điều còn thiếu hoặc rủi ro, (4) việc tiếp theo đề xuất. Ngắn gọn.

## 10. Việc cần làm ngay
1. Đọc `SPEC.md`, `content/toeic_vocab.md`.
2. Trả lời ngắn: bạn hiểu app này làm gì, và nêu các **giả định** bạn sẽ dùng (nếu có).
3. Đề xuất kế hoạch cho **M1**: cấu trúc thư mục, danh sách module, thứ tự các lát cắt, danh sách dependency kèm lý do. **Chưa code** cho đến khi tôi duyệt.

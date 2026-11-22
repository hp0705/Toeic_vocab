# SPEC – TOEIC Vocab Web App (tạm đặt tên: "TOEIC 700")

Phiên bản: 0.1 (draft) · Ngày: 2026-11-22

## 1. Tổng quan

### 1.1 Mục tiêu
Web app giúp học viên đang ở mức ~500 TOEIC đạt 700 (Reading 400). Trọng tâm là **từ vựng cho Reading (Part 5/6/7)**, đồng thời **luyện tai** thông qua phát âm của từng từ/câu, vì người dùng yếu cả từ vựng lẫn Listening.

### 1.2 Người dùng
Một người dùng chính (chủ dự án), học cá nhân, chủ yếu trên điện thoại, đôi khi trên laptop. Không cần tài khoản.

### 1.3 Nguyên tắc thiết kế
1. **Học ở bất cứ đâu**: mobile-first, dùng một tay, cài được như app (PWA), **hoạt động offline**.
2. **Học theo cụm, không học từ lẻ**: mỗi thẻ luôn hiện giới từ/cấu trúc đi kèm và collocation.
3. **Học theo dạng câu hỏi thật của TOEIC**: điền từ Part 5, họ từ, cặp từ dễ nhầm, paraphrase Part 7.
4. **Nghe là công dân hạng nhất**: mọi từ và câu ví dụ đều phát âm được, có chế độ luyện nghe riêng.
5. **Lặp lại ngắt quãng (SRS)** để nhớ lâu, tập trung vào từ yếu.
6. **Không backend, không tài khoản**: toàn bộ chạy phía trình duyệt, deploy tĩnh lên GitHub Pages.

### 1.4 Ngoài phạm vi (v1)
Đề thi thử đầy đủ, luyện Listening Part 1–4 bằng audio đề thật, chấm phát âm bằng AI, tài khoản/đồng bộ đám mây, bảng xếp hạng.

---

## 2. Nội dung (Content)

### 2.1 Nguồn dữ liệu
- `toeic_vocab.md`: 28 mục, **692 mục từ**, cộng **94 dòng Word Family** (74 nhóm 1–3 + 20 nhóm danh từ người/hành động).
- Build script chuyển file markdown này thành `data/vocab.json` (xem 2.3). File markdown vẫn là nguồn chính để chỉnh sửa.

### 2.2 Các loại mục (entry type)
Mỗi loại có mẫu thẻ riêng, vì dữ liệu hiện có không đồng nhất:

| type | Từ mục trong file | Ví dụ |
|---|---|---|
| `word` | 1–10, 12–14, 18–19(một phần), 24–26 | shipment, eligible |
| `collocation` | 11 (take/make/send...) | make a reservation |
| `phrasal` | 16, 27 | carry out, touch base |
| `phrase` | 15, 17, 22 | in accordance with, provided that |
| `prep_pattern` | 23.2 | be responsible for |
| `prep_contrast` | 23.1 | by vs until |
| `confusable` | 19 | affect / effect |
| `paraphrase` | 20 | postpone = delay = put off |
| `polysemy` | 21 | address (v) = giải quyết |
| `quantifier` | 28 | a number of / the number of |
| `wordfamily` | phần Word Family | apply → applicant → application |

Lưu ý khi chuyển đổi: một số dòng gộp nhiều mục (`postpone = delay = put off`, `affect / effect`, `fare / fair`) cần **tách thành các thẻ con có liên kết** để vẫn hỏi riêng được từng từ nhưng hiển thị cùng nhau.

### 2.3 Schema một mục (JSON)

```json
{
  "id": "w0123",
  "srcNo": 123,                      // STT trong file gốc, để đối chiếu
  "type": "word",
  "headword": "eligible",
  "pos": ["adj"],                    // loại từ
  "ipa": { "us": "/ˈelɪdʒəbl/", "uk": "/ˈelɪdʒəbl/" },
  "meaningVi": "đủ điều kiện",
  "meaningEn": "having the right to do or receive something",
  "specialSenses": [                 // nghĩa đặc biệt / trong ngữ cảnh TOEIC
    { "pos": "adj", "meaningVi": "...", "note": "hay hỏi ở 'từ trong ngữ cảnh' Part 7" }
  ],
  "patterns": [                      // giới từ/cấu trúc đi kèm
    "be eligible for + N",
    "be eligible to + V"
  ],
  "collocations": ["eligible for a bonus", "eligible employees"],
  "examples": [
    { "kind": "toeic", "en": "Full-time staff are eligible for a bonus.", "vi": "..." },
    { "kind": "daily", "en": "Are you eligible for a student discount?", "vi": "..." }
  ],
  "mnemonic": "mẹo nhớ từ file gốc",
  "wordFamily": { "n": ["eligibility"], "v": [], "adj": ["eligible"], "adv": [] },
  "confusableWith": ["illegible"],
  "synonyms": ["qualified"],
  "antonyms": ["ineligible"],
  "topic": "Business & Finance",
  "partFocus": ["P5", "P7"],         // hay xuất hiện ở Part nào
  "level": "core",                   // core | extra
  "audio": { "word": "audio/w0123.mp3", "examples": ["audio/w0123_e1.mp3"] }  // tùy chọn, xem 4.2
}
```

### 2.4 Làm giàu dữ liệu (data enrichment)
File hiện tại có: từ, nghĩa, mẹo nhớ, 1 câu ví dụ (đều là văn cảnh công sở). Người dùng muốn thêm: **IPA, câu ví dụ đời thường, nghĩa đặc biệt, giới từ đi kèm, phát âm**. Quy trình:

1. Script `scripts/enrich` tạo bản nháp cho các trường còn thiếu (IPA, `meaningEn`, ví dụ `daily`, `patterns`, `specialSenses`).
2. **Rà soát thủ công/đối chiếu từ điển** trước khi đưa vào `vocab.json`. IPA nên lấy từ nguồn từ điển (ví dụ Free Dictionary API hoặc CMUdict) rồi chuyển sang IPA, **không** để mô hình tự sinh IPA rồi dùng thẳng.
3. Mỗi mục có cờ `reviewed: true/false`. UI hiện huy hiệu nhỏ "chưa rà soát" để tránh học nhầm.
4. Ví dụ `daily` ưu tiên câu ngắn, tự nhiên, có chủ ngữ rõ, ≤ 15 từ. Ví dụ `toeic` giữ phong cách email/thông báo/hóa đơn.

Thứ tự làm giàu theo giá trị: mục 23 (giới từ), 22, 15 → mục 12–14, 24, 25 → còn lại.

---

## 3. Tính năng

### 3.1 Thẻ từ (Word Card) – màn hình cốt lõi
Mặt trước: từ + loại từ + IPA + nút 🔊 (US/UK).
Mặt sau / chi tiết gồm các khối, theo thứ tự:
1. **Nghĩa** (VI, kèm giải nghĩa EN ngắn, có thể ẩn).
2. **Nghĩa đặc biệt trong TOEIC** (nếu có), nổi bật bằng màu, kèm cảnh báo "nghĩa quen thuộc thường là đáp án sai".
3. **Đi kèm** (giới từ/cấu trúc): hiển thị dạng chip, ví dụ `for + N`, `to + V-ing`; từ khóa giới từ tô đậm trong ví dụ.
4. **Collocations**.
5. **Họ từ** (N / V / Adj / Adv), bấm để nghe từng dạng, có gợi ý "vị trí trong câu".
6. **Ví dụ**: tab "TOEIC" và "Đời thường"; mỗi câu có 🔊 phát cả câu, nút chậm 🐢, bật/tắt bản dịch VI; từ khóa highlight.
7. **Dễ nhầm với / đồng nghĩa / trái nghĩa**.
8. **Mẹo nhớ**.
9. Nút "Thêm vào danh sách Yếu", "Ghi chú cá nhân".

### 3.2 Phát âm & luyện nghe
- **v1**: Web Speech API (`speechSynthesis`), chọn giọng en-US / en-GB (TOEIC có thêm giọng Úc/Canada; liệt kê giọng có sẵn trên thiết bị cho người dùng chọn). Chỉnh tốc độ 0.6× / 0.8× / 1×.
- **Hạn chế cần biết**: chất lượng và số giọng phụ thuộc thiết bị (iOS/Android/Windows khác nhau), một số máy offline không có giọng. Do đó:
- **v2 (khuyến nghị)**: tạo sẵn file audio bằng TTS chất lượng cao lúc build, lưu trong repo (mp3 nhỏ, ~700 từ + ~1500 câu), cache bằng service worker để chạy offline và **giọng nhất quán** mọi thiết bị. Nếu có file audio thì dùng, nếu không thì fallback `speechSynthesis`.
- Chế độ **Nghe** (xem 3.4): nghe từ → chọn nghĩa/chọn từ; nghe câu → điền từ thiếu; nghe chép chính tả (dictation); lặp lại theo (shadowing, không chấm điểm ở v1).
- Tập nghe các cặp dễ nhầm theo âm (lose/loose, later/latter, advice/advise).

### 3.3 Ôn tập ngắt quãng (SRS)
- Thuật toán: SM-2 đơn giản hoá (hoặc FSRS nhẹ ở v2). Đánh giá 4 mức: **Lại / Khó / Được / Dễ**.
- Mỗi mục có `ease`, `interval`, `due`, `lapses`, `reps`, `status` (new / learning / review / mastered).
- Cấu hình: số từ mới/ngày (mặc định 15), giới hạn ôn/ngày (mặc định 100).
- "Lại" nhiều lần (leech, ≥ 4 lapses) → tự thêm vào danh sách **Yếu** và đề xuất mẹo nhớ/ví dụ khác.
- Hàng đợi hôm nay: ôn đến hạn trước, rồi từ mới; xen kẽ loại thẻ để không nhàm.

### 3.4 Các chế độ luyện tập (theo dạng đề thật)

| Chế độ | Mô tả | Liên quan Part |
|---|---|---|
| Flashcard | Lật thẻ, tự đánh giá (đi kèm SRS) | – |
| Trắc nghiệm nghĩa | Từ → 4 nghĩa, và ngược lại | P5/P7 |
| **Điền từ (cloze)** | Câu có chỗ trống, chọn 4 đáp án (động từ/giới từ/liên từ/lượng từ) | P5, P6 |
| **Họ từ** | "The ___ must submit a résumé." chọn applicant/application/apply/applied | P5 |
| **Collocation** | Ghép động từ với danh từ (make a reservation, place an order) | P5 |
| **Giới từ đi kèm** | be responsible ___ → for | P5 |
| **Cặp dễ nhầm** | Chọn đúng từ trong cặp, kèm giải thích | P5/P6 |
| **Paraphrase** | Cho câu gốc, chọn câu diễn đạt lại; hoặc nối từ đồng nghĩa | P7 |
| **Từ trong ngữ cảnh** | "Từ X trong đoạn gần nghĩa nhất với…" | P7 |
| **Nghe** | nghe-chọn nghĩa, nghe-điền từ, nghe-chép | Listening |
| Gõ từ (spelling) | Hiện nghĩa, gõ từ | – |

Mỗi câu trả lời sai hiện: đáp án đúng, **tại sao** (quy tắc từ loại/giới từ), và nút xem thẻ từ. Câu sai được đưa vào SRS ngắn hạn.

### 3.5 Duyệt & tìm kiếm
- Duyệt theo 28 mục / chủ đề / loại / Part; lọc theo trạng thái (mới, đang học, yếu, đã thuộc).
- Tìm kiếm tức thời (không dấu cũng tìm được, ví dụ "hoan tien" → refund), tìm cả tiếng Anh lẫn tiếng Việt.
- Đánh dấu yêu thích, tạo danh sách riêng.

### 3.6 Lộ trình & mục tiêu
- Dựng sẵn **lộ trình 6 tuần** từ cuối file `toeic_vocab.md` (Tuần 1: giới từ/liên từ/từ nối + Word Family nhóm 1 …). Mỗi ngày hiện "Hôm nay học gì".
- Mục tiêu hằng ngày (số thẻ/phút), **streak**, nhắc ôn (nhắc trong app; thông báo đẩy là tùy chọn ở v2 vì iOS hạn chế).
- Cho phép bỏ qua lộ trình và học tự do.

### 3.7 Thống kê
- Số từ theo trạng thái, độ chính xác theo loại bài (cloze, họ từ, giới từ…), **bản đồ nhiệt điểm yếu theo mục** (mục nào hay sai nhất), dự báo số thẻ cần ôn 7 ngày tới, lịch học.
- Gợi ý "nên ôn mục nào hôm nay" dựa trên điểm yếu.

### 3.8 Dữ liệu người dùng, sao lưu & đồng bộ
- Lưu trong **IndexedDB** (không dùng localStorage cho dữ liệu chính).
- **Rủi ro cần xử lý**: Safari/iOS có thể xoá dữ liệu web của trang không dùng lâu nếu chưa "Thêm vào Màn hình chính"; trình duyệt cũng có thể xoá khi thiếu dung lượng. Vì vậy:
  - Yêu cầu `navigator.storage.persist()`.
  - **Xuất/Nhập file JSON** (một nút) để sao lưu và chuyển thiết bị.
  - Nhắc sao lưu mỗi 7 ngày và hướng dẫn cài PWA trên iOS.
- Đồng bộ nhiều thiết bị (v2, tùy chọn): mã chuyển nhanh/QR, hoặc đồng bộ qua GitHub Gist riêng tư bằng token cá nhân. Không làm backend riêng.

### 3.9 Cài đặt
Giọng/accent mặc định, tốc độ đọc, tự phát âm khi mở thẻ, hiện/ẩn bản dịch VI, giới hạn từ mới/ôn mỗi ngày, giao diện sáng/tối/tự động, cỡ chữ, xuất/nhập dữ liệu, xoá dữ liệu.

---

## 4. Thiết kế UX/UI

### 4.1 Điều hướng (thanh dưới trên mobile, thanh bên trên desktop)
`Hôm nay` · `Học` · `Luyện tập` · `Thư viện` · `Thống kê` (Cài đặt trong menu).

### 4.2 Màn hình chính
- **Hôm nay**: số thẻ đến hạn, từ mới hôm nay, streak, nút lớn "Bắt đầu", gợi ý bài luyện từ điểm yếu, tiến độ tuần theo lộ trình.
- **Phiên học**: một thẻ mỗi màn hình, thao tác bằng vuốt/nút lớn; phím tắt desktop (Space = lật, 1–4 = đánh giá, P = phát âm, S = chậm).
- **Chi tiết từ**: như 3.1, cuộn dọc, các khối gập được.

### 4.3 Yêu cầu giao diện
- Mobile-first (rộng từ 360px), vùng chạm ≥ 44px, thao tác chính trong tầm ngón cái.
- Chế độ tối; chữ rõ, IPA dùng font hỗ trợ ký tự IPA (ví dụ Noto Sans / Charis SIL).
- Màu có ngữ nghĩa nhất quán: loại từ (N/V/Adj/Adv), nghĩa đặc biệt, giới từ đi kèm.
- Hỗ trợ truy cập: tương phản đạt WCAG AA, nhãn aria cho nút âm thanh, không chỉ dùng màu để phân biệt đúng/sai.
- Giao diện tiếng Việt; nội dung học song ngữ Anh–Việt.

### 4.4 Giao diện lôi cuốn (Visual & Engagement Design)

Mục tiêu: học xong một phiên 10 phút thấy **dễ chịu, có tiến bộ nhìn thấy được, muốn quay lại ngày mai**, mà không gây rối mắt hay tốn pin. Mọi hiệu ứng phải phục vụ việc học.

#### 4.4.1 Cá tính thị giác
- Phong cách: **sạch, ấm, tập trung** (kiểu sách học hiện đại), không màu mè game trẻ con. Nhiều khoảng trắng, góc bo lớn (16–24px), đổ bóng mềm.
- Một màu nhấn chính cho hành động (nút, tiến độ), các màu phụ chỉ có nghĩa ngữ pháp.
- Từ đang học luôn là **nhân vật chính** của màn hình: cỡ chữ lớn (32–40px), các thông tin phụ nhỏ hơn và nhạt hơn.

#### 4.4.2 Design tokens (đặt trong MỘT file, mọi component chỉ dùng token)

| Nhóm | Token | Sáng | Tối |
|---|---|---|---|
| Nền | `--bg` / `--surface` / `--surface-2` | #FAF8F5 / #FFFFFF / #F2EEE8 | #121417 / #1B1F24 / #242A31 |
| Chữ | `--text` / `--text-muted` | #1C2430 / #667085 | #EDEFF2 / #98A2B3 |
| Nhấn chính | `--primary` | #4F46E5 (chàm) | #8B8CFF |
| Thành công | `--ok` | #12A150 | #3DD68C |
| Sai / yếu | `--bad` | #E5484D | #FF7B80 |
| Cảnh báo / nghĩa đặc biệt | `--accent-warn` | #F59E0B | #FBBF24 |

Màu loại từ (dùng nhất quán mọi nơi): **N** xanh dương, **V** xanh lá, **Adj** cam, **Adv** tím. Giới từ đi kèm: chip viền `--primary`, nền nhạt.
Tương phản chữ/nền đạt WCAG AA ở cả hai chế độ.

#### 4.4.3 Chữ & khoảng cách
- Chữ giao diện: Inter (hoặc system-ui để nhẹ); từ vựng và ví dụ: font có serif nhẹ hoặc Inter đậm để dễ đọc; IPA: Noto Sans / Charis SIL.
- Thang cỡ chữ: 12 / 14 / 16 / 20 / 28 / 40. Thang khoảng cách: 4 / 8 / 12 / 16 / 24 / 32.
- Self-host font, chỉ tải subset cần dùng (Latin + Vietnamese + IPA) để giữ nhẹ.

#### 4.4.4 Màn hình chính "Hôm nay" (bố cục mobile)

```
┌──────────────────────────┐
│ Chào buổi tối 👋   🔥 12 │  ← lời chào + streak
│ ┌──────────────────────┐ │
│ │  Hôm nay cần ôn: 34  │ │  ← thẻ hành động chính
│ │  Từ mới: 15          │ │
│ │  ~ 9 phút            │ │
│ │  [  BẮT ĐẦU  ▶  ]    │ │
│ └──────────────────────┘ │
│ Vòng tiến độ ngày  ◔ 40% │
│ Tuần 1 · Giới từ & liên từ│ ← lộ trình
│ ▓▓▓▓░░░░░░  Ngày 3/7     │
│ Điểm yếu: "by / until" → │ ← gợi ý luyện 1 chạm
└──────────────────────────┘
 Hôm nay  Học  Luyện  Thư viện  Thống kê
```

#### 4.4.5 Thẻ học – trải nghiệm cốt lõi
- Thẻ lớn giữa màn hình; **lật bằng chạm hoặc vuốt**, hiệu ứng lật 3D ngắn (≈250ms).
- Nút 🔊 lớn, nổi bật cạnh từ; phát tự động khi thẻ hiện (có thể tắt). Đang phát thì có sóng âm nhỏ chạy.
- Câu ví dụ: **từ khóa tô sáng**, giới từ đi kèm gạch chân; chạm vào câu để nghe, chạm giữ để nghe chậm.
- 4 nút đánh giá (Lại / Khó / Được / Dễ) cố định phía dưới tầm ngón cái, **hiện kèm thời gian ôn lại** ("10 phút / 1 ngày / 3 ngày / 7 ngày") để người học hiểu SRS đang làm gì.
- Thanh tiến độ phiên mỏng trên cùng, chạy mượt; không đếm số đếm ngược gây áp lực.

#### 4.4.6 Phản hồi & vi tương tác
- **Đúng**: nút/ô đáp án chuyển xanh, nảy nhẹ (scale 1.03), âm "ting" ngắn (tuỳ chọn), rung nhẹ 10ms (nếu thiết bị hỗ trợ).
- **Sai**: lắc ngang rất nhẹ, hiện đáp án đúng + **lý do bằng một câu** ("sau *be responsible* cần giới từ *for*"), không dùng màu đỏ gắt hay chữ chê bai.
- Chuyển thẻ: trượt ngang; vào màn hình: mờ dần + trượt lên nhẹ (≤ 200ms).
- Skeleton khi tải thay cho vòng quay; trạng thái rỗng có minh hoạ nhỏ và lời mời hành động ("Chưa có từ yếu, tuyệt!").
- Tất cả hiệu ứng chỉ dùng `transform` và `opacity` (mượt, ít tốn pin); tôn trọng `prefers-reduced-motion` (tắt lật 3D, rung, hiệu ứng ăn mừng).

#### 4.4.7 Động lực (nhẹ nhàng, không gây nghiện)
- **Streak** có "đóng băng" 1 ngày/tuần để không nản khi lỡ ngày.
- **Vòng tiến độ ngày** (như vòng hoạt động), đóng vòng thì có hiệu ứng ăn mừng ngắn (confetti nhẹ ≤ 1.5s, chỉ hiện một lần/ngày).
- **Cột mốc từ vựng**: 50 / 100 / 250 / 500 / 692 từ "đã thuộc", mỗi mốc một huy hiệu đơn giản.
- **Tiến độ theo mục**: mỗi chủ đề/mục có thanh phần trăm "đã thuộc", tô màu dần, nhìn là biết mục nào còn yếu.
- **Bản đồ 6 tuần**: tuần đã xong sáng lên, tuần hiện tại nổi bật.
- Tổng kết cuối phiên: số từ mới, độ chính xác, **một việc làm tốt + một điểm cần luyện**, nút "Học thêm 5 thẻ" hoặc "Xong hôm nay".
- Không có bảng xếp hạng, không thông báo gây áp lực, không đẩy người học học quá mức giới hạn đặt ra.

#### 4.4.8 Giao diện chế độ Nghe
- Màn hình tối giản: nút phát khổng lồ ở giữa, các đáp án bên dưới; số lần nghe được hiện nhỏ.
- Thanh tốc độ (0.6× / 0.8× / 1×) dạng chip; sóng âm động khi đang phát.
- Sau khi trả lời: hiện **văn bản** của câu vừa nghe, tô sáng chỗ hay nghe sai, để biết mình nghe nhầm ở đâu.

#### 4.4.9 Thư viện & chi tiết từ
- Danh sách dạng thẻ gọn, **lọc bằng chip** (loại, Part, trạng thái), tìm kiếm ở trên cùng, cuộn ảo (virtualized) khi danh sách dài.
- Mỗi hàng có chấm trạng thái (mới / đang học / yếu / thuộc) và nút 🔊 nhỏ.
- Chi tiết từ chia khối gập được, thứ tự ưu tiên giữ như 3.1; khối "Nghĩa đặc biệt" luôn mở và nổi bật.

#### 4.4.10 Ngân sách hiệu năng cho giao diện
- Hiệu ứng 60fps trên điện thoại tầm trung; không thư viện animation nặng (ưu tiên CSS, nếu cần thì thư viện < 10KB gzip).
- Không ảnh nền lớn; minh hoạ dùng SVG inline nhỏ.
- LCP < 2.5s trên 4G, CLS ≈ 0.

---

## 5. Kiến trúc kỹ thuật

### 5.1 Đề xuất
| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Framework | **Vite + TypeScript + React** (hoặc Preact để nhẹ hơn) | Build tĩnh, dễ deploy Pages |
| Style | Tailwind CSS | Làm responsive/dark mode nhanh |
| Lưu trữ | IndexedDB qua **Dexie** | Dữ liệu tiến độ lớn, truy vấn tốt |
| PWA | `vite-plugin-pwa` (Workbox) | Cài được, offline, cache audio |
| Routing | hash router | GitHub Pages không rewrite URL |
| Âm thanh | file mp3 (v2) + `speechSynthesis` fallback | Xem 3.2 |
| Tìm kiếm | Fuse.js hoặc MiniSearch (chạy client) | Không cần server |
| Test | Vitest (logic SRS, parser) + Playwright (luồng chính) | |
| CI/CD | GitHub Actions → GitHub Pages | Push là deploy |

Phương án đơn giản hơn nếu muốn ít công cụ: HTML + JS thuần + ES modules, không build. Đổi lại khó quản lý khi app lớn; không khuyến nghị.

### 5.2 Cấu trúc repo

```
/
├─ SPEC.md
├─ content/
│  └─ toeic_vocab.md          # nguồn chính
├─ data/
│  ├─ vocab.json              # sinh ra từ content + enrichment
│  └─ enrichment/             # ipa, examples, patterns (đã rà soát)
├─ scripts/
│  ├─ parse-vocab.ts          # md → json
│  ├─ validate.ts             # kiểm tra schema, trùng lặp, thiếu trường
│  └─ build-audio.ts          # (v2) tạo mp3
├─ public/audio/              # (v2)
├─ src/
│  ├─ app/  features/  components/
│  ├─ srs/  db/  audio/  quiz/
│  └─ ...
├─ .github/workflows/deploy.yml
└─ README.md
```

### 5.3 Ghi chú triển khai
- Tổng dữ liệu nhỏ (vài trăm KB JSON), nạp một lần và cache. Audio v2 ước tính vài chục MB: tải theo nhóm/mục, cho phép "Tải trước để học offline" theo từng mục.
- Repo: `https://github.com/hp0705/Toeic_vocab` → URL app dự kiến `https://hp0705.github.io/Toeic_vocab/`. `base` của Vite phải là `/Toeic_vocab/` (phân biệt hoa thường). Mọi đường dẫn tài nguyên (dữ liệu, audio, icon, `start_url` và `scope` trong manifest PWA) phải tương đối theo `base`, không dùng `/` tuyệt đối.
- GitHub Pages miễn phí yêu cầu repo **public** (repo private cần gói trả phí). Nếu để public, mọi người đều thấy nội dung từ vựng trong repo.
- Tiến độ gắn với `id` mục ổn định (không dùng STT làm khoá, vì STT đổi khi sửa file). Parser sinh `id` từ headword + type; có bảng ánh xạ khi đổi tên.
- Tách tầng: `content` (chỉ đọc) và `progress` (người dùng), để cập nhật nội dung không mất tiến độ.

### 5.4 Phi chức năng
- Tải lần đầu < 3s trên 4G; sau đó mở app < 1s (cache).
- Chạy offline hoàn toàn (trừ lần tải đầu).
- Hỗ trợ: Safari iOS 16+, Chrome Android/desktop, Edge, Firefox, Safari macOS (bản 2 năm gần nhất).
- Riêng tư: không thu thập dữ liệu, không analytics bên thứ ba, không cookie theo dõi.
- Bản quyền: nội dung từ vựng do người dùng tự biên soạn; không sao chép nội dung từ điển/đề thi có bản quyền vào repo công khai. Nếu repo public, cân nhắc nội dung dùng riêng.

---

## 6. Lộ trình triển khai

### M1 – MVP (học được ngay)
- Parser md → JSON, schema, validate.
- Thẻ từ đầy đủ (nghĩa, đi kèm, ví dụ, họ từ), phát âm bằng `speechSynthesis`.
- Flashcard + SRS, giới hạn hằng ngày, duyệt/tìm kiếm.
- IndexedDB, xuất/nhập JSON, PWA offline, deploy GitHub Pages.
- Giao diện mobile + dark mode.

### M2 – Luyện theo dạng đề
- Cloze, họ từ, collocation, giới từ, cặp dễ nhầm, paraphrase, từ trong ngữ cảnh.
- Chế độ Nghe (nghe-chọn, nghe-điền, dictation).
- Danh sách Yếu, thống kê điểm yếu, lộ trình 6 tuần.
- Làm giàu dữ liệu (IPA, ví dụ đời thường) cho mục ưu tiên.

### M3 – Chất lượng & mở rộng
- Audio TTS tạo sẵn, đa giọng, tải trước theo mục.
- Shadowing có ghi âm/so sánh (tự nghe lại, không chấm).
- Đồng bộ qua Gist/QR, nhắc học, FSRS.
- Mở rộng nội dung (Part 7 đọc hiểu theo đoạn, từ vựng 700+).

---

## 7. Tiêu chí nghiệm thu (MVP)
1. Mở URL GitHub Pages trên điện thoại, "Thêm vào màn hình chính", tắt mạng vẫn học được.
2. Phát âm được cho 100% mục (từ và câu ví dụ) trên iPhone và Android.
3. Mỗi thẻ `word` hiển thị đủ: nghĩa, loại từ, IPA, đi kèm, ví dụ, họ từ (nếu có).
4. SRS lên lịch đúng: bấm "Dễ" thì khoảng ôn tăng, "Lại" thì quay về học lại trong ngày.
5. Xuất file JSON rồi nhập vào thiết bị khác khôi phục đúng tiến độ.
6. Cập nhật `toeic_vocab.md`, push lên GitHub → tự deploy mà không mất tiến độ đã học.
7. Parser báo lỗi rõ ràng khi một dòng thiếu cột hoặc trùng headword.

## 8. Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Giọng TTS của trình duyệt kém/không nhất quán | Audio tạo sẵn (M3), cho chọn giọng, thông báo khi thiết bị thiếu giọng |
| iOS xoá dữ liệu | `storage.persist()`, nhắc cài PWA, nhắc sao lưu |
| IPA/ví dụ sinh tự động sai | Đối chiếu từ điển, cờ `reviewed`, rà soát theo đợt |
| Dữ liệu md không đồng nhất | Parser theo từng mục, validate nghiêm, tách dòng gộp |
| Học quá nhiều, bỏ cuộc | Giới hạn thẻ/ngày mặc định thấp, gợi ý phiên 10 phút |
| Dùng một mình, thiếu động lực | Streak, mục tiêu tuần, thống kê tiến bộ |

## 9. Câu hỏi còn mở
1. Repo để public hay private? (ảnh hưởng đến GitHub Pages miễn phí và vấn đề nội dung)
2. Có muốn audio chất lượng cao tạo sẵn ngay từ đầu, hay bắt đầu bằng giọng của trình duyệt?
3. Thiết bị chính: iPhone hay Android? (ảnh hưởng ưu tiên kiểm thử và lưu trữ)
4. Số thời gian học mỗi ngày dự kiến, để đặt mặc định số thẻ mới/ôn?
5. Có muốn thêm phần luyện đọc đoạn văn ngắn (Part 6/7) trong M3 không?

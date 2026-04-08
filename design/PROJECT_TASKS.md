---

### 3. File `ISSUES.md` (hoặc `PROJECT_TASKS.md`)
Bạn có thể upload file này lên repo, sau đó yêu cầu GitHub Agent: *"Hãy đọc file ISSUES.md và tạo các GitHub Issues tương ứng vào project board"*.

```markdown
# 📋 Project Issues / Tasks Backlog

## Issue: [Phase 1] 🚀 Init Monorepo and Scaffold Apps
**Description:**
Thiết lập cấu trúc thư mục monorepo cơ bản cho dự án bao gồm Backend (NestJS) và Frontend (React Vite PWA).
**Tasks:**
- [ ] Khởi tạo `package.json` gốc với cấu hình npm workspaces.
- [ ] Tạo NestJS app trong thư mục `apps/api`.
- [ ] Tạo React Vite app trong thư mục `apps/web` và cài đặt `vite-plugin-pwa`.
- [ ] Cấu hình ESLint & Prettier dùng chung.
- [ ] Thêm script chạy đồng thời cả 2 app bằng lệnh `npm run dev` (dùng `npm-run-all`).

## Issue: [Phase 2] 📄 Implement PDF Upload and Raw Extract API
**Description:**
Xây dựng endpoint trên NestJS để nhận file PDF và trích xuất ra text thô.
**Tasks:**
- [ ] Tạo module `Document` trong NestJS.
- [ ] Tích hợp Multer để xử lý file upload.
- [ ] Cài đặt thư viện `pdf-parse`.
- [ ] Viết API endpoint `POST /api/documents/upload` để parse file PDF và trả về raw text.

## Issue: [Phase 2] 🧹 Build Text Cleaner Service (Regex Engine)
**Description:**
Làm sạch raw text tiếng Anh từ PDF kỹ thuật: xóa header/footer và xử lý code snippets.
**Tasks:**
- [ ] Viết hàm Regex loại bỏ các dòng có pattern là số trang hoặc tiêu đề chương lặp lại.
- [ ] Viết rule nhận diện Code Snippet (dựa vào ký tự `{`, `}`, thụt lề sâu).
- [ ] Thay thế các khối code bằng chuỗi *"[Code snippet omitted]"*.
- [ ] Viết Unit Test cho Cleaner Service.

## Issue: [Phase 3] 🔊 Text Chunking and TTS Integration
**Description:**
Cắt văn bản đã làm sạch thành các đoạn nhỏ và gọi API Cloud TTS để sinh file âm thanh.
**Tasks:**
- [ ] Viết thuật toán chia tách văn bản thành mảng các chuỗi (limit ~1000 chars, cắt theo câu/đoạn).
- [ ] Tích hợp Google Cloud TTS API (hoặc AWS Polly) vào module `TTS`.
- [ ] Viết logic lặp qua mảng text, gọi TTS API và lưu file audio.
- [ ] Tạo API `GET /api/documents/:id/playlist` trả về mảng các URL dẫn đến file audio.

## Issue: [Phase 4] 🎵 Build React Audio Player Component
**Description:**
Xây dựng giao diện Player có khả năng phát mảng các file audio (chunks) một cách liên tục.
**Tasks:**
- [ ] Thiết kế UI Player (Play/Pause, Progress Bar, Speed Control 1x-2x).
- [ ] Viết logic tự động chuyển sang file audio tiếp theo trong playlist khi file hiện tại kết thúc (`onEnded` event).
- [ ] Hiển thị tiến trình đọc tương ứng với chunk hiện tại.

## Issue: [Phase 4] 📶 Implement PWA Offline Storage (IndexedDB)
**Description:**
Cho phép lưu trữ các file audio xuống bộ nhớ trình duyệt để nghe offline.
**Tasks:**
- [ ] Cài đặt `localforage` trên frontend `apps/web`.
- [ ] Thêm nút "Download for Offline" trên UI giao diện tài liệu.
- [ ] Viết logic fetch các file MP3 dưới dạng Blob và lưu vào IndexedDB.
- [ ] Cập nhật logic Audio Player: Ưu tiên phát audio từ IndexedDB trước, nếu không có mới fetch từ Network.

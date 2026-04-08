---

### 2. File `ARCHITECTURE.md`
File này dùng để định hướng cho AI Agent biết cách tạo cấu trúc thư mục và luồng dữ liệu (Data Pipeline).

```markdown
# 🏗️ Architecture Design & Monorepo Structure

## 1. High-Level Architecture
The system operates on a Client-Server model with a one-way data processing pipeline (PDF -> Clean Text -> Audio Chunks).

* **Frontend (ReactJS + Vite + PWA):**
    * **UI/UX:** Document upload, library view, and an Audio Player with speed controls.
    * **Offline Engine:** Uses Service Worker (Workbox) to cache the App Shell. Integrates `localforage` (IndexedDB) to store downloaded `mp3/wav` chunks for offline listening.
* **Backend (NestJS):**
    * **API Gateway:** Handles PDF uploads.
    * **Document Pipeline:**
        1.  **Extractor Service:** Uses `pdf-parse` to extract raw text.
        2.  **Cleaner Service:** Regex engine to remove headers/footers, page numbers, and identify/skip Code Snippets.
        3.  **Chunking Service:** Splits long text into smaller sentences/paragraphs to bypass TTS API limits.
    * **TTS Integration:** Calls Google Cloud TTS (or AWS Polly) to generate audio files for each chunk.

## 2. Directory Structure (NPM Workspaces)

```text
tech-audiobook-monorepo/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── document/  # Upload & Metadata
│   │   │   │   ├── parser/    # Text Extraction & Cleaning
│   │   │   │   ├── tts/       # Cloud TTS API Integration
│   │   │   │   └── audio/     # MP3/WAV File Management
│   │   │   └── main.ts
│   └── web/                 # ReactJS PWA (Vite)
│       ├── src/
│       │   ├── components/  # AudioPlayer, DocumentList
│       │   ├── services/    # API Client, IndexedDB Wrapper
│       │   └── store/       # Player State
├── packages/                
│   └── shared-types/        # DTOs and Interfaces shared between Web & API
├── package.json
└── README.md

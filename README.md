# 🎧 Tech Audiobook PWA

A Progressive Web App designed to convert technical PDF documents (English) into high-quality audio using Cloud TTS APIs. 
Built with a Monorepo architecture to share types and configurations between the backend and frontend.

## 🏗 Tech Stack
- **Backend:** NestJS (PDF Parsing, Text Cleaning Pipeline, TTS Integration)
- **Frontend:** ReactJS + Vite + PWA (Offline Audio Player, IndexedDB)
- **Tooling:** NPM Workspaces

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- NPM or Yarn

### Installation & Run
```bash
# Install dependencies for all workspaces
npm install

# Run both Backend and Frontend in parallel
npm run dev

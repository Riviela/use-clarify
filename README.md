# AI Content Detector

A production-ready, full-stack AI text detection platform that analyzes pasted text and classifies it as **Human-written**, **AI-generated**, or **AI-refined**, including paragraph-level feedback.

![AI Content Detector](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)

## 🚀 Features

- **Text Analysis**: Paste or type up to 1200 words for analysis
- **Multi-Label Classification**: Detects Human, AI-Generated, and AI-Refined content
- **Paragraph-Level Analysis**: Independent analysis of each paragraph with confidence scores
- **Visual Highlighting**: Color-coded results (🟢 Human, 🟡 AI-Refined, 🔴 AI-Generated)
- **Multilingual Support**: English, German, French, Spanish
- **Privacy-First**: No permanent storage of submitted text
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: ARIA labels, keyboard navigation, screen reader friendly

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Dev Server**: Turbopack (enabled by default)
- **Deployment**: Edge-compatible API routes

## 📋 Prerequisites

- Node.js 18.17 or higher
- npm, yarn, or pnpm

## 🏃 Getting Started

### Installation

```bash
# Clone or navigate to the project directory
cd aidedectoryersen

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server uses **Turbopack** for instant updates and fast refresh.

### Building for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
aidedectoryersen/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Edge API route for text analysis
│   ├── detector.tsx               # Main detector client component
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles with design tokens
├── components/
│   ├── ui/                        # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── label.tsx
│   ├── disclaimer.tsx             # Privacy and accuracy disclaimer
│   ├── text-input.tsx             # Text input with word counter
│   ├── results-display.tsx        # Overall results with tabs
│   └── paragraph-analysis.tsx     # Paragraph-level breakdown
├── lib/
│   ├── detection/
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── analyzers.ts           # Heuristic analyzers
│   │   ├── classifier.ts          # Main classification logic
│   │   └── language.ts            # Language detection
│   └── utils.ts                   # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 🧠 Detection Algorithm

The current implementation uses **sophisticated heuristic analysis** including:

1. **Entropy Analysis**: Measures randomness in word choices
2. **Burstiness**: Analyzes variance in sentence lengths
3. **Lexical Diversity**: Calculates unique vs total word ratio
4. **Predictability**: Detects common AI phrase patterns
5. **Syntax Regularity**: Identifies repetitive sentence structures

### Future Enhancements

For production use with real users, consider:

- Integrating a trained ML model API (OpenAI Moderation, Hugging Face, custom models)
- Adding support for PDF and document upload
- Implementing batch processing for multiple files
- Rate limiting and authentication
- Usage analytics and reporting
- API access for developers

## 🌍 Multilingual Support

The system automatically detects and analyzes text in:

- 🇬🇧 English (en)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)

The detection algorithm is language-agnostic and can be extended for additional languages.

## 🔒 Privacy & Ethics

- **No Storage**: Submitted text is analyzed in-session only and never stored
- **Transparency**: Clear disclaimer about accuracy limitations
- **Ethical Use**: Designed as a tool to inform, not to definitively judge content

## 🎨 UI/UX Highlights

- Clean, academic, modern design
- Gradient backgrounds with glassmorphism effects
- Real-time word counter and validation
- Smooth loading states and transitions
- Color-coded visual feedback
- Tabbed results interface
- Mobile-responsive layout

## 🧪 API Contract

### POST `/api/analyze`

**Request:**
```json
{
  "text": "Your text here...",
  "language": "en" // optional
}
```

**Response:**
```json
{
  "overall": {
    "human": 60,
    "aiGenerated": 20,
    "aiRefined": 20
  },
  "paragraphs": [
    {
      "index": 0,
      "label": "human",
      "confidence": 85,
      "text": "Your paragraph text..."
    }
  ],
  "disclaimer": "No AI detector is 100% accurate..."
}
```

## 📝 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by [Scribbr AI Detector](https://www.scribbr.com/ai-detector/)

---

**Ready to detect AI content!** 🚀

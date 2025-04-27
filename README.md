# Data Rakshak 🛡️

## 🚀 Introduction
Data Rakshak ("Data Guardian" in Hindi) is a powerful tool designed to protect privacy by redacting sensitive information from documents. Specifically built with Indian context in mind, it can identify and remove Aadhaar numbers, PAN card details, phone numbers, and other Personal Identifiable Information (PII) from various document formats. Leveraging advanced machine learning algorithms, Data Rakshak ensures your documents remain compliant with privacy regulations while preserving their structure and readability.

## ✨ Features

- **Intelligent PII Detection**: Automatically identifies personal information in text, PDFs, and images
- **Precise Redaction**: Carefully obscures sensitive data while maintaining document integrity
- **Multi-format Support**: Seamlessly handles text files, PDFs, images, and scanned documents
- **Multilingual Capabilities**: Supports English and multiple Indian regional languages
- **Customizable Redaction**: Select specific types of information to redact based on your needs
- **Modern, Intuitive UI**: Clean, responsive interface with light/dark mode support

## 🛠️ Technologies

- **Frontend**:
  - React 19
  - React Router v7
  - Tailwind CSS v4
  
- **Build Tools**:
  - Vite 6 for lightning-fast builds
  - TypeScript for type safety
  - ESLint & Prettier for code quality
  
- **Deployment**:
  - Docker containerization

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Z-xus/dr-frontend.git
   cd dr-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Access the application at `http://localhost:5173`

## 🚀 Usage

1. **Text Analysis**: Paste text into the analyzer to detect and highlight PII
2. **Image Redaction**: Upload images containing text for automatic PII detection and redaction
3. **PDF Redaction**: Upload PDFs and select sensitive information types to redact
4. **Download**: Save your redacted documents for secure sharing

## 🔧 Building for Production

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

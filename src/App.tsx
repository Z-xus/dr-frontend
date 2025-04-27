import { Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/Layout';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Home from '@/pages/HomePage';
import Analyzer from '@/pages/PIIAnalyzer';
import RedactPdf from '@/pages/RedactPdf';
import RedactImage from '@/pages/RedactImage';
import ErrorPage from '@/pages/ErrorPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="data-rakshak-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyzer />} />
            <Route path="/redact-image" element={<RedactImage />} />
            <Route path="/redact-pdf" element={<RedactPdf />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;

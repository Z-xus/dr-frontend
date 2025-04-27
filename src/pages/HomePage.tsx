import { motion } from 'framer-motion';
import { FileSearch, FileText, Image, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function Home() {
  const navigate = useNavigate();

  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Data Rakshak
              </span>
            </div>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Advanced document and image redaction with pixel-perfect precision
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          <motion.div
            className="p-6 rounded-xl border border-primary/10 bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="relative z-10">
              <div className="mb-4 p-2 bg-primary/10 rounded-lg w-10 h-10 flex items-center justify-center">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyze</h3>
              <p className="text-sm text-muted-foreground mb-4">Scan and analyze documents for sensitive information</p>
              <Button onClick={() => navigate('/analyze')} className="w-full">
                Get Started
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl border border-primary/10 bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="relative z-10">
              <div className="mb-4 p-2 bg-primary/10 rounded-lg w-10 h-10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Redact PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">Secure your PDF documents with precision redaction</p>
              <Button onClick={() => navigate('/redact-pdf')} className="w-full">
                Redact PDF
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl border border-primary/10 bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="relative z-10">
              <div className="mb-4 p-2 bg-primary/10 rounded-lg w-10 h-10 flex items-center justify-center">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Redact Image</h3>
              <p className="text-sm text-muted-foreground mb-4">Protect sensitive information in your images</p>
              <Button onClick={() => navigate('/redact-image')} className="w-full">
                Redact Image
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
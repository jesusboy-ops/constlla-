/**
 * Shareable Snapshots & Clips Component
 * Export static images or short animated clips of 3D scenes
 * PRD Requirement: Core viral mechanic for social sharing
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShareableSnapshots = ({ isOpen, onClose }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [exportFormat, setExportFormat] = useState('png');

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // Get the Three.js canvas from the DOM
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('No canvas found');
      }
      
      // Get canvas data
      const dataURL = canvas.toDataURL(`image/${exportFormat}`, 0.95);
      
      setCapturedImage(dataURL);
      
      // Auto-download
      const link = document.createElement('a');
      link.download = `web3-constellation-${Date.now()}.${exportFormat}`;
      link.href = dataURL;
      link.click();
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const captureVideo = async () => {
    setIsCapturing(true);
    
    try {
      // Get the Three.js canvas from the DOM
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('No canvas found');
      }
      
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `web3-constellation-${Date.now()}.webm`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        setIsCapturing(false);
      };
      
      mediaRecorder.start();
      
      // Record for 5 seconds
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
      
    } catch (error) {
      console.error('Video capture failed:', error);
      setIsCapturing(false);
    }
  };

  const shareToSocial = (platform) => {
    if (!capturedImage) return;
    
    const text = "Exploring blockchain data in 3D with Web3 Constellation! 🌌✨";
    const url = window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-xl font-bold">Share Your Discovery</h3>
              <p className="text-white/60 text-sm">Export and share your 3D blockchain exploration</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-4 mb-6">
            {/* Screenshot */}
            <motion.button
              onClick={captureScreenshot}
              disabled={isCapturing}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl hover:border-blue-400/50 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xl">
                📸
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">High-Res Screenshot</div>
                <div className="text-white/60 text-sm">Capture current view as image</div>
              </div>
              {isCapturing && (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </motion.button>

            {/* Video Clip */}
            <motion.button
              onClick={captureVideo}
              disabled={isCapturing}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl hover:border-purple-400/50 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xl">
                🎬
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">5-Second Clip</div>
                <div className="text-white/60 text-sm">Record animated sequence</div>
              </div>
              {isCapturing && (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              )}
            </motion.button>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="text-white/80 text-sm font-medium mb-2 block">Export Format</label>
            <div className="flex gap-2">
              {['png', 'jpg', 'webp'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    exportFormat === format
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                      : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Social Sharing */}
          <div className="border-t border-white/10 pt-4">
            <div className="text-white/80 text-sm font-medium mb-3">Share On</div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => shareToSocial('twitter')}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg hover:border-blue-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-blue-400">🐦</span>
                <span className="text-white text-sm">Twitter</span>
              </motion.button>
              
              <motion.button
                onClick={() => shareToSocial('linkedin')}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-blue-500">💼</span>
                <span className="text-white text-sm">LinkedIn</span>
              </motion.button>
            </div>
          </div>

          {/* Preview */}
          {capturedImage && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-white/80 text-sm mb-2">Preview</div>
              <img 
                src={capturedImage} 
                alt="Captured screenshot" 
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareableSnapshots;
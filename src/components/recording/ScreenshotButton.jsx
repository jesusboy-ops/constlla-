/**
 * Screenshot Button Component
 * Captures screenshots of the 3D canvas
 */

import { useState } from 'react';
import { useThree } from '@react-three/fiber';
import GlassButton from '../ui/GlassButton.jsx';
import { useAppStore } from '../../state/useAppStore.js';

const ScreenshotButton = () => {
  const [capturing, setCapturing] = useState(false);
  const { gl } = useThree();
  const { addNotification } = useAppStore();

  const captureScreenshot = async () => {
    if (!gl) return;

    setCapturing(true);
    
    try {
      // Render the current frame
      gl.render();
      
      // Get canvas data
      const canvas = gl.domElement;
      const dataURL = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = `constella-screenshot-${Date.now()}.png`;
      link.href = dataURL;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification({
        type: 'success',
        title: 'Screenshot Captured',
        message: 'Your screenshot has been downloaded successfully!'
      });
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      addNotification({
        type: 'error',
        title: 'Screenshot Failed',
        message: 'Failed to capture screenshot. Please try again.'
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <GlassButton
      onClick={captureScreenshot}
      loading={capturing}
      disabled={capturing}
      className="flex items-center gap-2"
    >
      📸 Screenshot
    </GlassButton>
  );
};

export default ScreenshotButton;
/**
 * Video Recorder Component
 * Records video of the 3D canvas using MediaRecorder API
 */

import { useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import GlassButton from '../ui/GlassButton.jsx';
import { useAppStore } from '../../state/useAppStore.js';
import { useSettingsStore } from '../../state/useSettingsStore.js';

const VideoRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { gl } = useThree();
  const { addNotification } = useAppStore();
  const { recordingFPS, recordingQuality, recordingResolution } = useSettingsStore();
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    if (!gl) return;

    try {
      const canvas = gl.domElement;
      
      // Set canvas resolution for 4K recording
      const resolutions = {
        '1080p': { width: 1920, height: 1080 },
        '1440p': { width: 2560, height: 1440 },
        '4k': { width: 3840, height: 2160 }
      };
      
      const targetRes = resolutions[recordingResolution] || resolutions['4k'];
      
      // Temporarily resize canvas for recording
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      
      canvas.width = targetRes.width;
      canvas.height = targetRes.height;
      gl.setSize(targetRes.width, targetRes.height);
      
      const stream = canvas.captureStream(recordingFPS);
      
      // Configure recording options based on quality and resolution
      const bitrates = {
        'low': recordingResolution === '4k' ? 8000000 : 2000000,
        'medium': recordingResolution === '4k' ? 15000000 : 4000000,
        'high': recordingResolution === '4k' ? 25000000 : 8000000,
        '4k': 35000000
      };
      
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: bitrates[recordingQuality] || bitrates['4k']
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Restore original canvas size
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        gl.setSize(originalWidth, originalHeight);
        
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `constella-${recordingResolution}-recording-${Date.now()}.webm`;
        link.href = url;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        addNotification({
          type: 'success',
          title: 'Recording Complete',
          message: `${recordingResolution} video recorded for ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
        });
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      addNotification({
        type: 'info',
        title: 'Recording Started',
        message: `${recordingResolution} video recording at ${recordingFPS}fps has begun. Click stop when finished.`
      });

    } catch (error) {
      console.error('Recording start failed:', error);
      addNotification({
        type: 'error',
        title: 'Recording Failed',
        message: 'Failed to start recording. Please check browser permissions.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <GlassButton
          onClick={startRecording}
          className="flex items-center gap-2"
        >
          🎥 Record
        </GlassButton>
      ) : (
        <>
          <GlassButton
            variant="danger"
            onClick={stopRecording}
            className="flex items-center gap-2"
          >
            ⏹️ Stop
          </GlassButton>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoRecorder;
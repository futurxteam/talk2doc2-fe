import React, { useRef, useEffect } from 'react';

/**
 * AudioWaveVisualizer
 * Renders an organic, glowing sound frequency waveform on a canvas.
 * Seamlessly reacts to both user speech (mic input) and AI speech (OpenAI TTS).
 */
export default function AudioWaveVisualizer({
  analyser,
  state = 'listening', // 'listening' | 'speaking' | 'thinking' | 'idle'
  language = 'en',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle canvas high-DPI scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerY = height / 2;

      // Clear with pitch black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Get frequency data if analyser is active
      let avgVolume = 0;
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        avgVolume = sum / bufferLength; // 0 to 255
      }

      // Base dynamic amplitude based on state and volume
      let amplitude = 15;
      if (state === 'speaking') {
        amplitude = Math.max(30, avgVolume * 0.85);
      } else if (state === 'listening') {
        amplitude = Math.max(20, avgVolume * 0.7);
      } else if (state === 'thinking') {
        amplitude = 25 + Math.sin(phase * 2) * 12;
      } else {
        amplitude = 8;
      }

      phase += state === 'thinking' ? 0.06 : 0.035;

      // Draw multi-layered glowing wave curves
      const waveCount = 5;
      const colors = [
        { stroke: 'rgba(0, 242, 254, 0.85)', glow: 'rgba(0, 242, 254, 0.4)', speed: 1.0, freq: 0.008 },
        { stroke: 'rgba(79, 172, 254, 0.75)', glow: 'rgba(79, 172, 254, 0.35)', speed: 0.8, freq: 0.01 },
        { stroke: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.3)', speed: 1.2, freq: 0.006 },
        { stroke: 'rgba(56, 189, 248, 0.65)', glow: 'rgba(56, 189, 248, 0.25)', speed: 0.9, freq: 0.012 },
        { stroke: 'rgba(52, 211, 153, 0.8)', glow: 'rgba(52, 211, 153, 0.35)', speed: 1.1, freq: 0.009 },
      ];

      // Subtle center radial glow
      const radialGradient = ctx.createRadialGradient(
        width / 2, centerY, 10,
        width / 2, centerY, Math.min(width, height) * 0.4
      );
      if (state === 'speaking') {
        radialGradient.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        radialGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'listening') {
        radialGradient.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
        radialGradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.05)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        radialGradient.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      // Render each wave layer
      for (let w = 0; w < waveCount; w++) {
        const config = colors[w];
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 3.5 : 2;
        ctx.strokeStyle = config.stroke;
        ctx.shadowColor = config.glow;
        ctx.shadowBlur = 18;

        const sliceWidth = width / 180;
        let x = 0;

        for (let i = 0; i <= 180; i++) {
          // Envelope function: smooth taper at the edges so wave pinches to zero near screen edges
          const normX = i / 180; // 0 to 1
          const envelope = Math.sin(normX * Math.PI); // 0 at left, 1 at center, 0 at right

          // Wave height formula with multiple harmonics and phase shifts
          const wavePhase = phase * config.speed + w * 0.7;
          const sineValue =
            Math.sin(i * config.freq * 12 + wavePhase) * 0.65 +
            Math.sin(i * config.freq * 24 + wavePhase * 1.3) * 0.35;

          // Frequency bin influence
          const binIndex = Math.min(i, bufferLength - 1);
          const binFactor = (dataArray[binIndex] || 0) / 255;
          const dynamicBoost = 1 + binFactor * 1.2;

          const y = centerY + sineValue * amplitude * envelope * dynamicBoost;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      }

      // Reset shadow blur
      ctx.shadowBlur = 0;

      // Draw subtle status pill indicator in glowing monochrome
      ctx.save();
      const statusText =
        state === 'listening'
          ? (language === 'ml' ? 'കേൾക്കുന്നു...' : 'Listening...')
          : state === 'speaking'
          ? (language === 'ml' ? 'സംസാരിക്കുന്നു...' : 'Speaking...')
          : state === 'thinking'
          ? (language === 'ml' ? 'ചിന്തിക്കുന്നു...' : 'Processing...')
          : 'Ready';

      ctx.font = '500 13px Inter, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(statusText, width / 2, centerY + 130);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, state, language]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        zIndex: 99998,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}

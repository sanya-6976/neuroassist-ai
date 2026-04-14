import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Camera, MousePointer2, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const MEDIAPIPE_HANDS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
const MEDIAPIPE_DRAWING_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
const MEDIAPIPE_CAMERA_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

const SHAPES = {
    '3': [
      { x: 0.35, y: 0.25 }, { x: 0.40, y: 0.20 }, { x: 0.45, y: 0.18 }, { x: 0.50, y: 0.17 }, { x: 0.55, y: 0.18 }, { x: 0.60, y: 0.21 }, { x: 0.65, y: 0.25 },
      { x: 0.67, y: 0.30 }, { x: 0.65, y: 0.35 }, { x: 0.60, y: 0.40 }, { x: 0.55, y: 0.45 }, { x: 0.50, y: 0.48 }, { x: 0.45, y: 0.50 }, { x: 0.50, y: 0.52 }, { x: 0.55, y: 0.55 },
      { x: 0.60, y: 0.60 }, { x: 0.65, y: 0.65 }, { x: 0.67, y: 0.70 }, { x: 0.65, y: 0.75 }, { x: 0.60, y: 0.80 }, { x: 0.55, y: 0.82 }, { x: 0.50, y: 0.83 }, { x: 0.45, y: 0.82 },
      { x: 0.40, y: 0.80 }, { x: 0.35, y: 0.75 }
    ],
    'Circle': [
      { x: 0.5, y: 0.2 }, { x: 0.6, y: 0.23 }, { x: 0.7, y: 0.3 }, { x: 0.77, y: 0.4 }, { x: 0.8, y: 0.5 }, { x: 0.77, y: 0.6 }, { x: 0.7, y: 0.7 }, { x: 0.6, y: 0.77 },
      { x: 0.5, y: 0.8 }, { x: 0.4, y: 0.77 }, { x: 0.3, y: 0.7 }, { x: 0.23, y: 0.6 }, { x: 0.2, y: 0.5 }, { x: 0.23, y: 0.4 }, { x: 0.3, y: 0.3 }, { x: 0.4, y: 0.23 },
      { x: 0.5, y: 0.2 }
    ],
    'S': [
      { x: 0.65, y: 0.2 }, { x: 0.6, y: 0.17 }, { x: 0.5, y: 0.15 }, { x: 0.4, y: 0.17 }, { x: 0.35, y: 0.2 }, { x: 0.33, y: 0.28 }, { x: 0.35, y: 0.35 },
      { x: 0.4, y: 0.42 }, { x: 0.5, y: 0.5 }, { x: 0.6, y: 0.58 }, { x: 0.65, y: 0.65 }, { x: 0.67, y: 0.73 }, { x: 0.65, y: 0.8 }, { x: 0.6, y: 0.83 }, { x: 0.5, y: 0.85 },
      { x: 0.4, y: 0.83 }, { x: 0.35, y: 0.8 }
    ]
  };

const MESSAGES = [
  "You're a Star! ⭐", "Keep Going! 🚀", "Almost There! ✨", "Magic Trace! 🪄", 
  "Amazing Skills! 🧠", "Super Focus! 🧿", "Love it! ❤️"
];

const DrawGame = ({ completedTasks = [], setCompletedTasks }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);   
  const drawingCanvasRef = useRef(null);   
  const guideCanvasRef = useRef(null);     
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const pathPointsRef = useRef([]);
  const hueRef = useRef(280);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gesturesActive, setGesturesActive] = useState(false);
  const [isDrawingState, setIsDrawingState] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState('Loading AI...');
  const [currentShape, setCurrentShape] = useState('3');
  const [brushColor, setBrushColor] = useState('#10b981'); // Default green
  const [accuracy, setAccuracy] = useState(0);
  const [hitPoints, setHitPoints] = useState([]);
  const [encouragement, setEncouragement] = useState("");

  const COLORS = ['rainbow', '#a855f7', '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#ec4899'];
  const SMOOTHING = 0.18;

  const syncCanvasSize = () => {
    const parent = drawingCanvasRef.current?.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    [drawingCanvasRef.current, overlayCanvasRef.current, guideCanvasRef.current].forEach(c => {
      if (c) { c.width = w; c.height = h; }
    });
    drawGuide(); 
  };

  const drawGuide = () => {
    const ctx = guideCanvasRef.current?.getContext('2d');
    const w = guideCanvasRef.current?.width || 0;
    const h = guideCanvasRef.current?.height || 0;
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    
    // Draw base trace path
    ctx.setLineDash([15, 12]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 50;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = SHAPES[currentShape];
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x * w, p.y * h);
      else ctx.lineTo(p.x * w, p.y * h);
    });
    ctx.stroke();

    // Draw interactive checkpoints
    points.forEach((p, i) => {
      const isHit = hitPoints.includes(i);
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, isHit ? 12 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? '#10b981' : 'rgba(255, 255, 255, 0.3)';
      if (isHit) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#10b981';
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const checkAccuracy = (userPoints) => {
    if (!userPoints.length) return;
    const targetPoints = SHAPES[currentShape];
    const threshold = 0.08; 
    let newHits = [...hitPoints];
    let changed = false;

    targetPoints.forEach((tp, i) => {
      if (newHits.includes(i)) return;
      const isNear = userPoints.some(up => {
        const d = Math.sqrt(Math.pow(tp.x - up.x, 2) + Math.pow(tp.y - up.y, 2));
        return d < threshold;
      });
      if (isNear) {
        newHits.push(i);
        changed = true;
      }
    });

    if (changed) {
      setHitPoints(newHits);
      const score = Math.round((newHits.length / targetPoints.length) * 100);
      setAccuracy(score);
      
      // Dynamic encouragement
      if (newHits.length % 5 === 0) {
        setEncouragement(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        setTimeout(() => setEncouragement(""), 2000);
      }

      if (score > 85 && !completed) {
        setCompleted(true);
        if (!completedTasks.includes(1)) {
          setCompletedTasks(prev => [...prev, 1]);
        }
        
        // Save to Parent Insights
        const history = JSON.parse(localStorage.getItem('parent_insights_history') || '[]');
        history.push({
          date: new Date().toISOString(),
          exercise: `Draw Game: ${currentShape}`,
          tasksCompleted: 1,
          accuracy: score,
          type: 'draw'
        });
        localStorage.setItem('parent_insights_history', JSON.stringify(history));
      }
    }
  };

  const onResults = (results) => {
    const ovCtx = overlayCanvasRef.current?.getContext('2d');
    const drCtx = drawingCanvasRef.current?.getContext('2d');
    const w = overlayCanvasRef.current?.width ?? 0;
    const h = overlayCanvasRef.current?.height ?? 0;
    if (!ovCtx || !drCtx) return;

    ovCtx.clearRect(0, 0, w, h);

    if (results.multiHandLandmarks?.length) {
      setGesturesActive(true);
      setStatus(`Drawing Mode Active 🎨`);

      const lm = results.multiHandLandmarks[0];
      
      // Draw Skeleton for feedback
      if (window.drawConnectors && window.HAND_CONNECTIONS) {
        window.drawConnectors(ovCtx, lm, window.HAND_CONNECTIONS, {
          color: '#ffffff33',
          lineWidth: 2
        });
        window.drawLandmarks(ovCtx, lm, {
          color: '#10b981',
          lineWidth: 1,
          radius: 3
        });
      }

      const rawX = (1 - lm[8].x) * w;
      const rawY = lm[8].y * h;

      const sx = lastPos.current.x === 0 ? rawX : lastPos.current.x + (rawX - lastPos.current.x) * SMOOTHING;
      const sy = lastPos.current.y === 0 ? rawY : lastPos.current.y + (rawY - lastPos.current.y) * SMOOTHING;

      // PINCH DETECTION (Requirement: don't draw when index joins thumb)
      // Distance between Landmark 8 (Index Tip) and Landmark 4 (Thumb Tip)
      const dist = Math.sqrt(
        Math.pow(lm[8].x - lm[4].x, 2) + 
        Math.pow(lm[8].y - lm[4].y, 2) + 
        Math.pow(lm[8].z - lm[4].z, 2)
      );
      
      const isPinching = dist < 0.045; // Adjusted threshold for joined fingers
      const indexUp  = lm[8].y  < lm[6].y;
      
      // Drawing condition: Index is up AND not pinching
      const shouldDraw = indexUp && !isPinching;

      if (shouldDraw) {
        drCtx.lineCap = 'round';
        drCtx.lineJoin = 'round';
        drCtx.lineWidth = 12; // Medium thickness
        
        if (brushColor === 'rainbow') {
          hueRef.current = (hueRef.current + 2) % 360;
          drCtx.strokeStyle = `hsl(${hueRef.current}, 80%, 60%)`;
          drCtx.shadowColor = `hsl(${hueRef.current}, 80%, 50%)`;
        } else {
          drCtx.strokeStyle = brushColor;
          drCtx.shadowColor = brushColor;
        }
        drCtx.shadowBlur = 4;

        if (!isDrawingRef.current) {
          drCtx.beginPath();
          drCtx.moveTo(sx, sy);
          isDrawingRef.current = true;
          pathPointsRef.current = [];
        } else {
          drCtx.lineTo(sx, sy);
          drCtx.stroke();
          const p = { x: sx / w, y: sy / h };
          pathPointsRef.current.push(p);
          checkAccuracy([p]);
        }
        setIsDrawingState(true);
      } else {
        if (isDrawingRef.current) {
          drCtx.closePath();
          isDrawingRef.current = false;
        }
        setIsDrawingState(false);
      }

      lastPos.current = { x: sx, y: sy };

      // Tracking cursor
      ovCtx.beginPath();
      ovCtx.arc(sx, sy, isPinching ? 10 : 20, 0, 2 * Math.PI);
      ovCtx.strokeStyle = isPinching ? 'rgba(239, 68, 68, 0.8)' : '#10b981';
      ovCtx.lineWidth = 3;
      ovCtx.stroke();
      
      // Label current state
      ovCtx.fillStyle = 'white';
      ovCtx.font = '14px Arial';
      ovCtx.fillText(isPinching ? 'PINCHED' : (shouldDraw ? 'DRAWING' : 'IDLE'), sx + 25, sy);
    } else {
      setGesturesActive(false);
      setStatus('Show your hand to the camera 🤚');
      isDrawingRef.current = false;
      setIsDrawingState(false);
      lastPos.current = { x: 0, y: 0 };
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          loadScript(MEDIAPIPE_HANDS_CDN),
          loadScript(MEDIAPIPE_DRAWING_CDN),
          loadScript(MEDIAPIPE_CAMERA_CDN),
        ]);
        if (cancelled) return;

        syncCanvasSize();
        window.addEventListener('resize', syncCanvasSize);

        const Hands   = window.Hands;
        const Camera  = window.Camera;

        handsRef.current = new Hands({
          locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        handsRef.current.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        handsRef.current.onResults(onResults);

        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current) await handsRef.current.send({ image: videoRef.current });
          },
          width: 1280,
          height: 720,
        });
        await cameraRef.current.start();

        if (!cancelled) {
          setLoading(false);
          setStatus('Ready to trace! 🤚');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to initialize AI.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      handsRef.current?.close();
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, [currentShape]); 

  // Redraw guide when hitPoints change
  useEffect(() => {
    drawGuide();
  }, [hitPoints, currentShape]);

  const clearCanvas = () => {
    const drCtx = drawingCanvasRef.current?.getContext('2d');
    if (drCtx) drCtx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    setAccuracy(0);
    setHitPoints([]);
  };

  const changeLevel = (shape) => {
    setCurrentShape(shape);
    clearCanvas();
    setCompleted(false);
    setHitPoints([]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans overflow-hidden">
      <header className="relative z-30 px-6 py-5 md:px-10 md:py-8 flex items-center justify-between bg-gradient-to-b from-slate-900 to-transparent">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/therapy')}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all text-white border border-white/10 shadow-xl group"
          >
            <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
              ✨ AI Magic Draw
              <span className={`text-sm px-4 py-1 rounded-full font-bold uppercase transition-colors ${gesturesActive ? 'bg-purple-600 text-white animate-pulse' : 'bg-white/10 text-slate-500'}`}>
                {gesturesActive ? 'AI Active' : 'Waiting'}
              </span>
            </h1>
            <p className="text-slate-400 text-xl font-medium mt-1 uppercase tracking-widest">{status}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-8 py-4 bg-white/5 rounded-3xl border border-white/10 text-white font-black text-3xl flex items-center gap-4 shadow-inner min-w-[300px] justify-center">
             <Sparkles className={`w-8 h-8 transition-all ${accuracy > 70 ? 'text-emerald-400 scale-125' : 'text-amber-400'}`} />
             Progress: <span className={accuracy > 70 ? 'text-emerald-400' : 'text-purple-400'}>{accuracy}%</span>
          </div>
          <button
            onClick={clearCanvas}
            className="px-10 py-5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-3xl font-black text-2xl transition-all shadow-xl shadow-red-500/20 border-b-8 border-red-800"
          >
            RESET
          </button>
        </div>
      </header>

      <main className="flex-1 relative px-6 pb-6 md:px-10 md:pb-10 flex gap-8">
        {/* Main Canvas Container */}
        <div className="flex-1 relative rounded-[4rem] overflow-hidden bg-slate-900 border-[12px] border-slate-800 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-20 pointer-events-none" />
          <canvas ref={guideCanvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
          <canvas ref={drawingCanvasRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
          <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />

          {loading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-slate-900/95 backdrop-blur-xl">
              <Loader2 className="w-24 h-24 text-purple-500 animate-spin" />
              <p className="text-4xl font-black text-white">Waking up AI Engine...</p>
            </div>
          )}

          {/* Encouragement Popup */}
          {encouragement && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-12 py-6 rounded-full shadow-2xl border-4 border-purple-500">
                <p className="text-4xl font-black text-purple-700 tracking-tight">{encouragement}</p>
              </div>
            </div>
          )}

          {completed && (
            <div className="absolute inset-0 z-60 bg-emerald-500/10 backdrop-blur-md flex items-center justify-center animate-in zoom-in duration-500">
              <div className="bg-white p-16 rounded-[4.5rem] shadow-2xl border-x-8 border-emerald-50 text-center max-w-2xl">
                 <div className="w-40 h-40 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-pulse">
                    <CheckCircle className="w-28 h-28 text-emerald-600 animate-bounce" />
                 </div>
                 <h3 className="text-7xl font-black text-slate-900 mb-4 tracking-tighter">LEVEL UP! 🏆</h3>
                 <p className="text-3xl text-slate-600 font-bold mb-10">You're a master at tracing the {currentShape}!</p>
                 <div className="flex gap-4 justify-center">
                    <button onClick={() => setCompleted(false)} className="bg-slate-100 px-10 py-6 rounded-3xl font-black text-2xl hover:bg-slate-200 transition-colors">Free Draw</button>
                    <button onClick={() => navigate('/therapy')} className="bg-emerald-600 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-xl border-b-8 border-emerald-800 hover:bg-emerald-700 transition-all active:translate-y-1 active:border-b-4">Next Goal 🚀</button>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Level Sidebar */}
        <aside className="w-96 flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4 leading-none">
                <MousePointer2 className="w-10 h-10 text-purple-600" />
                Select Shape
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.keys(SHAPES).map(shape => (
                  <button
                    key={shape}
                    onClick={() => changeLevel(shape)}
                    className={`py-6 rounded-3xl font-black text-4xl transition-all border-4 ${
                      currentShape === shape 
                        ? 'bg-purple-600 text-white border-purple-200 shadow-xl scale-105' 
                        : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-0.5 bg-slate-100" />

            <div>
              <h4 className="text-xl font-bold text-slate-400 border-l-4 border-purple-500 px-4 mb-6">Pen Magic</h4>
              <div className="flex flex-wrap gap-4">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    style={{ background: c === 'rainbow' ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)' : c }}
                    className={`w-14 h-14 rounded-2xl transition-all ${brushColor === c ? 'ring-4 ring-offset-4 ring-purple-600 scale-110 shadow-lg' : 'opacity-80 hover:scale-105'}`}
                  >
                    {c === 'rainbow' && <Sparkles className="w-6 h-6 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-10 rounded-[3.5rem] shadow-2xl text-white transform hover:rotate-1 transition-transform cursor-default">
             <h4 className="text-2xl font-black mb-4 flex items-center gap-3"><Sparkles className="animate-spin-slow" /> Magic Guide</h4>
             <p className="text-xl font-medium leading-relaxed opacity-90">
               Light up all the <span className="font-black text-emerald-300">checkpoints</span> to unlock the next level!
             </p>
          </div>
        </aside>
      </main>

      <footer className="px-10 py-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-10">
            <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl border transition-all ${isDrawingState ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/10 opacity-40'}`}>
               <span className="font-black text-white uppercase tracking-widest text-sm">Magic Brush Active</span>
            </div>
            <div className="flex items-center gap-4 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
               <span className="font-black uppercase tracking-widest text-sm">Anti-Gravity Stabilizer x1.5</span>
            </div>
         </div>
         <p className="text-slate-600 font-bold uppercase tracking-[0.4em] text-xs">Aesthetic Core v5.0 • CP Optimized</p>
      </footer>
    </div>
  );
};

export default DrawGame;


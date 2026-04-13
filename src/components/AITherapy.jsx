import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Activity, CheckCircle, AlertTriangle, RotateCcw, Play, Pause, Zap } from 'lucide-react';

// ─── MediaPipe CDN loader ────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Skeleton connections (MediaPipe Pose landmark indices) ──────────────────
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // upper body
  [11, 23], [12, 24], [23, 24],                      // torso
  [23, 25], [25, 27], [24, 26], [26, 28],            // legs
];

// ─── Drawing helpers ─────────────────────────────────────────────────────────
function drawSkeleton(ctx, landmarks, width, height, postureGood) {
  if (!landmarks || landmarks.length === 0) return;

  const color = postureGood ? '#22c55e' : '#ef4444';
  const pointColor = postureGood ? '#86efac' : '#fca5a5';

  // Draw connections
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  for (const [a, b] of POSE_CONNECTIONS) {
    const lA = landmarks[a];
    const lB = landmarks[b];
    if (!lA || !lB || lA.visibility < 0.5 || lB.visibility < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(lA.x * width, lA.y * height);
    ctx.lineTo(lB.x * width, lB.y * height);
    ctx.stroke();
  }

  // Draw keypoints
  ctx.shadowBlur = 0;
  for (const lm of landmarks) {
    if (!lm || lm.visibility < 0.5) continue;
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 6, 0, 2 * Math.PI);
    ctx.fillStyle = pointColor;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ─── Posture analysis ────────────────────────────────────────────────────────
function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length < 33) return { good: true, reason: 'Detecting...' };

  const ls = landmarks[11]; // left shoulder
  const rs = landmarks[12]; // right shoulder
  const lh = landmarks[23]; // left hip
  const rh = landmarks[24]; // right hip

  if (!ls || !rs || !lh || !rh) return { good: true, reason: 'Detecting...' };
  if (ls.visibility < 0.5 || rs.visibility < 0.5) return { good: true, reason: 'Move into frame' };

  // Shoulder tilt (Y difference — in normalized coords, both should be similar)
  const shoulderTilt = Math.abs(ls.y - rs.y);
  // Forward lean — shoulders should be above hips
  const leftLean = ls.x - lh.x;
  const rightLean = rs.x - rh.x;
  const avgLean = Math.abs((leftLean + rightLean) / 2);

  if (shoulderTilt > 0.07) {
    return { good: false, reason: 'Shoulders uneven' };
  }
  if (avgLean > 0.12) {
    return { good: false, reason: 'Leaning sideways' };
  }
  return { good: true, reason: 'Spine aligned' };
}

// ─── Movement / rep detection ─────────────────────────────────────────────────
// Tracks left + right hand raises as reps
function detectMovement(landmarks, prevState, setRepState) {
  if (!landmarks || landmarks.length < 33) return prevState;

  const lw = landmarks[15]; // left wrist
  const rw = landmarks[16]; // right wrist
  const ls = landmarks[11]; // left shoulder
  const rs = landmarks[12]; // right shoulder

  if (!lw || !rw || !ls || !rs) return prevState;

  const leftRaised  = lw.visibility > 0.5 && lw.y < ls.y - 0.05;
  const rightRaised = rw.visibility > 0.5 && rw.y < rs.y - 0.05;

  const wasLeftRaised  = prevState.leftRaised;
  const wasRightRaised = prevState.rightRaised;

  let newReps = prevState.reps;
  // Count a rep on the falling edge (hand comes back down)
  if (wasLeftRaised && !leftRaised)  newReps++;
  if (wasRightRaised && !rightRaised) newReps++;

  return { leftRaised, rightRaised, reps: newReps };
}

// ─── Component ────────────────────────────────────────────────────────────────
const AITherapy = ({ onMovementDetected }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const poseRef     = useRef(null);
  const cameraRef   = useRef(null);
  const repStateRef = useRef({ leftRaised: false, rightRaised: false, reps: 0 });

  const [cameraOn,    setCameraOn]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [posture,     setPosture]     = useState({ good: true, reason: 'Start camera to begin' });
  const [reps,        setReps]        = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isActive,    setIsActive]    = useState(false);
  const [fps,         setFps]         = useState(0);
  const timerRef  = useRef(null);
  const frameRef  = useRef(0);
  const fpsTimer  = useRef(null);

  // FPS counter
  useEffect(() => {
    fpsTimer.current = setInterval(() => {
      setFps(frameRef.current);
      frameRef.current = 0;
    }, 1000);
    return () => clearInterval(fpsTimer.current);
  }, []);

  // Session timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Called by MediaPipe on every frame
  const onResults = useCallback((results) => {
    frameRef.current++;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lms = results.poseLandmarks;

    // Posture
    const p = analyzePosture(lms);
    setPosture(p);

    // Movement
    const prev    = repStateRef.current;
    const next    = detectMovement(lms, prev, setReps);
    repStateRef.current = next;
    if (next.reps !== prev.reps) {
      setReps(next.reps);
      if (onMovementDetected) onMovementDetected(next.reps);
    }

    // Draw skeleton
    drawSkeleton(ctx, lms, canvas.width, canvas.height, p.good);
  }, [onMovementDetected]);

  // Start camera + MediaPipe
  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load MediaPipe scripts
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');

      const Pose   = window.Pose;
      const Camera = window.Camera;

      if (!Pose || !Camera) throw new Error('MediaPipe failed to load');

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence:  0.6,
      });
      pose.onResults(onResults);
      poseRef.current = pose;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      await camera.start();
      cameraRef.current = camera;

      setCameraOn(true);
      setIsActive(true);
    } catch (err) {
      setError(err.message || 'Camera/MediaPipe error');
    } finally {
      setLoading(false);
    }
  }, [onResults]);

  // Stop camera
  const stopCamera = useCallback(async () => {
    setIsActive(false);
    if (cameraRef.current)   { cameraRef.current.stop();    cameraRef.current = null; }
    if (poseRef.current)     { await poseRef.current.close(); poseRef.current = null; }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setCameraOn(false);
  }, []);

  // Reset session
  const resetSession = () => {
    repStateRef.current = { leftRaised: false, rightRaised: false, reps: 0 };
    setReps(0);
    setSessionTime(0);
    setPosture({ good: true, reason: cameraOn ? 'Detecting...' : 'Start camera to begin' });
  };

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">

      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">AI Therapy</h2>
          <p className="text-xl text-slate-500 mt-2 font-medium">Real-time posture detection & movement tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {cameraOn && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE &bull; {fps} fps
            </div>
          )}
          <button
            onClick={cameraOn ? stopCamera : startCamera}
            disabled={loading}
            className={`flex items-center gap-3 px-7 py-4 rounded-2xl text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg active:scale-95 ${
              loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' :
              cameraOn
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300 shadow-red-200'
                : 'bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-300 shadow-blue-200'
            }`}
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Loading AI...</>
            ) : cameraOn ? (
              <><CameraOff className="w-6 h-6" /> Stop Camera</>
            ) : (
              <><Camera className="w-6 h-6" /> Start Camera</>
            )}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <AlertTriangle className="w-7 h-7 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">Error</p>
            <p className="text-base">{error}. Please allow camera permissions and ensure you are on Chrome.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Camera feed ── */}
        <div className="xl:col-span-2">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-slate-800">
            {/* Placeholder when camera off */}
            {!cameraOn && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-6">
                <div className="p-8 bg-slate-800 rounded-full border-2 border-slate-700">
                  <Camera className="w-20 h-20 opacity-40" />
                </div>
                <p className="text-2xl font-semibold opacity-50">Camera off</p>
                <p className="text-base opacity-30 text-center px-10">Click "Start Camera" to enable<br/>posture and movement detection</p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-6">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xl font-bold">Initialising AI model…</p>
                <p className="text-sm text-slate-400">Loading MediaPipe Pose (first load may take ~10s)</p>
              </div>
            )}
            {/* Video element (always mounted so ref is valid) */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              style={{ display: cameraOn ? 'block' : 'none', transform: 'scaleX(-1)' }}
            />
            {/* Canvas overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: cameraOn ? 'block' : 'none', transform: 'scaleX(-1)' }}
            />

            {/* In-video posture badge */}
            {cameraOn && (
              <div className={`absolute top-4 left-4 flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md font-bold text-lg border-2 transition-all duration-500 shadow-xl ${
                posture.good
                  ? 'bg-emerald-900/70 text-emerald-300 border-emerald-500/50'
                  : 'bg-red-900/70 text-red-300 border-red-500/50'
              }`}>
                {posture.good
                  ? <CheckCircle className="w-6 h-6" />
                  : <AlertTriangle className="w-6 h-6 animate-pulse" />
                }
                {posture.good ? 'Good Posture' : 'Incorrect Posture'}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats panel ── */}
        <div className="flex flex-col gap-6">

          {/* Posture card */}
          <div className={`p-8 rounded-3xl border-4 transition-all duration-500 shadow-lg ${
            posture.good
              ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100'
              : 'bg-red-50 border-red-300 shadow-red-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Posture</h3>
              {posture.good
                ? <CheckCircle className="w-8 h-8 text-emerald-500" />
                : <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              }
            </div>
            <p className={`text-4xl font-black tracking-tight ${posture.good ? 'text-emerald-600' : 'text-red-600'}`}>
              {posture.good ? 'Good Posture' : 'Incorrect Posture'}
            </p>
            <p className="text-lg text-slate-500 mt-2 font-medium">{posture.reason}</p>
          </div>

          {/* Reps card */}
          <div className="p-8 rounded-3xl bg-blue-700 text-white shadow-2xl shadow-blue-200 border-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-200 uppercase tracking-widest">Reps</h3>
              <Activity className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-8xl font-black tracking-tighter leading-none">{reps}</p>
            <p className="text-blue-200 text-lg mt-3 font-medium">Arm raises counted</p>
          </div>

          {/* Session timer */}
          <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-700 uppercase tracking-widest">Session</h3>
              {isActive
                ? <Pause className="w-8 h-8 text-slate-400" />
                : <Play  className="w-8 h-8 text-slate-400" />
              }
            </div>
            <p className="text-5xl font-black text-slate-900 tracking-tight font-mono">{formatTime(sessionTime)}</p>
            <p className="text-slate-400 text-lg mt-2 font-medium">Active time</p>
          </div>

          {/* Reset */}
          <button
            onClick={resetSession}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" /> Reset Session
          </button>
        </div>
      </div>

      {/* ── Exercise guide ── */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Hand Raise',
            icon: <Zap className="w-8 h-8" />,
            desc: 'Raise one or both arms above shoulder level. Lower them back down to complete a rep.',
            color: 'bg-amber-50 border-amber-200 text-amber-700',
            iconBg: 'bg-amber-100',
          },
          {
            title: 'Good Posture Cue',
            icon: <CheckCircle className="w-8 h-8" />,
            desc: 'Keep shoulders level and avoid leaning sideways. The skeleton turns green when posture is correct.',
            color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            iconBg: 'bg-emerald-100',
          },
          {
            title: 'Tracking Tips',
            icon: <Camera className="w-8 h-8" />,
            desc: 'Ensure good lighting and that your upper body is visible. Stay ~1–2 m from the camera.',
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            iconBg: 'bg-blue-100',
          },
        ].map((item) => (
          <div key={item.title} className={`p-7 rounded-3xl border-2 ${item.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-5`}>
              {item.icon}
            </div>
            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
            <p className="text-base opacity-80 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AITherapy;

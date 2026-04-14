import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Activity, CheckCircle, AlertTriangle, Play, Star, Heart, Zap, ArrowRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // upper body
  [11, 23], [12, 24], [23, 24],                      // torso
  [23, 25], [25, 27], [24, 26], [26, 28],            // legs
];

// ─── Task Pool (Adaptive difficulty) ─────────────────────────────────────────
const TASK_POOL = [
  { id: 1, name: 'Raise hand slowly', instruction: 'Lift your hand slowly up to the sky', duration: 15, tip: 'Keep your arm straight without forcing it.', focus: 'Arms' },
  { id: 2, name: 'Neck alignment correction', instruction: 'Keep your head straight and look forward', duration: 20, tip: 'Keep your chin parallel to the floor.', focus: 'Neck' },
  { id: 3, name: 'Shoulder relaxation', instruction: 'Drop your shoulders down and relax', duration: 25, tip: 'Breathe out and let shoulders fall gently.', focus: 'Posture' },
  { id: 4, name: 'Gentle seated stretch', instruction: 'Sit up tall and reach slightly forward', duration: 30, tip: 'Keep your back straight while reaching.', focus: 'Posture' },
  { id: 5, name: 'Arm extension forward', instruction: 'Reach both arms straight out in front', duration: 30, tip: 'Keep elbows extended comfortably.', focus: 'Arms' },
  { id: 6, name: 'Side arm lift', instruction: 'Raise arms out to your sides slowly', duration: 25, tip: 'Do not go higher than your shoulders.', focus: 'Arms' },
  { id: 7, name: 'Neck slow rotation', instruction: 'Slowly turn your head left, then right', duration: 20, tip: 'Move smoothly to avoid any discomfort.', focus: 'Neck' },
  { id: 8, name: 'Leg lift seated', instruction: 'Life your left leg slowly, then right leg', duration: 30, tip: 'Hold on to the chair for better support.', focus: 'Full body' },
  { id: 9, name: 'Wrist circles', instruction: 'Slowly rotate your wrists in a circle', duration: 15, tip: 'Keep your hands open and relaxed.', focus: 'Arms' },
  { id: 10, name: 'Torso twist seated', instruction: 'Gently rotate your upper body left and right', duration: 25, tip: 'Only go as far as feels comfortable.', focus: 'Full body' },
];

function getRandomTasks(count) {
  const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────
function drawSkeleton(ctx, landmarks, width, height, postureGood, isWarning) {
  if (!landmarks || landmarks.length === 0) return;

  const color = isWarning ? '#ef4444' : (postureGood ? '#22c55e' : '#f59e0b');
  const pointColor = isWarning ? '#fca5a5' : (postureGood ? '#86efac' : '#fcd34d');

  ctx.lineWidth = 4;
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

function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length < 33) return { good: false, warning: false, reason: 'Detecting...', tip: 'Make sure upper body is visible' };

  const ls = landmarks[11]; const rs = landmarks[12];
  const lh = landmarks[23]; const rh = landmarks[24];
  const nose = landmarks[0];

  if (!ls || !rs || !lh || !rh || !nose) return { good: false, warning: false, reason: 'Please make sure upper body is visible', tip: 'Move back a little' };
  if (ls.visibility < 0.5 || rs.visibility < 0.5) return { good: false, warning: false, reason: 'Move into frame', tip: 'Center yourself in the camera' };

  const shoulderTilt = Math.abs(ls.y - rs.y);
  const avgLean = Math.abs((ls.x - lh.x + rs.x - rh.x) / 2);
  
  if (avgLean > 0.25 || shoulderTilt > 0.2) {
    return { good: false, warning: true, reason: 'Please move slowly and safely!', tip: 'Avoid sudden leaning' };
  }
  if (shoulderTilt > 0.08) {
    return { good: false, warning: false, reason: 'Adjust posture: Shoulders uneven', tip: 'Try to drop the higher shoulder' };
  }
  if (avgLean > 0.15) {
    return { good: false, warning: false, reason: 'Adjust posture: Leaning sideways', tip: 'Center your weight' };
  }
  return { good: true, warning: false, reason: 'Perfect posture!', tip: 'Keep it up!' };
}

// ─── Main Component ──────────────────────────────────────────────────────────
const AITherapy = ({ onMovementDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  // System States
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Session Flow States
  // 0: Start, 1: Setup, 2: Assignment, 3: Perform, 4: Feedback, 5: Finished
  const [stepID, setStepID] = useState(0); 
  const [sessionTasks, setSessionTasks] = useState([]);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [stars, setStars] = useState(0);
  const [postureFeedback, setPostureFeedback] = useState({ good: false, warning: false, reason: 'Ready to start', tip: '' });
  const [notes, setNotes] = useState([]);

  // Timers & Speech
  const timerRef = useRef(null);
  const speechRef = useRef(window.speechSynthesis);

  const speak = useCallback((text) => {
    if (!speechRef.current) return;
    speechRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechRef.current.speak(utterance);
  }, []);

  // ─── Camera Methods ────────────────────────────────────────────────────────
  const onResults = useCallback((results) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lms = results.poseLandmarks;
    const feedback = analyzePosture(lms);
    setPostureFeedback(feedback);

    if (feedback.warning && stepID === 3) {
      speak("Please move slowly and safely");
    }

    drawSkeleton(ctx, lms, canvas.width, canvas.height, feedback.good, feedback.warning);
  }, [stepID, speak]);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');

      const Pose = window.Pose;
      const Camera = window.Camera;
      if (!Pose || !Camera) throw new Error('MediaPipe failed to load');

      const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
      pose.onResults(onResults);
      poseRef.current = pose;
      streamRef.current = stream;

      let stream;

try {
  await new Promise(resolve => setTimeout(resolve, 300)); // 🔥 ADD THIS LINE
stream = await navigator.mediaDevices.getUserMedia({ video: true });
streamRef.current = stream;

  if (!videoRef.current) {
  console.warn("⏳ Waiting for video element...");
  await new Promise(resolve => setTimeout(resolve, 300));
}


videoRef.current.srcObject = stream;

try {
  await videoRef.current.play();
} catch (e) {
  console.warn("⚠️ Video play failed:", e);
}
} catch (err) {
  console.error("Camera error:", err);
}

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) await poseRef.current.send({ image: videoRef.current });
        },
        width: 640, height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      setCameraOn(true);
    } catch (err) {
      setError(err.message || 'Camera error');
    } finally {
      setLoading(false);
    }
  }, [onResults]);

  const stopCamera = useCallback(async () => {
    if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
    if (poseRef.current) { await poseRef.current.close(); poseRef.current = null; }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setCameraOn(false);
  }, []);

  const initCamera = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    streamRef.current = stream;

    if (!videoRef.current) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    videoRef.current.srcObject = stream;
    await videoRef.current.play();

  } catch (err) {
    console.error("Camera error:", err);
  }
};
  useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    stopCamera();
    speechRef.current?.cancel();
  };
}, []);
  useEffect(() => {
    initCamera();
  }, [stepID]);
  // ─── Flow Logic ─────────────────────────────────────────────────────────────
  
  // Enter Setup
  const handleStartSession = async () => {
    speak("Let’s begin your session. Activating camera.");
    setStepID(1);
    
    // Check for personalized plan
    const savedPlan = localStorage.getItem('personalized_therapy_plan');
    let tasks = [];
    
    if (savedPlan) {
      tasks = JSON.parse(savedPlan);
      // Optional: Clear after use so next session starts fresh
      // localStorage.removeItem('personalized_therapy_plan');
    } else {
      tasks = getRandomTasks(3); // Fallback to 3 Random Tasks
    }
    
    setSessionTasks(tasks);
    setCurrentTaskIdx(0);
    setStars(0);
    setNotes([]);
    if (!cameraOn) await startCamera();
    
    // Auto progress to Task Assigned after 4s
    setTimeout(() => {
      setStepID(2);
    }, 4000);
  };

  // Run Task Flow Machine
  useEffect(() => {
    if (stepID === 2) {
      // Assignment Phase
      const tsk = sessionTasks[currentTaskIdx];
      speak(`Next task: ${tsk.name}. ${tsk.instruction}`);
      
      const to = setTimeout(() => {
        setTimeRemaining(tsk.duration);
        setStepID(3); // Go to Perform
        speak("Hold this position.");
      }, 5000);
      return () => clearTimeout(to);
    }
    
    if (stepID === 3) {
      // Perform Exercise Timer
      if (timeRemaining > 0) {
        timerRef.current = setTimeout(() => {
          // Only decrement if no warning
          if (!postureFeedback.warning) {
            setTimeRemaining(prev => {
  if (prev <= 0) return 0;
  return prev - 1;
});
          }
          if (postureFeedback.reason.includes('Adjust')) {
            if (Math.random() < 0.2) speak(postureFeedback.tip); // Occasional tip
          }
        }, 1000);
      } else {
        // Exercise done
        setStepID(4); // Feedback Phase
      }
      return () => clearTimeout(timerRef.current);
    }

    if (stepID === 4) {
      // Feedback Phase (Rewards)
      speak("Great job! Well done!");
      setStars(prev => prev + 1);
      
      const pFeed = postureFeedback.reason.includes('Adjust') ? "Needs improvement in form" : "Stable form maintained";
      setNotes(prev => [...prev, `${sessionTasks[currentTaskIdx].name}: ${pFeed}`]);

      const to = setTimeout(() => {
        if (currentTaskIdx < sessionTasks.length - 1) {
          setCurrentTaskIdx(prev => prev + 1);
          setStepID(2); // Next Assignment
        } else {
          setStepID(5); // Finished
          speak("Amazing work today! You completed all the exercises.");
          
          // Save to Parent Insights Dashboard
          const stored = JSON.parse(localStorage.getItem('parent_insights_history') || '[]');
          const totalDuration = sessionTasks.reduce((acc, t) => acc + t.duration, 0);
          
          stored.push({ 
            date: new Date().toISOString(), 
            exercise: 'AI Physio Session',
            tasksCompleted: sessionTasks.length,
            sessionTime: totalDuration,
            accuracy: 85 + Math.floor(Math.random() * 10), // Mock accuracy for now
            type: 'physio',
            notes: notes.join('. ')
          });
          localStorage.setItem('parent_insights_history', JSON.stringify(stored));

          if (onMovementDetected) onMovementDetected(stars + 1);
        }
      }, 4000);
      return () => clearTimeout(to);
    }

  }, [stepID, timeRemaining, currentTaskIdx, sessionTasks, speak]);


  // ─── Rendering Helpers ──────────────────────────────────────────────────────
  const currentEx = sessionTasks[currentTaskIdx];

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-3 mb-8 w-full max-w-lg mx-auto">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md ${
              stepID >= s 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              {stepID > s ? <CheckCircle className="w-5 h-5 text-white" /> : s}
            </div>
            {s < 5 && <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${stepID > s ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center justify-start overflow-x-hidden font-sans">
      
      {/* Header aligned center */}
      <div className="text-center mb-10 w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="inline-flex items-center justify-center gap-4 mb-3">
          <div className="p-3 bg-rose-100 rounded-3xl shadow-sm">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-100" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">AI Physio Coach</h2>
        </div>
        <p className="text-xl text-slate-500 font-medium">Structured, adaptive, and guided therapy system.</p>
      </div>

      {stepID > 0 && renderStepIndicator()}

      <div className="w-full max-w-5xl relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: START */}
          {stepID === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-slate-200 border-4 border-slate-100 text-center flex flex-col items-center justify-center"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Activity className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-4">Ready to start?</h3>
              <p className="text-lg text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                Connect your camera and follow the instructions. We will assign 3 dynamic exercises to complete today.
              </p>
              <button
                onClick={handleStartSession}
                className="group relative px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-black rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 w-1/2 translate-x-[-150%] skew-x-12 group-hover:animate-[shine_1s_ease-in-out_infinite]" />
                <Play className="w-8 h-8 fill-white" />
                START SESSION
              </button>

              {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center gap-3">
                  <AlertTriangle /> {error}
                </div>
              )}
            </motion.div>
          )}

          {/* SHARED CAMERA FOR STEPS 1 to 4 */}
          {stepID >= 1 && stepID <= 4 && (
            <motion.div
              key="shared-camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col lg:flex-row gap-8 items-stretch justify-center"
            >
              {/* Dynamic Action Card */}
              <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-4 border-slate-100 p-8 flex flex-col justify-center min-h-[500px]">
                <AnimatePresence mode="wait">
                  
                  {stepID === 1 && (
                    <motion.div key="setup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center">
                      <Camera className="w-16 h-16 text-indigo-400 mx-auto mb-6 animate-pulse" />
                      <h3 className="text-3xl font-black text-slate-800 mb-2">Camera Setup</h3>
                      <p className="text-slate-500 font-medium">Please step back so your upper body is visible...</p>
                      {loading && <div className="mt-6 w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />}
                    </motion.div>
                  )}

                  {stepID === 2 && currentEx && (
                    <motion.div key="assign" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-6">
                        {currentTaskIdx + 1}/3
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-4">{currentEx.name}</h3>
                      <p className="text-xl text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl mb-6">
                        {currentEx.instruction}
                      </p>
                      <div className="inline-flex gap-2 items-center bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold">
                        <Zap size={20} className="fill-indigo-700" />
                        Adaptive Duration: {currentEx.duration} sec
                      </div>
                    </motion.div>
                  )}

                  {stepID === 3 && currentEx && (
                    <motion.div key="perform" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
                      <h3 className="text-3xl font-black text-slate-800 mb-2 text-center">{currentEx.name}</h3>
                      <p className="text-center text-slate-500 font-medium mb-8 uppercase tracking-widest text-sm font-bold">Perform Exercise</p>
                      
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className={`relative w-48 h-48 rounded-full border-[12px] flex items-center justify-center transition-colors duration-500 shadow-xl ${
                          postureFeedback.warning ? 'border-red-500 bg-red-50 scale-105 animate-pulse' : 
                          postureFeedback.good ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50'
                        }`}>
                          <p className="text-6xl font-black tracking-tighter text-slate-800">{timeRemaining}</p>
                        </div>
                      </div>

                      {/* Real-time Feedback UI */}
                      <div className="mt-8">
                        <div className={`p-6 rounded-3xl transition-all duration-300 border-2 shadow-lg flex items-start gap-4 ${
                          postureFeedback.warning ? 'bg-red-900 border-red-500 text-white' :
                          postureFeedback.good ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          <div className={`mt-1 p-2 rounded-xl ${postureFeedback.warning ? 'bg-red-800' : postureFeedback.good ? 'bg-emerald-200' : 'bg-amber-200'}`}>
                            {postureFeedback.warning ? <AlertTriangle size={24} className="animate-ping" /> : postureFeedback.good ? <CheckCircle size={24} /> : <Lightbulb size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{postureFeedback.reason}</p>
                            <p className="opacity-80 text-sm mt-1">{postureFeedback.warning ? 'Halt movement!' : postureFeedback.tip}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {stepID === 4 && (
                    <motion.div key="feedback" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="text-center flex flex-col items-center justify-center h-full">
                      <Star size={100} className="text-amber-400 fill-amber-400 drop-shadow-xl animate-[spin_3s_linear_infinite] mb-6" />
                      <h3 className="text-5xl font-black text-slate-800 tracking-tight">Great Job!</h3>
                      <p className="text-2xl text-slate-500 mt-4 font-medium">+1 Star Earned</p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Camera Container (Always present in 1-4) */}
              <div className="flex-1 w-full lg:max-w-md relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-800 shrink-0 aspect-[3/4] lg:aspect-auto min-h-[500px]">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted style={{ transform: 'scaleX(-1)' }} />
                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50" style={{ transform: 'scaleX(-1)' }} />
                
                {/* Visual Task Guide Info Overlay in video */}
                {stepID >= 2 && stepID <= 4 && currentEx && (
                  <div className="absolute bottom-6 inset-x-4 z-20">
                    <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl">
                       <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Visual Guide Focus</p>
                       <p className="text-slate-200 text-sm font-medium">{currentEx.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINISHED */}
          {stepID === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-slate-200 border-4 border-slate-100 text-center"
            >
              <div className="flex justify-center mb-8 gap-4">
                {[...Array(sessionTasks.length)].map((_, i) => (
                  <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }} key={i}>
                    <Star size={80} className="text-amber-400 fill-amber-400 drop-shadow-lg" />
                  </motion.div>
                ))}
              </div>
              <h3 className="text-6xl font-black text-slate-800 tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">
                Session Complete!
              </h3>
              <p className="text-2xl text-slate-500 font-medium mb-12">
                You successfully finished {sessionTasks.length} tasks today.
              </p>
              
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => window.location.href='/dashboard'}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl font-bold rounded-2xl transition-all"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => setStepID(0)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-2xl transition-all shadow-lg flex items-center gap-3"
                >
                  Restart Session <ArrowRight />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global CSS for fancy shine effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% {
            transform: translateX(150%) skewX(12deg);
          }
        }
      `}} />
    </div>
  );
};

export default AITherapy;

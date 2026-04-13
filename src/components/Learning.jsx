import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

const Learning = ({ completedLearning = [], setCompletedLearning }) => {
  const SUBJECTS = [
    { 
      id: 'math', 
      title: "Math Basics", 
      videoUrl: "https://www.youtube.com/embed/8mve0UoSxTo", 
      colorClass: "bg-blue-600 hover:bg-blue-700" 
    },
    { 
      id: 'english', 
      title: "English Phonics", 
      videoUrl: "https://www.youtube.com/embed/0XzwB2S2Kow", 
      colorClass: "bg-purple-600 hover:bg-purple-700" 
    },
    { 
      id: 'science', 
      title: "Science: Solar System", 
      videoUrl: "https://www.youtube.com/embed/fGLbFj2E1Mo", 
      colorClass: "bg-green-600 hover:bg-green-700" 
    }
  ];

  const markLearned = (id) => {
    if (!completedLearning.includes(id)) {
      setCompletedLearning(prev => [...prev, id]);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-1000">
      <header className="mb-16 space-y-3">
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight flex items-center gap-6">
          <div className="p-4 bg-blue-100 rounded-3xl">
            <BookOpen className="w-12 h-12 text-blue-700" />
          </div>
          Learning Zone
        </h2>
        <p className="text-2xl md:text-3xl text-slate-500 font-medium">Watch interactive lessons and build your knowledge.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {SUBJECTS.map((subject, i) => {
          const isLearned = completedLearning.includes(subject.id);
          
          return (
            <div 
              key={subject.id} 
              className="bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="aspect-video w-full bg-slate-950 relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={subject.videoUrl} 
                  title={subject.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                ></iframe>
                {isLearned && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg z-10 animate-in zoom-in">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-10 flex flex-col gap-8">
                <div>
                  <h3 className={`text-4xl font-black mb-3 tracking-tight transition-colors ${isLearned ? 'text-gray-300 line-through' : 'text-slate-900 group-hover:text-blue-700'}`}>
                    {subject.title}
                  </h3>
                  <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${isLearned ? 'bg-gray-100' : 'bg-blue-600 group-hover:w-full'}`}></div>
                </div>
                <button 
                  onClick={() => markLearned(subject.id)}
                  disabled={isLearned}
                  className={`w-full py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 transition-all ${
                    isLearned 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : `${subject.colorClass} text-white shadow-xl hover:scale-105 active:scale-95 shadow-current/20`
                  }`}
                  aria-label={isLearned ? `Learned ${subject.title}` : `Mark ${subject.title} as Learned`}
                >
                  {isLearned ? (
                    <>
                      <CheckCircle className="w-10 h-10" />
                      LEARNED
                    </>
                  ) : (
                    "Mark as Learned"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learning;

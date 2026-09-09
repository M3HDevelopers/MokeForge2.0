import { useState, useEffect } from 'react';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main Content */}
      <div className={`relative z-10 text-center transition-all duration-1500 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {/* Decorative Border */}
        <div className="relative px-12 py-16 sm:px-20 sm:py-20">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400/60 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400/60 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400/60 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400/60 rounded-br-lg" />

          {/* Top decorative line */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400/60" />
            <div className="mx-3 w-2 h-2 rotate-45 bg-purple-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>

          {/* Name */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent tracking-wider animate-gradient">
            Mubashir Ahmed
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-purple-200/70 tracking-widest uppercase font-light">
            Welcome to my world
          </p>

          {/* Bottom decorative line */}
          <div className="flex items-center justify-center mt-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400/60" />
            <div className="mx-3 w-2 h-2 rotate-45 bg-purple-400/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-400/60" />
          </div>
        </div>
      </div>

      {/* Floating rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] border border-purple-500/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] border border-pink-500/5 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
      </div>
    </div>
  );
}

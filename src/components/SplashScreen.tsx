import { useEffect, useState, useRef } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  const loadingSteps = [
    "Initializing systems...",
    "Loading AI models...",
    "Connecting to health services...",
    "Preparing your dashboard...",
    "Welcome to AtherCare!",
  ];

  // ── Particle canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number;
      size: number;
      speedX: number; speedY: number;
      opacity: number;
      pulse: number;
      color: string;
    }

    const colors = ["0,212,255", "124,58,237", "16,185,129", "244,63,94"];
    const particles: Particle[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x, dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Progress loader & phase transitions ──────────────────────
  useEffect(() => {
    // Phase: enter → hold (after 400ms)
    const enterTimer = setTimeout(() => setPhase("hold"), 400);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (phase !== "hold") return;

    let step = 0;
    const totalDuration = 2800; // ms for progress to reach 100
    const interval = 40;
    const increment = (interval / totalDuration) * 100;

    const ticker = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        // Update loading text based on progress
        const textIdx = Math.min(
          Math.floor((next / 100) * loadingSteps.length),
          loadingSteps.length - 1
        );
        setLoadingText(loadingSteps[textIdx]);
        return next;
      });
      step++;
    }, interval);

    // Exit phase after totalDuration + small buffer
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      setTimeout(onFinish, 600);
    }, totalDuration + 400);

    return () => {
      clearInterval(ticker);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isEntering = phase === "enter";
  const isExiting = phase === "exit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, #0a0f1e 0%, #050810 40%, #0d0818 100%)",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.03)" : "scale(1)",
        transition: isExiting ? "opacity 0.6s ease, transform 0.6s ease" : "none",
      }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0,212,255,0.07) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(124,58,237,0.07) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Main card */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: isEntering ? 0 : 1,
          transform: isEntering ? "translateY(28px) scale(0.96)" : "translateY(0) scale(1)",
          transition: "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Logo ring + icon */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer spinning ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 140,
              height: 140,
              border: "2px solid transparent",
              borderTopColor: "rgba(0,212,255,0.7)",
              borderRightColor: "rgba(124,58,237,0.4)",
              borderRadius: "50%",
              animation: "splash-spin 2.5s linear infinite",
            }}
          />
          {/* Middle dashed ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 112,
              height: 112,
              border: "1px dashed rgba(16,185,129,0.3)",
              animation: "splash-spin-rev 4s linear infinite",
            }}
          />
          {/* Icon background */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 88,
              height: 88,
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
              border: "1px solid rgba(0,212,255,0.3)",
              boxShadow: "0 0 40px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05)",
              animation: "splash-pulse 2.5s ease-in-out infinite",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5C20 5 8 11 8 21C8 27.627 13.373 33 20 33C26.627 33 32 27.627 32 21C32 11 20 5 20 5Z"
                fill="url(#heartGrad)"
                opacity="0.9"
              />
              <path
                d="M20 10L22 17H29L23.5 21.5L25.5 28.5L20 24L14.5 28.5L16.5 21.5L11 17H18L20 10Z"
                fill="white"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="heartGrad" x1="8" y1="5" x2="32" y2="33" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4ff" />
                  <stop offset="0.5" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center mb-2">
          <h1
            className="font-bold tracking-wide"
            style={{
              fontSize: "2.4rem",
              background: "linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.04em",
              lineHeight: 1.1,
            }}
          >
            AtherCare
          </h1>
          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              color: "rgba(0,212,255,0.6)",
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            MedAI Platform
          </div>
        </div>

        {/* Tagline */}
        <p
          className="text-center mt-2 mb-10"
          style={{
            color: "rgba(148,163,184,0.7)",
            fontSize: "0.9rem",
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          AI-Powered Healthcare · Skin Detection · Blood Analysis
        </p>

        {/* Progress bar */}
        <div className="w-72 mb-4">
          <div
            className="rounded-full overflow-hidden"
            style={{
              height: 4,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00d4ff, #7c3aed, #10b981)",
                boxShadow: "0 0 10px rgba(0,212,255,0.6)",
                transition: "width 0.04s linear",
              }}
            />
          </div>
        </div>

        {/* Loading text + percentage */}
        <div className="flex items-center justify-between w-72">
          <span
            style={{
              color: "rgba(148,163,184,0.6)",
              fontSize: "0.75rem",
              letterSpacing: "0.03em",
            }}
          >
            {loadingText}
          </span>
          <span
            style={{
              color: "rgba(0,212,255,0.7)",
              fontSize: "0.75rem",
              fontVariantNumeric: "tabular-nums",
              minWidth: 36,
              textAlign: "right",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>

        {/* Feature badges */}
        <div className="flex gap-3 mt-10 flex-wrap justify-center">
          {[
            { icon: "🔬", label: "Skin AI" },
            { icon: "🩸", label: "Blood AI" },
            { icon: "💬", label: "Chatbot" },
            { icon: "🏥", label: "Hospitals" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.72rem",
                color: "rgba(148,163,184,0.7)",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Bottom credit */}
        <div
          className="mt-10"
          style={{ color: "rgba(100,116,139,0.4)", fontSize: "0.65rem", letterSpacing: "0.1em" }}
        >
          POWERED BY AI · BUILT FOR HEALTHCARE
        </div>
      </div>

      {/* CSS animations via <style> tag */}
      <style>{`
        @keyframes splash-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splash-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes splash-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05); }
          50%       { box-shadow: 0 0 60px rgba(0,212,255,0.35), inset 0 0 30px rgba(0,212,255,0.1); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

import Link from "next/link";
import GradientText from "@/components/GradientText";

const RAIN_ITEMS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${6 + Math.random() * 4}s`,
  opacity: 0.1 + Math.random() * 0.15,
}));

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden">
      {/* 雨滴背景 - 覆盖整个页面 */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {RAIN_ITEMS.map((item) => (
          <span
            key={item.id}
            className="absolute text-2xl font-bold text-neutral-400 animate-rain"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              opacity: item.opacity,
            }}
          >
            404
          </span>
        ))}
      </div>

      {/* 主内容 */}
      <GradientText className="text-6xl font-bold md:text-8xl animate-slime-bounce z-10">
        404
      </GradientText>
      <p className="mt-4 text-lg text-neutral-500 z-10">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-neutral-900 px-6 py-3 text-sm text-white transition-colors hover:bg-neutral-800 z-10"
      >
        Go Home
      </Link>

      <style>{`
        .animate-slime-bounce {
          animation: slime-bounce 2s ease-in-out infinite;
        }
        @keyframes slime-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes rain {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(180deg);
            opacity: 0;
          }
        }
        .animate-rain {
          animation: rain 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

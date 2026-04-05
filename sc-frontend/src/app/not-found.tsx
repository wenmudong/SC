import Link from "next/link";
import GradientText from "@/components/GradientText";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <GradientText className="text-6xl font-bold md:text-8xl animate-slime-bounce">
        404
      </GradientText>
      <p className="mt-4 text-lg text-neutral-500">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-neutral-900 px-6 py-3 text-sm text-white transition-colors hover:bg-neutral-800"
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
      `}</style>
    </div>
  );
}

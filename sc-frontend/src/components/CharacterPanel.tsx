import Image from "next/image";

interface ProgressBarProps {
  label: string;
  name: string;
  value: number;
  max: number;
  color: string;
}

function ProgressBar({ label, name, value, max, color }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-medium text-neutral-400">{label}</span>
      <div className="flex-1 h-2 bg-neutral-200 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-xs text-neutral-700 text-right">{value}</span>
    </div>
  );
}

// 静态常量，避免 hydration mismatch
const STATIC_AGE = 24; // 2001-09-15 出生，到 2026-04-05 为 24 岁
const HEIGHT = 173;
const WEIGHT = 75;

export default function CharacterPanel() {
  return (
    <div className="bg-neutral-50 rounded-lg p-6 flex flex-col items-center gap-6 transition-colors hover:bg-neutral-100">
      {/* 人物立绘 */}
      <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-neutral-300">
        <Image
          src="/images/b.jpg"
          alt="人物立绘"
          fill
          sizes="192px"
          loading="eager"
          className="object-cover"
        />
      </div>

      {/* 昵称 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Wenmudong</h2>
      </div>

      {/* 进度条区域 */}
      <div className="w-full flex flex-col gap-4">
        {/* LVL - 年龄 */}
        <ProgressBar
          label="LVL"
          name="年龄"
          value={STATIC_AGE}
          max={100}
          color="#22c55e"
        />

        {/* HP - 身高 */}
        <ProgressBar
          label="HP"
          name="身高"
          value={HEIGHT}
          max={200}
          color="#ef4444"
        />

        {/* MP - 体重 */}
        <ProgressBar
          label="MP"
          name="体重"
          value={WEIGHT}
          max={100}
          color="#3b82f6"
        />
      </div>
    </div>
  );
}

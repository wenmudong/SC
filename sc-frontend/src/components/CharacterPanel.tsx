import Image from "next/image";

// 计算年龄（基于出生日期 2001-09-15）
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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

export default function CharacterPanel() {
  const age = calculateAge("2001-09-15");

  return (
    <div className="bg-neutral-50 rounded-lg p-6 flex flex-col items-center gap-6 transition-colors hover:bg-neutral-100">
      {/* 人物立绘 */}
      <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-neutral-300">
        <Image
          src="/images/b.jpg"
          alt="人物立绘"
          fill
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
          value={age}
          max={100}
          color="#22c55e"
        />

        {/* HP - 身高 */}
        <ProgressBar
          label="HP"
          name="身高"
          value={173}
          max={200}
          color="#ef4444"
        />

        {/* MP - 体重 */}
        <ProgressBar
          label="MP"
          name="体重"
          value={75}
          max={100}
          color="#3b82f6"
        />
      </div>
    </div>
  );
}

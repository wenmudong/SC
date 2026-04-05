import PageHeader from "@/components/PageHeader";
import CharacterPanel from "@/components/CharacterPanel";

export default function Home() {
  return (
    <>
      <PageHeader title="Wenmudong." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左栏：角色面板 - 1/3 宽度 */}
        <div className="md:col-span-1">
          <CharacterPanel />
        </div>

        {/* 右栏：简历面板占位 - 2/3 宽度 */}
        <div className="md:col-span-2">
          <div className="bg-neutral-50 rounded-lg p-6 min-h-96 transition-colors hover:bg-neutral-100">
            <div className="text-neutral-400 text-sm">简历面板（占位）</div>
          </div>
        </div>
      </div>
    </>
  );
}

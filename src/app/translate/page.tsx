import { UploadArea } from "@/components/upload-area";
import { TranslationTasks } from "@/components/translation-tasks";
import { mockTasks } from "@/lib/mock-data";

export default function TranslatePage() {
  return (
    <div className="space-y-8">
      <UploadArea />
      <TranslationTasks tasks={mockTasks} />
    </div>
  );
}

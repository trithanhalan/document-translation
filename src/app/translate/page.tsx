import { UploadArea } from "@/components/upload-area";
import { TranslationTasks } from "@/components/translation-tasks";

export default function TranslatePage() {
  return (
    <div className="space-y-8">
      <UploadArea />
      <TranslationTasks />
    </div>
  );
}

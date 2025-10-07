import { TranslationView } from "@/components/translation-view";
import { sampleDocument, sampleGlossary } from "@/lib/data";

export default function Home() {
  return <TranslationView document={sampleDocument} glossary={sampleGlossary} />;
}

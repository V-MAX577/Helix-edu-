import { LocalLearningWorkspace } from "@/components/local-workspace";

export const metadata = {
  title: "HELIXEDU Learning Workspace",
  description: "A device-only learning workspace with offline lessons, quizzes, flashcards, notes and a local study assistant.",
};

export default function DemoPage() {
  return <LocalLearningWorkspace />;
}


import FileUpload from "@/components/FileUpload";
import AskSection from "@/components/AskSection";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 bg-background">
      <h1 className="text-3xl font-bold text-center mb-8">InteliDoc Assist</h1>
      <FileUpload />
      <AskSection />
    </main>
  );
}

import { TutorNav } from "@/components/tutor/tutor-nav";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col bg-background">
      <TutorNav />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}

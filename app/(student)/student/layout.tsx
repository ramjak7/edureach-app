import { StudentNav } from "@/components/student/student-nav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col bg-background">
      <StudentNav />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}

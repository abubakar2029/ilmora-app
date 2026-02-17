import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-4 pt-16 pb-8 lg:px-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}

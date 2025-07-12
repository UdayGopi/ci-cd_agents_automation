import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AIChat from "./AIChat";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AIChat />
    </div>
  );
}

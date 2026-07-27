
import './globals.css';
import Link from 'next/link';
import { Search, Bell, Sparkles, LayoutDashboard, BrainCircuit, Network, GitPullRequest } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-slate-50 flex h-screen overflow-hidden font-sans">
        
        {/* Navigation Sidebar */}
        <aside className="w-16 flex flex-col items-center py-4 bg-zinc-900 border-r border-zinc-800 space-y-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] cursor-pointer">
            CH
          </div>
          <nav className="flex flex-col space-y-6 text-zinc-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors" title="Workspace"><LayoutDashboard size={24} /></Link>
            <Link href="/studio" className="hover:text-indigo-400 transition-colors text-indigo-400" title="CerebroStudio"><GitPullRequest size={24} /></Link>
            <Link href="/mission-control" className="hover:text-indigo-400 transition-colors" title="Mission Control"><BrainCircuit size={24} /></Link>
            <Link href="/knowledge-graph" className="hover:text-indigo-400 transition-colors" title="Knowledge Graph"><Network size={24} /></Link>
          </nav>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Bar / Global Search */}
          <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950/50 backdrop-blur-md z-10">
            <div className="flex items-center bg-zinc-900 rounded-lg px-3 py-1.5 border border-zinc-700 w-96 group focus-within:border-indigo-500 transition-colors">
              <Search size={16} className="text-zinc-500 group-focus-within:text-indigo-400" />
              <input type="text" placeholder="Search commands, agents, workflows (Cmd+K)" className="bg-transparent border-none outline-none ml-2 text-sm w-full text-zinc-300 placeholder-zinc-600" />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-zinc-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 cursor-pointer"></div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          
          {/* AI Copilot Floating Action */}
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 z-50">
            <Sparkles size={20} className="text-white" />
          </button>
        </div>

      </body>
    </html>
  );
}

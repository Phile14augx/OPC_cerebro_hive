import TaskGraphViewer from "./components/TaskGraphViewer";
import EventStream from "./components/EventStream";
import ObservabilityDashboard from "./components/ObservabilityDashboard";

export default function CerebroStudioPage() {
  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
          CerebroStudio™
        </h1>
        <div className="flex space-x-4">
          <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm font-medium border border-green-800">
            Runtime: Online
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Intelligence Workspace (Task Graph) */}
        <section className="lg:col-span-2 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-700 bg-neutral-800/50">
            <h2 className="text-xl font-semibold">Intelligence: Task Graph</h2>
          </div>
          <div className="flex-grow p-4">
            <TaskGraphViewer />
          </div>
        </section>

        {/* Operations Workspace (Event Stream) */}
        <section className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-700 bg-neutral-800/50">
            <h2 className="text-xl font-semibold">Operations: Event Stream</h2>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            <EventStream />
          </div>
        </section>
      </div>

      {/* Observability Workspace */}
      <section className="h-64 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-neutral-700 bg-neutral-800/50">
          <h2 className="text-xl font-semibold">Platform Observability</h2>
        </div>
        <div className="flex-grow p-4 flex items-center justify-center">
          <ObservabilityDashboard />
        </div>
      </section>
    </div>
  );
}

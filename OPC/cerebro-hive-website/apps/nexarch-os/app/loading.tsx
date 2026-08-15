export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 border border-os-border bg-os-surface" />
      <div className="grid grid-cols-4 gap-3">
        <div className="h-24 border border-os-border bg-os-surface" />
        <div className="h-24 border border-os-border bg-os-surface" />
        <div className="h-24 border border-os-border bg-os-surface" />
        <div className="h-24 border border-os-border bg-os-surface" />
      </div>
      <div className="h-64 border border-os-border bg-os-surface" />
    </div>
  );
}

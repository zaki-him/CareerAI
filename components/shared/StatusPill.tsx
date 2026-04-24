import { TaskStatus } from "@/lib/types";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function StatusPill({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (next: TaskStatus) => void;
}) {
  const nextStatus: TaskStatus =
    status === "todo" ? "in-progress" : status === "in-progress" ? "done" : "todo";
  const label = status === "todo" ? "Not started" : status === "in-progress" ? "In progress" : "Done";
  const Icon = status === "done" ? CheckCircle2 : status === "in-progress" ? Clock : Target;

  return (
    <button
      type="button"
      onClick={() => onChange(nextStatus)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md",
        status === "done"
          ? "border-emerald-500/60 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-600 dark:text-emerald-400"
          : status === "in-progress"
          ? "border-amber-500/60 bg-gradient-to-r from-amber-500/10 to-amber-400/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-secondary/70 text-muted-foreground hover:border-primary/40"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

export default StatusPill;
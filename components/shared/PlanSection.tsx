import { Target, TrendingUp, Calendar, Sparkles, Lightbulb, Network, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateMonthProgress, calculatePlanProgress } from "@/lib/plan";
import { UserProfile } from "@/lib/types";
import { Plan, MonthPlan, TaskStatus } from "@/lib/types";
import StatusPill from "./StatusPill";

export default function PlanSection({
  profile,
  plan,
  selectedMonth,
  onSelectMonth,
  onUpdateTaskStatus,
  onStartMonth,
}: {
  profile: UserProfile | null;
  plan: Plan;
  selectedMonth: MonthPlan | null;
  onSelectMonth: (id: string) => void;
  onUpdateTaskStatus: (monthId: string, taskId: string, status: TaskStatus) => void;
  onStartMonth: (monthId: string) => void;
}) {
  const overall = calculatePlanProgress(plan);

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight sm:text-lg">Your 12‑month journey</h2>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {profile?.desiredRole
                  ? `A realistic path from ${profile.currentRole || "where you are now"} to ${
                      profile.desiredRole
                    }.`
                  : "A structured plan that turns long‑term goals into monthly, doable steps."}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Overall progress</p>
              <p className="text-2xl font-bold tracking-tight">
                {overall}
                <span className="text-sm text-muted-foreground">%</span>
              </p>
            </div>
            <div className="relative h-2.5 w-40 overflow-hidden rounded-full bg-secondary/70 shadow-inner">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-emerald-500 shadow-sm transition-all duration-500"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.5fr)]">
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold uppercase tracking-wide text-foreground/80">Monthly themes</p>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{plan.months.length} months</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {plan.months.map((month) => {
              const monthProgress = calculateMonthProgress(month);
              const isActive = selectedMonth?.id === month.id;
              const isStarted = month.tasks.some((task) => task.status !== "todo");
              return (
                <button
                  key={month.id}
                  type="button"
                  onClick={() => onSelectMonth(month.id)}
                  className={cn(
                    "group flex flex-col items-start gap-2 rounded-lg border px-3.5 py-3 text-left text-xs transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  {isActive && (
                    <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-xl" />
                  )}
                  <div className="relative flex w-full items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                          isActive
                            ? "bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-sm"
                            : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        {month.index}
                      </span>
                      <div className="text-sm font-bold leading-tight">{month.title}</div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        monthProgress === 100
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {monthProgress}%
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isStarted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isStarted ? "Started" : "Not started"}
                  </span>
                  <p className="relative line-clamp-2 text-xs leading-relaxed text-muted-foreground">{month.theme}</p>
                  <div className="relative mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60 shadow-inner">
                    <div
                      className={cn(
                        "h-full rounded-full shadow-sm transition-all duration-500",
                        monthProgress === 100
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-primary to-emerald-500"
                      )}
                      style={{ width: `${monthProgress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          {selectedMonth ? (
            <>
              {selectedMonth.tasks.every((task) => task.status === "todo") && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Ready to begin {selectedMonth.title}? Start now and we will mark your first task
                      as in progress.
                    </p>
                    <button
                      type="button"
                      onClick={() => onStartMonth(selectedMonth.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Start this month
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Focus for {selectedMonth.title.toLowerCase()}
                  </p>
                  <h3 className="mt-1.5 text-base font-bold leading-tight">{selectedMonth.theme}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{selectedMonth.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Complete</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {calculateMonthProgress(selectedMonth)}
                    <span className="text-sm text-muted-foreground">%</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {selectedMonth.tasks.map((task) => {
                  const CategoryIcon = {
                    learning: Lightbulb,
                    hobby: Sparkles,
                    work: Briefcase,
                  }[task.category] || Target;

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-xs transition-colors hover:border-primary/40 hover:bg-accent/30"
                    >
                      <div className="mt-0.5 shrink-0">
                        <StatusPill
                          status={task.status}
                          onChange={(next) => onUpdateTaskStatus(selectedMonth.id, task.id, next)}
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold leading-tight">{task.title}</p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Pick a month to see your focus tasks</p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Each month balances learning, practice, networking, and reflection so you're always moving forward.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}



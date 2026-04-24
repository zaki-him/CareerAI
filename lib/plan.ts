import { MonthPlan, Plan } from "./types";

export function calculateMonthProgress(month: MonthPlan): number {
  if (!month.tasks || month.tasks.length === 0) return 0;
  const completedTasks = month.tasks.filter((task) => task.status === "done").length;
  return Math.round((completedTasks / month.tasks.length) * 100);
}

export function calculatePlanProgress(plan: Plan): number {
  if (!plan.months || plan.months.length === 0) return 0;
  const totalProgress = plan.months.reduce((acc, month) => acc + calculateMonthProgress(month), 0);
  return Math.round(totalProgress / plan.months.length);
}

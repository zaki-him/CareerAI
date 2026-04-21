export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: "learning" | "hobby" | "work";
  status: TaskStatus;
}

export type MonthPlan = {
  id: string
  title: string
  tasks: Task[]
  index: number
  theme: string
  summary: string
}

export type Plan = {
  id: string
  months: MonthPlan[]
}

export type UserProfile = {
  name: string;
  currentRole: string;
  yearsExperience: string;
  desiredRole: string;
  timePerWeek: string;
  constraints: string;
  challenges: string;
};

export type AppStage = "onboarding" | "plan";

export type ChatMessage = {
  id: string;
  from: "user";
  content: string;
  timestamp: number;
};

export type AppState = {
  stage: AppStage;
  profile: UserProfile | null;
  plan: Plan | null;
  selectedMonthId: string | null;
  chat: ChatMessage[];
};
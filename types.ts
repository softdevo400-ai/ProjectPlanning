
export enum UserRole {
  CHAIRMAN = 'Chairman',
  PROGRAMME_OFFICER = 'Programme Officer',
  PROJECT_DIRECTOR = 'Project Director'
}

export enum DashboardTab {
  TOTAL_PROJECTS = 'Total Projects',
  APPROVED_BUDGET = 'Approved Budget',
  EXPENDITURE = 'Expenditure'
}

export enum ProjectCategory {
  LAUNCH_VEHICLE = 'Launch Vehicles',
  SATELLITE_INFRA = 'Satellite Infrastructure',
  USER_FUNDED = 'User Funded Projects'
}

export enum SidebarView {
  OVERALL = 'Overall Dashboard',
  LAUNCH_VEHICLES = 'Launch Vehicles',
  SATELLITE_INFRA = 'Satellite Infrastructure',
  USER_FUNDED = 'User Funded Projects'
}

export interface ExpenditureBreakup {
  category: string;
  allocated: number;
  spent: number;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  status: 'In Progress' | 'Completed' | 'Delayed' | 'Planning';
  progress: number;
  startDate: string;
  endDate: string;
  totalBudget: number;
  spentBudget: number;
  director: string;
  description: string;
  breakup: ExpenditureBreakup[];
}

export interface DashboardStats {
  totalProjects: number;
  approvedBudget: number;
  totalExpenditure: number;
  activeMissions: number;
}

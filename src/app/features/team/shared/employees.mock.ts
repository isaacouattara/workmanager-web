import type { Department, Employee, TaskState } from './employee.model';

/**
 * Données de démonstration (100 employés). Remplacées plus tard par GET /api/employees.
 * Les 8 premiers reprennent la maquette ; les autres sont générés de façon DÉTERMINISTE
 * (mêmes valeurs à chaque rechargement) pour tester tri, filtres et pagination.
 */
type Seed = [string, 'male' | 'female', Department, string, Employee['status'], string, boolean, number, number, TaskState, string];

const FIRST_SEEDS: Seed[] = [
  ['Jorg Rownlig', 'male', 'Marketing', 'Manager', 'active', '2024-08-24', true, 29, 30, 'done', 'Review final UI assets for marketing'],
  ['Sarah Collins', 'female', 'Finance', 'Finance Manager', 'inactive', '2025-01-14', false, 35, 40, 'in-progress', 'Coordinate quarterly budget review'],
  ['Jasmine Dizzy', 'female', 'Engineer', 'Sr. Dev ops', 'active', '2023-02-12', true, 13, 20, 'in-progress', 'Prepare deployment pipeline'],
  ['Michael Tan', 'male', 'HR', 'HR Specialist', 'vacation', '2022-03-03', true, 34, 40, 'in-progress', 'Supervise onboarding checklist'],
  ['Emily Johnson', 'female', 'Finance', 'Accountant', 'active', '2024-07-22', false, 38, 40, 'in-progress', 'Plan and delegate invoicing tasks'],
  ['Olivia Brown', 'female', 'IT', 'Software Engineer', 'active', '2023-06-18', true, 19, 20, 'done', 'Refine interaction patterns'],
  ['Daniel Smith', 'male', 'Marketing', 'Content Strategist', 'active', '2021-11-05', true, 5, 40, 'none', ''],
  ['Kevin Lee', 'male', 'Engineer', 'Jr. Front End Dev', 'vacation', '2024-09-10', true, 44, 40, 'in-progress', 'Build the dashboard layout'],
];

const FIRST_F = ['Sophie', 'Maya', 'Amelia', 'Chloe', 'Nora', 'Lina', 'Grace', 'Hannah', 'Alexandra', 'Zoe', 'Ava', 'Ruth'];
const FIRST_M = ['James', 'Marcus', 'Noah', 'Liam', 'Ethan', 'Lucas', 'Adam', 'Samuel', 'Victor', 'Leo', 'Oscar', 'Hugo'];
const LAST = ['Kim', 'Green', 'Morgan', 'Carter', 'Rivera', 'Cho', 'Ruiz', 'Patel', 'Bennett', 'Hayes', 'Novak', 'Duval', 'Keita', 'Diallo', 'Mensah', 'Costa'];

const ROLES: Record<Department, string[]> = {
  Marketing: ['Manager', 'Content Strategist', 'SEO Specialist', 'Brand Designer'],
  Finance: ['Finance Manager', 'Accountant', 'Financial Analyst'],
  Engineer: ['Sr. Dev ops', 'Jr. Front End Dev', 'Backend Developer', 'QA Engineer'],
  HR: ['HR Specialist', 'Recruiter', 'HR Manager'],
  IT: ['Software Engineer', 'System Admin', 'Network Engineer'],
};
const SKILLS: Record<Department, string[]> = {
  Marketing: ['SEO', 'Copywriting', 'Analytics'],
  Finance: ['Budgeting', 'Excel', 'Audit'],
  Engineer: ['Angular', 'Spring Boot', 'Docker'],
  HR: ['Recruiting', 'Onboarding', 'Payroll'],
  IT: ['Networking', 'Security', 'Cloud'],
};
const TASKS = ['Review sprint backlog', 'Update documentation', 'Prepare monthly report', 'Audit access rights', 'Plan team workshop', 'Fix reported issues', 'Draft project proposal'];
const DEPTS: Department[] = ['Marketing', 'Finance', 'Engineer', 'HR', 'IT'];
const RATIOS = [0.97, 0.87, 0.65, 0.95, 0.8, 1.1, 0.5, 0.9, 0.4];
const STATES: TaskState[] = ['done', 'in-progress', 'in-progress', 'none'];

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const pad = (n: number) => String(n).padStart(2, '0');

function build(seeds: Seed[]): Employee[] {
  return seeds.map(([name, gender, department, role, status, joiningDate, verified, logged, capacity, state, task], i) => ({
    id: `e${i + 1}`,
    name,
    email: `${slug(name)}@gmail.com`,
    verified,
    gender,
    department,
    role,
    status,
    joiningDate,
    loggedHours: logged,
    capacityHours: capacity,
    skills: SKILLS[department].slice(0, 2),
    task: state === 'none' ? null : { title: task, state },
  }));
}

function generate(count: number, startIndex: number): Employee[] {
  const seen = new Map<string, number>();
  return Array.from({ length: count }, (_, i): Employee => {
    const n = startIndex + i;
    const gender = n % 2 === 0 ? 'female' : 'male';
    const first = (gender === 'female' ? FIRST_F : FIRST_M)[(n * 5 + 1) % 12];
    const last = LAST[(n * 7 + 3) % 16];
    const department = DEPTS[n % 5];
    const capacity = [40, 40, 30, 20][n % 4];
    const base = slug(first + last);
    const dup = seen.get(base) ?? 0;
    seen.set(base, dup + 1);
    const state = STATES[n % 4];
    return {
      id: `e${n + 1}`,
      name: `${first} ${last}`,
      email: `${base}${dup ? dup : ''}@gmail.com`,
      verified: n % 6 !== 1,
      gender,
      department,
      role: ROLES[department][n % ROLES[department].length],
      status: n % 13 === 5 ? 'inactive' : n % 9 === 3 ? 'vacation' : 'active',
      joiningDate: `${2021 + (n % 5)}-${pad(((n * 5) % 12) + 1)}-${pad(((n * 11) % 28) + 1)}`,
      loggedHours: Math.round(capacity * RATIOS[n % 9]),
      capacityHours: capacity,
      skills: SKILLS[department].slice(n % 2, (n % 2) + 2),
      task: state === 'none' ? null : { title: TASKS[n % TASKS.length], state },
    };
  });
}

export const EMPLOYEES: Employee[] = [...build(FIRST_SEEDS), ...generate(92, FIRST_SEEDS.length)];

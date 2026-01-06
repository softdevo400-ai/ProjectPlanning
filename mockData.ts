
import { Project, ProjectCategory } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'LV-01',
    name: 'Nebula-X Heavy Lift',
    category: ProjectCategory.LAUNCH_VEHICLE,
    status: 'In Progress',
    progress: 75,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    totalBudget: 450000000,
    spentBudget: 320000000,
    director: 'Dr. Sarah Chen',
    description: 'Next generation heavy lift vehicle for lunar missions.',
    breakup: [
      { category: 'Propulsion R&D', allocated: 150000000, spent: 120000000 },
      { category: 'Structural Components', allocated: 100000000, spent: 85000000 },
      { category: 'Avionics', allocated: 80000000, spent: 60000000 },
      { category: 'Testing & Logistics', allocated: 120000000, spent: 55000000 }
    ]
  },
  {
    id: 'LV-02',
    name: 'SmallSat Express',
    category: ProjectCategory.LAUNCH_VEHICLE,
    status: 'Delayed',
    progress: 40,
    startDate: '2024-03-01',
    endDate: '2026-06-30',
    totalBudget: 120000000,
    spentBudget: 45000000,
    director: 'Robert Miller',
    description: 'Rapid deployment launcher for small satellite constellations.',
    breakup: [
      { category: 'Engine Development', allocated: 40000000, spent: 15000000 },
      { category: 'Platform Systems', allocated: 30000000, spent: 10000000 },
      { category: 'Ground Station Integration', allocated: 20000000, spent: 12000000 },
      { category: 'Safety & Quality', allocated: 30000000, spent: 8000000 }
    ]
  },
  {
    id: 'SI-01',
    name: 'GeoScan 360',
    category: ProjectCategory.SATELLITE_INFRA,
    status: 'In Progress',
    progress: 90,
    startDate: '2022-06-01',
    endDate: '2024-12-31',
    totalBudget: 280000000,
    spentBudget: 265000000,
    director: 'Elena Petrov',
    description: 'High-resolution hyperspectral earth observation satellite network.',
    breakup: [
      { category: 'Sensor Suite', allocated: 120000000, spent: 115000000 },
      { category: 'Data Link System', allocated: 60000000, spent: 55000000 },
      { category: 'Solar Array Panels', allocated: 40000000, spent: 40000000 },
      { category: 'Payload Integration', allocated: 60000000, spent: 55000000 }
    ]
  },
  {
    id: 'SI-02',
    name: 'DeepSpace Comms Relay',
    category: ProjectCategory.SATELLITE_INFRA,
    status: 'Planning',
    progress: 10,
    startDate: '2025-01-01',
    endDate: '2028-12-31',
    totalBudget: 600000000,
    spentBudget: 20000000,
    director: 'Dr. James Wilson',
    description: 'Interplanetary communication relay system for future Mars missions.',
    breakup: [
      { category: 'Design & Engineering', allocated: 150000000, spent: 15000000 },
      { category: 'Long-lead Materials', allocated: 250000000, spent: 5000000 },
      { category: 'Software Architecture', allocated: 100000000, spent: 0 },
      { category: 'Integration Facilities', allocated: 100000000, spent: 0 }
    ]
  },
  {
    id: 'UF-01',
    name: 'SkyLink Private Mesh',
    category: ProjectCategory.USER_FUNDED,
    status: 'Completed',
    progress: 100,
    startDate: '2021-01-01',
    endDate: '2023-12-31',
    totalBudget: 150000000,
    spentBudget: 150000000,
    director: 'Mark Thompson',
    description: 'Dedicated private communication network for SkyLink Corp.',
    breakup: [
      { category: 'Contractor Fees', allocated: 50000000, spent: 50000000 },
      { category: 'Launch Services', allocated: 60000000, spent: 60000000 },
      { category: 'Licensing & Compliance', allocated: 20000000, spent: 20000000 },
      { category: 'Operations Transfer', allocated: 20000000, spent: 20000000 }
    ]
  },
  {
    id: 'UF-02',
    name: 'UrbanMap RealTime',
    category: ProjectCategory.USER_FUNDED,
    status: 'In Progress',
    progress: 60,
    startDate: '2023-08-01',
    endDate: '2025-02-28',
    totalBudget: 85000000,
    spentBudget: 52000000,
    director: 'Alice Zhao',
    description: 'Real-time urban mapping and traffic analysis infrastructure.',
    breakup: [
      { category: 'Satellite Leasing', allocated: 30000000, spent: 20000000 },
      { category: 'Cloud Infrastructure', allocated: 25000000, spent: 15000000 },
      { category: 'AI Algorithm Dev', allocated: 20000000, spent: 12000000 },
      { category: 'Ground Support', allocated: 10000000, spent: 5000000 }
    ]
  }
];

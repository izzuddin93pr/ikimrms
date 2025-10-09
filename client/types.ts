
export type Role = 'host' | 'co-host' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
  organization: string;
}

export interface YearlyProgress {
  year: number;
  progress: number;
  notes?: string;
  budgetLimit?: number;
  budgetSpent?: number;
}

export type DocumentType = 'proposal' | 'report' | 'publication' | 'presentation' | 'data' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileURL: string;
  storagePath: string; 
  uploadedBy: string;
  uploadedAt: string;
}

export type ResearchStatus = 'Active-Ongoing (From Past Years)' | 'Active-Ongoing (New)' | 'Unregistered' | 'Completed';

export interface Research {
  id: string;
  title: string;
  description: string;
  // FIX: Changed centreId to string to match AcademicCentre.id type
  centreId: string;
  startDate: string;
  endDate: string;
  extensionPeriods: string[];
  budget: number;
  spending: number;
  team: string[];
  status: ResearchStatus;
  progress: number;
  yearlyProgress: YearlyProgress[];
  documents: Document[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type CollaborationStatus = 'Active' | 'Expired' | 'Extended';

export interface Collaboration {
  id: string;
  organization: string;
  type: 'MoU' | 'MoA';
  startDate: string;
  endDate: string;
  extensionPeriods: string[];
  // FIX: Changed centreId to string to match AcademicCentre.id type
  centreId: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicCentre {
  id:string;
  name: string;
  abbr: string;
}

export type ExternalResearchStatus = 'Active-Ongoing' | 'Pending' | 'Completed';

export interface ResearchInvolvement {
  type: 'internal' | 'external';
  researchId?: string;
  externalProjectTitle?: string;
  role: 'Principal Investigator' | 'Research Secretary' | 'Research Member';
  externalProjectStatus?: ExternalResearchStatus;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  // FIX: Changed centreId to string to match AcademicCentre.id type
  centreId: string;
  involvements: ResearchInvolvement[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type Section = 'dashboard' | 'research' | 'collaboration' | 'centres' | 'researchers' | 'account & users';

// For i18n
export type TFunction = (key: string, params?: { [key: string]: string | number }) => string;

export interface TranslationPayload {
    t: TFunction;
    locale: 'en' | 'ms';
    statusTranslationKeys: Record<string, string>;
    roleTranslationKeys: Record<string, string>;
    externalStatusTranslationKeys: Record<string, string>;
}

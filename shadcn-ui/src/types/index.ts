import { Timestamp } from "firebase/firestore";

export enum AnimalType {
  DAIRY_CATTLE = "dairy_cattle",
  BEEF_CATTLE = "beef_cattle"
}

export enum AnimalStatus {
  HEALTHY = "healthy",
  SICK = "sick",
  PREGNANT = "pregnant",
  LACTATING = "lactating",
  DRY = "dry"
}

export enum ProductionType {
  MILK = "milk",
  MEAT = "meat"
}

export interface ParentInfo {
  father?: { code: string; name: string };
  mother?: { code: string; name: string };
  maternalGrandfather?: { code: string; name: string };
  maternalGrandmother?: { code: string; name: string };
  paternalGrandfather?: { code: string; name: string };
  paternalGrandmother?: { code: string; name: string };
}

export interface Animal {
  id: string;
  tag: string;
  name?: string;
  type: AnimalType;
  breed: string;
  birthDate: Timestamp;
  gender: "male" | "female";
  status: AnimalStatus;
  weight: number;
  purchaseDate?: Timestamp;
  purchasePrice?: number;
  notes?: string;
  health: HealthRecord[];
  production: ProductionRecord[];
  parentInfo?: ParentInfo;   // 👈 en lugar de parentMaleId/parentFemaleId
  imageUrl?: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  date: Date | string;
  type: "vaccination" | "treatment" | "checkup";
  description: string;
  medicine?: string;
  dosage?: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
}

export interface ProductionRecord {
  id: string;
  animalId: string;
  date: Date | string;
  type: ProductionType;
  quantity: number; // liters for milk, kg for meat
  quality?: string;
  notes?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  units: "hectares" | "acres";
  animalCount: {
    dairy: number;
    beef: number;
    total: number;
  };
}

export interface Dashboard {
  totalAnimals: number;
  byType: {
    dairy: number;
    beef: number;
  };
  byStatus: Record<AnimalStatus, number>;
  production: {
    milk: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    meat: {
      thisMonth: number;
      thisYear: number;
    };
  };
  recentHealth: HealthRecord[];
}
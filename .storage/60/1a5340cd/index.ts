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

export interface Animal {
  id: string;
  tag: string;
  name?: string;
  type: AnimalType;
  breed: string;
  birthDate: Date | string;
  gender: "male" | "female";
  status: AnimalStatus;
  weight: number;
  purchaseDate?: Date | string;
  purchasePrice?: number;
  notes?: string;
  health: HealthRecord[];
  production: ProductionRecord[];
  parentMaleId?: string;
  parentFemaleId?: string;
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
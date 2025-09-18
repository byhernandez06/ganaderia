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

// types/index.ts
export interface ParentRef {
  id?: string;   // opcional, por si guardas IDs
  code?: string; // tu "tag" o código visible
  name?: string; // nombre visible
}


// === TU TIPO Animal, ampliado con parentInfo ===
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
  // ...
  parentMaleId?: string;
  parentFemaleId?: string;

  // ⬇️⬇️ NUEVO: lo que guardas desde el formulario
  parentInfo?: {
    father?: ParentRef;
    mother?: ParentRef;
    maternalGrandfather?: ParentRef;
    maternalGrandmother?: ParentRef;
    paternalGrandfather?: ParentRef;
    paternalGrandmother?: ParentRef;
  };
}

// === NUEVO: exporta Genealogy para todo el proyecto ===
export interface Genealogy {
  id: string;                  // id del doc (puede ser = animalId)
  animalId: string;            // a quién pertenece
  fatherId?: string;
  motherId?: string;
  paternalGrandfatherId?: string;
  paternalGrandmotherId?: string;
  maternalGrandfatherId?: string;
  maternalGrandmotherId?: string;
  updatedAt?: any;             // Timestamp | Date | string (evita importar tipos de Firestore aquí)
  updatedBy?: string;
}




// En tu archivo types/index.ts
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
  nextDoseDate?: Date | string; // Nuevo campo
  repeatEveryDays?: number; // Nuevo campo
  reminderAdvanceDays?: number; // Nuevo campo
  reminderEnabled?: boolean; // Nuevo campo
}

export interface ProductionRecord {
  id: string;
  animalId: string;
   timestamp: Timestamp | Date;// de Firestore
  type: ProductionType;
  turno: "mañana" | "tarde" | "noche";
  ubicacion_ordeño: string;
  quantity: number;
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
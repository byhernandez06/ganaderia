import { Timestamp } from "firebase/firestore";
import { AnimalType, AnimalStatus } from "./enums";
import { HealthRecord } from "./HealthRecord";
import { ProductionRecord } from "./ProductionRecord";
import { ParentInfo } from "./ParentInfo";

export interface Animal {
    id: string;
    tag: string;
    name?: string | null;
    type: AnimalType;
    breed: string;
    birthDate: Timestamp;
    gender: "male" | "female";
    status: AnimalStatus;
    weight: number;
    purchaseDate?: Timestamp | null;
    purchasePrice?: number | null;
    notes?: string | null;
    health: HealthRecord[]; // ⚠️ ideal sería subcolección
    production: ProductionRecord[]; // ⚠️ ideal sería subcolección
    parentInfo?: ParentInfo | null;
    imageUrl?: string | null;
}
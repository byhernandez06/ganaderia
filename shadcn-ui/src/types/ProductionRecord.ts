import { Timestamp } from "firebase/firestore";
import { ProductionType } from "./enums";

export interface ProductionRecord {
    id: string;
    animalId: string;
    date: Timestamp;
    type: ProductionType;
    quantity: number; // liters for milk, kg for meat
    quality?: string | null;
    notes?: string | null;
}
import { Timestamp } from "firebase/firestore";

export interface HealthRecord {
    id: string;
    animalId: string;
    date: Timestamp;
    type: "vaccination" | "treatment" | "checkup";
    description: string;
    medicine?: string | null;
    dosage?: string | null;
    veterinarian?: string | null;
    cost?: number | null;
    notes?: string | null;
}
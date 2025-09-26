import { AnimalStatus } from "./enums";
import { HealthRecord } from "./HealthRecord";

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
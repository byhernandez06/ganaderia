export interface Farm {
    id: string;
    name: string;
    location: string;
    size: number;
    units: "hectares" | "acres";
    animalCount: {
        dairy: number;
        beef: number;
        // ❌ mejor calcular total
    };
}
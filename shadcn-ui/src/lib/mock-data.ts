import { Animal, AnimalStatus, AnimalType, HealthRecord, ProductionRecord, ProductionType, Dashboard, Farm } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Helper to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to generate random number within a range
const randomNumber = (min: number, max: number) => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

// Generate mock health records
const generateHealthRecords = (animalId: string, count: number): HealthRecord[] => {
  const records: HealthRecord[] = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const types = ["vaccination", "treatment", "checkup"];
  
  for (let i = 0; i < count; i++) {
    records.push({
      id: uuidv4(),
      animalId,
      date: randomDate(oneYearAgo, today).toISOString(),
      type: types[Math.floor(Math.random() * types.length)] as "vaccination" | "treatment" | "checkup",
      description: ["Annual checkup", "Hoof trimming", "Parasite control", "Antibiotics", "Vitamins supplement"][Math.floor(Math.random() * 5)],
      medicine: Math.random() > 0.3 ? ["Antibiotics", "Vitamins", "Parasite control", "Pain relief", "Anti-inflammatory"][Math.floor(Math.random() * 5)] : undefined,
      dosage: Math.random() > 0.5 ? `${Math.floor(Math.random() * 10) + 1} ml` : undefined,
      veterinarian: Math.random() > 0.5 ? ["Dr. Smith", "Dr. Johnson", "Dr. Garcia", "Dr. Chen"][Math.floor(Math.random() * 4)] : undefined,
      cost: Math.random() > 0.3 ? Math.floor(Math.random() * 200) + 50 : undefined,
      notes: Math.random() > 0.7 ? "Follow up in two weeks" : undefined
    });
  }
  
  return records;
};

// Generate mock production records
const generateProductionRecords = (animalId: string, type: AnimalType, count: number): ProductionRecord[] => {
  const records: ProductionRecord[] = [];
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const isMilkProducer = type === AnimalType.DAIRY_CATTLE;
  
  for (let i = 0; i < count; i++) {
    const recordType = isMilkProducer ? ProductionType.MILK : ProductionType.MEAT;
    const quantity = recordType === ProductionType.MILK 
      ? randomNumber(15, 40) // Liters of milk
      : randomNumber(1.5, 2.5); // Kg of meat gain per day
      
    records.push({
      id: uuidv4(),
      animalId,
      date: randomDate(threeMonthsAgo, today).toISOString(),
      type: recordType,
      quantity,
      quality: Math.random() > 0.5 ? ["Excellent", "Good", "Average"][Math.floor(Math.random() * 3)] : undefined,
      notes: Math.random() > 0.8 ? "Regular production" : undefined
    });
  }
  
  return records;
};

// Generate mock animals
export const generateAnimals = (count: number): Animal[] => {
  const animals: Animal[] = [];
  const today = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  
  const dairyBreeds = ["Holstein", "Jersey", "Brown Swiss", "Guernsey", "Ayrshire"];
  const beefBreeds = ["Angus", "Hereford", "Charolais", "Simmental", "Brahman"];
  const statuses = Object.values(AnimalStatus);
  
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.5 ? AnimalType.DAIRY_CATTLE : AnimalType.BEEF_CATTLE;
    const breeds = type === AnimalType.DAIRY_CATTLE ? dairyBreeds : beefBreeds;
    const gender = Math.random() > 0.7 ? "female" : "male";
    const birthDate = randomDate(fiveYearsAgo, today);
    const animalId = uuidv4();
    
    animals.push({
      id: animalId,
      tag: `TAG${Math.floor(Math.random() * 10000)}`,
      name: Math.random() > 0.5 ? ["Bella", "Daisy", "Luna", "Molly", "Lucy", "Max", "Charlie", "Buddy", "Rocky", "Duke"][Math.floor(Math.random() * 10)] : undefined,
      type,
      breed: breeds[Math.floor(Math.random() * breeds.length)],
      birthDate: birthDate.toISOString(),
      gender,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      weight: type === AnimalType.DAIRY_CATTLE 
        ? randomNumber(400, 700) // Dairy cattle weight in kg
        : randomNumber(500, 1000), // Beef cattle weight in kg
      purchaseDate: Math.random() > 0.7 ? randomDate(birthDate, today).toISOString() : undefined,
      purchasePrice: Math.random() > 0.7 ? Math.floor(Math.random() * 2000) + 1000 : undefined,
      notes: Math.random() > 0.8 ? "Good genetics" : undefined,
      health: generateHealthRecords(animalId, Math.floor(Math.random() * 5) + 1),
      production: generateProductionRecords(animalId, type, Math.floor(Math.random() * 20) + 5),
      parentMaleId: Math.random() > 0.7 ? uuidv4() : undefined,
      parentFemaleId: Math.random() > 0.7 ? uuidv4() : undefined,
      imageUrl: Math.random() > 0.5 ? `https://source.unsplash.com/featured/?${type === AnimalType.DAIRY_CATTLE ? "dairy" : "beef"},cattle` : undefined
    });
  }
  
  return animals;
};

// Mock farm data
export const mockFarm: Farm = {
  id: uuidv4(),
  name: "Rancho La Esperanza",
  location: "Jalisco, México",
  size: 150,
  units: "hectares",
  animalCount: {
    dairy: 75,
    beef: 125,
    total: 200
  }
};

// Generate mock dashboard data
export const generateDashboardData = (animals: Animal[]): Dashboard => {
  const byType = {
    dairy: animals.filter(a => a.type === AnimalType.DAIRY_CATTLE).length,
    beef: animals.filter(a => a.type === AnimalType.BEEF_CATTLE).length
  };
  
  const byStatus = Object.values(AnimalStatus).reduce((acc, status) => {
    acc[status] = animals.filter(a => a.status === status).length;
    return acc;
  }, {} as Record<AnimalStatus, number>);
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  const milkProduction = animals
    .filter(a => a.type === AnimalType.DAIRY_CATTLE)
    .flatMap(a => a.production)
    .filter(p => p.type === ProductionType.MILK);
  
  const meatProduction = animals
    .filter(a => a.type === AnimalType.BEEF_CATTLE)
    .flatMap(a => a.production)
    .filter(p => p.type === ProductionType.MEAT);
  
  const recentHealth = animals
    .flatMap(a => a.health.map(h => ({ ...h, animal: a })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    totalAnimals: animals.length,
    byType,
    byStatus,
    production: {
      milk: {
        today: milkProduction
          .filter(p => new Date(p.date).toDateString() === today.toDateString())
          .reduce((sum, p) => sum + p.quantity, 0),
        thisWeek: milkProduction
          .filter(p => new Date(p.date) >= startOfWeek)
          .reduce((sum, p) => sum + p.quantity, 0),
        thisMonth: milkProduction
          .filter(p => new Date(p.date) >= startOfMonth)
          .reduce((sum, p) => sum + p.quantity, 0)
      },
      meat: {
        thisMonth: meatProduction
          .filter(p => new Date(p.date) >= startOfMonth)
          .reduce((sum, p) => sum + p.quantity, 0),
        thisYear: meatProduction
          .filter(p => new Date(p.date) >= startOfYear)
          .reduce((sum, p) => sum + p.quantity, 0)
      }
    },
    recentHealth
  };
};

// Generate initial data
export const mockAnimals = generateAnimals(50);
export const mockDashboard = generateDashboardData(mockAnimals);
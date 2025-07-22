import React, { createContext, useContext, useState, ReactNode } from "react";
import { Animal, Dashboard, Farm, HealthRecord, ProductionRecord } from "@/types";
import { mockAnimals, mockDashboard, mockFarm } from "@/lib/mock-data";
import { v4 as uuidv4 } from "uuid";

interface FarmContextType {
  farm: Farm;
  animals: Animal[];
  dashboard: Dashboard;
  isLoading: boolean;
  // Animal operations
  addAnimal: (animal: Omit<Animal, "id" | "health" | "production">) => void;
  updateAnimal: (animal: Animal) => void;
  deleteAnimal: (animalId: string) => void;
  getAnimal: (animalId: string) => Animal | undefined;
  // Health records
  addHealthRecord: (record: Omit<HealthRecord, "id">) => void;
  updateHealthRecord: (record: HealthRecord) => void;
  deleteHealthRecord: (recordId: string) => void;
  // Production records
  addProductionRecord: (record: Omit<ProductionRecord, "id">) => void;
  updateProductionRecord: (record: ProductionRecord) => void;
  deleteProductionRecord: (recordId: string) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const useFarmContext = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error("useFarmContext must be used within a FarmProvider");
  }
  return context;
};

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [farm, setFarm] = useState<Farm>(mockFarm);
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals);
  const [dashboard, setDashboard] = useState<Dashboard>(mockDashboard);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Animal operations
  const addAnimal = (animalData: Omit<Animal, "id" | "health" | "production">) => {
    const newAnimal: Animal = {
      ...animalData,
      id: uuidv4(),
      health: [],
      production: []
    };

    setAnimals(prev => [...prev, newAnimal]);
    updateDashboard([...animals, newAnimal]);
  };

  const updateAnimal = (updatedAnimal: Animal) => {
    setAnimals(prev => prev.map(animal => 
      animal.id === updatedAnimal.id ? updatedAnimal : animal
    ));
    updateDashboard([...animals.filter(a => a.id !== updatedAnimal.id), updatedAnimal]);
  };

  const deleteAnimal = (animalId: string) => {
    setAnimals(prev => prev.filter(animal => animal.id !== animalId));
    updateDashboard(animals.filter(a => a.id !== animalId));
  };

  const getAnimal = (animalId: string) => {
    return animals.find(animal => animal.id === animalId);
  };

  // Health record operations
  const addHealthRecord = (recordData: Omit<HealthRecord, "id">) => {
    const record: HealthRecord = { ...recordData, id: uuidv4() };
    const animalToUpdate = animals.find(animal => animal.id === recordData.animalId);

    if (animalToUpdate) {
      const updatedAnimal: Animal = {
        ...animalToUpdate,
        health: [...animalToUpdate.health, record]
      };
      updateAnimal(updatedAnimal);
    }
  };

  const updateHealthRecord = (updatedRecord: HealthRecord) => {
    const animalToUpdate = animals.find(animal => animal.id === updatedRecord.animalId);

    if (animalToUpdate) {
      const updatedAnimal: Animal = {
        ...animalToUpdate,
        health: animalToUpdate.health.map(record => 
          record.id === updatedRecord.id ? updatedRecord : record
        )
      };
      updateAnimal(updatedAnimal);
    }
  };

  const deleteHealthRecord = (recordId: string) => {
    const animalWithRecord = animals.find(animal => 
      animal.health.some(record => record.id === recordId)
    );

    if (animalWithRecord) {
      const updatedAnimal: Animal = {
        ...animalWithRecord,
        health: animalWithRecord.health.filter(record => record.id !== recordId)
      };
      updateAnimal(updatedAnimal);
    }
  };

  // Production record operations
  const addProductionRecord = (recordData: Omit<ProductionRecord, "id">) => {
    const record: ProductionRecord = { ...recordData, id: uuidv4() };
    const animalToUpdate = animals.find(animal => animal.id === recordData.animalId);

    if (animalToUpdate) {
      const updatedAnimal: Animal = {
        ...animalToUpdate,
        production: [...animalToUpdate.production, record]
      };
      updateAnimal(updatedAnimal);
    }
  };

  const updateProductionRecord = (updatedRecord: ProductionRecord) => {
    const animalToUpdate = animals.find(animal => animal.id === updatedRecord.animalId);

    if (animalToUpdate) {
      const updatedAnimal: Animal = {
        ...animalToUpdate,
        production: animalToUpdate.production.map(record => 
          record.id === updatedRecord.id ? updatedRecord : record
        )
      };
      updateAnimal(updatedAnimal);
    }
  };

  const deleteProductionRecord = (recordId: string) => {
    const animalWithRecord = animals.find(animal => 
      animal.production.some(record => record.id === recordId)
    );

    if (animalWithRecord) {
      const updatedAnimal: Animal = {
        ...animalWithRecord,
        production: animalWithRecord.production.filter(record => record.id !== recordId)
      };
      updateAnimal(updatedAnimal);
    }
  };

  // Update dashboard data
  const updateDashboard = (currentAnimals: Animal[]) => {
    // This is a simplified implementation - in a real app, we would fetch from the backend
    const byType = {
      dairy: currentAnimals.filter(a => a.type === "dairy_cattle").length,
      beef: currentAnimals.filter(a => a.type === "beef_cattle").length,
    };

    const byStatus = {
      healthy: currentAnimals.filter(a => a.status === "healthy").length,
      sick: currentAnimals.filter(a => a.status === "sick").length,
      pregnant: currentAnimals.filter(a => a.status === "pregnant").length,
      lactating: currentAnimals.filter(a => a.status === "lactating").length,
      dry: currentAnimals.filter(a => a.status === "dry").length,
    };

    // Update farm animal counts
    setFarm(prev => ({
      ...prev,
      animalCount: {
        dairy: byType.dairy,
        beef: byType.beef,
        total: currentAnimals.length
      }
    }));

    // Get most recent health records
    const recentHealth = currentAnimals
      .flatMap(a => a.health)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Simple calculation for dashboard metrics
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const milkRecords = currentAnimals
      .flatMap(a => a.production)
      .filter(p => p.type === "milk");
    
    const meatRecords = currentAnimals
      .flatMap(a => a.production)
      .filter(p => p.type === "meat");

    setDashboard({
      totalAnimals: currentAnimals.length,
      byType,
      byStatus,
      production: {
        milk: {
          today: milkRecords
            .filter(r => new Date(r.date).toDateString() === today.toDateString())
            .reduce((sum, r) => sum + r.quantity, 0),
          thisWeek: milkRecords
            .filter(r => new Date(r.date) >= startOfWeek)
            .reduce((sum, r) => sum + r.quantity, 0),
          thisMonth: milkRecords
            .filter(r => new Date(r.date) >= startOfMonth)
            .reduce((sum, r) => sum + r.quantity, 0),
        },
        meat: {
          thisMonth: meatRecords
            .filter(r => new Date(r.date) >= startOfMonth)
            .reduce((sum, r) => sum + r.quantity, 0),
          thisYear: meatRecords
            .filter(r => new Date(r.date) >= startOfYear)
            .reduce((sum, r) => sum + r.quantity, 0),
        }
      },
      recentHealth,
    });
  };

  return (
    <FarmContext.Provider
      value={{
        farm,
        animals,
        dashboard,
        isLoading,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        getAnimal,
        addHealthRecord,
        updateHealthRecord,
        deleteHealthRecord,
        addProductionRecord,
        updateProductionRecord,
        deleteProductionRecord,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};
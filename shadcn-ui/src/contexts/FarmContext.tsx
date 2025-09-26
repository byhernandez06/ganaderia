import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animal, HealthRecord, ProductionRecord } from '@/types';
import { toast } from 'sonner';
import * as firebaseService from '@/services/firebase-service';

// Define the context type
interface FarmContextType {
  // Data
  animals: Animal[];
  healthRecords: HealthRecord[];
  productionRecords: ProductionRecord[];

  // Loading states
  isLoading: boolean;

  // Animal operations
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<void>;
  updateAnimal: (id: string, animal: Partial<Omit<Animal, 'id'>>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;

  // Health record operations
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => Promise<void>;
  updateHealthRecord: (id: string, record: Partial<Omit<HealthRecord, 'id'>>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;

  // Production record operations
  addProductionRecord: (record: Omit<ProductionRecord, 'id'>) => Promise<void>;
  updateProductionRecord: (id: string, record: Partial<Omit<ProductionRecord, 'id'>>) => Promise<void>;
  deleteProductionRecord: (id: string) => Promise<void>;

  // Dashboard stats
  dashboardStats: {
    totalAnimals: number;
    animalsByType: Record<string, number>;
    healthByType: Record<string, number>;
    totalMilkProduction: number;
    totalMeatProduction: number;
    recentHealthRecords: HealthRecord[];
  } | null;
  refreshDashboardStats: () => Promise<void>;
}

// Create the context
const FarmContext = createContext<FarmContextType | undefined>(undefined);

// Provider component
export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<FarmContextType['dashboardStats']>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Load animals
        const animalsData = await firebaseService.getAnimals();
        console.log("AnimalsData: ", animalsData)
        setAnimals(animalsData);

        // Load health records
        const healthData = await firebaseService.getHealthRecords();
        setHealthRecords(healthData);

        // Load production records
        const productionData = await firebaseService.getProductionRecords();
        setProductionRecords(productionData);

        // Load dashboard stats
        await refreshDashboardStats();

      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load farm data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Dashboard stats
  const refreshDashboardStats = async () => {
    try {
      const stats = await firebaseService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const addAnimal = async (animal: Omit<Animal, "id">) => {
    try {
      const newAnimal = await firebaseService.addAnimal(animal);
      setAnimals(prev => [...prev, newAnimal]);
      await refreshDashboardStats();
      toast.success("Animal added successfully");
    } catch (error) {
      console.error("Error adding animal:", error);
      toast.error("Failed to add animal");
      throw error;
    }
  };


  const updateAnimal = async (id: string, animal: Partial<Omit<Animal, 'id'>>) => {
    try {
      await firebaseService.updateAnimal(id, animal);
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, ...animal } : a));
      await refreshDashboardStats();
      toast.success('Animal updated successfully');
    } catch (error) {
      console.error('Error updating animal:', error);
      toast.error('Failed to update animal');
      throw error;
    }
  };

  const deleteAnimal = async (id: string) => {
    try {
      await firebaseService.deleteAnimal(id);
      setAnimals(prev => prev.filter(a => a.id !== id));

      // Also remove related records
      setHealthRecords(prev => prev.filter(r => r.animalId !== id));
      setProductionRecords(prev => prev.filter(r => r.animalId !== id));

      await refreshDashboardStats();
      toast.success('Animal deleted successfully');
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
      throw error;
    }
  };

  // Health record operations
  const addHealthRecord = async (record: Omit<HealthRecord, 'id'>) => {
    try {
      const id = await firebaseService.addHealthRecord(record);
      const newRecord = { id, ...record };
      setHealthRecords(prev => [...prev, newRecord]);
      await refreshDashboardStats();
      toast.success('Health record added successfully');
    } catch (error) {
      console.error('Error adding health record:', error);
      toast.error('Failed to add health record');
      throw error;
    }
  };

  const updateHealthRecord = async (id: string, record: Partial<Omit<HealthRecord, 'id'>>) => {
    try {
      await firebaseService.updateHealthRecord(id, record);
      setHealthRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
      await refreshDashboardStats();
      toast.success('Health record updated successfully');
    } catch (error) {
      console.error('Error updating health record:', error);
      toast.error('Failed to update health record');
      throw error;
    }
  };

  const deleteHealthRecord = async (id: string) => {
    try {
      await firebaseService.deleteHealthRecord(id);
      setHealthRecords(prev => prev.filter(r => r.id !== id));
      await refreshDashboardStats();
      toast.success('Health record deleted successfully');
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
      throw error;
    }
  };

  // Production record operations
  const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>) => {
    try {
      const id = await firebaseService.addProductionRecord(record);
      const newRecord = { id, ...record };
      setProductionRecords(prev => [...prev, newRecord]);
      await refreshDashboardStats();
      toast.success('Production record added successfully');
    } catch (error) {
      console.error('Error adding production record:', error);
      toast.error('Failed to add production record');
      throw error;
    }
  };

  const updateProductionRecord = async (id: string, record: Partial<Omit<ProductionRecord, 'id'>>) => {
    try {
      await firebaseService.updateProductionRecord(id, record);
      setProductionRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
      await refreshDashboardStats();
      toast.success('Production record updated successfully');
    } catch (error) {
      console.error('Error updating production record:', error);
      toast.error('Failed to update production record');
      throw error;
    }
  };

  const deleteProductionRecord = async (id: string) => {
    try {
      await firebaseService.deleteProductionRecord(id);
      setProductionRecords(prev => prev.filter(r => r.id !== id));
      await refreshDashboardStats();
      toast.success('Production record deleted successfully');
    } catch (error) {
      console.error('Error deleting production record:', error);
      toast.error('Failed to delete production record');
      throw error;
    }
  };

  return (
    <FarmContext.Provider
      value={{
        animals,
        healthRecords,
        productionRecords,
        isLoading,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        addHealthRecord,
        updateHealthRecord,
        deleteHealthRecord,
        addProductionRecord,
        updateProductionRecord,
        deleteProductionRecord,
        dashboardStats,
        refreshDashboardStats,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

// Custom hook for using the context
export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
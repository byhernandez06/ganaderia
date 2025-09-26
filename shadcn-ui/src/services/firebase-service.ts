import {
  collection, addDoc, doc, getDoc, getDocs, updateDoc,
  deleteDoc, query, where, orderBy, limit, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Animal, HealthRecord, ProductionRecord,
  AnimalType, ProductionType
} from '@/types';

// Collections references
const animalsCollection = collection(db, 'animals');
const healthRecordsCollection = collection(db, 'healthRecords');
const productionRecordsCollection = collection(db, 'productionRecords');

// ================= Animal Services =================

export const getAnimals = async (): Promise<Animal[]> => {
  const snapshot = await getDocs(animalsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Animal, 'id'>
  }));
};

export const getAnimalById = async (id: string): Promise<Animal | null> => {
  const docRef = doc(db, 'animals', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() as Omit<Animal, 'id'> };
  }
  return null;
};


export const addAnimal = async (formData: Omit<Animal, "id">): Promise<Animal> => {
  const id = doc(collection(db, "animals")).id;

  const newAnimal: Animal = {
    id,
    tag: formData.tag,
    name: formData.name || null,
    type: formData.type,
    breed: formData.breed,
    birthDate: formData.birthDate instanceof Date
      ? Timestamp.fromDate(formData.birthDate)
      : (formData.birthDate as any),
    gender: formData.gender,
    status: formData.status,
    weight: formData.weight,
    purchaseDate: formData.purchaseDate
      ? (formData.purchaseDate instanceof Date
        ? Timestamp.fromDate(formData.purchaseDate)
        : (formData.purchaseDate as any))
      : null,
    purchasePrice: formData.purchasePrice || null,
    notes: formData.notes || null,
    health: [],
    production: [],
    parentInfo: formData.parentInfo || {
      father: null,
      mother: null,
      maternalGrandfather: null,
      maternalGrandmother: null,
      paternalGrandfather: null,
      paternalGrandmother: null,
    },
    imageUrl: formData.imageUrl || null,
  };

  await setDoc(doc(db, "animals", id), newAnimal);

  return newAnimal;
};


export const updateAnimal = async (id: string, animal: Partial<Omit<Animal, 'id'>>): Promise<void> => {
  const animalRef = doc(db, 'animals', id);
  const updateData = { ...animal };

  // Convert dates to Firestore Timestamps if they exist
  if (animal.birthDate) {
    updateData.birthDate = Timestamp.fromDate(new Date(animal.birthDate));
  }

  await updateDoc(animalRef, updateData);
};

export const deleteAnimal = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'animals', id));
};

export const getAnimalsByType = async (type: AnimalType): Promise<Animal[]> => {
  const q = query(animalsCollection, where("type", "==", type));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Animal, 'id'>
  }));
};

// ================= Health Record Services =================

export const getHealthRecords = async (): Promise<HealthRecord[]> => {
  const snapshot = await getDocs(healthRecordsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<HealthRecord, 'id'>
  }));
};

export const getHealthRecordsByAnimalId = async (animalId: string): Promise<HealthRecord[]> => {
  const q = query(healthRecordsCollection, where("animalId", "==", animalId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<HealthRecord, 'id'>
  }));
};

export const addHealthRecord = async (record: Omit<HealthRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(healthRecordsCollection, {
    ...record,
    date: Timestamp.fromDate(new Date(record.date)),
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateHealthRecord = async (id: string, record: Partial<Omit<HealthRecord, 'id'>>): Promise<void> => {
  const recordRef = doc(db, 'healthRecords', id);
  const updateData = { ...record };

  // Convert dates to Firestore Timestamps if they exist
  if (record.date) {
    updateData.date = Timestamp.fromDate(new Date(record.date));
  }

  await updateDoc(recordRef, updateData);
};

export const deleteHealthRecord = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'healthRecords', id));
};

// ================= Production Record Services =================

export const getProductionRecords = async (): Promise<ProductionRecord[]> => {
  const snapshot = await getDocs(productionRecordsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<ProductionRecord, 'id'>
  }));
};

export const getProductionRecordsByAnimalId = async (animalId: string): Promise<ProductionRecord[]> => {
  const q = query(productionRecordsCollection, where("animalId", "==", animalId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<ProductionRecord, 'id'>
  }));
};

export const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(productionRecordsCollection, {
    ...record,
    date: Timestamp.fromDate(new Date(record.date)),
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateProductionRecord = async (id: string, record: Partial<Omit<ProductionRecord, 'id'>>): Promise<void> => {
  const recordRef = doc(db, 'productionRecords', id);
  const updateData = { ...record };

  // Convert dates to Firestore Timestamps if they exist
  if (record.date) {
    updateData.date = Timestamp.fromDate(new Date(record.date));
  }

  await updateDoc(recordRef, updateData);
};

export const deleteProductionRecord = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'productionRecords', id));
};

// ================= Dashboard Statistics =================

export const getDashboardStats = async () => {
  const animalsSnapshot = await getDocs(animalsCollection);
  const healthSnapshot = await getDocs(healthRecordsCollection);
  const productionSnapshot = await getDocs(productionRecordsCollection);

  const totalAnimals = animalsSnapshot.size;

  // Count animals by type
  const animalsByType: Record<string, number> = {};
  animalsSnapshot.forEach(doc => {
    const animal = doc.data() as Animal;
    animalsByType[animal.type] = (animalsByType[animal.type] || 0) + 1;
  });

  // Count health records by type
  const healthByType: Record<string, number> = {};
  healthSnapshot.forEach(doc => {
    const record = doc.data() as HealthRecord;
    healthByType[record.type] = (healthByType[record.type] || 0) + 1;
  });

  // Calculate total production
  let totalMilkProduction = 0;
  let totalMeatProduction = 0;

  productionSnapshot.forEach(doc => {
    const record = doc.data() as ProductionRecord;
    if (record.type === ProductionType.MILK) {
      totalMilkProduction += record.quantity;
    } else if (record.type === ProductionType.MEAT) {
      totalMeatProduction += record.quantity;
    }
  });

  // Get recent health records
  const recentHealthQ = query(
    healthRecordsCollection,
    orderBy("date", "desc"),
    limit(5)
  );
  const recentHealthSnapshot = await getDocs(recentHealthQ);
  const recentHealthRecords = recentHealthSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<HealthRecord, 'id'>
  }));

  return {
    totalAnimals,
    animalsByType,
    healthByType,
    totalMilkProduction,
    totalMeatProduction,
    recentHealthRecords
  };
};
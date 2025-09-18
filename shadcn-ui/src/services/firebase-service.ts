import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, 
  deleteDoc, query, where, orderBy, limit, Timestamp,
  setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Animal, HealthRecord, ProductionRecord,  
  AnimalType, ProductionType, Genealogy, AnimalStatus
} from '@/types';

// Collections
const animalsCollection = collection(db, 'animals');
const healthRecordsCollection = collection(db, 'healthRecords');
const productionRecordsCollection = collection(db, 'productionRecords');
const genealogyCollection = collection(db, 'genealogy');

// ===== Helpers =====
const normalizeDateToTimestamp = (dateValue: string | number | Date | Timestamp): Timestamp => {
  if (dateValue instanceof Timestamp) return dateValue;
  if (dateValue instanceof Date) return Timestamp.fromDate(dateValue);
  return Timestamp.fromDate(new Date(dateValue));
};

const convertFirestoreData = (data: any) => {
  const result = { ...data };
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  });
  return result;
};

// ================= Animals =================
export async function getAnimals(): Promise<Animal[]> {
  const snap = await getDocs(animalsCollection);
  return snap.docs.map((d) => {
    const data: any = d.data();

    const birthDate =
      data?.birthDate instanceof Timestamp
        ? data.birthDate.toDate().toISOString()
        : (data?.birthDate ?? new Date().toISOString());

    const gender: Animal["gender"] =
      data?.gender === "male" || data?.gender === "female"
        ? data.gender
        : (data?.sex === "Macho" ? "male" : data?.sex === "Hembra" ? "female" : "female");

    return {
      id: d.id,
      tag: data?.tag ?? "",
      name: data?.name ?? "",
      type: data?.type ?? AnimalType.DAIRY_CATTLE,
      breed: data?.breed ?? "",
      birthDate,
      gender,
      status: data?.status ?? AnimalStatus.HEALTHY,
      weight: Number(data?.weight ?? 0),
      origin: data?.origin ?? "Finca",
      parentMaleId: data?.parentMaleId,
      parentFemaleId: data?.parentFemaleId,
      parentInfo: data?.parentInfo,
    } as Animal;
  });
}

export const getAnimalById = async (id: string): Promise<Animal | null> => {
  const docRef = doc(db, 'animals', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data: any = docSnap.data();
  const birthDate =
    data?.birthDate instanceof Timestamp
      ? data.birthDate.toDate().toISOString()
      : (data?.birthDate ?? new Date().toISOString());

  const gender: Animal["gender"] =
    data?.gender === "male" || data?.gender === "female"
      ? data.gender
      : (data?.sex === "Macho" ? "male" : data?.sex === "Hembra" ? "female" : "female");

  return {
    id: docSnap.id,
    tag: data?.tag ?? "",
    name: data?.name ?? "",
    type: data?.type ?? AnimalType.DAIRY_CATTLE,
    breed: data?.breed ?? "",
    birthDate,
    gender,
    status: data?.status ?? AnimalStatus.HEALTHY,
    weight: Number(data?.weight ?? 0),
    origin: data?.origin ?? "Finca",
    parentMaleId: data?.parentMaleId,
    parentFemaleId: data?.parentFemaleId,
    parentInfo: data?.parentInfo,
  } as Animal;
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<string> => {
  const docRef = await addDoc(animalsCollection, {
    ...animal,
    birthDate: normalizeDateToTimestamp(animal.birthDate),
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateAnimal = async (id: string, animal: Partial<Omit<Animal, 'id'>>): Promise<void> => {
  const ref = doc(db, 'animals', id);
  const updateData: any = { ...animal };
  if (animal.birthDate) {
    updateData.birthDate = normalizeDateToTimestamp(animal.birthDate);
  }
  await updateDoc(ref, updateData);
};

export const deleteAnimal = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'animals', id));
};

export const getAnimalsByType = async (type: AnimalType): Promise<Animal[]> => {
  const q = query(animalsCollection, where("type", "==", type));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertFirestoreData(doc.data()) as Omit<Animal, 'id'>
  })) as Animal[];
};

// ================= Health =================
export const getHealthRecords = async (): Promise<HealthRecord[]> => {
  const snapshot = await getDocs(healthRecordsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertFirestoreData(doc.data()) as Omit<HealthRecord, 'id'>
  }));
};

export const getHealthRecordsByAnimalId = async (animalId: string): Promise<HealthRecord[]> => {
  const q = query(healthRecordsCollection, where("animalId", "==", animalId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertFirestoreData(doc.data()) as Omit<HealthRecord, 'id'>
  }));
};

export const addHealthRecord = async (record: Omit<HealthRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(healthRecordsCollection, {
    ...record,
    date: normalizeDateToTimestamp(record.date),
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateHealthRecord = async (id: string, record: Partial<Omit<HealthRecord, 'id'>>): Promise<void> => {
  const ref = doc(db, 'healthRecords', id);
  const updateData: any = { ...record };
  if (record.date) updateData.date = normalizeDateToTimestamp(record.date);
  await updateDoc(ref, updateData);
};

export const deleteHealthRecord = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'healthRecords', id));
};

// ================= Production =================
export const getProductionRecords = async (): Promise<ProductionRecord[]> => {
  const snapshot = await getDocs(productionRecordsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertFirestoreData(doc.data()) as Omit<ProductionRecord, 'id'>
  }));
};

export const getProductionRecordsByAnimalId = async (animalId: string): Promise<ProductionRecord[]> => {
  const q = query(productionRecordsCollection, where("animalId", "==", animalId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertFirestoreData(doc.data()) as Omit<ProductionRecord, 'id'>
  }));
};

export const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(productionRecordsCollection, {
    ...record,
    timestamp: normalizeDateToTimestamp(record.timestamp),
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateProductionRecord = async (id: string, record: Partial<Omit<ProductionRecord, 'id'>>) => {
  const ref = doc(db, 'productionRecords', id);
  const updateData: any = { ...record };
  if (record.timestamp) updateData.timestamp = normalizeDateToTimestamp(record.timestamp);
  await updateDoc(ref, updateData);
};

export const deleteProductionRecord = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'productionRecords', id));
};

// ================= Genealogy =================
// Doc id = animalId  (simple y sin duplicados)
export async function getGenealogyRecords(): Promise<Genealogy[]> {
  const snap = await getDocs(genealogyCollection);
  return snap.docs.map((d) => {
    const g = d.data() as Omit<Genealogy, "id">;
    const updatedAt =
      (g as any)?.updatedAt instanceof Timestamp
        ? (g as any).updatedAt.toDate().toISOString()
        : (g as any)?.updatedAt ?? null;

    return { id: d.id, ...g, updatedAt } as Genealogy;
  });
}

export async function addGenealogyRecord(record: Omit<Genealogy, 'id'>): Promise<string> {
  const id = record.animalId; // usamos animalId como id del doc
  const ref = doc(genealogyCollection, id);
  await setDoc(ref, {
    ...record,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return id;
}

export async function updateGenealogyRecord(
  id: string,
  patch: Partial<Omit<Genealogy, 'id'>>
): Promise<void> {
  const ref = doc(genealogyCollection, id);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGenealogyRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, 'genealogy', id));
}

// ================= Dashboard =================
export const getDashboardStats = async () => {
  const animalsSnapshot = await getDocs(animalsCollection);
  const healthSnapshot = await getDocs(healthRecordsCollection);
  const productionSnapshot = await getDocs(productionRecordsCollection);

  const totalAnimals = animalsSnapshot.size;
  
  const animalsByType: Record<string, number> = {};
  animalsSnapshot.forEach(docu => {
    const animal = convertFirestoreData(docu.data()) as Animal;
    animalsByType[animal.type] = (animalsByType[animal.type] || 0) + 1;
  });

  const healthByType: Record<string, number> = {};
  healthSnapshot.forEach(docu => {
    const record = convertFirestoreData(docu.data()) as HealthRecord;
    healthByType[record.type] = (healthByType[record.type] || 0) + 1;
  });

  let totalMilkProduction = 0;
  let totalMeatProduction = 0;
  productionSnapshot.forEach(docu => {
    const record = convertFirestoreData(docu.data()) as ProductionRecord;
    if (record.type === ProductionType.MILK) totalMilkProduction += record.quantity;
    if (record.type === ProductionType.MEAT) totalMeatProduction += record.quantity;
  });

  const recentHealthQ = query(healthRecordsCollection, orderBy("date", "desc"), limit(5));
  const recentHealthSnapshot = await getDocs(recentHealthQ);
  const recentHealthRecords = recentHealthSnapshot.docs.map(docu => ({
    id: docu.id,
    ...convertFirestoreData(docu.data()) as Omit<HealthRecord, 'id'>
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

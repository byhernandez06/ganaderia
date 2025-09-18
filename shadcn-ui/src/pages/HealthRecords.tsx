'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useFarm } from "@/contexts/FarmContext";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HealthRecord, Animal } from "@/types";
import { PlusCircle, MoreHorizontal, Filter, Search, Calendar, Bell } from "lucide-react";
import { toast } from 'sonner';

/* ========= Interfaces extendidas ========= */
interface HealthRecordWithAnimalInfo extends HealthRecord {
  animalTag: string;
  animalName: string;
  animalType: string;
  _status?: DoseStatus;
  _dLeft?: number;
}

/* ========= Helpers ========= */
type DoseStatus = "overdue" | "today" | "soon" | "ok";

// Función robusta para manejar todos los formatos de fecha
const parseDate = (date: any): Date => {
  if (!date) return new Date();
  
  // Si ya es un objeto Date válido
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  
  // Si es un Firestore Timestamp
  if (typeof date === 'object' && date !== null && date.seconds !== undefined) {
    return new Date(date.seconds * 1000);
  }
  
  // Si es un string
  if (typeof date === 'string') {
    // Intenta parsear directamente
    const directParse = new Date(date);
    if (!isNaN(directParse.getTime())) return directParse;
    
    // Intenta formato YYYY-MM-DD (sin tiempo)
    const dateOnlyParse = new Date(date + 'T00:00:00');
    if (!isNaN(dateOnlyParse.getTime())) return dateOnlyParse;
    
    // Intenta formato con diferentes separadores
    const normalizedDate = date.replace(/\//g, '-');
    const normalizedParse = new Date(normalizedDate);
    if (!isNaN(normalizedParse.getTime())) return normalizedParse;
  }
  
  console.warn('No se pudo parsear la fecha:', date, 'usando fecha actual');
  return new Date();
};

// Función segura para convertir a ISO string (solo fecha)
const toISODate = (date: any): string => {
  try {
    const parsedDate = parseDate(date);
    return parsedDate.toISOString().split("T")[0];
  } catch (error) {
    console.error('Error converting to ISO date:', error, 'Value:', date);
    return new Date().toISOString().split("T")[0];
  }
};

const daysDiffFromToday = (target: any) => {
  try {
    const today = new Date(); 
    const t = parseDate(target);
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tOnly = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return Math.round((tOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 999;
  }
};

// Función helper para convertir cualquier fecha a string ISO
const getDateAsISOString = (date: any): string => {
  return toISODate(date);
};

const getDoseStatus = (r: HealthRecord): DoseStatus => {
  if (!r?.nextDoseDate) return "ok";
  try {
    const nextDoseDateStr = getDateAsISOString(r.nextDoseDate);
    const dLeft = daysDiffFromToday(nextDoseDateStr);
    const advance = r.reminderAdvanceDays ?? 0;
    if (dLeft < 0) return "overdue";
    if (dLeft === 0) return "today";
    if (dLeft <= advance) return "soon";
    return "ok";
  } catch (error) {
    console.error('Error getting dose status:', error);
    return "ok";
  }
};

const statusStyles: Record<DoseStatus, string> = {
  overdue: "bg-red-100 text-red-800 border-red-200",
  today: "bg-orange-100 text-orange-800 border-orange-200",
  soon: "bg-amber-100 text-amber-900 border-amber-200",
  ok: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusLabel: Record<DoseStatus, string> = { 
  overdue: "Atrasada", 
  today: "Hoy", 
  soon: "Pronto", 
  ok: "OK" 
};

const progressPct = (r: HealthRecord) => {
  if (!r?.nextDoseDate) return 100;
  try {
    const nextDoseDateStr = getDateAsISOString(r.nextDoseDate);
    const adv = r.reminderAdvanceDays ?? 0; 
    if (adv <= 0) return 100;
    const dLeft = daysDiffFromToday(nextDoseDateStr);
    const used = Math.max(0, adv - Math.max(0, dLeft));
    return Math.round((used / adv) * 100);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 100;
  }
};

// Función para mostrar notificaciones del navegador
const showNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
};

export default function HealthRecords() {
  const { 
    animals, 
    healthRecords, 
    isLoading, 
    addHealthRecord, 
    updateHealthRecord, 
    deleteHealthRecord 
  } = useFarm();

  // Logs de diagnóstico
  useEffect(() => {
    console.log("Animals:", animals);
    console.log("Health records:", healthRecords);
    console.log("Animals length:", animals.length);
    console.log("Health records length:", healthRecords.length);
  }, [animals, healthRecords]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    animalId: "",
    date: new Date().toISOString().split("T")[0],
    type: "checkup",
    description: "",
    medicine: "",
    dosage: "",
    veterinarian: "",
    cost: 0,
    notes: "",
    nextDoseDate: "",
    repeatEveryDays: undefined,
    reminderAdvanceDays: 3,
    reminderEnabled: true,
  });

  // Memoizar la lista de registros de salud con información del animal
  const allHealthRecords: HealthRecordWithAnimalInfo[] = useMemo(() => {
    return healthRecords.map(record => {
      const animal = animals.find(a => a.id === record.animalId);
      return {
        ...record,
        animalTag: animal?.tag ?? "Sin etiqueta",
        animalName: animal?.name ?? "",
        animalType: animal?.type ?? "",
      };
    });
  }, [healthRecords, animals]);

  // Memoizar los registros filtrados
  const filteredHealthRecords = useMemo(() => {
    const filtered = allHealthRecords.filter((record: HealthRecordWithAnimalInfo) => {
      const q = (searchTerm || "").toLowerCase();
      const matchesSearch =
        (record.animalTag?.toLowerCase() || "").includes(q) ||
        (record.description?.toLowerCase() || "").includes(q) ||
        ((record.medicine || "").toLowerCase() || "").includes(q) ||
        ((record.veterinarian || "").toLowerCase() || "").includes(q);
      const matchesType = !selectedType || selectedType === "" || record.type === selectedType;
      const matchesAnimal = !selectedAnimalId || selectedAnimalId === "" || record.animalId === selectedAnimalId;
      return matchesSearch && matchesType && matchesAnimal;
    });
    return filtered;
  }, [allHealthRecords, searchTerm, selectedType, selectedAnimalId]);

  // Memoizar los items de próximas dosis
  const upcomingDoseItems = useMemo(() => {
    const upcoming = filteredHealthRecords
      .filter((r: HealthRecordWithAnimalInfo) => !!r?.nextDoseDate && r.reminderEnabled)
      .map((r: HealthRecordWithAnimalInfo) => ({ 
        ...r, 
        _status: getDoseStatus(r), 
        _dLeft: daysDiffFromToday(getDateAsISOString(r.nextDoseDate))
      }))
      .sort((a: HealthRecordWithAnimalInfo, b: HealthRecordWithAnimalInfo) => {
        const order: DoseStatus[] = ["overdue", "today", "soon", "ok"];
        const byStatus = order.indexOf(a._status!) - order.indexOf(b._status!);
        if (byStatus !== 0) return byStatus;
        return (a._dLeft ?? 999) - (b._dLeft ?? 999);
      })
      .slice(0, 8);
    return upcoming;
  }, [filteredHealthRecords]);

  // Función para verificar notificaciones
  const checkNotifications = useCallback(() => {
    const newNotifications: string[] = [];
    
    allHealthRecords.forEach((record) => {
      if (record.reminderEnabled && record.nextDoseDate) {
        const status = getDoseStatus(record);
        
        if (status === "today") {
          newNotifications.push(
            `¡Hoy toca aplicar ${record.medicine || 'tratamiento'} a ${record.animalTag}`
          );
        } else if (status === "overdue") {
          newNotifications.push(
            `¡Atrasado! Se debió aplicar ${record.medicine || 'tratamiento'} a ${record.animalTag}`
          );
        }
      }
    });

    setNotifications(newNotifications);

    if (newNotifications.length > 0) {
      newNotifications.forEach(notification => {
        showNotification("Recordatorio de Salud", notification);
      });
    }
  }, [allHealthRecords]);

  // useEffect para notificaciones
  useEffect(() => {
    checkNotifications();
    
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numeric = ["cost", "repeatEveryDays", "reminderAdvanceDays"].includes(name);
    setNewRecord(prev => ({ ...prev, [name]: numeric ? (value === "" ? undefined : Number(value)) : value }));
  };

  const handleSelectChange = (name: string, value: string) => setNewRecord(prev => ({ ...prev, [name]: value }));

  const handleAddRecord = async () => {
    if (!addHealthRecord) { 
      console.error("addHealthRecord no disponible"); 
      return; 
    }
    if (newRecord.animalId && newRecord.date && newRecord.type && newRecord.description) {
      try {
        await addHealthRecord(newRecord as Omit<HealthRecord, "id">);
        setNewRecord({
          animalId: "",
          date: new Date().toISOString().split("T")[0],
          type: "checkup",
          description: "",
          medicine: "",
          dosage: "",
          veterinarian: "",
          cost: 0,
          notes: "",
          nextDoseDate: "",
          repeatEveryDays: undefined,
          reminderAdvanceDays: 3,
          reminderEnabled: true,
        });
        setIsAddDialogOpen(false);
        toast.success("Registro de salud agregado correctamente");
      } catch (error) {
        console.error("Error adding health record:", error);
        toast.error("Error al agregar el registro de salud");
      }
    } else {
      toast.error("Por favor complete los campos obligatorios");
    }
  };

  const handleToggleReminder = async (recordId: string, checked: boolean) => {
    if (!updateHealthRecord) { 
      console.error("updateHealthRecord no disponible"); 
      return; 
    }
    try {
      await updateHealthRecord(recordId, { reminderEnabled: checked });
      toast.success("Recordatorio actualizado");
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Error al actualizar el recordatorio");
    }
  };

  const handleMarkDose = async (record: HealthRecord) => {
    if (!updateHealthRecord) { 
      console.error("updateHealthRecord no disponible"); 
      return; 
    }
    
    try {
      const todayIso = toISODate(new Date());
      if (record.nextDoseDate && record.repeatEveryDays && record.repeatEveryDays > 0) {
        const nextDoseDateStr = getDateAsISOString(record.nextDoseDate);
        const next = parseDate(nextDoseDateStr);
        next.setDate(next.getDate() + record.repeatEveryDays);
        await updateHealthRecord(record.id, { 
          date: todayIso, 
          nextDoseDate: toISODate(next) 
        });
      } else {
        await updateHealthRecord(record.id, { 
          date: todayIso, 
          nextDoseDate: undefined 
        });
      }
      toast.success("Dosis marcada como aplicada");
    } catch (error) {
      console.error("Error marking dose:", error);
      toast.error("Error al marcar la dosis");
    }
  };

  const getTypeColor = (type: string) =>
    type === "vaccination" ? "bg-blue-100 text-blue-800"
    : type === "treatment" ? "bg-amber-100 text-amber-800"
    : "bg-green-100 text-green-800";

  const getTypeLabel = (type: string) =>
    type === "vaccination" ? "Vacunación"
    : type === "treatment" ? "Tratamiento"
    : type === "checkup" ? "Chequeo"
    : type;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4">Cargando registros de salud...</span>
      </div>
    );
  }

  // Mensaje si no hay animales
  if (animals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Salud</CardTitle>
          <CardDescription>0 registros encontrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            No hay animales cargados. Agrega animales primero para ver registros.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recordatorios Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="text-red-700 text-sm p-2 bg-red-100 rounded">
                  {notification}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registros de Salud</h1>
          <p className="text-muted-foreground">Gestiona los eventos de salud del ganado</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Agregar Registro</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Salud</DialogTitle>
              <DialogDescription>Registra un nuevo evento de salud para un animal.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <Select onValueChange={(v) => handleSelectChange("animalId", v)} value={newRecord.animalId || ""}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar animal" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {animals.map((a: Animal) => (
                        <SelectItem key={a.id} value={a.id}>{a.tag}{a.name ? ` - ${a.name}` : ""}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input id="date" name="date" type="date" value={newRecord.date as string} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select onValueChange={(v) => handleSelectChange("type", v)} value={newRecord.type as string}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="vaccination">Vacunación</SelectItem>
                        <SelectItem value="treatment">Tratamiento</SelectItem>
                        <SelectItem value="checkup">Chequeo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input id="description" name="description" placeholder="Descripción del tratamiento" value={newRecord.description || ""} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicina</Label>
                  <Input id="medicine" name="medicine" placeholder="Nombre del medicamento" value={newRecord.medicine || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosis</Label>
                  <Input id="dosage" name="dosage" placeholder="Cantidad y unidad" value={newRecord.dosage || ""} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinario</Label>
                  <Input id="veterinarian" name="veterinarian" placeholder="Nombre del veterinario" value={newRecord.veterinarian || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo ($)</Label>
                  <Input id="cost" name="cost" type="number" placeholder="0" value={newRecord.cost?.toString() || ""} onChange={handleInputChange} />
                </div>
              </div>

              {/* Recordatorio */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Recordatorio de Próxima Dosis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextDoseDate">Próxima Dosis</Label>
                    <Input id="nextDoseDate" name="nextDoseDate" type="date" value={(newRecord.nextDoseDate as string) || ""} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repeatEveryDays">Repetir cada (días)</Label>
                    <Input id="repeatEveryDays" name="repeatEveryDays" type="number" placeholder="0" value={(newRecord.repeatEveryDays as number | undefined) ?? ""} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminderAdvanceDays">Avisar con (días) de anticipación</Label>
                    <Input id="reminderAdvanceDays" name="reminderAdvanceDays" type="number" placeholder="3" value={(newRecord.reminderAdvanceDays as number | undefined) ?? 3} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea id="notes" name="notes" placeholder="Notas adicionales..." value={newRecord.notes || ""} onChange={handleInputChange} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddRecord}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Salud</CardTitle>
          <CardDescription>{filteredHealthRecords.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Búsqueda + filtros */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por animal o descripción" className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo de Registro</Label>
                      <Select onValueChange={setSelectedType} value={selectedType || ""}>
                        <SelectTrigger><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="vaccination">Vacunación</SelectItem>
                          <SelectItem value="treatment">Tratamiento</SelectItem>
                          <SelectItem value="checkup">Chequeo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Animal</Label>
                      <Select onValueChange={setSelectedAnimalId} value={selectedAnimalId || ""}>
                        <SelectTrigger><SelectValue placeholder="Todos los animales" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          {animals.map((a: Animal) => (
                            <SelectItem key={a.id} value={a.id}>{a.tag}{a.name ? ` - ${a.name}` : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => {
                      setSelectedType(null);
                      setSelectedAnimalId(null);
                      setSearchTerm("");
                    }}>
                      Limpiar filtros
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Leyenda + Tabla + Panel lateral */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabla */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Leyenda:</span>
                  <span className="px-2 py-0.5 rounded border bg-red-100 text-red-800 text-xs">Atrasada</span>
                  <span className="px-2 py-0.5 rounded border bg-orange-100 text-orange-800 text-xs">Hoy</span>
                  <span className="px-2 py-0.5 rounded border bg-amber-100 text-amber-900 text-xs">Pronto</span>
                  <span className="px-2 py-0.5 rounded border bg-emerald-100 text-emerald-800 text-xs">OK</span>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Animal</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Medicina</TableHead>
                        <TableHead>Veterinario</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Próxima dosis</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Recordatorio</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHealthRecords.length > 0 ? filteredHealthRecords.map((record: HealthRecordWithAnimalInfo) => {
                        const st = getDoseStatus(record);
                        const pct = progressPct(record);

                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {record.date ? parseDate(record.date).toLocaleDateString() : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {record.animalTag || "-"} {record.animalName && `(${record.animalName})`}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getTypeColor(record.type)}>
                                {getTypeLabel(record.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.description || "-"}</TableCell>
                            <TableCell>{record.medicine || "-"}</TableCell>
                            <TableCell>{record.veterinarian || "-"}</TableCell>
                            <TableCell>{typeof record.cost === "number" ? `$${record.cost}` : "-"}</TableCell>
                            <TableCell>
                              {record.nextDoseDate ? (
                                <div className="min-w-[160px]">
                                  <div className="text-sm mb-1">
                                    {parseDate(record.nextDoseDate).toLocaleDateString()}
                                    {typeof record.reminderAdvanceDays === "number" && record.reminderAdvanceDays > 0 && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        (aviso {record.reminderAdvanceDays}d)
                                      </span>
                                    )}
                                  </div>
                                  {typeof record.reminderAdvanceDays === "number" && record.reminderAdvanceDays > 0 && (
                                    <div className="h-2 w-full bg-muted rounded">
                                      <div className={
                                        "h-2 rounded " + (st === "overdue" ? "bg-red-500" : st === "today" ? "bg-orange-500" : st === "soon" ? "bg-amber-500" : "bg-emerald-500")
                                      } style={{ width: `${pct}%` }} />
                                    </div>
                                  )}
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded border text-xs ${statusStyles[st]}`}>
                                {statusLabel[st]}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Activo</span>
                                <Switch
                                  checked={!!record.reminderEnabled}
                                  onCheckedChange={(checked) => handleToggleReminder(record.id, checked)}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir menú</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkDose(record)}>
                                    Marcar dosis aplicada
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteHealthRecord(record.id)}
                                  >
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={11} className="h-24 text-center">
                            {healthRecords.length === 0 
                              ? "No hay registros de salud. Crea uno con 'Agregar Registro'."
                              : "No se encontraron registros que coincidan con los filtros."
                            }
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Panel lateral */}
              <div className="space-y-4">
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Próximas dosis</CardTitle>
                    <CardDescription>
                      {upcomingDoseItems.length > 0 ? `${upcomingDoseItems.length} próximas` : "Sin próximas dosis"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {upcomingDoseItems.map((item: HealthRecordWithAnimalInfo) => {
                        return (
                          <div key={item.id} className="rounded-lg border p-3 hover:bg-muted/50 transition">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {item.animalTag} {item.animalName && (
                                  <span className="text-muted-foreground">({item.animalName})</span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded border text-xs ${statusStyles[item._status!]}`}>
                                {statusLabel[item._status!]}
                              </span>
                            </div>
                            <div className="mt-1 text-sm">
                              {item.medicine || item.type} • {item.description}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Próxima: {parseDate(item.nextDoseDate).toLocaleDateString()}
                              {typeof item.reminderAdvanceDays === "number" && item.reminderAdvanceDays > 0 && ` • aviso ${item.reminderAdvanceDays}d`}
                            </div>
                            {typeof item.reminderAdvanceDays === "number" && item.reminderAdvanceDays > 0 && (
                              <div className="mt-2 h-1.5 w-full bg-muted rounded">
                                <div className={"h-1.5 rounded " + (item._status === "overdue" ? "bg-red-500" : item._status === "today" ? "bg-orange-500" : item._status === "soon" ? "bg-amber-500" : "bg-emerald-500")}
                                  style={{ width: `${progressPct(item)}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
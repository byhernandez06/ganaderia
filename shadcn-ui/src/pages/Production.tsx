import React, { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProductionRecord, ProductionType, AnimalType } from "@/types";
import { PlusCircle, MoreHorizontal, Search, Calendar, Droplet, BarChart2, Download, Trash2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/** Tipo para los registros enriquecidos que usa la UI */
type EnrichedProduction = ProductionRecord & {
  date: string; // YYYY-MM-DD
  animalTag: string;
  animalName: string;
  animalType?: AnimalType;
  quality?: string;
  notes?: string;
  turno?: "mañana" | "tarde" | "noche";
  ubicacion_ordeño?: string;
};

type AnimalTotal = { animalId: string; tag: string; name: string; total: number; count: number };

export default function Production() {
  const { animals, productionRecords, addProductionRecord, deleteProductionRecord } = useFarm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newRecord, setNewRecord] = useState<Omit<ProductionRecord, "id"> & {
    quality?: string;
    notes?: string;
    date: string;
  }>({
    animalId: "",
    timestamp: Timestamp.fromDate(new Date()),
    type: ProductionType.MILK,
    quantity: 0,
    turno: "mañana",
    ubicacion_ordeño: "",
    date: new Date().toISOString().split("T")[0],
    quality: "",
    notes: "",
  });

  /** Normaliza y enriquece todos los registros con datos del animal y fecha */
  const allProductionRecords = useMemo<EnrichedProduction[]>(() => {
    if (!productionRecords || productionRecords.length === 0) return [];

    return productionRecords.map((record) => {
      const animal = animals?.find((a) => a.id === record.animalId);

      // Fecha normalizada
      let dateStr = new Date().toISOString().split("T")[0];
      try {
        if (record.timestamp instanceof Timestamp) {
          dateStr = record.timestamp.toDate().toISOString().split("T")[0];
        } else if (record.timestamp instanceof Date) {
          dateStr = record.timestamp.toISOString().split("T")[0];
        } else {
          dateStr = new Date(record.timestamp as any).toISOString().split("T")[0];
        }
      } catch {
        // deja dateStr por defecto (hoy) en caso de error
      }

      // quantity numérica SIEMPRE
      const qty = typeof record.quantity === "string"
        ? parseFloat(record.quantity)
        : Number(record.quantity ?? 0);

      // type como string (MILK | MEAT)
      const type = String(record.type) as ProductionType;

      return {
        ...record,
        quantity: isNaN(qty) ? 0 : qty,
        type,
        date: dateStr,
        animalTag: animal?.tag || record.animalId,
        animalName: animal?.name || "",
        animalType: animal?.type,
        quality: (record as any).quality || "",
        notes: (record as any).notes || "",
        turno: (record as any).turno || "mañana",
        ubicacion_ordeño: (record as any).ubicacion_ordeño || "",
      };
    });
  }, [productionRecords, animals]);

  /** Filtros por búsqueda y por animal */
  const filteredProductionRecords = useMemo<EnrichedProduction[]>(() => {
    const searchLower = searchTerm.toLowerCase();

    return allProductionRecords.filter((record) => {
      const matchesSearch =
        !searchTerm ||
        record.animalTag.toLowerCase().includes(searchLower) ||
        (record.animalName?.toLowerCase() || "").includes(searchLower) ||
        record.date.includes(searchTerm);

      const matchesAnimal = !selectedAnimalId || record.animalId === selectedAnimalId;
      return matchesSearch && matchesAnimal;
    });
  }, [allProductionRecords, searchTerm, selectedAnimalId]);

  /** Separa por tipo (LECHE / CARNE) */
  const milkRecords = useMemo(
    () => filteredProductionRecords.filter((r) => r.type === ProductionType.MILK),
    [filteredProductionRecords]
  );
  const meatRecords = useMemo(
    () => filteredProductionRecords.filter((r) => r.type === ProductionType.MEAT),
    [filteredProductionRecords]
  );

  /** Subtotales según filtros vigentes */
  const milkSubtotal = useMemo(
    () => milkRecords.reduce((t, r) => t + (Number(r.quantity) || 0), 0),
    [milkRecords]
  );
  const meatSubtotal = useMemo(
    () => meatRecords.reduce((t, r) => t + (Number(r.quantity) || 0), 0),
    [meatRecords]
  );

  /** Construye totales por animal */
  const buildTotals = (rows: EnrichedProduction[]): AnimalTotal[] => {
    const map = new Map<string, { tag: string; name: string; total: number; count: number }>();
    for (const r of rows) {
      const key = r.animalId;
      const prev = map.get(key) ?? { tag: r.animalTag, name: r.animalName, total: 0, count: 0 };
      prev.total += Number(r.quantity) || 0;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map, ([animalId, v]) => ({ animalId, ...v })).sort((a, b) => b.total - a.total);
  };

  /** Totales por animal (según filtros) + maps para acceso O(1) */
  const milkTotalsByAnimal = useMemo<AnimalTotal[]>(() => buildTotals(milkRecords), [milkRecords]);
  const meatTotalsByAnimal = useMemo<AnimalTotal[]>(() => buildTotals(meatRecords), [meatRecords]);

  const milkTotalsMap = useMemo(() => new Map(milkTotalsByAnimal.map((r) => [r.animalId, r.total])), [milkTotalsByAnimal]);
  const meatTotalsMap = useMemo(() => new Map(meatTotalsByAnimal.map((r) => [r.animalId, r.total])), [meatTotalsByAnimal]);

  /** Exportar PDF */
  const downloadPDF = (records: EnrichedProduction[], title: string, unit: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);
    const subtotal = records.reduce((total, record) => total + (record.quantity || 0), 0);
    doc.text(`Total: ${subtotal.toFixed(2)} ${unit}`, 14, 42);

    const tableData = records.map((record) => [
      new Date(record.date).toLocaleDateString(),
      `${record.animalTag} ${record.animalName ? `(${record.animalName})` : ""}`,
      `${record.quantity?.toFixed(2) || "0"} ${unit}`,
      record.turno || "-",
      record.ubicacion_ordeño || "-",
      record.quality || "-",
      record.notes || "-",
    ]);

    doc.autoTable({
      startY: 50,
      head: [["Fecha", "Animal", "Cantidad", "Turno", "Ubicación"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  /** Handlers de formulario */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      setNewRecord((prev) => ({ ...prev, [name]: value as ProductionType, animalId: "" }));
    } else {
      setNewRecord((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRecord = async () => {
    if (newRecord.animalId && newRecord.date && newRecord.type !== undefined && newRecord.quantity !== undefined) {
      const recordToAdd = {
        ...newRecord,
        timestamp: Timestamp.fromDate(new Date(newRecord.date)),
        turno: newRecord.turno || "mañana",
        ubicacion_ordeño: newRecord.ubicacion_ordeño || "",
      };
      await addProductionRecord(recordToAdd as Omit<ProductionRecord, "id">);
      setNewRecord({
        animalId: "",
        timestamp: Timestamp.fromDate(new Date()),
        type: ProductionType.MILK,
        quantity: 0,
        turno: "mañana",
        ubicacion_ordeño: "",
        date: new Date().toISOString().split("T")[0],
        quality: "",
        notes: "",
      });
      setIsAddDialogOpen(false);
    }
  };

  /** Lista de animales válida según el tipo elegido */
  const filteredAnimals =
    animals?.filter(
      (animal) =>
        (newRecord.type === ProductionType.MILK && animal.type === AnimalType.DAIRY_CATTLE) ||
        (newRecord.type === ProductionType.MEAT && animal.type === AnimalType.BEEF_CATTLE)
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Producción</h1>
          <p className="text-muted-foreground">Registro y seguimiento de la producción de leche y carne</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Producción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Producción</DialogTitle>
              <DialogDescription>Registra la producción de leche o ganancia de peso para un animal.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Producción</Label>
                  <Select onValueChange={(value) => handleSelectChange("type", value)} value={newRecord.type || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={ProductionType.MILK}>Leche</SelectItem>
                        <SelectItem value={ProductionType.MEAT}>Carne (Ganancia de Peso)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalId">Animal</Label>
                  <Select onValueChange={(value) => handleSelectChange("animalId", value)} value={newRecord.animalId || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar animal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {filteredAnimals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} {animal.name ? `- ${animal.name}` : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" name="date" type="date" value={newRecord.date} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">{newRecord.type === ProductionType.MILK ? "Cantidad (litros)" : "Ganancia (kg)"}</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newRecord.quantity?.toString() || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {newRecord.type === ProductionType.MILK && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion_ordeño">Ubicación (Ordeño)</Label>
                    <Input
                      id="ubicacion_ordeño"
                      name="ubicacion_ordeño"
                      placeholder="Ubicación de Ordeño"
                      value={newRecord.ubicacion_ordeño}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="turno">Turno</Label>
                    <Select
                      value={newRecord.turno}
                      onValueChange={(value) =>
                        setNewRecord((prev) => ({
                          ...prev,
                          turno: value as "mañana" | "tarde" | "noche",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mañana">Mañana</SelectItem>
                        <SelectItem value="tarde">Tarde</SelectItem>
                        <SelectItem value="noche">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quality">Calidad (Opcional)</Label>
                  <Input id="quality" name="quality" placeholder="Ej: Excelente, Buena, Regular" value={newRecord.quality || ""} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRecord}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="milk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="milk">
            <Droplet className="mr-2 h-4 w-4" />
            Producción de Leche ({milkRecords.length})
          </TabsTrigger>
          <TabsTrigger value="meat">
            <BarChart2 className="mr-2 h-4 w-4" />
            Ganancia de Peso ({meatRecords.length})
          </TabsTrigger>
        </TabsList>

        {/* ====== TAB LECHE ====== */}
        <TabsContent value="milk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resumen de Producción de Leche</span>
                <Button variant="outline" size="sm" onClick={() => downloadPDF(milkRecords, "Producción de Leche", "L")} disabled={milkRecords.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{milkSubtotal.toFixed(2)} L</div>
                  <div className="text-sm text-muted-foreground">Total de Leche</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{milkRecords.length}</div>
                  <div className="text-sm text-muted-foreground">Registros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {milkRecords.length > 0 ? (milkSubtotal / milkRecords.length).toFixed(2) : "0.00"} L
                  </div>
                  <div className="text-sm text-muted-foreground">Promedio por Registro</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totales por animal (LECHE) */}
          <Card>
            <CardHeader>
              <CardTitle>Totales por Animal (Leche)</CardTitle>
              <CardDescription>Acumulado según filtros actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead className="text-right">Total (L)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milkTotalsByAnimal.map((row) => (
                      <TableRow key={row.animalId}>
                        <TableCell>
                          <div className="font-medium">{row.tag}</div>
                          {row.name && <div className="text-sm text-muted-foreground">({row.name})</div>}
                        </TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell className="text-right">{row.total.toFixed(2)} L</TableCell>
                      </TableRow>
                    ))}
                    {milkTotalsByAnimal.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          Sin datos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
{/* Tabla de registros LECHE */}
<Card>
  <CardHeader>
    <CardTitle>Registros de Producción de Leche</CardTitle>
    <CardDescription>{milkRecords.length} registros encontrados</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por animal, fecha..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Cantidad (L)</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acumulado Animal</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milkRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <div className="font-medium">{record.animalTag}</div>
                    {record.animalName && (
                      <div className="text-sm text-muted-foreground">({record.animalName})</div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-800">
                    {(record.quantity || 0).toFixed(2)} L
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{record.turno || "-"}</Badge>
                </TableCell>

                <TableCell>{record.ubicacion_ordeño || "-"}</TableCell>

                <TableCell className="text-right">
                  {(milkTotalsMap.get(record.animalId) ?? 0).toFixed(2)} L
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteProductionRecord(record.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {milkRecords.length === 0 && (
              <TableRow>
                {/* 7 columnas en el header -> colSpan 7 */}
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron registros de producción de leche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </CardContent>
</Card>

        </TabsContent>

        {/* ====== TAB CARNE ====== */}
        <TabsContent value="meat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resumen de Ganancia de Peso</span>
                <Button variant="outline" size="sm" onClick={() => downloadPDF(meatRecords, "Ganancia de Peso", "kg")} disabled={meatRecords.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{meatSubtotal.toFixed(2)} kg</div>
                  <div className="text-sm text-muted-foreground">Total de Ganancia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{meatRecords.length}</div>
                  <div className="text-sm text-muted-foreground">Registros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {meatRecords.length > 0 ? (meatSubtotal / meatRecords.length).toFixed(2) : "0.00"} kg
                  </div>
                  <div className="text-sm text-muted-foreground">Promedio por Registro</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Totales por animal (CARNE) */}
          <Card>
            <CardHeader>
              <CardTitle>Totales por Animal (Carne)</CardTitle>
              <CardDescription>Acumulado según filtros actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead className="text-right">Total (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meatTotalsByAnimal.map((row) => (
                      <TableRow key={row.animalId}>
                        <TableCell>
                          <div className="font-medium">{row.tag}</div>
                          {row.name && <div className="text-sm text-muted-foreground">({row.name})</div>}
                        </TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell className="text-right">{row.total.toFixed(2)} kg</TableCell>
                      </TableRow>
                    ))}
                    {meatTotalsByAnimal.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8"></TableCell>
                          Sin datos
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de registros CARNE */}
          <Card>
            <CardHeader>
              <CardTitle>Registros de Ganancia de Peso</CardTitle>
              <CardDescription>{meatRecords.length} registros encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por animal, fecha..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Animal</TableHead>
                        <TableHead>Ganancia (kg)</TableHead>
                        <TableHead className="text-right">Acumulado Animal</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meatRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.animalTag}</div>
                              {record.animalName && <div className="text-sm text-muted-foreground">({record.animalName})</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-50 text-green-800">
                              {(record.quantity || 0).toFixed(2)} kg
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.quality ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                {record.quality}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {(meatTotalsMap.get(record.animalId) ?? 0).toFixed(2)} kg
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteProductionRecord(record.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {meatRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No se encontraron registros de ganancia de peso.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

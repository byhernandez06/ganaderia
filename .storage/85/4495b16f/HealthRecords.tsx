import React, { useState } from "react";
import { useFarm } from "@/contexts/FarmContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Animal, HealthRecord } from "@/types";
import { PlusCircle, MoreHorizontal, Filter, Search, Calendar } from "lucide-react";

export default function HealthRecords() {
  const { animals, addHealthRecord, deleteHealthRecord } = useFarmContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
  });

  // Get all health records from all animals
  const allHealthRecords = animals.flatMap(animal => 
    animal.health.map(record => ({
      ...record,
      animalTag: animal.tag,
      animalName: animal.name || "",
      animalType: animal.type
    }))
  );

  // Filter health records based on search term and selected filters
  const filteredHealthRecords = allHealthRecords.filter((record) => {
    const matchesSearch =
      record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.medicine?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || record.type === selectedType;
    const matchesAnimal = !selectedAnimalId || record.animalId === selectedAnimalId;

    return matchesSearch && matchesType && matchesAnimal;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord({
      ...newRecord,
      [name]: name === "cost" ? parseFloat(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewRecord({
      ...newRecord,
      [name]: value
    });
  };

  const handleAddRecord = () => {
    if (newRecord.animalId && newRecord.date && newRecord.type && newRecord.description) {
      addHealthRecord(newRecord as Omit<HealthRecord, "id">);
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
      });
      setIsAddDialogOpen(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-amber-100 text-amber-800";
      case "checkup":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vaccination":
        return "Vacunación";
      case "treatment":
        return "Tratamiento";
      case "checkup":
        return "Chequeo";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registros de Salud</h1>
          <p className="text-muted-foreground">
            Gestiona los eventos de salud del ganado
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Salud</DialogTitle>
              <DialogDescription>
                Registra un nuevo evento de salud para un animal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("animalId", value)}
                  value={newRecord.animalId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar animal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.tag} {animal.name ? `- ${animal.name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newRecord.date as string}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("type", value)}
                    value={newRecord.type as string}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
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
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Descripción del evento de salud"
                  value={newRecord.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicina (Opcional)</Label>
                  <Input
                    id="medicine"
                    name="medicine"
                    placeholder="Nombre del medicamento"
                    value={newRecord.medicine || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosis (Opcional)</Label>
                  <Input
                    id="dosage"
                    name="dosage"
                    placeholder="Cantidad y unidad"
                    value={newRecord.dosage || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinario (Opcional)</Label>
                  <Input
                    id="veterinarian"
                    name="veterinarian"
                    placeholder="Nombre del veterinario"
                    value={newRecord.veterinarian || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo (Opcional)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    placeholder="0"
                    value={newRecord.cost?.toString() || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Observaciones adicionales"
                  value={newRecord.notes || ""}
                  onChange={handleInputChange}
                />
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

      <Card>
        <CardHeader>
          <CardTitle>Historial de Salud</CardTitle>
          <CardDescription>
            {filteredHealthRecords.length} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por animal o descripción"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los animales" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          {animals.map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} {animal.name ? `- ${animal.name}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedType(null);
                        setSelectedAnimalId(null);
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
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
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHealthRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{record.animalTag} {record.animalName && `(${record.animalName})`}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeColor(record.type)}>
                          {getTypeLabel(record.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>{record.medicine || "-"}</TableCell>
                      <TableCell>{record.veterinarian || "-"}</TableCell>
                      <TableCell>{record.cost ? `$${record.cost}` : "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
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
                  ))}
                  {filteredHealthRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No se encontraron registros de salud con los criterios de búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
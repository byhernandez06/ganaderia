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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Animal, AnimalStatus, AnimalType } from "@/types";
import { PlusCircle, MoreHorizontal, Filter, Search } from "lucide-react";

export default function Animals() {
  const { animals, addAnimal, updateAnimal, deleteAnimal } = useFarm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAnimal, setNewAnimal] = useState<Partial<Animal>>({
    tag: "",
    name: "",
    type: AnimalType.DAIRY_CATTLE,
    breed: "",
    birthDate: new Date().toISOString().split("T")[0],
    gender: "female",
    status: AnimalStatus.HEALTHY,
    weight: 0
  });

  // Filter animals based on search term and selected filters
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || animal.type === selectedType;
    const matchesStatus = !selectedStatus || animal.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAnimal({
      ...newAnimal,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewAnimal({
      ...newAnimal,
      [name]: value
    });
  };

  const handleAddAnimal = () => {
    if (newAnimal.tag && newAnimal.breed && newAnimal.type && newAnimal.status && newAnimal.weight) {
      addAnimal(newAnimal as Omit<Animal, "id" | "health" | "production">);
      setNewAnimal({
        tag: "",
        name: "",
        type: AnimalType.DAIRY_CATTLE,
        breed: "",
        birthDate: new Date().toISOString().split("T")[0],
        gender: "female",
        status: AnimalStatus.HEALTHY,
        weight: 0
      });
      setIsAddDialogOpen(false);
    }
  };

  const getStatusColor = (status: AnimalStatus) => {
    switch (status) {
      case AnimalStatus.HEALTHY:
        return "bg-green-100 text-green-800";
      case AnimalStatus.SICK:
        return "bg-red-100 text-red-800";
      case AnimalStatus.PREGNANT:
        return "bg-blue-100 text-blue-800";
      case AnimalStatus.LACTATING:
        return "bg-purple-100 text-purple-800";
      case AnimalStatus.DRY:
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Animales</h1>
          <p className="text-muted-foreground">
            Gestiona tu ganado lechero y de carne
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Animal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Animal</DialogTitle>
              <DialogDescription>
                Completa los detalles del nuevo animal para añadirlo al registro.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tag">Etiqueta/Arete</Label>
                  <Input
                    id="tag"
                    name="tag"
                    placeholder="ABC123"
                    value={newAnimal.tag}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre (Opcional)</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    value={newAnimal.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("type", value)}
                    defaultValue={newAnimal.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={AnimalType.DAIRY_CATTLE}>Ganado Lechero</SelectItem>
                        <SelectItem value={AnimalType.BEEF_CATTLE}>Ganado Cárnico</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    name="breed"
                    placeholder="Holstein, Angus, etc."
                    value={newAnimal.breed}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={newAnimal.birthDate as string}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    defaultValue={newAnimal.gender as string}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="female">Hembra</SelectItem>
                        <SelectItem value="male">Macho</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("status", value)}
                    defaultValue={newAnimal.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={AnimalStatus.HEALTHY}>Saludable</SelectItem>
                        <SelectItem value={AnimalStatus.SICK}>Enfermo</SelectItem>
                        <SelectItem value={AnimalStatus.PREGNANT}>Preñada</SelectItem>
                        <SelectItem value={AnimalStatus.LACTATING}>Lactando</SelectItem>
                        <SelectItem value={AnimalStatus.DRY}>Seca</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="0"
                    value={newAnimal.weight?.toString()}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAnimal}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Animales</CardTitle>
          <CardDescription>
            {filteredAnimals.length} animales encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por etiqueta, nombre o raza"
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
                      <Label>Tipo</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="dairy" 
                            checked={selectedType === AnimalType.DAIRY_CATTLE}
                            onCheckedChange={() => setSelectedType(selectedType === AnimalType.DAIRY_CATTLE ? null : AnimalType.DAIRY_CATTLE)}
                          />
                          <Label htmlFor="dairy">Ganado Lechero</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="beef" 
                            checked={selectedType === AnimalType.BEEF_CATTLE}
                            onCheckedChange={() => setSelectedType(selectedType === AnimalType.BEEF_CATTLE ? null : AnimalType.BEEF_CATTLE)}
                          />
                          <Label htmlFor="beef">Ganado Cárnico</Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select onValueChange={setSelectedStatus} value={selectedStatus || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value={AnimalStatus.HEALTHY}>Saludable</SelectItem>
                          <SelectItem value={AnimalStatus.SICK}>Enfermo</SelectItem>
                          <SelectItem value={AnimalStatus.PREGNANT}>Preñada</SelectItem>
                          <SelectItem value={AnimalStatus.LACTATING}>Lactando</SelectItem>
                          <SelectItem value={AnimalStatus.DRY}>Seca</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        setSelectedType(null);
                        setSelectedStatus(null);
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
                    <TableHead>Etiqueta/Arete</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Raza</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimals.map((animal) => {
                    const birthDate = new Date(animal.birthDate);
                    const ageInMs = new Date().getTime() - birthDate.getTime();
                    const ageInYears = (ageInMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
                    
                    return (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.tag}</TableCell>
                        <TableCell>{animal.name || "-"}</TableCell>
                        <TableCell>
                          {animal.type === AnimalType.DAIRY_CATTLE ? "Lechero" : "Cárnico"}
                        </TableCell>
                        <TableCell>{animal.breed}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(animal.status)}>
                            {animal.status === AnimalStatus.HEALTHY && "Saludable"}
                            {animal.status === AnimalStatus.SICK && "Enfermo"}
                            {animal.status === AnimalStatus.PREGNANT && "Preñada"}
                            {animal.status === AnimalStatus.LACTATING && "Lactando"}
                            {animal.status === AnimalStatus.DRY && "Seca"}
                          </Badge>
                        </TableCell>
                        <TableCell>{animal.weight} kg</TableCell>
                        <TableCell>{ageInYears} años</TableCell>
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
                                onClick={() => deleteAnimal(animal.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredAnimals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No se encontraron animales con los criterios de búsqueda.
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
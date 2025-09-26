import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Animal, AnimalStatus, AnimalType } from "@/types";
import { PlusCircle, MoreHorizontal, Filter, Search, Eye, Edit, Calendar, Activity, TrendingUp, Users } from "lucide-react";

export default function Animals() {
  const { animals, healthRecords, productionRecords, addAnimal, updateAnimal, deleteAnimal } = useFarm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [editAnimal, setEditAnimal] = useState<Partial<Animal>>({});
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

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditAnimal({
      ...editAnimal,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewAnimal({
      ...newAnimal,
      [name]: value
    });
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditAnimal({
      ...editAnimal,
      [name]: value
    });
  };

  const handleAddAnimal = async () => {
    if (
      newAnimal.tag &&
      newAnimal.breed &&
      newAnimal.type &&
      newAnimal.status &&
      newAnimal.weight
    ) {
      await addAnimal(newAnimal);

      // Reset del formulario
      setNewAnimal({
        tag: "",
        name: "",
        type: AnimalType.DAIRY_CATTLE,
        breed: "",
        birthDate: new Date().toISOString().split("T")[0],
        gender: "female",
        status: AnimalStatus.HEALTHY,
        weight: 0,
        parentInfo: {
          father: null,
          mother: null,
          maternalGrandfather: null,
          maternalGrandmother: null,
          paternalGrandfather: null,
          paternalGrandmother: null,
        },
      });

      setIsAddDialogOpen(false);
    }
  };

  const handleEditAnimal = () => {
    if (selectedAnimal && editAnimal) {
      updateAnimal(selectedAnimal.id, editAnimal);
      setIsEditDialogOpen(false);
      setSelectedAnimal(null);
      setEditAnimal({});
    }
  };

  const toFormDateString = (d: any): string => {
    if (!d) return "";
    // Firestore Timestamp
    if (typeof d === "object" && typeof d.toDate === "function") {
      return d.toDate().toISOString().split("T")[0];
    }
    if (d instanceof Date) return d.toISOString().split("T")[0];
    if (typeof d === "string") return d;
    return "";
  };

  // helper: texto para mostrar ParentReference
  const getParentDisplay = (p?: { id: string; tag?: string; name?: string } | null) =>
    p ? `${p.tag ? `${p.tag}${p.name ? " · " : ""}` : ""}${p.name ?? p.id}` : "";

  const openEditDialog = (animal: Animal) => {
    setSelectedAnimal(animal);

    setEditAnimal({
      tag: animal.tag,
      name: animal.name ?? "",
      type: animal.type,
      breed: animal.breed,
      birthDate: toFormDateString((animal as any).birthDate),
      gender: animal.gender,
      status: animal.status,
      weight: animal.weight,
      purchaseDate: toFormDateString((animal as any).purchaseDate),
      purchasePrice: animal.purchasePrice ?? null,
      notes: animal.notes ?? "",
      parentInfo: {
        mother: animal.parentInfo?.mother ?? null,
        father: animal.parentInfo?.father ?? null,
        maternalGrandfather: animal.parentInfo?.maternalGrandfather ?? null,
        maternalGrandmother: animal.parentInfo?.maternalGrandmother ?? null,
        paternalGrandfather: animal.parentInfo?.paternalGrandfather ?? null,
        paternalGrandmother: animal.parentInfo?.paternalGrandmother ?? null,
      },
      imageUrl: animal.imageUrl ?? null,
    });

    setIsEditDialogOpen(true);
  };


  const openDetailsDialog = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDetailsDialogOpen(true);
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

  const getAnimalHealthRecords = (animalId: string) => {
    return healthRecords.filter(record => record.animalId === animalId);
  };

  const getAnimalProductionRecords = (animalId: string) => {
    return productionRecords.filter(record => record.animalId === animalId);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "No disponible";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Fecha inválida";
    return d.toLocaleDateString('es-ES');
  };

  const calculateAge = (birthDate: Date | string | null | undefined) => {
    if (!birthDate) return "No disponible";

    let birth: Date;

    // Si es Firestore Timestamp
    if (typeof birthDate === "object" && "seconds" in birthDate) {
      birth = new Date(birthDate.seconds * 1000);
    } else {
      birth = new Date(birthDate);
    }

    if (isNaN(birth.getTime())) return "No disponible"; // en lugar de "Fecha inválida"

    const now = new Date();
    const ageInMs = now.getTime() - birth.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

    if (ageInYears < 1) {
      const ageInMonths = Math.floor(ageInYears * 12);
      return `${ageInMonths} ${ageInMonths === 1 ? "mes" : "meses"}`;
    }

    return `${ageInYears.toFixed(1)} años`;
  };


  const findAnimalById = (id: string) => {
    return animals.find(animal => animal.id === id);
  };

  function getParentInfo(parent?: { id: string; tag?: string; name?: string } | null): string {
    if (!parent) return "";
    return `${parent.tag || ""} ${parent.name || ""}`.trim();
  }

  const getGrandparents = (parentId: string | undefined) => {
    if (!parentId) return { maternal: null, paternal: null };
    const parent = findAnimalById(parentId);
    if (!parent) return { maternal: null, paternal: null };

    return {
      maternal: parent.parentFemaleId ? getParentInfo(parent.parentFemaleId) : null,
      paternal: parent.parentMaleId ? getParentInfo(parent.parentMaleId) : null
    };
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Animal</DialogTitle>
              <DialogDescription>
                Completa los detalles del nuevo animal para añadirlo al registro.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Tag & Nombre */}
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

              {/* Tipo & Raza */}
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

              {/* Fecha nacimiento & Género */}
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

              {/* Estado & Peso */}
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

              {/* Padre & Madre */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentFemaleId">Madre (Opcional)</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const mother = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            mother:
                              value !== "none"
                                ? {
                                  id: mother?.id || "",
                                  tag: mother?.tag,
                                  name: mother?.name || mother?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar madre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin madre registrada</SelectItem>
                        {animals
                          .filter((a) => a.gender === "female")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentMaleId">Padre (Opcional)</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const father = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            father:
                              value !== "none"
                                ? {
                                  id: father?.id || "",
                                  tag: father?.tag,
                                  name: father?.name || father?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin padre registrado</SelectItem>
                        {animals
                          .filter((a) => a.gender === "male")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Abuelos Maternos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Abuelo Materno</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const abuelo = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            maternalGrandfather:
                              value !== "none"
                                ? {
                                  id: abuelo?.id || "",
                                  tag: abuelo?.tag,
                                  name: abuelo?.name || abuelo?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar abuelo materno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin abuelo registrado</SelectItem>
                        {animals
                          .filter((a) => a.gender === "male")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Abuela Materna</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const abuela = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            maternalGrandmother:
                              value !== "none"
                                ? {
                                  id: abuela?.id || "",
                                  tag: abuela?.tag,
                                  name: abuela?.name || abuela?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar abuela materna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin abuela registrada</SelectItem>
                        {animals
                          .filter((a) => a.gender === "female")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Abuelos Paternos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Abuelo Paterno</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const abuelo = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            paternalGrandfather:
                              value !== "none"
                                ? {
                                  id: abuelo?.id || "",
                                  tag: abuelo?.tag,
                                  name: abuelo?.name || abuelo?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar abuelo paterno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin abuelo registrado</SelectItem>
                        {animals
                          .filter((a) => a.gender === "male")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Abuela Paterna</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewAnimal((prev) => {
                        const abuela = animals.find((a) => a.id === value);
                        return {
                          ...prev,
                          parentInfo: {
                            ...prev.parentInfo,
                            paternalGrandmother:
                              value !== "none"
                                ? {
                                  id: abuela?.id || "",
                                  tag: abuela?.tag,
                                  name: abuela?.name || abuela?.tag || "Sin nombre",
                                }
                                : null,
                          },
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar abuela paterna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">Sin abuela registrada</SelectItem>
                        {animals
                          .filter((a) => a.gender === "female")
                          .map((animal) => (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.tag} - {animal.name || "Sin nombre"}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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

      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal</DialogTitle>
            <DialogDescription>
              Modifica los detalles del animal seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* --- BASIC FIELDS --- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tag">Etiqueta/Arete</Label>
                <Input
                  id="edit-tag"
                  name="tag"
                  placeholder="ABC123"
                  value={editAnimal.tag || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre (Opcional)</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Nombre"
                  value={editAnimal.name || ""}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>

            {/* Tipo & Raza */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  onValueChange={(value) => handleEditSelectChange("type", value)}
                  value={editAnimal.type as string | undefined}
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
                <Label htmlFor="edit-breed">Raza</Label>
                <Input
                  id="edit-breed"
                  name="breed"
                  placeholder="Holstein, Angus, etc."
                  value={editAnimal.breed || ""}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>

            {/* Fecha nacimiento & Género */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="edit-birthDate"
                  name="birthDate"
                  type="date"
                  value={(editAnimal.birthDate as string) || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Género</Label>
                <Select
                  onValueChange={(value) => handleEditSelectChange("gender", value)}
                  value={editAnimal.gender as string | undefined}
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

            {/* Estado & Peso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  onValueChange={(value) => handleEditSelectChange("status", value)}
                  value={editAnimal.status as string | undefined}
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
                <Label htmlFor="edit-weight">Peso (kg)</Label>
                <Input
                  id="edit-weight"
                  name="weight"
                  type="number"
                  placeholder="0"
                  value={editAnimal.weight?.toString() || ""}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>

            {/* Padre & Madre (controlados, muestran valor actual) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Madre */}
              <div className="space-y-2">
                <Label htmlFor="edit-parentFemaleId">Madre (Opcional)</Label>
                <Select
                  value={editAnimal.parentInfo?.mother?.id ?? "none"}
                  onValueChange={(value) => {
                    const mother = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        mother:
                          value !== "none"
                            ? {
                              id: mother?.id || "",
                              tag: mother?.tag,
                              name: mother?.name || mother?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar madre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin madre registrada</SelectItem>
                      {animals
                        .filter((a) => a.gender === "female" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Padre */}
              <div className="space-y-2">
                <Label htmlFor="edit-parentMaleId">Padre (Opcional)</Label>
                <Select
                  value={editAnimal.parentInfo?.father?.id ?? "none"}
                  onValueChange={(value) => {
                    const father = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        father:
                          value !== "none"
                            ? {
                              id: father?.id || "",
                              tag: father?.tag,
                              name: father?.name || father?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin padre registrado</SelectItem>
                      {animals
                        .filter((a) => a.gender === "male" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* === Parent Info === */}
            <div className="grid grid-cols-2 gap-4">
              {/* Madre */}
              <div className="space-y-2">
                <Label htmlFor="edit-mother">Madre (Opcional)</Label>
                <Select
                  value={editAnimal.parentInfo?.mother?.id ?? "none"}
                  onValueChange={(value) => {
                    const mother = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        mother:
                          value !== "none"
                            ? {
                              id: mother?.id || "",
                              tag: mother?.tag,
                              name: mother?.name || mother?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar madre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin madre registrada</SelectItem>
                      {animals
                        .filter((a) => a.gender === "female" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Padre */}
              <div className="space-y-2">
                <Label htmlFor="edit-father">Padre (Opcional)</Label>
                <Select
                  value={editAnimal.parentInfo?.father?.id ?? "none"}
                  onValueChange={(value) => {
                    const father = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        father:
                          value !== "none"
                            ? {
                              id: father?.id || "",
                              tag: father?.tag,
                              name: father?.name || father?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin padre registrado</SelectItem>
                      {animals
                        .filter((a) => a.gender === "male" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Abuelo Materno */}
              <div className="space-y-2">
                <Label htmlFor="edit-maternalGrandfather">Abuelo Materno</Label>
                <Select
                  value={editAnimal.parentInfo?.maternalGrandfather?.id ?? "none"}
                  onValueChange={(value) => {
                    const abuelo = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        maternalGrandfather:
                          value !== "none"
                            ? {
                              id: abuelo?.id || "",
                              tag: abuelo?.tag,
                              name: abuelo?.name || abuelo?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar abuelo materno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin abuelo registrado</SelectItem>
                      {animals
                        .filter((a) => a.gender === "male" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Abuela Materna */}
              <div className="space-y-2">
                <Label htmlFor="edit-maternalGrandmother">Abuela Materna</Label>
                <Select
                  value={editAnimal.parentInfo?.maternalGrandmother?.id ?? "none"}
                  onValueChange={(value) => {
                    const abuela = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        maternalGrandmother:
                          value !== "none"
                            ? {
                              id: abuela?.id || "",
                              tag: abuela?.tag,
                              name: abuela?.name || abuela?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar abuela materna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin abuela registrada</SelectItem>
                      {animals
                        .filter((a) => a.gender === "female" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Abuelo Paterno */}
              <div className="space-y-2">
                <Label htmlFor="edit-paternalGrandfather">Abuelo Paterno</Label>
                <Select
                  value={editAnimal.parentInfo?.paternalGrandfather?.id ?? "none"}
                  onValueChange={(value) => {
                    const abuelo = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        paternalGrandfather:
                          value !== "none"
                            ? {
                              id: abuelo?.id || "",
                              tag: abuelo?.tag,
                              name: abuelo?.name || abuelo?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar abuelo paterno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin abuelo registrado</SelectItem>
                      {animals
                        .filter((a) => a.gender === "male" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Abuela Paterna */}
              <div className="space-y-2">
                <Label htmlFor="edit-paternalGrandmother">Abuela Paterna</Label>
                <Select
                  value={editAnimal.parentInfo?.paternalGrandmother?.id ?? "none"}
                  onValueChange={(value) => {
                    const abuela = animals.find((a) => a.id === value);
                    setEditAnimal((prev) => ({
                      ...prev,
                      parentInfo: {
                        ...prev.parentInfo,
                        paternalGrandmother:
                          value !== "none"
                            ? {
                              id: abuela?.id || "",
                              tag: abuela?.tag,
                              name: abuela?.name || abuela?.tag || "Sin nombre",
                            }
                            : null,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar abuela paterna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sin abuela registrada</SelectItem>
                      {animals
                        .filter((a) => a.gender === "female" && a.id !== selectedAnimal?.id)
                        .map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.tag} - {animal.name || "Sin nombre"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compra & Notas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-purchaseDate">Fecha de Compra (Opcional)</Label>
                <Input
                  id="edit-purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={(editAnimal.purchaseDate as string) || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purchasePrice">Precio de Compra (Opcional)</Label>
                <Input
                  id="edit-purchasePrice"
                  name="purchasePrice"
                  type="number"
                  placeholder="0"
                  value={editAnimal.purchasePrice?.toString() || ""}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas (Opcional)</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                placeholder="Notas adicionales sobre el animal..."
                value={editAnimal.notes || ""}
                onChange={handleEditInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditAnimal}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles del Animal
            </DialogTitle>
            <DialogDescription>
              Información completa del animal seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedAnimal && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Etiqueta/Arete</Label>
                    <p className="text-sm font-medium">{selectedAnimal.tag}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                    <p className="text-sm">{selectedAnimal.name || "Sin nombre"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="text-sm">{selectedAnimal.type === AnimalType.DAIRY_CATTLE ? "Ganado Lechero" : "Ganado Cárnico"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Raza</Label>
                    <p className="text-sm">{selectedAnimal.breed}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                    <p className="text-sm">{formatDate(selectedAnimal.birthDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Edad</Label>
                    <p className="text-sm">{calculateAge(selectedAnimal.birthDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Género</Label>
                    <p className="text-sm">{selectedAnimal.gender === "female" ? "Hembra" : "Macho"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <Badge variant="outline" className={getStatusColor(selectedAnimal.status)}>
                      {selectedAnimal.status === AnimalStatus.HEALTHY && "Saludable"}
                      {selectedAnimal.status === AnimalStatus.SICK && "Enfermo"}
                      {selectedAnimal.status === AnimalStatus.PREGNANT && "Preñada"}
                      {selectedAnimal.status === AnimalStatus.LACTATING && "Lactando"}
                      {selectedAnimal.status === AnimalStatus.DRY && "Seca"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Peso</Label>
                    <p className="text-sm">{selectedAnimal.weight} kg</p>
                  </div>
                  {selectedAnimal.purchaseDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de Compra</Label>
                      <p className="text-sm">{formatDate(selectedAnimal.purchaseDate)}</p>
                    </div>
                  )}
                  {selectedAnimal.purchasePrice && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Precio de Compra</Label>
                      <p className="text-sm">${selectedAnimal.purchasePrice}</p>
                    </div>
                  )}
                </CardContent>
                {selectedAnimal.notes && (
                  <>
                    <Separator />
                    <CardContent>
                      <Label className="text-sm font-medium text-muted-foreground">Notas</Label>
                      <p className="text-sm mt-1">{selectedAnimal.notes}</p>
                    </CardContent>
                  </>
                )}
              </Card>

              {/* Genealogy Information */}
              {/* Genealogical Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Árbol Genealógico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">

                    {/* Maternal Grandparents */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Abuelo Materno</p>
                        <p className="text-sm font-medium">
                          {getParentInfo(selectedAnimal.parentInfo?.maternalGrandfather) || "No registrado"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Abuela Materna</p>
                        <p className="text-sm font-medium">
                          {getParentInfo(selectedAnimal.parentInfo?.maternalGrandmother) || "No registrada"}
                        </p>
                      </div>
                    </div>

                    {/* Mother */}
                    <div className="border-l-2 border-muted h-6"></div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Madre</p>
                      <p className="text-sm font-medium">
                        {getParentInfo(selectedAnimal.parentInfo?.mother) || "No registrada"}
                      </p>
                    </div>

                    {/* Animal */}
                    <div className="border-l-2 border-muted h-6"></div>
                    <div className="text-center bg-muted p-2 rounded-lg">
                      <p className="text-sm font-bold">{selectedAnimal.tag}</p>
                      <p className="text-xs text-muted-foreground">{selectedAnimal.name || "Sin nombre"}</p>
                    </div>

                    {/* Father */}
                    <div className="border-l-2 border-muted h-6"></div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Padre</p>
                      <p className="text-sm font-medium">
                        {getParentInfo(selectedAnimal.parentInfo?.father) || "No registrado"}
                      </p>
                    </div>

                    {/* Paternal Grandparents */}
                    <div className="border-l-2 border-muted h-6"></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Abuelo Paterno</p>
                        <p className="text-sm font-medium">
                          {getParentInfo(selectedAnimal.parentInfo?.paternalGrandfather) || "No registrado"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Abuela Paterna</p>
                        <p className="text-sm font-medium">
                          {getParentInfo(selectedAnimal.parentInfo?.paternalGrandmother) || "No registrada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5" />
                    Registros de Salud
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getAnimalHealthRecords(selectedAnimal.id).length > 0 ? (
                    <div className="space-y-3">
                      {getAnimalHealthRecords(selectedAnimal.id).map((record) => (
                        <div key={record.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{record.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(record.date)}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {record.type === "vaccination" && "Vacunación"}
                              {record.type === "treatment" && "Tratamiento"}
                              {record.type === "checkup" && "Chequeo"}
                            </Badge>
                          </div>
                          {record.medicine && (
                            <p className="text-xs text-muted-foreground">Medicina: {record.medicine}</p>
                          )}
                          {record.veterinarian && (
                            <p className="text-xs text-muted-foreground">Veterinario: {record.veterinarian}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay registros de salud disponibles.</p>
                  )}
                </CardContent>
              </Card>

              {/* Production Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Registros de Producción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getAnimalProductionRecords(selectedAnimal.id).length > 0 ? (
                    <div className="space-y-3">
                      {getAnimalProductionRecords(selectedAnimal.id).map((record) => (
                        <div key={record.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">
                                {record.quantity} {record.type === "milk" ? "litros de leche" : "kg de carne"}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(record.date)}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {record.type === "milk" ? "Leche" : "Carne"}
                            </Badge>
                          </div>
                          {record.quality && (
                            <p className="text-xs text-muted-foreground">Calidad: {record.quality}</p>
                          )}
                          {record.notes && (
                            <p className="text-xs text-muted-foreground">Notas: {record.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay registros de producción disponibles.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <TableCell>{calculateAge(animal.birthDate)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailsDialog(animal)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(animal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
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
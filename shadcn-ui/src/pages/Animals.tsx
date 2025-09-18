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

// Componente de Registro de Animales (integrado)
const AnimalRegistration = ({ onAnimalAdded, onCancel }) => {
  const { addAnimal } = useFarm();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    birthDate: '',
    breed: '',
    sex: '',
    origin: 'Finca',
    father: { name: '', code: '' },
    mother: { name: '', code: '' },
    maternalGrandfather: { name: '', code: '' },
    maternalGrandmother: { name: '', code: '' },
    paternalGrandfather: { name: '', code: '' },
    paternalGrandmother: { name: '', code: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Mapear los datos del formulario a la estructura esperada por useFarm
      const newAnimalData = {
        tag: formData.code,
        name: formData.name,
        type: formData.breed === "Jersey" || formData.breed === "Holstein" ? 
              AnimalType.DAIRY_CATTLE : AnimalType.BEEF_CATTLE,
        breed: formData.breed,
        birthDate: formData.birthDate,
        gender: formData.sex === "Macho" ? "male" : "female",
        status: AnimalStatus.HEALTHY,
        weight: 0, // Valor por defecto, puedes añadir campo en el formulario si es necesario
        origin: formData.origin,
        // Incluir información de padres si es necesario
        parentInfo: {
          father: formData.father,
          mother: formData.mother,
          maternalGrandfather: formData.maternalGrandfather,
          maternalGrandmother: formData.maternalGrandmother,
          paternalGrandfather: formData.paternalGrandfather,
          paternalGrandmother: formData.paternalGrandmother
        }
      };

      addAnimal(newAnimalData);
      setSubmitMessage('¡Animal registrado exitosamente!');
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        birthDate: '',
        breed: '',
        sex: '',
        origin: 'Finca',
        father: { name: '', code: '' },
        mother: { name: '', code: '' },
        maternalGrandfather: { name: '', code: '' },
        maternalGrandmother: { name: '', code: '' },
        paternalGrandfather: { name: '', code: '' },
        paternalGrandmother: { name: '', code: '' }
      });

      if (onAnimalAdded) {
        onAnimalAdded(newAnimalData);
      }

      setTimeout(() => {
        setSubmitMessage('');
        if (onAnimalAdded) {
          onAnimalAdded();
        }
      }, 2000);
    } catch (error) {
      setSubmitMessage('Error al registrar el animal. Intenta nuevamente.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nuevo Animal</h2>
      
      {submitMessage && (
        <div className={`mb-4 p-4 rounded-md ${
          submitMessage.includes('exitosamente') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Animal *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Bella"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Animal *
              </label>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Ej: BEL001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <Input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza *
              </label>
              <Select
                name="breed"
                value={formData.breed}
                onValueChange={(value) => setFormData(prev => ({...prev, breed: value}))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar raza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jersey">Jersey</SelectItem>
                  <SelectItem value="Parda">Parda</SelectItem>
                  <SelectItem value="Holstein">Holstein</SelectItem>
                  <SelectItem value="Brahman">Brahman</SelectItem>
                  <SelectItem value="Angus">Angus</SelectItem>
                  <SelectItem value="Otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <Select
                name="sex"
                value={formData.sex}
                onValueChange={(value) => setFormData(prev => ({...prev, sex: value}))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedencia
              </label>
              <Select
                name="origin"
                value={formData.origin}
                onValueChange={(value) => setFormData(prev => ({...prev, origin: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar procedencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Finca">Finca</SelectItem>
                  <SelectItem value="Compra">Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Parents Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Padres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Padre</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Padre
                  </label>
                  <Input
                    type="text"
                    name="father.name"
                    value={formData.father.name}
                    onChange={handleChange}
                    placeholder="Ej: Toro Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Padre
                  </label>
                  <Input
                    type="text"
                    name="father.code"
                    value={formData.father.code}
                    onChange={handleChange}
                    placeholder="Ej: MAX001"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Madre</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Madre
                  </label>
                  <Input
                    type="text"
                    name="mother.name"
                    value={formData.mother.name}
                    onChange={handleChange}
                    placeholder="Ej: Vaca Luna"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de la Madre
                  </label>
                  <Input
                    type="text"
                    name="mother.code"
                    value={formData.mother.code}
                    onChange={handleChange}
                    placeholder="Ej: LUN001"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grandparents Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Abuelos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Abuelos Maternos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abuelo Materno
                  </label>
                  <Input
                    type="text"
                    name="maternalGrandfather.name"
                    value={formData.maternalGrandfather.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Abuelo Materno
                  </label>
                  <Input
                    type="text"
                    name="maternalGrandfather.code"
                    value={formData.maternalGrandfather.code}
                    onChange={handleChange}
                    placeholder="Código"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abuela Materna
                  </label>
                  <Input
                    type="text"
                    name="maternalGrandmother.name"
                    value={formData.maternalGrandmother.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Abuela Materna
                  </label>
                  <Input
                    type="text"
                    name="maternalGrandmother.code"
                    value={formData.maternalGrandmother.code}
                    onChange={handleChange}
                    placeholder="Código"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Abuelos Paternos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abuelo Paterno
                  </label>
                  <Input
                    type="text"
                    name="paternalGrandfather.name"
                    value={formData.paternalGrandfather.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Abuelo Paterno
                  </label>
                  <Input
                    type="text"
                    name="paternalGrandfather.code"
                    value={formData.paternalGrandfather.code}
                    onChange={handleChange}
                    placeholder="Código"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abuela Paterna
                  </label>
                  <Input
                    type="text"
                    name="paternalGrandmother.name"
                    value={formData.paternalGrandmother.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Abuela Paterna
                  </label>
                  <Input
                    type="text"
                    name="paternalGrandmother.code"
                    value={formData.paternalGrandmother.code}
                    onChange={handleChange}
                    placeholder="Código"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Animal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Animals() {
  const { animals, addAnimal, updateAnimal, deleteAnimal } = useFarm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AnimalRegistration 
              onAnimalAdded={() => setIsAddDialogOpen(false)}
              onCancel={() => setIsAddDialogOpen(false)}
            />
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
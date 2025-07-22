import React, { useState } from "react";
import { useFarmContext } from "@/contexts/FarmContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Animal, ProductionRecord, ProductionType, AnimalType } from "@/types";
import { PlusCircle, MoreHorizontal, Filter, Search, Calendar, Droplet, BarChart2 } from "lucide-react";

export default function Production() {
  const { animals, addProductionRecord, deleteProductionRecord } = useFarmContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ProductionType | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"milk" | "meat">("milk");
  const [newRecord, setNewRecord] = useState<Partial<ProductionRecord>>({
    animalId: "",
    date: new Date().toISOString().split("T")[0],
    type: ProductionType.MILK,
    quantity: 0,
    quality: "",
    notes: "",
  });

  // Get all production records from all animals
  const allProductionRecords = animals.flatMap(animal => 
    animal.production.map(record => ({
      ...record,
      animalTag: animal.tag,
      animalName: animal.name || "",
      animalType: animal.type
    }))
  );

  // Filter production records based on search term, selected type, and animal
  const filteredProductionRecords = allProductionRecords.filter((record) => {
    const matchesSearch =
      record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.animalName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || record.type === selectedType;
    const matchesAnimal = !selectedAnimalId || record.animalId === selectedAnimalId;

    return matchesSearch && matchesType && matchesAnimal;
  });

  // Separate milk and meat records
  const milkRecords = filteredProductionRecords.filter(record => record.type === ProductionType.MILK);
  const meatRecords = filteredProductionRecords.filter(record => record.type === ProductionType.MEAT);

  // Prepare data for charts - last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const prepareDailyChartData = (records: typeof filteredProductionRecords, type: ProductionType) => {
    const recentRecords = records
      .filter(record => record.type === type && new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by date
    const recordsByDate = recentRecords.reduce((acc, record) => {
      const date = new Date(record.date).toLocaleDateString();
      if (!acc[date]) acc[date] = { date, total: 0 };
      acc[date].total += record.quantity;
      return acc;
    }, {} as Record<string, { date: string, total: number }>);
    
    return Object.values(recordsByDate);
  };

  const milkChartData = prepareDailyChartData(allProductionRecords, ProductionType.MILK);
  const meatChartData = prepareDailyChartData(allProductionRecords, ProductionType.MEAT);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord({
      ...newRecord,
      [name]: name === "quantity" ? parseFloat(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      setNewRecord({
        ...newRecord,
        [name]: value,
        // Reset animal when switching type
        animalId: ""
      });
    } else {
      setNewRecord({
        ...newRecord,
        [name]: value
      });
    }
  };

  const handleAddRecord = () => {
    if (newRecord.animalId && newRecord.date && newRecord.type !== undefined && newRecord.quantity !== undefined) {
      addProductionRecord(newRecord as Omit<ProductionRecord, "id">);
      setNewRecord({
        animalId: "",
        date: new Date().toISOString().split("T")[0],
        type: ProductionType.MILK,
        quantity: 0,
        quality: "",
        notes: "",
      });
      setIsAddDialogOpen(false);
    }
  };

  // Filter animals based on production type for the dropdown
  const filteredAnimals = animals.filter(animal => 
    (newRecord.type === ProductionType.MILK && animal.type === AnimalType.DAIRY_CATTLE) ||
    (newRecord.type === ProductionType.MEAT && animal.type === AnimalType.BEEF_CATTLE)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Producción</h1>
          <p className="text-muted-foreground">
            Registro y seguimiento de la producción de leche y carne
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Producción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Producción</DialogTitle>
              <DialogDescription>
                Registra la producción de leche o ganancia de peso para un animal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Producción</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("type", value)}
                  value={newRecord.type || ""}
                >
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
                <Select
                  onValueChange={(value) => handleSelectChange("animalId", value)}
                  value={newRecord.animalId || ""}
                >
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
                  <Label htmlFor="quantity">
                    {newRecord.type === ProductionType.MILK ? "Cantidad (litros)" : "Ganancia (kg)"}
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newRecord.quantity?.toString() || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Calidad (Opcional)</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("quality", value)}
                  value={newRecord.quality || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar calidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Excellent">Excelente</SelectItem>
                      <SelectItem value="Good">Buena</SelectItem>
                      <SelectItem value="Average">Promedio</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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

      <Tabs defaultValue="milk" className="space-y-4" onValueChange={(value) => setActiveTab(value as "milk" | "meat")}>
        <TabsList>
          <TabsTrigger value="milk">
            <Droplet className="mr-2 h-4 w-4" />
            Producción de Leche
          </TabsTrigger>
          <TabsTrigger value="meat">
            <BarChart2 className="mr-2 h-4 w-4" />
            Ganancia de Peso
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="milk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Producción de Leche</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={milkChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} L`, 'Total']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Producción (L)"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros de Producción de Leche</CardTitle>
              <CardDescription>
                {milkRecords.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por animal"
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
                          <Label>Animal</Label>
                          <Select onValueChange={setSelectedAnimalId} value={selectedAnimalId || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos los animales" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Todos</SelectItem>
                              {animals
                                .filter(animal => animal.type === AnimalType.DAIRY_CATTLE)
                                .map((animal) => (
                                  <SelectItem key={animal.id} value={animal.id}>
                                    {animal.tag} {animal.name ? `- ${animal.name}` : ""}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
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
                        <TableHead>Cantidad (L)</TableHead>
                        <TableHead>Calidad</TableHead>
                        <TableHead>Notas</TableHead>
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
                          <TableCell className="font-medium">
                            {record.animalTag} {record.animalName && `(${record.animalName})`}
                          </TableCell>
                          <TableCell>{record.quantity.toFixed(1)} L</TableCell>
                          <TableCell>
                            {record.quality ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                {record.quality}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{record.notes || "-"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => deleteProductionRecord(record.id)}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {milkRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No se encontraron registros de producción de leche con los criterios de búsqueda.
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

        <TabsContent value="meat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ganancia de Peso</CardTitle>
              <CardDescription>Últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={meatChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} kg`, 'Total']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Ganancia (kg)"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros de Ganancia de Peso</CardTitle>
              <CardDescription>
                {meatRecords.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por animal"
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
                          <Label>Animal</Label>
                          <Select onValueChange={setSelectedAnimalId} value={selectedAnimalId || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos los animales" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Todos</SelectItem>
                              {animals
                                .filter(animal => animal.type === AnimalType.BEEF_CATTLE)
                                .map((animal) => (
                                  <SelectItem key={animal.id} value={animal.id}>
                                    {animal.tag} {animal.name ? `- ${animal.name}` : ""}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
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
                        <TableHead>Ganancia (kg)</TableHead>
                        <TableHead>Calidad</TableHead>
                        <TableHead>Notas</TableHead>
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
                          <TableCell className="font-medium">
                            {record.animalTag} {record.animalName && `(${record.animalName})`}
                          </TableCell>
                          <TableCell>{record.quantity.toFixed(1)} kg</TableCell>
                          <TableCell>
                            {record.quality ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800">
                                {record.quality}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{record.notes || "-"}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => deleteProductionRecord(record.id)}
                                >
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {meatRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No se encontraron registros de ganancia de peso con los criterios de búsqueda.
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
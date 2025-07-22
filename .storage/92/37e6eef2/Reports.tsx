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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AnimalStatus, AnimalType, ProductionType } from "@/types";
import { Download } from "lucide-react";

export default function Reports() {
  const { animals, dashboard } = useFarmContext();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Data for pie charts
  const animalTypeData = [
    { name: "Ganado Lechero", value: dashboard.byType.dairy },
    { name: "Ganado Cárnico", value: dashboard.byType.beef }
  ];

  const animalStatusData = Object.entries(dashboard.byStatus).map(([status, count]) => ({
    name: status === AnimalStatus.HEALTHY ? "Saludable" :
          status === AnimalStatus.SICK ? "Enfermo" :
          status === AnimalStatus.PREGNANT ? "Preñada" :
          status === AnimalStatus.LACTATING ? "Lactando" : "Seca",
    value: count,
    status
  }));

  // Calculate milk production by day over the selected time period
  const calculateProductionData = () => {
    const today = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
    }

    // Get milk production records
    const milkRecords = animals
      .flatMap(animal => animal.production)
      .filter(record => 
        record.type === ProductionType.MILK && 
        new Date(record.date) >= startDate
      );

    // Get meat production records
    const meatRecords = animals
      .flatMap(animal => animal.production)
      .filter(record => 
        record.type === ProductionType.MEAT && 
        new Date(record.date) >= startDate
      );

    // Aggregate by date
    const milkByDate: Record<string, number> = {};
    milkRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      milkByDate[date] = (milkByDate[date] || 0) + record.quantity;
    });

    const meatByDate: Record<string, number> = {};
    meatRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      meatByDate[date] = (meatByDate[date] || 0) + record.quantity;
    });

    // Convert to array and sort by date
    const milkData = Object.entries(milkByDate)
      .map(([date, quantity]) => ({ date, quantity }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const meatData = Object.entries(meatByDate)
      .map(([date, quantity]) => ({ date, quantity }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { milkData, meatData };
  };

  const { milkData, meatData } = calculateProductionData();

  // Health records summary
  const healthRecordsByType = animals
    .flatMap(animal => animal.health)
    .reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const healthChartData = [
    { name: "Vacunaciones", value: healthRecordsByType["vaccination"] || 0 },
    { name: "Tratamientos", value: healthRecordsByType["treatment"] || 0 },
    { name: "Chequeos", value: healthRecordsByType["checkup"] || 0 }
  ];

  // Cost breakdown
  const totalCosts = animals
    .flatMap(animal => animal.health)
    .reduce((sum, record) => sum + (record.cost || 0), 0);

  const costsByType = animals
    .flatMap(animal => animal.health)
    .reduce((acc, record) => {
      if (record.cost) {
        acc[record.type] = (acc[record.type] || 0) + record.cost;
      }
      return acc;
    }, {} as Record<string, number>);

  const costChartData = [
    { name: "Vacunaciones", value: costsByType["vaccination"] || 0 },
    { name: "Tratamientos", value: costsByType["treatment"] || 0 },
    { name: "Chequeos", value: costsByType["checkup"] || 0 }
  ];

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const handleExportReport = () => {
    // In a real application, this would generate a PDF or Excel report
    alert("Exportando reporte... Función no implementada completamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas de la producción y salud del ganado
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="space-y-2 w-48">
          <Label htmlFor="timeRange">Período de Tiempo</Label>
          <Select
            onValueChange={(value) => setTimeRange(value as "week" | "month" | "quarter" | "year")}
            defaultValue={timeRange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mes</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Año</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="production">Producción</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="costs">Costos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Proporción de ganado lechero vs. cárnico</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={animalTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {animalTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} animales`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Estado de los Animales</CardTitle>
                <CardDescription>Distribución por estado de salud y productivo</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={animalStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {animalStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.status === AnimalStatus.HEALTHY ? "#10b981" :
                              entry.status === AnimalStatus.SICK ? "#ef4444" :
                              entry.status === AnimalStatus.PREGNANT ? "#3b82f6" :
                              entry.status === AnimalStatus.LACTATING ? "#8b5cf6" : "#f59e0b"
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} animales`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
              <CardDescription>Estadísticas clave de la operación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-lg font-semibold">{dashboard.totalAnimals}</p>
                  <p className="text-blue-600 text-sm">Total de Animales</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 text-lg font-semibold">{dashboard.production.milk.thisMonth.toFixed(0)} L</p>
                  <p className="text-green-600 text-sm">Leche (Este Mes)</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-amber-800 text-lg font-semibold">{dashboard.production.meat.thisMonth.toFixed(0)} kg</p>
                  <p className="text-amber-600 text-sm">Ganancia Peso (Este Mes)</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-800 text-lg font-semibold">${totalCosts.toFixed(0)}</p>
                  <p className="text-purple-600 text-sm">Costos Veterinarios Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Producción de Leche</CardTitle>
                <CardDescription>
                  Litros producidos durante {timeRange === "week" ? "la última semana" : 
                                            timeRange === "month" ? "el último mes" : 
                                            timeRange === "quarter" ? "el último trimestre" : "el último año"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={milkData}
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
                    <Tooltip formatter={(value) => [`${value} L`, 'Litros']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Producción (L)"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Ganancia de Peso</CardTitle>
                <CardDescription>
                  Kilogramos ganados durante {timeRange === "week" ? "la última semana" : 
                                            timeRange === "month" ? "el último mes" : 
                                            timeRange === "quarter" ? "el último trimestre" : "el último año"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={meatData}
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
                    <Tooltip formatter={(value) => [`${value} kg`, 'Kilogramos']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Ganancia (kg)"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Salud</CardTitle>
              <CardDescription>Distribución de eventos por tipo</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={healthChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} eventos`, 'Cantidad']} />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Vacunaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-blue-600">
                  {healthRecordsByType["vaccination"] || 0}
                </div>
                <p className="text-center text-muted-foreground">Eventos totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tratamientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-amber-600">
                  {healthRecordsByType["treatment"] || 0}
                </div>
                <p className="text-center text-muted-foreground">Eventos totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Chequeos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-green-600">
                  {healthRecordsByType["checkup"] || 0}
                </div>
                <p className="text-center text-muted-foreground">Eventos totales</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Costos Veterinarios</CardTitle>
              <CardDescription>Desglose de costos por tipo de evento</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Costo']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Costos</CardTitle>
              <CardDescription>Costos totales y promedios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-800 text-2xl font-semibold">${totalCosts.toFixed(0)}</p>
                  <p className="text-purple-600 text-sm">Costo Total</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-2xl font-semibold">
                    ${(totalCosts / dashboard.totalAnimals).toFixed(0)}
                  </p>
                  <p className="text-blue-600 text-sm">Promedio por Animal</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 text-2xl font-semibold">
                    ${(totalCosts / Object.values(healthRecordsByType).reduce((a, b) => a + b, 0)).toFixed(0)}
                  </p>
                  <p className="text-green-600 text-sm">Promedio por Evento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
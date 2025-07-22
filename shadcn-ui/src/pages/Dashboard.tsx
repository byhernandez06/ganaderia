import React from "react";
import { useFarm } from "@/contexts/FarmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Beef, Droplet, BarChart2 } from "lucide-react";
import { AnimalType, AnimalStatus } from "@/types";

export default function Dashboard() {
  const { dashboardStats } = useFarm();
  
  // If dashboardStats is null, use default values
  const dashboard = dashboardStats || {
    totalAnimals: 0,
    animalsByType: {},
    byType: { dairy: 0, beef: 0 },
    byStatus: { healthy: 0, sick: 0, pregnant: 0 },
    recentHealth: [],
    production: {
      milk: { today: 0, thisWeek: 0, thisMonth: 0 },
      meat: { thisMonth: 0 }
    }
  };

  const farm = { name: "Livestock Farm" };

  const statusData = dashboard.byStatus ? Object.entries(dashboard.byStatus).map(([status, count]) => ({
    status,
    count
  })) : [];

  const animalTypeData = [
    { name: "Ganado Lechero", value: dashboard?.byType?.dairy },
    { name: "Ganado Cárnico", value: dashboard?.byType?.beef }
  ];

  const productionData = [
    { name: "Día", leche: dashboard.production?.milk?.today.toFixed(1) },
    { name: "Semana", leche: dashboard.production?.milk?.thisWeek.toFixed(1) },
    { name: "Mes", leche: dashboard.production?.milk?.thisMonth.toFixed(1) }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de ganadería de {farm.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animales</CardTitle>
            <Beef className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalAnimals}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.byType?.dairy} lechero, {dashboard.byType?.beef} cárnico
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción de Leche Hoy</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.production?.milk?.today.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.production?.milk?.thisMonth.toFixed(1)} L este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia de Peso</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.production?.meat?.thisMonth.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros de Salud</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.recentHealth?.length}</div>
            <p className="text-xs text-muted-foreground">
              Eventos recientes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="production">Producción</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
                <CardDescription>Proporción de ganado lechero vs. cárnico</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={animalTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
                <CardDescription>Estado de salud y productivo del ganado</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Cantidad" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Producción de Leche</CardTitle>
              <CardDescription>Litros producidos en diferentes períodos</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leche" name="Litros" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros Recientes de Salud</CardTitle>
              <CardDescription>Últimos eventos de salud registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.recentHealth?.map(record => (
                  <div key={record.id} className="flex items-start gap-4 rounded-lg border p-3">
                    <div className={`mt-0.5 rounded-full p-1 ${
                      record.type === 'vaccination' ? 'bg-blue-100' :
                      record.type === 'treatment' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      <Activity className={`h-4 w-4 ${
                        record.type === 'vaccination' ? 'text-blue-500' :
                        record.type === 'treatment' ? 'text-amber-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {record.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {record.type} {record.medicine && `- Medicina: ${record.medicine}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
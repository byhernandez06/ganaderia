import React from "react";
import { useFarm } from "@/contexts/FarmContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { farm } = useFarm();
  const [farmSettings, setFarmSettings] = useState({
    name: farm.name,
    location: farm.location,
    size: farm.size,
    units: farm.units,
  });
  const [notifications, setNotifications] = useState({
    healthAlerts: true,
    productionReports: true,
    systemUpdates: false,
  });
  const [language, setLanguage] = useState("es");
  const [darkMode, setDarkMode] = useState(false);

  const handleFarmSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFarmSettings({
      ...farmSettings,
      [name]: name === "size" ? parseFloat(value) : value,
    });
  };

  const handleSaveSettings = () => {
    // In a real app, we would save these settings to the backend
    toast.success("Configuración guardada exitosamente");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra las configuraciones del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Finca</CardTitle>
          <CardDescription>
            Actualiza la información básica de tu finca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm-name">Nombre de la Finca</Label>
                <Input
                  id="farm-name"
                  name="name"
                  value={farmSettings.name}
                  onChange={handleFarmSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-location">Ubicación</Label>
                <Input
                  id="farm-location"
                  name="location"
                  value={farmSettings.location}
                  onChange={handleFarmSettingChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm-size">Tamaño</Label>
                <Input
                  id="farm-size"
                  name="size"
                  type="number"
                  value={farmSettings.size.toString()}
                  onChange={handleFarmSettingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm-units">Unidades</Label>
                <Select
                  value={farmSettings.units}
                  onValueChange={(value) =>
                    setFarmSettings({ ...farmSettings, units: value as "hectares" | "acres" })
                  }
                >
                  <SelectTrigger id="farm-units">
                    <SelectValue placeholder="Seleccionar unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">Hectáreas</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias del Sistema</CardTitle>
          <CardDescription>
            Personaliza la experiencia de usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Cambiar a tema oscuro para uso nocturno
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Notificaciones</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="health-alerts">Alertas de Salud</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas sobre problemas de salud del ganado
                  </p>
                </div>
                <Switch
                  id="health-alerts"
                  checked={notifications.healthAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, healthAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="production-reports">Reportes de Producción</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir informes diarios sobre producción de leche y ganancia de peso
                  </p>
                </div>
                <Switch
                  id="production-reports"
                  checked={notifications.productionReports}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, productionReports: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system-updates">Actualizaciones del Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones sobre nuevas funciones y mejoras
                  </p>
                </div>
                <Switch
                  id="system-updates"
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, systemUpdates: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Guardar Configuración</Button>
      </div>
    </div>
  );
}
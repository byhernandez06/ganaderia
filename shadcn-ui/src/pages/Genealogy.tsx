'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useFarm } from "@/contexts/FarmContext";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Search, ListTree } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import type { Animal, Genealogy } from "@/types";

/** ===================== Página de Genealogía ===================== */
export default function GenealogyPage() {
  const {
    animals,
    genealogy,
    isLoading,
    addGenealogyRecord,
    updateGenealogyRecord,
  } = useFarm();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /** ---------- Helpers ---------- */
  const findAnimal = (id?: string | null) =>
    animals.find(a => a.id === id) ?? null;

  /** ---------- Genealogía existente ---------- */
  const existingGenealogy = useMemo(() => {
    if (!selectedAnimalId) return null;
    return genealogy.find(g => g.animalId === selectedAnimalId) ?? null;
  }, [genealogy, selectedAnimalId]);

  /** ---------- Animal seleccionado ---------- */
  const selectedAnimal = useMemo(() => {
    if (!selectedAnimalId) return null;
    return animals.find(a => a.id === selectedAnimalId) ?? null;
  }, [animals, selectedAnimalId]);

  /** ---------- Form ---------- */
  const [form, setForm] = useState<Partial<Genealogy>>({
    animalId: "",
    fatherId: "",
    motherId: "",
    paternalGrandfatherId: "",
    paternalGrandmotherId: "",
    maternalGrandfatherId: "",
    maternalGrandmotherId: "",
  });

  useEffect(() => {
    if (!selectedAnimalId) return;

    if (existingGenealogy) {
      setForm({
        animalId: existingGenealogy.animalId,
        fatherId: existingGenealogy.fatherId ?? "",
        motherId: existingGenealogy.motherId ?? "",
        paternalGrandfatherId: existingGenealogy.paternalGrandfatherId ?? "",
        paternalGrandmotherId: existingGenealogy.paternalGrandmotherId ?? "",
        maternalGrandfatherId: existingGenealogy.maternalGrandfatherId ?? "",
        maternalGrandmotherId: existingGenealogy.maternalGrandmotherId ?? "",
      });
    } else {
      setForm({
        animalId: selectedAnimalId,
        fatherId: "",
        motherId: "",
        paternalGrandfatherId: "",
        paternalGrandmotherId: "",
        maternalGrandfatherId: "",
        maternalGrandmotherId: "",
      });
    }
  }, [selectedAnimalId, existingGenealogy]);

  /** ---------- Autorrelleno de abuelos al elegir padre/madre ---------- */
  const fillGrandparentsFromParent = (parentId: string, side: "paternal" | "maternal") => {
    const parentG = genealogy.find(g => g.animalId === parentId);
    if (!parentG) return;

    if (side === "paternal") {
      setForm(prev => ({
        ...prev,
        paternalGrandfatherId: parentG.fatherId ?? prev.paternalGrandfatherId ?? "",
        paternalGrandmotherId: parentG.motherId ?? prev.paternalGrandmotherId ?? "",
      }));
    } else {
      setForm(prev => ({
        ...prev,
        maternalGrandfatherId: parentG.fatherId ?? prev.maternalGrandfatherId ?? "",
        maternalGrandmotherId: parentG.motherId ?? prev.maternalGrandmotherId ?? "",
      }));
    }
  };

  const handleSelectChange = (name: keyof Genealogy, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "fatherId" && value) fillGrandparentsFromParent(value, "paternal");
    if (name === "motherId" && value) fillGrandparentsFromParent(value, "maternal");
  };

  /** ---------- Guardar ---------- */
  const handleSave = async () => {
    if (!selectedAnimalId) {
      toast.error("Selecciona un animal primero");
      return;
    }
    try {
      if (existingGenealogy) {
        await updateGenealogyRecord(existingGenealogy.id, {
          ...form,
          animalId: selectedAnimalId,
          updatedAt: Timestamp.now(),
          updatedBy: "usuario_actual",
        });
        toast.success("Genealogía actualizada");
      } else {
        await addGenealogyRecord({
          ...form,
          animalId: selectedAnimalId,
          updatedAt: Timestamp.now(),
          updatedBy: "usuario_actual",
        } as Omit<Genealogy, "id">);
        toast.success("Genealogía creada");
      }
      setIsEditDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la genealogía");
    }
  };

  /** ---------- Búsqueda lista izquierda ---------- */
  const filteredAnimals = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return animals.filter(a =>
      a.tag.toLowerCase().includes(q) || (a.name?.toLowerCase() ?? "").includes(q)
    );
  }, [animals, searchTerm]);

  /** ---------- Fallback: usa parentInfo y/o parentMaleId/parentFemaleId ---------- */
  const fallbackFromAnimal = useMemo(() => {
    if (!selectedAnimal) return null;

    // 1) Si el animal trae IDs directos de padres, úsalos
    if (selectedAnimal.parentMaleId || selectedAnimal.parentFemaleId) {
      return {
        father: findAnimal(selectedAnimal.parentMaleId),
        mother: findAnimal(selectedAnimal.parentFemaleId),
        paternalGrandfather: null,
        paternalGrandmother: null,
        maternalGrandfather: null,
        maternalGrandmother: null,
      };
    }

    // 2) Si el animal trae parentInfo por código/nombre/ID, intenta resolverlo
    const p = (selectedAnimal as any).parentInfo as Animal["parentInfo"] | undefined;
    if (!p) return null;

    const byRef = (r?: { id?: string; code?: string; name?: string }) => {
      if (!r) return null;
      const q = (r.code || r.name || "").trim().toLowerCase();
      return animals.find(x =>
        (r.id && x.id === r.id) ||
        x.tag.toLowerCase() === q ||
        (x.name?.toLowerCase() === q)
      ) ?? null;
    };

    return {
      father: byRef(p.father),
      mother: byRef(p.mother),
      maternalGrandfather: byRef(p.maternalGrandfather),
      maternalGrandmother: byRef(p.maternalGrandmother),
      paternalGrandfather: byRef(p.paternalGrandfather),
      paternalGrandmother: byRef(p.paternalGrandmother),
    };
  }, [selectedAnimal, animals]);

  /** ---------- Datos a visualizar (prioriza genealogía válida) ---------- */
  const hasGenealogyData = useMemo(() => {
    if (!existingGenealogy) return false;
    const g = existingGenealogy;
    return !!(g.fatherId || g.motherId || g.paternalGrandfatherId || g.paternalGrandmotherId || g.maternalGrandfatherId || g.maternalGrandmotherId);
  }, [existingGenealogy]);

  const vis = useMemo(() => {
    if (hasGenealogyData && existingGenealogy) {
      return {
        father: findAnimal(existingGenealogy.fatherId),
        mother: findAnimal(existingGenealogy.motherId),
        paternalGrandfather: findAnimal(existingGenealogy.paternalGrandfatherId),
        paternalGrandmother: findAnimal(existingGenealogy.paternalGrandmotherId),
        maternalGrandfather: findAnimal(existingGenealogy.maternalGrandfatherId),
        maternalGrandmother: findAnimal(existingGenealogy.maternalGrandmotherId),
      };
    }
    // Si no hay datos en genealogy, usa fallback
    return fallbackFromAnimal;
  }, [hasGenealogyData, existingGenealogy, fallbackFromAnimal, animals]);

  /** ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <span className="ml-4">Cargando genealogías...</span>
      </div>
    );
  }

  /** ---------- UI ---------- */
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Genealogía Animal</h1>
          <p className="text-muted-foreground">Gestiona los parentescos entre los animales</p>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar / Editar
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestión de Genealogía</DialogTitle>
              <DialogDescription>
                {selectedAnimal
                  ? `Parentescos para ${selectedAnimal.tag}${selectedAnimal.name ? ` (${selectedAnimal.name})` : ""}`
                  : "Selecciona un animal primero"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Animal */}
              <div className="space-y-2">
                <Label>Animal *</Label>
                <Select
                  value={selectedAnimalId}
                  onValueChange={(v) => setSelectedAnimalId(v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar animal" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {animals.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type}, {a.gender})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Padres */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Padre</Label>
                  <Select
                    value={form.fatherId || ""}
                    onValueChange={(v) => handleSelectChange("fatherId", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar padre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {animals
                        .filter(a => a.id !== selectedAnimalId && a.gender === "male")
                        .map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!!form.fatherId && <p className="text-xs text-muted-foreground">ID: {form.fatherId}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Madre</Label>
                  <Select
                    value={form.motherId || ""}
                    onValueChange={(v) => handleSelectChange("motherId", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar madre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {animals
                        .filter(a => a.id !== selectedAnimalId && a.gender === "female")
                        .map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!!form.motherId && <p className="text-xs text-muted-foreground">ID: {form.motherId}</p>}
                </div>
              </div>

              {/* Abuelos paternos */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-semibold mb-3">Abuelos Paternos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Abuelo Paterno</Label>
                    <Select
                      value={form.paternalGrandfatherId || ""}
                      onValueChange={(v) => handleSelectChange("paternalGrandfatherId", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar abuelo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {animals.filter(a => a.gender === "male").map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!form.paternalGrandfatherId && (
                      <p className="text-xs text-muted-foreground">ID: {form.paternalGrandfatherId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Abuela Paterna</Label>
                    <Select
                      value={form.paternalGrandmotherId || ""}
                      onValueChange={(v) => handleSelectChange("paternalGrandmotherId", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar abuela" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {animals.filter(a => a.gender === "female").map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!form.paternalGrandmotherId && (
                      <p className="text-xs text-muted-foreground">ID: {form.paternalGrandmotherId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Abuelos maternos */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-semibold mb-3">Abuelos Maternos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Abuelo Materno</Label>
                    <Select
                      value={form.maternalGrandfatherId || ""}
                      onValueChange={(v) => handleSelectChange("maternalGrandfatherId", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar abuelo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {animals.filter(a => a.gender === "male").map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!form.maternalGrandfatherId && (
                      <p className="text-xs text-muted-foreground">ID: {form.maternalGrandfatherId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Abuela Materna</Label>
                    <Select
                      value={form.maternalGrandmotherId || ""}
                      onValueChange={(v) => handleSelectChange("maternalGrandmotherId", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar abuela" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {animals.filter(a => a.gender === "female").map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.tag}{a.name ? ` - ${a.name}` : ""} ({a.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!form.maternalGrandmotherId && (
                      <p className="text-xs text-muted-foreground">ID: {form.maternalGrandmotherId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!selectedAnimalId}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de animal */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle>Seleccionar Animal</CardTitle>
            <CardDescription>Elige un animal para ver/editar su genealogía</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por etiqueta o nombre"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredAnimals.map(a => (
                <div
                  key={a.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedAnimalId === a.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedAnimalId(a.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{a.tag}</p>
                      {!!a.name && <p className="text-sm text-muted-foreground">{a.name}</p>}
                      <p className="text-xs text-muted-foreground">ID: {a.id}</p>
                    </div>
                    <Badge variant="outline">{a.type}</Badge>
                  </div>
                </div>
              ))}
              {filteredAnimals.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No se encontraron animales</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vista genealógica */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
            <div>
              <CardTitle>Información Genealógica</CardTitle>
              <CardDescription>
                {selectedAnimal
                  ? `Parentescos de ${selectedAnimal.tag}${selectedAnimal.name ? ` (${selectedAnimal.name})` : ""}`
                  : "Selecciona un animal para ver su genealogía"}
              </CardDescription>
            </div>
            {selectedAnimal && (
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />Editar
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {!selectedAnimal && (
              <div className="text-center py-8 text-muted-foreground">
                <ListTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un animal para ver su genealogía</p>
              </div>
            )}

            {selectedAnimal && (
              <div className="space-y-6">
                {/* Árbol */}
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ListTree className="h-5 w-5" />
                    Árbol Genealógico
                  </h3>

                  <div className="space-y-4">
                    {/* Abuelos */}
                    <div className="grid grid-cols-2 gap-4">
                      <Box title="Abuelo Paterno" animal={vis?.paternalGrandfather ?? null} color="blue" />
                      <Box title="Abuela Paterna" animal={vis?.paternalGrandmother ?? null} color="pink" />
                    </div>

                    <div className="flex justify-center">
                      <div className="h-6 border-l-2 border-gray-300" />
                    </div>

                    {/* Padres */}
                    <div className="grid grid-cols-2 gap-4">
                      <Box title="Padre" animal={vis?.father ?? null} color="blue" />
                      <Box title="Madre" animal={vis?.mother ?? null} color="pink" />
                    </div>

                    <div className="flex justify-center">
                      <div className="h-6 border-l-2 border-gray-300" />
                    </div>

                    {/* Animal actual */}
                    <div className="flex justify-center">
                      <div className="p-4 rounded-md border-2 border-primary bg-primary/10 w-56 text-center">
                        <p className="text-sm font-medium text-gray-700">Animal Actual</p>
                        <p className="font-bold text-lg">{selectedAnimal.tag}</p>
                        {!!selectedAnimal.name && (
                          <p className="text-sm text-muted-foreground">{selectedAnimal.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">ID: {selectedAnimal.id}</p>
                        <Badge className="mt-2">{selectedAnimal.type}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <Card>
                  <CardHeader className="py-3 bg-muted/30">
                    <CardTitle className="text-sm">Estado de la información</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {!hasGenealogyData ? (
                      <p className="text-sm">
                        No hay genealogía guardada (o está vacía) para este animal. Puedes crearla desde “Agregar / Editar”.
                        {(selectedAnimal as any)?.parentInfo && (
                          <> Se muestran datos <em>estimados</em> desde <code>parentInfo</code> o <code>parentMaleId/parentFemaleId</code>.</>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm">Genealogía registrada.</p>
                    )}
                    {!!existingGenealogy?.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Última actualización:&nbsp;
                        {typeof existingGenealogy.updatedAt === "string"
                          ? existingGenealogy.updatedAt
                          : new Date(
                              (existingGenealogy.updatedAt as any)?.toDate
                                ? (existingGenealogy.updatedAt as any).toDate()
                                : (existingGenealogy.updatedAt as any)
                            ).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** -------------------- Sub-componente Box -------------------- */
function Box({ title, animal, color }:{
  title: string;
  animal: Animal | null;
  color: "blue" | "pink";
}) {
  const bg = animal ? (color === "blue" ? "bg-blue-50" : "bg-pink-50") : "bg-gray-100";
  return (
    <div className={`p-3 rounded-md border ${bg}`}>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {animal ? (
        <div>
          <p className="font-semibold">{animal.tag}</p>
          {!!animal.name && <p className="text-sm text-muted-foreground">{animal.name}</p>}
          <p className="text-xs text-muted-foreground">ID: {animal.id}</p>
          <p className="text-xs text-muted-foreground">{animal.breed} · {animal.gender}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No especificado</p>
      )}
    </div>
  );
}

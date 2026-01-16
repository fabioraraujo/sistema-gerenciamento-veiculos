import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type VehicleStatus = "ativo" | "inativo";

interface VehicleFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  status: VehicleStatus;
}

const initialFormData: VehicleFormData = {
  placa: "",
  marca: "",
  modelo: "",
  ano: new Date().getFullYear(),
  cor: "",
  status: "ativo",
};

interface FormErrors {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
}

export default function Vehicles() {
  const utils = trpc.useUtils();

  // Filters state
  const [searchMarca, setSearchMarca] = useState("");
  const [searchModelo, setSearchModelo] = useState("");
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Stabilize query inputs
  const queryInput = useMemo(
    () => ({
      marca: searchMarca || undefined,
      modelo: searchModelo || undefined,
      status: filterStatus === "all" ? undefined : filterStatus,
      page,
      pageSize,
    }),
    [searchMarca, searchModelo, filterStatus, page, pageSize]
  );

  // Queries
  const { data: vehiclesData, isLoading } = trpc.vehicles.list.useQuery(queryInput);

  const { data: marcas } = trpc.vehicles.getMarcas.useQuery();

  const marcaForModelos = useMemo(() => searchMarca || undefined, [searchMarca]);
  const { data: modelos } = trpc.vehicles.getModelos.useQuery({ marca: marcaForModelos });

  // Mutations
  const createMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => {
      toast.success("Veículo cadastrado com sucesso!");
      setIsCreateOpen(false);
      setFormData(initialFormData);
      utils.vehicles.list.invalidate();
      utils.vehicles.getMarcas.invalidate();
      utils.vehicles.getModelos.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar veículo");
    },
  });

  const updateMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => {
      toast.success("Veículo atualizado com sucesso!");
      setIsEditOpen(false);
      setSelectedVehicleId(null);
      setFormData(initialFormData);
      utils.vehicles.list.invalidate();
      utils.vehicles.getMarcas.invalidate();
      utils.vehicles.getModelos.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar veículo");
    },
  });

  const deleteMutation = trpc.vehicles.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedVehicleId(null);
      utils.vehicles.list.invalidate();
      utils.vehicles.getMarcas.invalidate();
      utils.vehicles.getModelos.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir veículo");
    },
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchMarca, searchModelo, filterStatus]);

  // Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.placa || formData.placa.length < 7) {
      errors.placa = "Placa deve ter no mínimo 7 caracteres";
    }
    if (!formData.marca) {
      errors.marca = "Marca é obrigatória";
    }
    if (!formData.modelo) {
      errors.modelo = "Modelo é obrigatório";
    }
    if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
      errors.ano = "Ano inválido";
    }
    if (!formData.cor) {
      errors.cor = "Cor é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleCreate = () => {
    if (!validateForm()) return;
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!validateForm() || !selectedVehicleId) return;
    updateMutation.mutate({ id: selectedVehicleId, ...formData });
  };

  const handleDelete = () => {
    if (!selectedVehicleId) return;
    deleteMutation.mutate({ id: selectedVehicleId });
  };

  const openEditModal = (vehicle: NonNullable<typeof vehiclesData>["data"][0]) => {
    setSelectedVehicleId(vehicle.id);
    setFormData({
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.ano,
      cor: vehicle.cor,
      status: vehicle.status,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setSelectedVehicleId(id);
    setIsDeleteOpen(true);
  };

  const clearFilters = () => {
    setSearchMarca("");
    setSearchModelo("");
    setFilterStatus("all");
  };

  const hasActiveFilters = searchMarca || searchModelo || filterStatus !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Veículos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua frota de veículos
          </p>
        </div>
        <Button onClick={() => {
          setFormData(initialFormData);
          setFormErrors({});
          setIsCreateOpen(true);
        }} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filter-marca">Marca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="filter-marca"
                  placeholder="Buscar por marca..."
                  value={searchMarca}
                  onChange={(e) => setSearchMarca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-modelo">Modelo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="filter-modelo"
                  placeholder="Buscar por modelo..."
                  value={searchModelo}
                  onChange={(e) => setSearchModelo(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as VehicleStatus | "all")}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Veículos</CardTitle>
          <CardDescription>
            {vehiclesData?.total ?? 0} veículo(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : vehiclesData?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhum veículo encontrado</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para encontrar veículos."
                  : "Comece cadastrando seu primeiro veículo."}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setIsCreateOpen(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Veículo
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiclesData?.data.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{vehicle.placa}</TableCell>
                        <TableCell>{vehicle.marca}</TableCell>
                        <TableCell>{vehicle.modelo}</TableCell>
                        <TableCell>{vehicle.ano}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{
                                backgroundColor: getColorHex(vehicle.cor),
                              }}
                            />
                            {vehicle.cor}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={vehicle.status === "ativo" ? "default" : "secondary"}
                            className={
                              vehicle.status === "ativo"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                            }
                          >
                            {vehicle.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(vehicle)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteModal(vehicle.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {vehiclesData && vehiclesData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {vehiclesData.page} de {vehiclesData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(vehiclesData.totalPages, p + 1))}
                      disabled={page === vehiclesData.totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Veículo</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo veículo
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            submitLabel="Cadastrar"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Atualize os dados do veículo
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="Salvar"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Vehicle Form Component
interface VehicleFormProps {
  formData: VehicleFormData;
  setFormData: React.Dispatch<React.SetStateAction<VehicleFormData>>;
  formErrors: FormErrors;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel: string;
}

function VehicleForm({
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isLoading,
  submitLabel,
}: VehicleFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            placeholder="ABC-1234"
            value={formData.placa}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))
            }
            className={formErrors.placa ? "border-destructive" : ""}
          />
          {formErrors.placa && (
            <p className="text-xs text-destructive">{formErrors.placa}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input
            id="ano"
            type="number"
            placeholder="2024"
            value={formData.ano}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ano: parseInt(e.target.value) || 0 }))
            }
            className={formErrors.ano ? "border-destructive" : ""}
          />
          {formErrors.ano && (
            <p className="text-xs text-destructive">{formErrors.ano}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input
            id="marca"
            placeholder="Toyota"
            value={formData.marca}
            onChange={(e) => setFormData((prev) => ({ ...prev, marca: e.target.value }))}
            className={formErrors.marca ? "border-destructive" : ""}
          />
          {formErrors.marca && (
            <p className="text-xs text-destructive">{formErrors.marca}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            placeholder="Corolla"
            value={formData.modelo}
            onChange={(e) => setFormData((prev) => ({ ...prev, modelo: e.target.value }))}
            className={formErrors.modelo ? "border-destructive" : ""}
          />
          {formErrors.modelo && (
            <p className="text-xs text-destructive">{formErrors.modelo}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cor">Cor *</Label>
          <Input
            id="cor"
            placeholder="Prata"
            value={formData.cor}
            onChange={(e) => setFormData((prev) => ({ ...prev, cor: e.target.value }))}
            className={formErrors.cor ? "border-destructive" : ""}
          />
          {formErrors.cor && (
            <p className="text-xs text-destructive">{formErrors.cor}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value as VehicleStatus }))
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

// Helper function to get color hex from color name
function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    preto: "#1a1a1a",
    branco: "#ffffff",
    prata: "#c0c0c0",
    cinza: "#808080",
    vermelho: "#dc2626",
    azul: "#2563eb",
    verde: "#16a34a",
    amarelo: "#eab308",
    laranja: "#ea580c",
    marrom: "#78350f",
    bege: "#d4c5a9",
    dourado: "#d4af37",
    rosa: "#ec4899",
    roxo: "#9333ea",
    vinho: "#722f37",
  };
  return colors[colorName.toLowerCase()] || "#6b7280";
}

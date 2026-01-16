import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Car, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Stabilize query input
  const queryInput = useMemo(() => ({ page: 1, pageSize: 100 }), []);
  const { data: vehiclesData, isLoading } = trpc.vehicles.list.useQuery(queryInput);

  const stats = useMemo(() => {
    if (!vehiclesData) return { total: 0, ativos: 0, inativos: 0 };
    const ativos = vehiclesData.data.filter((v) => v.status === "ativo").length;
    return {
      total: vehiclesData.total,
      ativos,
      inativos: vehiclesData.total - ativos,
    };
  }, [vehiclesData]);

  const recentVehicles = useMemo(() => {
    if (!vehiclesData) return [];
    return vehiclesData.data.slice(0, 5);
  }, [vehiclesData]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Gerenciamento de Veículos
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o resumo da sua frota de veículos
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Total de Veículos</CardDescription>
                <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Veículos cadastrados no sistema
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Veículos Ativos</CardDescription>
                <CardTitle className="text-3xl font-bold text-emerald-600">
                  {stats.ativos}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Veículos em operação
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Veículos Inativos</CardDescription>
                <CardTitle className="text-3xl font-bold text-gray-500">
                  {stats.inativos}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Veículos fora de operação
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-500" />
              </div>
            </Card>
          </div>

          {/* Recent Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Veículos Recentes</CardTitle>
                <CardDescription>
                  Últimos veículos cadastrados
                </CardDescription>
              </div>
              <Link href="/veiculos">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Car className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum veículo cadastrado ainda
                  </p>
                  <Link href="/veiculos">
                    <Button variant="link" className="mt-2">
                      Cadastrar primeiro veículo
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {vehicle.marca} {vehicle.modelo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.placa} • {vehicle.ano}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "ativo"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {vehicle.status === "ativo" ? "Ativo" : "Inativo"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getAdminMetrics } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Receipt, Shield, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Metrics {
  users: {
    total: number;
    admins: number;
    recent: number;
  };
  transactions: {
    total: number;
    recent: number;
  };
  emails: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
}

export function AdminDashboardContent() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getAdminMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar métricas");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do sistema FinkoMoney
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Erro ao carregar métricas</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const emailSuccessRate =
    metrics.emails.total > 0
      ? ((metrics.emails.sent / metrics.emails.total) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema FinkoMoney
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-semibold">
                +{metrics.users.recent}
              </span>{" "}
              nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        {/* Total Admins */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.admins}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.users.admins / metrics.users.total) * 100).toFixed(1)}% do
              total
            </p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.transactions.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-semibold">
                +{metrics.transactions.recent}
              </span>{" "}
              nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        {/* Emails Sent */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emails.sent}</div>
            <p className="text-xs text-muted-foreground">
              {emailSuccessRate}% taxa de sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Stats Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Emails Enviados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {metrics.emails.sent}
            </div>
            <p className="text-xs text-green-600 dark:text-green-500">
              {metrics.emails.total > 0
                ? ((metrics.emails.sent / metrics.emails.total) * 100).toFixed(1)
                : "0"}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Emails Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {metrics.emails.pending}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              Aguardando envio
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Emails Falhos
            </CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {metrics.emails.failed}
            </div>
            <p className="text-xs text-red-600 dark:text-red-500">
              {metrics.emails.total > 0
                ? ((metrics.emails.failed / metrics.emails.total) * 100).toFixed(1)
                : "0"}
              % do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <a
            href="/admin/admins"
            className="flex-1 rounded-lg border-2 border-border bg-card p-4 text-center hover:bg-accent transition-colors"
          >
            <Shield className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <h3 className="font-semibold">Gerenciar Admins</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Adicionar ou remover administradores
            </p>
          </a>
          <a
            href="/admin/logs"
            className="flex-1 rounded-lg border-2 border-border bg-card p-4 text-center hover:bg-accent transition-colors"
          >
            <Mail className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">Ver Logs de Emails</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Histórico completo de emails
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

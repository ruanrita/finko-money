"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { togglePlanFeature } from "../actions";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  display_name: string;
};

type Feature = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  path: string;
};

type Matrix = Record<string, Record<string, boolean>>;

interface PlanFeaturesMatrixProps {
  plans: Plan[];
  features: Feature[];
  matrix: Matrix;
}

export function PlanFeaturesMatrix({ plans, features, matrix: initialMatrix }: PlanFeaturesMatrixProps) {
  const [matrix, setMatrix] = useState<Matrix>(initialMatrix);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleToggle = async (planId: string, featureId: string, enabled: boolean) => {
    const key = `${planId}-${featureId}`;
    setLoading(prev => ({ ...prev, [key]: true }));

    // Optimistic update
    setMatrix(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [featureId]: enabled
      }
    }));

    const result = await togglePlanFeature(planId, featureId, enabled);

    if (result.error) {
      // Revert on error
      setMatrix(prev => ({
        ...prev,
        [planId]: {
          ...prev[planId],
          [featureId]: !enabled
        }
      }));
      toast.error(result.error);
    } else {
      toast.success(enabled ? "Feature adicionada" : "Feature removida");
    }

    setLoading(prev => ({ ...prev, [key]: false }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Features por Plano</CardTitle>
        <CardDescription>
          Marque quais features estão disponíveis em cada plano. Features "core" (Dashboard e Configurações) estão sempre disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Feature</TableHead>
                {plans.map(plan => (
                  <TableHead key={plan.id} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold">{plan.display_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {plan.name}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map(feature => (
                <TableRow key={feature.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{feature.display_name}</div>
                      {feature.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {feature.path}
                      </div>
                    </div>
                  </TableCell>
                  {plans.map(plan => {
                    const isEnabled = matrix[plan.id]?.[feature.id] || false;
                    const key = `${plan.id}-${feature.id}`;
                    const isLoading = loading[key] || false;

                    return (
                      <TableCell key={plan.id} className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => handleToggle(plan.id, feature.id, checked)}
                              />
                              {isEnabled ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

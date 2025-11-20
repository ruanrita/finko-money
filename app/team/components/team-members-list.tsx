"use client";

import { useState } from "react";
import { Crown, User, MoreVertical, Trash2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { removeMemberAction, changeMemberRoleAction } from "../actions";
import { useRouter } from "next/navigation";
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

type Member = {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
  };
};

type Props = {
  members: Member[];
  currentUserId: string;
  userRole: string | null;
  branchId: string;
};

export function TeamMembersList({ members, currentUserId, userRole, branchId }: Props) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  async function handleRemoveMember(memberId: string, userId: string) {
    const result = await removeMemberAction(branchId, userId);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao remover membro");
    }
    setRemovingId(null);
  }

  async function handleChangeRole(memberId: string, userId: string, newRole: "owner" | "member") {
    const result = await changeMemberRoleAction(branchId, userId, newRole);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao alterar role");
    }
    setChangingRoleId(null);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? "membro" : "membros"} neste workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const isOwner = member.role === "owner";
              const canManage = userRole === "owner" && !isCurrentUser;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      {isOwner ? (
                        <Crown className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.users.full_name || member.users.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Você)
                            </span>
                          )}
                        </p>
                        <Badge variant={isOwner ? "default" : "secondary"}>
                          {isOwner ? "Dono" : "Membro"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.users.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entrou em {formatDate(member.joined_at)}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isOwner && (
                          <DropdownMenuItem
                            onClick={() => setChangingRoleId(member.id)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Promover a Dono
                          </DropdownMenuItem>
                        )}
                        {isOwner && (
                          <DropdownMenuItem
                            onClick={() => setChangingRoleId(member.id)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Rebaixar a Membro
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setRemovingId(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Remove Member Dialog */}
                  {removingId === member.id && (
                    <AlertDialog
                      open={removingId === member.id}
                      onOpenChange={(open) => !open && setRemovingId(null)}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover membro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover {member.users.email} do workspace?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id, member.user_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Change Role Dialog */}
                  {changingRoleId === member.id && (
                    <AlertDialog
                      open={changingRoleId === member.id}
                      onOpenChange={(open) => !open && setChangingRoleId(null)}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Alterar permissão</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isOwner
                              ? `Tem certeza que deseja rebaixar ${member.users.email} para Membro?`
                              : `Tem certeza que deseja promover ${member.users.email} para Dono?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleChangeRole(
                                member.id,
                                member.user_id,
                                isOwner ? "member" : "owner"
                              )
                            }
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

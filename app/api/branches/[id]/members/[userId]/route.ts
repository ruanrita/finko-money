import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  return BranchRoutes.updateMemberRole(request, params.id, params.userId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  return BranchRoutes.removeMember(request, params.id, params.userId);
}

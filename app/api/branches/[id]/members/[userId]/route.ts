import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  return BranchRoutes.updateMemberRole(request, id, userId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  return BranchRoutes.removeMember(request, id, userId);
}

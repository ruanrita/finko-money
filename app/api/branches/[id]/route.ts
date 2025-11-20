import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BranchRoutes.getById(request, params.id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BranchRoutes.update(request, params.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BranchRoutes.delete(request, params.id);
}

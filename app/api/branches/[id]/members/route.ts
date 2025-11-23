import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return BranchRoutes.getMembers(request, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return BranchRoutes.addMember(request, id);
}

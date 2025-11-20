import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BranchRoutes.getMembers(request, params.id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return BranchRoutes.addMember(request, params.id);
}

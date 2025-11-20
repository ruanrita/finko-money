import { NextRequest } from "next/server";
import { BranchRoutes } from "@/src/modules/branches";

export async function GET(request: NextRequest) {
  return BranchRoutes.list(request);
}

export async function POST(request: NextRequest) {
  return BranchRoutes.create(request);
}

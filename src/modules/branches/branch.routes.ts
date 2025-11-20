import { NextRequest, NextResponse } from "next/server";
import { BranchService } from "./branch.service";
import {
  createBranchSchema,
  updateBranchSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./branch.schema";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  return user;
}

export class BranchRoutes {
  static async list(request: NextRequest) {
    try {
      const user = await getUser();
      const branches = await BranchService.getUserBranches(user.id);

      return NextResponse.json({ data: branches });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async getById(request: NextRequest, branchId: string) {
    try {
      const user = await getUser();
      const branch = await BranchService.getBranchById(branchId, user.id);

      return NextResponse.json({ data: branch });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async create(request: NextRequest) {
    try {
      const user = await getUser();
      const body = await request.json();
      const input = createBranchSchema.parse(body);

      const branch = await BranchService.createBranch(input, user.id);

      return NextResponse.json({ data: branch }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async update(request: NextRequest, branchId: string) {
    try {
      const user = await getUser();
      const body = await request.json();
      const input = updateBranchSchema.parse(body);

      const branch = await BranchService.updateBranch(branchId, input, user.id);

      return NextResponse.json({ data: branch });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async delete(request: NextRequest, branchId: string) {
    try {
      const user = await getUser();
      await BranchService.deleteBranch(branchId, user.id);

      return NextResponse.json({ message: "Branch deletado com sucesso" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async getMembers(request: NextRequest, branchId: string) {
    try {
      const user = await getUser();
      const members = await BranchService.getBranchMembers(branchId, user.id);

      return NextResponse.json({ data: members });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async addMember(request: NextRequest, branchId: string) {
    try {
      const user = await getUser();
      const body = await request.json();
      const input = addMemberSchema.parse(body);

      const member = await BranchService.addMember(branchId, input, user.id);

      return NextResponse.json({ data: member }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async removeMember(request: NextRequest, branchId: string, userId: string) {
    try {
      const user = await getUser();
      await BranchService.removeMember(branchId, userId, user.id);

      return NextResponse.json({ message: "Membro removido com sucesso" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  static async updateMemberRole(request: NextRequest, branchId: string, userId: string) {
    try {
      const user = await getUser();
      const body = await request.json();
      const input = updateMemberRoleSchema.parse(body);

      const member = await BranchService.updateMemberRole(branchId, userId, input, user.id);

      return NextResponse.json({ data: member });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}

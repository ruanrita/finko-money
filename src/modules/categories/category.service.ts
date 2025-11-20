import { CategoryRepository } from "./category.repository";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export class CategoryService {
  /**
   * Lista todas as categorias de um branch
   */
  static async list(userId: string, branchId: string): Promise<Category[]> {
    return await CategoryRepository.findByBranchId(branchId, userId);
  }

  /**
   * Busca uma categoria por ID
   */
  static async getById(id: string, branchId: string, userId: string): Promise<Category> {
    const category = await CategoryRepository.findById(id, branchId, userId);

    if (!category) {
      throw new Error("Categoria não encontrada");
    }

    return category;
  }

  /**
   * Cria uma nova categoria
   */
  static async create(
    userId: string,
    branchId: string,
    input: CreateCategoryInput
  ): Promise<Category> {
    // Verifica se já existe categoria com esse nome no branch
    const exists = await CategoryRepository.existsByName(input.name, branchId, userId);

    if (exists) {
      throw new Error("Já existe uma categoria com este nome");
    }

    return await CategoryRepository.create(userId, {
      name: input.name,
      color: input.color || "#6366f1",
      icon: input.icon,
      branch_id: branchId,
    });
  }

  /**
   * Atualiza uma categoria
   */
  static async update(
    id: string,
    branchId: string,
    userId: string,
    input: UpdateCategoryInput
  ): Promise<Category> {
    // Verifica se a categoria existe
    const category = await CategoryRepository.findById(id, branchId, userId);

    if (!category) {
      throw new Error("Categoria não encontrada");
    }

    // Se está alterando o nome, verifica duplicação
    if (input.name && input.name !== category.name) {
      const exists = await CategoryRepository.existsByName(
        input.name,
        branchId,
        userId,
        id
      );

      if (exists) {
        throw new Error("Já existe uma categoria com este nome");
      }
    }

    return await CategoryRepository.update(id, branchId, userId, input);
  }

  /**
   * Deleta uma categoria
   */
  static async delete(id: string, branchId: string, userId: string): Promise<void> {
    // Verifica se a categoria existe
    const category = await CategoryRepository.findById(id, branchId, userId);

    if (!category) {
      throw new Error("Categoria não encontrada");
    }

    // TODO: Verificar se há transações vinculadas e definir estratégia
    // (deletar em cascata, impedir deleção, ou desvincular)

    await CategoryRepository.delete(id, branchId, userId);
  }
}

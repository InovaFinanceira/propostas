"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Ação de login simplificada
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: string }> => {
    console.log("🔐 Login:", args.email);
    
    const user = await ctx.runQuery(internal.users.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.passwordHash !== args.password) {
      throw new Error("Senha incorreta");
    }

    return { userId: user._id };
  },
});

// Ação de criar usuário simplificada
export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
  },
  handler: async (ctx, args): Promise<{ userId: string }> => {
    console.log("👤 Criando usuário:", args.email);

    const existingUser = await ctx.runQuery(internal.users.getUserByEmail, {
      email: args.email,
    });

    if (existingUser) {
      throw new Error("Email já registrado");
    }

    const userId = await ctx.runMutation(internal.users.insertUser, {
      name: args.name,
      email: args.email,
      passwordHash: args.password,
      role: args.role,
    });

    return { userId };
  },
});

// Ação para atualizar usuário
export const updateUser = action({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
      passwordHash: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    console.log("✏️ Atualizando usuário:", args.userId);
    await ctx.runMutation(internal.users.updateUserById, {
      userIdToUpdate: args.userId,
      updates: args.updates,
    });
  },
});

// Ação para deletar usuário
export const deleteUser = action({
  args: {
    userIdToDelete: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args): Promise<void> => {
    console.log("🗑️ Deletando usuário:", args.userIdToDelete);

    // Validar que o usuário atual existe e é ADMIN
    const currentUser = await ctx.runQuery(internal.users.getUserByIdInternal, {
      userId: args.currentUserId,
    });

    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    if (currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem excluir usuários");
    }

    // Não permitir que um admin delete a si mesmo
    if (args.userIdToDelete === args.currentUserId) {
      throw new Error("Você não pode excluir sua própria conta");
    }

    // Deletar o usuário
    await ctx.runMutation(internal.users.deleteUserById, {
      userIdToDelete: args.userIdToDelete,
    });

    console.log("✅ Usuário excluído com sucesso:", args.userIdToDelete);
  },
});


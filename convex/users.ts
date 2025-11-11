import { v } from "convex/values";
import { internalMutation, query, internalQuery, mutation } from "./_generated/server";

// Apenas queries e mutations (sem "use node")
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

// Query interna para buscar usuário por ID (usada em actions)
export const getUserByIdInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

// Query para buscar todos os usuários (para filtros e listagens) - VERSÃO ULTRA ROBUSTA
export const getAllUsers = query({
  args: { requesterId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    try {
      console.log("getAllUsers: Iniciando query com requesterId:", args.requesterId);

      // Se não há requesterId, retorna array vazio (sem erro)
      if (!args.requesterId) {
        console.log("getAllUsers: Sem requesterId, retornando array vazio");
        return [];
      }

      // Verifica se o requesterId é válido
      try {
        const requester = await ctx.db.get(args.requesterId);
        if (!requester) {
          console.log("getAllUsers: Requester não encontrado, retornando array vazio");
          return [];
        }
        console.log("getAllUsers: Requester válido:", requester.name);
      } catch (requesterError) {
        console.error("getAllUsers: Erro ao verificar requester:", requesterError);
        return [];
      }

      console.log("getAllUsers: Buscando todos os usuários...");

      // Busca todos os usuários
      const users = await ctx.db.query("users").collect();
      console.log("getAllUsers: Encontrados", users.length, "usuários");

      if (!users || users.length === 0) {
        console.log("getAllUsers: Nenhum usuário encontrado");
        return [];
      }

      const result = users.map(user => {
        if (!user || !user._id || !user.name) {
          console.warn("getAllUsers: Usuário com dados incompletos:", user);
          return null;
        }
        return {
          _id: user._id,
          name: user.name,
          email: user.email || '',
          role: user.role || 'USER'
        };
      }).filter(Boolean); // Remove nulls

      console.log("getAllUsers: Retornando", result.length, "usuários válidos");
      return result;
    } catch (error) {
      console.error("getAllUsers: Erro crítico:", error);
      if (error instanceof Error) {
        console.error("getAllUsers: Stack trace:", error.stack);
      }
      // Em caso de erro, retorna array vazio em vez de falhar
      return [];
    }
  },
});

export const getAllAdmins = internalQuery({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
      .collect();
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Mutation interna para verificar login
export const verifyLogin = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role
    };
  },
});

export const insertUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
    });
  },
});

export const updateUserById = internalMutation({
  args: {
    userIdToUpdate: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
      passwordHash: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userIdToUpdate, args.updates);
  },
});

export const deleteUserById = internalMutation({
  args: { 
    userIdToDelete: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userIdToDelete);
  },
});

export const getAllUsersInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").collect();
  },
});

export const getCurrentUser = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        return null;
      }
      const user = await ctx.db.get(args.userId);
      return user || null;
    } catch (error) {
      console.error("Erro em getCurrentUser:", error);
      return null;
    }
  },
});

// Query alternativa mais simples para listar usuários (SEM VALIDAÇÃO)
export const getSimpleUsersList = query({
  args: {},
  handler: async (ctx, args) => {
    try {
      console.log("getSimpleUsersList: Iniciando query simples");
      const users = await ctx.db.query("users").collect();
      console.log("getSimpleUsersList: Encontrados", users.length, "usuários");

      return users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
    } catch (error) {
      console.error("getSimpleUsersList: Erro:", error);
      return [];
    }
  },
});

// Mutation para criar usuário (para migração)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER"))
  },
  handler: async (ctx, args) => {
    console.log("createUser: Criando usuário:", args.name, args.email);

    // Verifica se já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error(`Usuário com email ${args.email} já existe`);
    }

    // Cria o usuário
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      passwordHash: "senha123hash" // Hash da senha padrão
    });

    console.log("createUser: Usuário criado com ID:", userId);
    return userId;
  },
});

export const getUsers = query({
  args: { userId: v.optional(v.union(v.id("users"), v.null())) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new Error("Usuário não autenticado.");
    }

    const currentUser = await ctx.db.get(args.userId);

    if (!currentUser) {
      throw new Error("Usuário não encontrado no banco de dados.");
    }

    if (currentUser.role !== "ADMIN") {
      throw new Error(`O usuário '${currentUser.name}' não tem permissão de ADMIN.`);
    }

    return ctx.db.query("users").collect();
  },
});
/**
 * Script para criar o usuário administrador inicial
 * 
 * Execute com:
 * npx convex run createAdmin:createInitialAdmin
 * 
 * IMPORTANTE: Após o primeiro login, altere a senha!
 */

import { mutation } from "./_generated/server";

export const createInitialAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const adminEmail = "contato@grupoinovafinanceira.com";
    const adminName = "Administrador";
    const defaultPassword = "senha123"; // ⚠️ ALTERAR APÓS PRIMEIRO LOGIN!
    
    console.log("🔧 Criando usuário administrador inicial...");
    
    // Verifica se já existe um admin com este email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", adminEmail))
      .first();
    
    if (existing) {
      console.log("⚠️ Usuário admin já existe:", adminEmail);
      return { 
        success: false,
        message: "Usuário admin já existe",
        userId: existing._id 
      };
    }
    
    // Cria o usuário admin
    const userId = await ctx.db.insert("users", {
      name: adminName,
      email: adminEmail,
      passwordHash: defaultPassword,
      role: "ADMIN"
    });
    
    console.log("✅ Usuário admin criado com sucesso!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Senha:", defaultPassword);
    console.log("⚠️ IMPORTANTE: Altere a senha após o primeiro login!");
    
    return { 
      success: true,
      message: "Admin criado com sucesso",
      userId,
      email: adminEmail,
      defaultPassword: defaultPassword
    };
  },
});

/**
 * Script para listar todos os usuários (útil para debug)
 * 
 * Execute com:
 * npx convex run createAdmin:listAllUsers
 */
export const listAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    console.log("👥 Total de usuários:", users.length);
    console.log("\n📋 Lista de usuários:");
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
    });
    
    return users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role
    }));
  },
});

/**
 * Script para resetar senha de um usuário
 * 
 * Execute com:
 * npx convex run createAdmin:resetPassword '{"email":"contato@grupoinovafinanceira.com","newPassword":"novaSenha123"}'
 */
import { v } from "convex/values";

export const resetPassword = mutation({
  args: {
    email: v.string(),
    newPassword: v.string()
  },
  handler: async (ctx, args) => {
    console.log("🔄 Resetando senha para:", args.email);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user) {
      console.log("❌ Usuário não encontrado:", args.email);
      return { 
        success: false,
        message: "Usuário não encontrado" 
      };
    }
    
    await ctx.db.patch(user._id, {
      passwordHash: args.newPassword
    });
    
    console.log("✅ Senha resetada com sucesso!");
    
    return { 
      success: true,
      message: "Senha resetada com sucesso",
      email: args.email
    };
  },
});


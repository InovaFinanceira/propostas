# 🚀 Guia de Deploy - Grupo Inova Financeira

Este documento contém todas as instruções para fazer o deploy do sistema de propostas para a Grupo Inova Financeira.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter acesso a:

- ✅ GitHub: https://github.com/InovaFinanceira/propostas
- ✅ Vercel: https://vercel.com/inova-financeiras-projects
- ✅ Convex: https://dashboard.convex.dev/t/contato-40968/propostas-ec7f0
- ✅ Chave API FIPE (já configurada)
- ⚠️ Chave API Google Gemini (necessária para funcionalidades de IA)

---

## 🔧 Configurações Locais Concluídas

As seguintes alterações já foram feitas localmente:

### 1. Variáveis de Ambiente (`.env.local`)
```env
GEMINI_API_KEY=AIzaSyBdLvnu7uyGygYVz--_A0BlzpXbA6IhdJ8
NEXT_PUBLIC_CONVEX_URL=https://majestic-newt-282.convex.cloud
CONVEX_DEPLOYMENT=prod:majestic-newt-282
NEXT_PUBLIC_FIPE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Branding Atualizado
- ✅ Título da página: "Grupo Inova Financeira - Gerenciador de Propostas"
- ✅ Alt text das logos: "Grupo Inova Financeira Logo"
- ✅ Email de teste: contato@grupoinovafinanceira.com
- ✅ README.md atualizado
- ⚠️ **PENDENTE**: Substituir `/public/logo.png` pelo logo da Inova Financeira

### 3. Limpeza de Código
- ✅ Removidos arquivos `.bak` e `.bak2`
- ✅ Atualizado `cache-bust.txt`

---

## 📦 Passo 1: Preparar o Logo

**IMPORTANTE**: Antes de fazer o commit, você precisa substituir o logo:

1. Obtenha o logo da Grupo Inova Financeira em formato PNG
2. Dimensões recomendadas: 500x200px (ou proporção similar)
3. Substitua o arquivo: `public/logo.png`

---

## 🔄 Passo 2: Commit e Push para GitHub

```bash
# Verificar status
git status

# Adicionar todos os arquivos alterados
git add .

# Fazer commit
git commit -m "feat: Configuração inicial para Grupo Inova Financeira

- Atualizado branding (nome, logos, textos)
- Configurado Convex para novo ambiente
- Atualizado token API FIPE
- Removido código legado
- Atualizado documentação"

# Push para o repositório
git push origin main
```

---

## 🗄️ Passo 3: Configurar Convex

### 3.1. Instalar Convex CLI (se ainda não tiver)
```bash
npm install -g convex
```

### 3.2. Login no Convex
```bash
npx convex login
```

### 3.3. Deploy do Schema e Functions
```bash
# Deploy para produção
npx convex deploy --prod

# Isso irá:
# - Criar as tabelas (users, proposals)
# - Criar os índices
# - Fazer deploy das queries, mutations e actions
```

### 3.4. Criar Usuário Admin Inicial

Após o deploy do Convex, você precisa criar o primeiro usuário admin:

**Opção A: Via Dashboard do Convex**
1. Acesse: https://dashboard.convex.dev/t/contato-40968/propostas-ec7f0
2. Vá em "Data" → "users"
3. Clique em "Add Document"
4. Adicione:
```json
{
  "name": "Administrador",
  "email": "contato@grupoinovafinanceira.com",
  "passwordHash": "senha123",
  "role": "ADMIN"
}
```

**Opção B: Via Script (Recomendado)**
Crie um arquivo temporário `convex/createAdmin.ts`:
```typescript
import { mutation } from "./_generated/server";

export const createInitialAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const adminEmail = "contato@grupoinovafinanceira.com";
    
    // Verifica se já existe
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", adminEmail))
      .first();
    
    if (existing) {
      return { message: "Admin já existe" };
    }
    
    // Cria o admin
    const userId = await ctx.db.insert("users", {
      name: "Administrador",
      email: adminEmail,
      passwordHash: "senha123",
      role: "ADMIN"
    });
    
    return { userId, message: "Admin criado com sucesso" };
  },
});
```

Execute:
```bash
npx convex run createAdmin:createInitialAdmin
```

**⚠️ IMPORTANTE**: Após o primeiro login, altere a senha imediatamente!

---

## ☁️ Passo 4: Deploy na Vercel

### 4.1. Conectar Repositório
1. Acesse: https://vercel.com/inova-financeiras-projects
2. Clique em "Add New Project"
3. Selecione o repositório: `InovaFinanceira/propostas`
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4.2. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```
GEMINI_API_KEY=AIzaSyBdLvnu7uyGygYVz--_A0BlzpXbA6IhdJ8
NEXT_PUBLIC_CONVEX_URL=https://majestic-newt-282.convex.cloud
CONVEX_DEPLOYMENT=prod:majestic-newt-282
NEXT_PUBLIC_FIPE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkYjFmNDkyYS0wOTE5LTQwY2QtOGUyYi05NzA1OGMxMmUxODIiLCJlbWFpbCI6ImNvbnRhdG9AZ3J1cG9pbm92YWZpbmFuY2VpcmEuY29tIiwiaWF0IjoxNzYzMTQ4NzM0fQ.I6iL_b488HIMFvSv8SAv5cxofJHlIpCdhEIYEXGQTU8
```

**Importante**: Marque todas como disponíveis para:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4.3. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar (2-5 minutos)
3. Anote a URL gerada (ex: `propostas-xyz.vercel.app`)

---

## 🌐 Passo 5: Configurar Domínio Customizado

### 5.1. Na Vercel
1. Vá em "Settings" → "Domains"
2. Adicione: `propostas.grupoinovafinanceira.com`
3. A Vercel fornecerá registros DNS para configurar

### 5.2. No Provedor de DNS (ex: Registro.br, Cloudflare)
Adicione os registros fornecidos pela Vercel:

**Tipo A:**
```
propostas.grupoinovafinanceira.com → 76.76.21.21
```

**Tipo CNAME (alternativo):**
```
propostas.grupoinovafinanceira.com → cname.vercel-dns.com
```

### 5.3. Aguardar Propagação
- Pode levar de 5 minutos a 48 horas
- Verifique em: https://dnschecker.org

---

## ✅ Passo 6: Testes Pós-Deploy

### 6.1. Teste de Login
1. Acesse: https://propostas.grupoinovafinanceira.com
2. Faça login com:
   - Email: `contato@grupoinovafinanceira.com`
   - Senha: `senha123`
3. ✅ Deve redirecionar para `/propostas`

### 6.2. Teste de Criação de Proposta
1. Clique em "Nova Proposta"
2. Preencha os dados básicos
3. Teste a integração FIPE:
   - Selecione tipo de veículo
   - Selecione marca
   - Selecione modelo
   - ✅ Deve carregar os dados automaticamente

### 6.3. Teste de Permissões (Admin)
1. Acesse `/usuarios`
2. Crie um novo usuário com role "USER"
3. Faça logout
4. Faça login com o novo usuário
5. ✅ Não deve ter acesso a `/usuarios`

---

## 🔒 Passo 7: Segurança Pós-Deploy

### 7.1. Alterar Senha do Admin
1. Faça login como admin
2. Vá em "Usuários"
3. Edite o usuário admin
4. Altere a senha para uma senha forte

### 7.2. Criar Usuários Reais
1. Remova ou desative usuários de teste
2. Crie usuários reais da equipe
3. Defina roles apropriadas (ADMIN ou USER)

### 7.3. Revisar Variáveis de Ambiente
1. Se necessário, gere uma nova chave GEMINI_API_KEY
2. Atualize na Vercel
3. Faça redeploy

---

## 📊 Monitoramento

### Convex Dashboard
- URL: https://dashboard.convex.dev/t/contato-40968/propostas-ec7f0
- Monitore:
  - Número de queries/mutations
  - Erros
  - Performance

### Vercel Dashboard
- URL: https://vercel.com/inova-financeiras-projects
- Monitore:
  - Builds
  - Deployments
  - Analytics
  - Logs

---

## 🆘 Troubleshooting

### Erro: "NEXT_PUBLIC_CONVEX_URL não está definida"
- Verifique se a variável está configurada na Vercel
- Faça redeploy após adicionar

### Erro 404 ao acessar o site
- Verifique se o DNS está configurado corretamente
- Aguarde propagação DNS

### Login não funciona
- Verifique se o usuário admin foi criado no Convex
- Verifique os logs no Convex Dashboard

### API FIPE não carrega dados
- Verifique se o token está correto
- Verifique o limite de requisições (1000/dia)
- Veja logs no console do navegador

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique os logs na Vercel
2. Verifique os logs no Convex Dashboard
3. Consulte a documentação em `/docs`

---

## ✨ Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Treinar equipe no uso do sistema
2. ✅ Importar dados existentes (se houver)
3. ✅ Configurar backups regulares
4. ✅ Monitorar uso e performance
5. ✅ Coletar feedback dos usuários

---

**Data de criação**: 14/01/2025  
**Versão**: 1.0.0  
**Empresa**: Grupo Inova Financeira


# ✅ Checklist Pré-Deploy - Grupo Inova Financeira

Use este checklist para garantir que tudo está pronto antes do deploy.

---

## 📝 Alterações Locais

### Configurações
- [x] `.env.local` atualizado com credenciais da Inova Financeira
- [x] Token API FIPE configurado
- [x] URL do Convex atualizada (majestic-newt-282)

### Branding
- [x] Título da página atualizado (`src/app/layout.tsx`)
- [x] Alt text dos logos atualizado
- [x] Email de teste atualizado (`src/app/login-simple/page.tsx`)
- [x] README.md atualizado
- [x] `public/cache-bust.txt` atualizado
- [x] Logo substituído em `public/logo.png`
- [x] Favicon configurado (`public/favicon.ico` e metadata)

### Limpeza
- [x] Arquivos `.bak` removidos
- [x] Referências à Nobrecar removidas

---

## 🎨 Logo

**✅ CONCLUÍDO:**

1. [x] Logo da Grupo Inova Financeira obtido
2. [x] Arquivo renomeado para `public/logo.png`
3. [x] Favicon criado (`public/favicon.ico`)
4. [x] Metadata atualizado com ícones
5. [ ] Testar localmente: `npm run dev`
6. [ ] Verificar se o logo e favicon aparecem corretamente

---

## 🔑 Chaves API

### Verificar se você tem:
- [x] Token API FIPE (já configurado)
- [x] Chave Google Gemini (usando a mesma da Nobrecar - pode ser alterada depois)
- [ ] Confirmar se a chave Gemini funciona (testar funcionalidade de IA)

---

## 🚀 Antes do Commit

- [x] Logo substituído
- [x] Favicon configurado
- [ ] Testar localmente: `npm run dev`
- [ ] Verificar login funciona
- [ ] Verificar criação de proposta
- [ ] Verificar integração FIPE
- [ ] Verificar se não há erros no console
- [ ] Verificar se logo e favicon aparecem corretamente

---

## 📦 Git & GitHub

- [ ] Repositório GitHub criado: https://github.com/InovaFinanceira/propostas
- [ ] Git inicializado localmente
- [ ] Remote configurado: `git remote add origin https://github.com/InovaFinanceira/propostas.git`
- [ ] Commit feito com mensagem descritiva
- [ ] Push para `main` branch

---

## 🗄️ Convex

- [ ] Login no Convex: `npx convex login`
- [ ] Deploy do schema: `npx convex deploy --prod`
- [ ] Verificar tabelas criadas no dashboard
- [ ] Criar usuário admin inicial
- [ ] Testar login com usuário admin

---

## ☁️ Vercel

- [ ] Projeto criado na Vercel
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas:
  - [ ] `GEMINI_API_KEY`
  - [ ] `NEXT_PUBLIC_CONVEX_URL`
  - [ ] `CONVEX_DEPLOYMENT`
  - [ ] `NEXT_PUBLIC_FIPE_TOKEN`
- [ ] Deploy realizado com sucesso
- [ ] URL de produção anotada

---

## 🌐 Domínio

- [ ] Domínio adicionado na Vercel: `propostas.grupoinovafinanceira.com`
- [ ] Registros DNS configurados
- [ ] Aguardar propagação DNS (5min - 48h)
- [ ] Testar acesso pelo domínio customizado

---

## ✅ Testes Pós-Deploy

- [ ] Login funciona
- [ ] Criação de proposta funciona
- [ ] API FIPE carrega marcas/modelos
- [ ] Permissões de admin funcionam
- [ ] Permissões de user funcionam
- [ ] Tema claro/escuro funciona
- [ ] Responsividade mobile funciona

---

## 🔒 Segurança

- [ ] Senha do admin alterada
- [ ] Usuários de teste removidos
- [ ] Variáveis de ambiente seguras
- [ ] `.env.local` NÃO commitado (verificar `.gitignore`)

---

## 📊 Monitoramento

- [ ] Convex Dashboard acessível
- [ ] Vercel Dashboard acessível
- [ ] Logs sendo gerados corretamente
- [ ] Sem erros críticos

---

## 📚 Documentação

- [x] `DEPLOY-INOVA-FINANCEIRA.md` criado
- [x] `README.md` atualizado
- [ ] Equipe treinada no uso do sistema
- [ ] Documentação de processos criada (se necessário)

---

## 🎯 Comandos Rápidos

### Testar Localmente
```bash
npm run dev
# Acesse: http://localhost:9002
```

### Deploy Convex
```bash
npx convex deploy --prod
```

### Verificar Build
```bash
npm run build
```

### Commit e Push
```bash
git add .
git commit -m "feat: Configuração inicial Grupo Inova Financeira"
git push origin main
```

---

## ⚠️ IMPORTANTE

**NÃO FAÇA O DEPLOY SEM:**
1. ✅ Substituir o logo
2. ✅ Testar localmente
3. ✅ Verificar todas as variáveis de ambiente

---

## 📞 Em Caso de Problemas

1. Verifique os logs na Vercel
2. Verifique os logs no Convex Dashboard
3. Consulte `docs/DEPLOY-INOVA-FINANCEIRA.md`
4. Verifique o console do navegador (F12)

---

**Última atualização**: 14/01/2025  
**Status**: Pronto para deploy (após substituir logo)


# 🚀 Guia de Deploy em Produção - A-Pay

Documentação completa para colocar sua aplicação A-Pay em produção na VPS Hetzner.

---

## 📚 Documentação Disponível

Este projeto possui documentação completa de deploy em múltiplos arquivos:

### 1. **[DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md)** ⭐ PRINCIPAL
   - Guia completo passo-a-passo de deploy
   - Configuração de VPS, Nginx, PM2, SSL
   - Troubleshooting detalhado
   - **COMECE POR AQUI!**

### 2. **[DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md)** ✅
   - Checklist interativo para deploy inicial
   - Checklist para atualizações
   - Verificações de segurança
   - Variáveis de ambiente requeridas

### 3. **[COMANDOS-RAPIDOS.md](COMANDOS-RAPIDOS.md)** ⚡
   - Comandos do dia-a-dia
   - Monitoramento e debugging
   - Comandos de emergência
   - Aliases úteis

### 4. **[deploy.sh](deploy.sh)** 🤖
   - Script automatizado de deploy
   - Suporta deploy normal, forçado e rollback
   - Uso: `./deploy.sh`

### 5. **[ecosystem.config.js](ecosystem.config.js)** ⚙️
   - Configuração do PM2
   - Gerenciamento de processos do backend
   - Cluster mode e auto-restart

### 6. **[.env.production.example](.env.production.example)** 🔐
   - Template de variáveis de ambiente
   - Comentários explicativos
   - Use como base para criar seu `.env`

---

## 🎯 Início Rápido

### Para Deploy Inicial (Primeira Vez)

1. **Prepare a VPS:**
   ```bash
   # Conectar à VPS
   ssh root@SEU_IP_VPS

   # Seguir DEPLOY-PRODUCAO.md - Passo 1
   ```

2. **Configure DNS:**
   - `app.seudominio.com` → IP da VPS
   - `admin.seudominio.com` → IP da VPS
   - `api.seudominio.com` → IP da VPS

3. **Siga o guia completo:**
   - Leia [DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md)
   - Use [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) para não esquecer nada

### Para Atualizar Aplicação (Já em Produção)

```bash
# Conectar à VPS
ssh apay@SEU_IP_VPS

# Usar script automatizado
cd ~/a-pay
./deploy.sh
```

**OU** seguir processo manual em [DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md) seção "Como Atualizar".

---

## 🏗️ Arquitetura de Deploy

```
Internet
   ↓
DNS (app.seudominio.com, admin.seudominio.com, api.seudominio.com)
   ↓
VPS Hetzner (IP: SEU_IP)
   ↓
Nginx :80/:443 (Reverse Proxy + SSL)
   ↓
   ├─→ Frontend (Static Files em /var/www)
   │   ├─→ app.seudominio.com
   │   └─→ admin.seudominio.com
   │
   └─→ Backend (PM2 em :3001)
       └─→ api.seudominio.com
           ↓
       Supabase (PostgreSQL + Auth)
```

---

## 📋 Pré-requisitos

### Na VPS:
- [ ] Ubuntu 20.04+ ou Debian 11+
- [ ] Node.js 20.x
- [ ] Nginx
- [ ] PM2
- [ ] Certbot (Let's Encrypt)

### Credenciais Necessárias:
- [ ] Domínio configurado
- [ ] Supabase URL
- [ ] Supabase Anon Key
- [ ] Supabase Service Role Key
- [ ] Database URL (Supabase PostgreSQL)

---

## 🛠️ Tecnologias Utilizadas

### Backend:
- **Runtime:** Node.js 20.x
- **Framework:** Fastify
- **ORM:** Prisma
- **Autenticação:** Supabase Auth
- **Process Manager:** PM2

### Frontend:
- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **State:** Zustand
- **Routing:** React Router

### Infraestrutura:
- **Servidor:** VPS Hetzner
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt
- **Database:** Supabase PostgreSQL

---

## 🚦 Status de Produção

### Verificar se está tudo funcionando:

```bash
# Via terminal (SSH na VPS)
pm2 status
curl http://localhost:3001/health
sudo systemctl status nginx

# Via navegador
https://app.seudominio.com       # Frontend App
https://admin.seudominio.com     # Frontend Admin
https://api.seudominio.com/health # Backend Health
```

### Monitoramento:

```bash
# Logs em tempo real
pm2 logs apay-backend

# Status de recursos
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Fluxo de Atualização

1. **Desenvolver localmente**
   - Fazer mudanças no código
   - Testar localmente
   - Commitar no Git

2. **Push para repositório**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin master
   ```

3. **Deploy na VPS**
   ```bash
   ssh apay@SEU_IP_VPS
   cd ~/a-pay
   ./deploy.sh
   ```

4. **Verificar**
   ```bash
   pm2 status
   curl https://api.seudominio.com/health
   # Testar no navegador
   ```

---

## 🆘 Solução de Problemas

### Backend não inicia:
```bash
pm2 logs apay-backend --err
cd ~/a-pay/backend
cat .env  # Verificar variáveis
```

### Frontend mostra página em branco:
```bash
cd ~/a-pay/frontend
ls -la dist/  # Verificar se build existe
npm run build  # Re-buildar
```

### Erro 502 Bad Gateway:
```bash
pm2 restart apay-backend
sudo systemctl restart nginx
```

### SSL não funciona:
```bash
sudo certbot certificates  # Ver certificados
sudo certbot renew  # Renovar
```

**Mais soluções:** [DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md) seção "Troubleshooting"

---

## 🔐 Segurança

### Configurações Obrigatórias:

1. **Firewall ativo:**
   ```bash
   sudo ufw enable
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   ```

2. **Fail2Ban (proteção contra brute force):**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Atualizações de segurança:**
   ```bash
   sudo apt install unattended-upgrades
   ```

4. **Variáveis de ambiente protegidas:**
   - `.env` NÃO deve estar no Git
   - Usar `.env.production.example` como template

---

## 📊 Monitoramento Recomendado

### Ferramentas Gratuitas:

1. **UptimeRobot** (https://uptimerobot.com)
   - Monitora se site está no ar
   - Envia alerta por email/SMS

2. **PM2 Plus** (https://pm2.io)
   - Dashboard de monitoramento
   - Alertas de erros e crashes

3. **Google Analytics** (opcional)
   - Monitorar uso da aplicação

---

## 📝 Manutenção Regular

### Diariamente:
- [ ] Verificar logs de erro: `pm2 logs apay-backend --err --lines 20`

### Semanalmente:
- [ ] Verificar uso de disco: `df -h`
- [ ] Verificar uso de memória: `free -h`
- [ ] Atualizar sistema: `sudo apt update && sudo apt upgrade`

### Mensalmente:
- [ ] Revisar logs do Nginx
- [ ] Limpar logs antigos: `pm2 flush`
- [ ] Verificar SSL: `sudo certbot certificates`
- [ ] Backup manual do código

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial:
- **PM2:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx:** https://nginx.org/en/docs/
- **Prisma:** https://www.prisma.io/docs
- **Supabase:** https://supabase.com/docs

### Tutoriais Úteis:
- Deploy Node.js com PM2
- Configurar SSL com Certbot
- Otimização de Nginx

---

## 🤝 Suporte

### Se tiver problemas:

1. **Consulte a documentação:**
   - [DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md)
   - [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md)
   - [COMANDOS-RAPIDOS.md](COMANDOS-RAPIDOS.md)

2. **Verifique os logs:**
   ```bash
   pm2 logs apay-backend --err
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Teste componentes individualmente:**
   ```bash
   curl http://localhost:3001/health  # Backend
   sudo nginx -t  # Nginx config
   ```

---

## 📞 Comandos Essenciais

```bash
# Deploy
./deploy.sh

# Status
pm2 status

# Logs
pm2 logs apay-backend

# Reiniciar
pm2 restart apay-backend

# Health check
curl https://api.seudominio.com/health

# Rollback
./deploy.sh --rollback
```

**Mais comandos:** [COMANDOS-RAPIDOS.md](COMANDOS-RAPIDOS.md)

---

## 🎯 Próximos Passos Após Deploy

1. **Testar todas funcionalidades:**
   - Login (app e admin)
   - Criar comanda
   - Adicionar itens
   - Pagamento
   - Kitchen

2. **Configurar monitoramento:**
   - UptimeRobot para uptime
   - PM2 Plus para métricas
   - Google Analytics (opcional)

3. **Otimizações:**
   - CDN para assets estáticos (Cloudflare)
   - Cache no Nginx
   - Compressão Gzip

4. **Backups:**
   - Supabase já faz backup automático do banco
   - Considere backup do código (.env principalmente)

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## ✨ Desenvolvido por

**A-Pay** - Sistema de Gestão de Comandas e Pedidos

**Última atualização da documentação:** 14/10/2025

---

**🎉 Parabéns por chegar até aqui! Agora você está pronto para colocar o A-Pay em produção!**

Siga o [DEPLOY-PRODUCAO.md](DEPLOY-PRODUCAO.md) passo-a-passo e use o [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) para não esquecer nada.

Boa sorte! 🚀

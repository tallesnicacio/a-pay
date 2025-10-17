#!/bin/bash

##############################################################################
# Script de Configuração Inicial da VPS - A-Pay
#
# Este script instala e configura tudo necessário na VPS Hetzner:
# - Node.js 20.x
# - PM2
# - Nginx
# - Firewall (UFW)
# - Git
#
# Uso: Execute este script como root na VPS
#   chmod +x setup-vps.sh
#   ./setup-vps.sh
##############################################################################

set -e  # Exit on error

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

log "========================================="
log "Configuração Inicial da VPS - A-Pay"
log "========================================="

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Por favor, execute como root (sudo ./setup-vps.sh)"
    exit 1
fi

# 1. Atualizar sistema
log "1. Atualizando sistema..."
apt update
apt upgrade -y

# 2. Instalar dependências básicas
log "2. Instalando dependências básicas..."
apt install -y curl wget git build-essential software-properties-common ufw fail2ban

# 3. Instalar Node.js 20.x
log "3. Instalando Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    log "✓ Node.js $(node -v) instalado"
else
    log "✓ Node.js já está instalado: $(node -v)"
fi

# 4. Instalar PM2 globalmente
log "4. Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    log "✓ PM2 instalado"
else
    log "✓ PM2 já está instalado"
fi

# 5. Instalar Nginx
log "5. Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    log "✓ Nginx instalado e iniciado"
else
    log "✓ Nginx já está instalado"
fi

# 6. Configurar Firewall
log "6. Configurando Firewall (UFW)..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
log "✓ Firewall configurado"

# 7. Configurar Fail2Ban
log "7. Configurando Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
log "✓ Fail2Ban configurado"

# 8. Criar usuário apay (opcional - pode usar root)
log "8. Verificando usuário apay..."
if ! id "apay" &>/dev/null; then
    info "Criando usuário 'apay'..."
    useradd -m -s /bin/bash apay
    usermod -aG sudo apay
    log "✓ Usuário 'apay' criado"
else
    log "✓ Usuário 'apay' já existe"
fi

# 9. Instalar Certbot para SSL
log "9. Instalando Certbot (Let's Encrypt)..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    log "✓ Certbot instalado"
else
    log "✓ Certbot já está instalado"
fi

log "========================================="
log "Configuração inicial concluída!"
log "========================================="
log ""
info "Próximos passos:"
info "1. Clonar o repositório: git clone https://github.com/tallesnicacio/a-pay.git"
info "2. Configurar arquivos .env"
info "3. Executar script de deploy"
log ""
log "Resumo das ferramentas instaladas:"
echo "  - Node.js: $(node -v)"
echo "  - NPM: $(npm -v)"
echo "  - PM2: $(pm2 -v)"
echo "  - Nginx: $(nginx -v 2>&1 | grep -o 'nginx/[0-9.]*')"
echo "  - Certbot: $(certbot --version 2>&1 | head -n1)"
log ""
log "Sistema pronto para deploy! 🚀"

#!/bin/bash

##############################################################################
# Script de Deploy Automatizado - A-Pay
#
# Este script automatiza o processo de atualização da aplicação em produção.
# Ele faz: git pull, build do frontend, restart do backend.
#
# Uso:
#   ./deploy.sh              # Deploy normal
#   ./deploy.sh --force      # Deploy forçado (sobrescreve mudanças locais)
#   ./deploy.sh --rollback   # Rollback para commit anterior
##############################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_DIR="$HOME/a-pay"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOG_DIR="$APP_DIR/logs"
BACKUP_DIR="$APP_DIR/backups"
DEPLOY_LOG="$LOG_DIR/deploy.log"

# Criar diretórios se não existirem
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$DEPLOY_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$DEPLOY_LOG"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$DEPLOY_LOG"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."

    if ! command_exists git; then
        error "Git não está instalado"
        exit 1
    fi

    if ! command_exists node; then
        error "Node.js não está instalado"
        exit 1
    fi

    if ! command_exists npm; then
        error "NPM não está instalado"
        exit 1
    fi

    if ! command_exists pm2; then
        error "PM2 não está instalado. Instale com: npm install -g pm2"
        exit 1
    fi

    log "✓ Todas as dependências estão instaladas"
}

# Função para fazer backup do código atual
backup_current() {
    log "Criando backup do código atual..."

    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    # Pegar commit hash atual
    cd "$APP_DIR"
    CURRENT_COMMIT=$(git rev-parse --short HEAD)

    # Criar arquivo com informações do backup
    cat > "$BACKUP_DIR/$BACKUP_NAME.info" <<EOF
Backup criado em: $(date +'%Y-%m-%d %H:%M:%S')
Commit: $CURRENT_COMMIT
Branch: $(git branch --show-current)
EOF

    log "✓ Backup criado: $BACKUP_NAME (commit: $CURRENT_COMMIT)"
}

# Função para rollback
rollback() {
    log "Iniciando rollback..."

    cd "$APP_DIR"

    # Voltar 1 commit
    git reset --hard HEAD~1

    log "✓ Código revertido para commit anterior"

    # Re-deploy
    deploy_backend
    deploy_frontend

    log "✓ Rollback concluído"
}

# Função para atualizar código
update_code() {
    log "Atualizando código do repositório..."

    cd "$APP_DIR"

    # Verificar se há mudanças locais
    if ! git diff-index --quiet HEAD --; then
        if [ "$FORCE_DEPLOY" = true ]; then
            warning "Mudanças locais detectadas. Sobrescrevendo (--force)..."
            git stash
        else
            error "Há mudanças locais não commitadas. Use --force para sobrescrever."
            exit 1
        fi
    fi

    # Puxar código mais recente
    BEFORE_COMMIT=$(git rev-parse --short HEAD)
    git pull origin master
    AFTER_COMMIT=$(git rev-parse --short HEAD)

    if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
        info "Nenhuma atualização encontrada (já está na versão mais recente)"
        return 1
    else
        log "✓ Código atualizado: $BEFORE_COMMIT → $AFTER_COMMIT"
        return 0
    fi
}

# Função para deploy do backend
deploy_backend() {
    log "Fazendo deploy do backend..."

    cd "$BACKEND_DIR"

    # Verificar se .env existe
    if [ ! -f .env ]; then
        error "Arquivo .env não encontrado no backend!"
        exit 1
    fi

    # Instalar dependências (apenas production)
    log "Instalando dependências do backend..."
    npm install --production

    # Gerar Prisma Client
    log "Gerando Prisma Client..."
    npx prisma generate

    # Executar migrações (se houver)
    log "Executando migrações do banco de dados..."
    npx prisma migrate deploy || warning "Nenhuma migração pendente ou erro nas migrações"

    # Reiniciar backend com PM2
    log "Reiniciando backend com PM2..."
    pm2 restart apay-backend

    # Aguardar backend iniciar
    sleep 3

    # Verificar se está rodando
    if pm2 list | grep -q "apay-backend.*online"; then
        log "✓ Backend reiniciado com sucesso"
    else
        error "Backend falhou ao reiniciar!"
        pm2 logs apay-backend --lines 50
        exit 1
    fi

    # Testar health check
    log "Testando health check..."
    sleep 2
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log "✓ Backend está respondendo corretamente"
    else
        error "Backend não está respondendo ao health check!"
        exit 1
    fi
}

# Função para deploy do frontend
deploy_frontend() {
    log "Fazendo deploy do frontend..."

    cd "$FRONTEND_DIR"

    # Verificar se .env.production existe
    if [ ! -f .env.production ]; then
        error "Arquivo .env.production não encontrado no frontend!"
        exit 1
    fi

    # Instalar dependências
    log "Instalando dependências do frontend..."
    npm install

    # Build de produção
    log "Buildando frontend para produção..."
    npm run build

    # Verificar se build foi criado
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        error "Build do frontend falhou! Diretório dist/ não foi criado."
        exit 1
    fi

    log "✓ Frontend buildado com sucesso"

    # Limpar cache do Nginx (opcional)
    if command_exists nginx && [ -w /var/cache/nginx ]; then
        log "Limpando cache do Nginx..."
        sudo rm -rf /var/cache/nginx/*
    fi
}

# Função principal de deploy
deploy() {
    log "========================================="
    log "Iniciando deploy da aplicação A-Pay"
    log "========================================="

    # Verificar dependências
    check_dependencies

    # Fazer backup
    backup_current

    # Atualizar código
    if update_code; then
        CODE_UPDATED=true
    else
        CODE_UPDATED=false
    fi

    # Se não houve atualização e não é force, perguntar se continua
    if [ "$CODE_UPDATED" = false ] && [ "$FORCE_DEPLOY" != true ]; then
        read -p "Código já está atualizado. Deseja continuar com o deploy? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Deploy cancelado pelo usuário"
            exit 0
        fi
    fi

    # Deploy backend
    deploy_backend

    # Deploy frontend
    deploy_frontend

    # Mostrar status final
    log "========================================="
    log "Deploy concluído com sucesso!"
    log "========================================="

    # Mostrar informações
    cd "$APP_DIR"
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    COMMIT_MESSAGE=$(git log -1 --pretty=%B)

    info "Versão atual: $CURRENT_COMMIT"
    info "Último commit: $COMMIT_MESSAGE"
    info ""
    info "Status do backend:"
    pm2 list | grep apay-backend
    info ""
    info "Últimas linhas do log:"
    pm2 logs apay-backend --lines 10 --nostream
}

# Função para mostrar uso
show_usage() {
    cat << EOF
Uso: $0 [OPÇÕES]

Script de deploy automatizado para A-Pay em produção.

OPÇÕES:
    (nenhuma)       Deploy normal - atualiza código e reinicia aplicação
    --force         Deploy forçado - sobrescreve mudanças locais
    --rollback      Rollback - reverte para commit anterior
    --help          Mostra esta mensagem de ajuda

EXEMPLOS:
    $0                  # Deploy normal
    $0 --force          # Deploy forçado
    $0 --rollback       # Rollback para versão anterior

LOGS:
    Deploy log: $DEPLOY_LOG
    Backend logs: pm2 logs apay-backend

EOF
}

# Parse argumentos
FORCE_DEPLOY=false
DO_ROLLBACK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --rollback)
            DO_ROLLBACK=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            error "Opção desconhecida: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Executar ação
if [ "$DO_ROLLBACK" = true ]; then
    backup_current
    rollback
else
    deploy
fi

log "Processo finalizado"

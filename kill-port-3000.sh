#!/bin/bash

echo "🔍 Procurando processos na porta 3000..."

# Encontrar o PID
PID=$(netstat -ano | grep ":3000" | grep "LISTENING" | awk '{print $5}' | head -1)

if [ -z "$PID" ]; then
    echo "✅ Porta 3000 está livre!"
    exit 0
fi

echo "📍 Encontrado processo PID: $PID"
echo "🔪 Matando processo..."

# Matar o processo (funciona no WSL)
kill -9 $PID 2>/dev/null || {
    echo "⚠️  Não foi possível matar via WSL, tente manualmente:"
    echo ""
    echo "    taskkill //PID $PID //F"
    echo ""
    echo "Ou no PowerShell:"
    echo "    Stop-Process -Id $PID -Force"
}

echo "✅ Pronto! Tente novamente: pnpm dev"

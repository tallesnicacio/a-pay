/**
 * Detecta o subdomínio atual
 * admin.localhost:5173 -> 'admin'
 * app.localhost:5173 -> 'app'
 * localhost:5173 -> null (não permitido)
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Se for localhost direto, não tem subdomínio (não permitido)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // Extrair subdomínio
  const parts = hostname.split('.');

  // Se tiver apenas uma parte (ex: localhost), não tem subdomínio
  if (parts.length === 1) {
    return null;
  }

  // Retornar a primeira parte como subdomínio
  return parts[0];
}

/**
 * Verifica se está no painel admin
 */
export function isAdminPanel(): boolean {
  const subdomain = getSubdomain();
  return subdomain === 'admin';
}

/**
 * Verifica se está no painel app
 */
export function isAppPanel(): boolean {
  const subdomain = getSubdomain();
  // Agora APENAS aceita app.* explicitamente
  return subdomain === 'app';
}

/**
 * Retorna a URL base para o painel correto
 */
export function getPanelUrl(panel: 'admin' | 'app'): string {
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  return `${protocol}//${panel}.localhost${port}`;
}

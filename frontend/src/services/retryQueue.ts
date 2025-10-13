/**
 * Retry Queue para operações offline
 *
 * Armazena requisições que falharam por falta de internet
 * e as executa novamente quando a conexão for restaurada
 */

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data: any;
  headers: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'apay_retry_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

class RetryQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Carregar fila do localStorage
   */
  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[RetryQueue] Erro ao carregar fila:', error);
      this.queue = [];
    }
  }

  /**
   * Salvar fila no localStorage
   */
  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[RetryQueue] Erro ao salvar fila:', error);
    }
  }

  /**
   * Adicionar requisição à fila
   */
  add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedRequest);
    this.saveQueue();

    console.log('[RetryQueue] Requisição adicionada à fila:', queuedRequest.id);

    // Tentar processar imediatamente se online
    if (navigator.onLine) {
      this.process();
    }
  }

  /**
   * Processar fila de requisições
   */
  async process() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    console.log('[RetryQueue] Processando fila...', this.queue.length, 'itens');

    while (this.queue.length > 0 && navigator.onLine) {
      const request = this.queue[0];

      try {
        await this.executeRequest(request);
        // Sucesso: remover da fila
        this.queue.shift();
        this.saveQueue();
        console.log('[RetryQueue] Requisição executada:', request.id);
      } catch (error) {
        console.error('[RetryQueue] Erro ao executar requisição:', error);

        // Incrementar contador de retries
        request.retryCount++;

        if (request.retryCount >= MAX_RETRIES) {
          // Máximo de tentativas atingido: remover da fila
          console.error('[RetryQueue] Máximo de tentativas atingido:', request.id);
          this.queue.shift();
          this.saveQueue();
        } else {
          // Aguardar antes da próxima tentativa
          await this.delay(RETRY_DELAY);
        }

        // Se offline, parar processamento
        if (!navigator.onLine) {
          break;
        }
      }
    }

    this.isProcessing = false;

    if (this.queue.length === 0) {
      console.log('[RetryQueue] Fila vazia');
    }
  }

  /**
   * Executar requisição
   */
  private async executeRequest(request: QueuedRequest) {
    const { api } = await import('./api');

    const response = await api.request({
      url: request.url,
      method: request.method as any,
      data: request.data,
      headers: request.headers,
    });

    return response.data;
  }

  /**
   * Limpar fila
   */
  clear() {
    this.queue = [];
    this.saveQueue();
    console.log('[RetryQueue] Fila limpa');
  }

  /**
   * Obter tamanho da fila
   */
  get size() {
    return this.queue.length;
  }

  /**
   * Obter itens da fila
   */
  getItems() {
    return [...this.queue];
  }

  /**
   * Remover item específico da fila
   */
  remove(id: string) {
    const index = this.queue.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      console.log('[RetryQueue] Item removido:', id);
    }
  }

  /**
   * Setup listener para quando voltar online
   */
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('[RetryQueue] Conexão restaurada, processando fila...');
      this.process();
    });

    window.addEventListener('offline', () => {
      console.log('[RetryQueue] Conexão perdida');
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gerar ID único
   */
  private generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const retryQueue = new RetryQueue();

// Export para uso em stores
export default retryQueue;

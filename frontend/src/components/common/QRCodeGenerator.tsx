import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './Button';
import { Card } from './Card';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  description?: string;
  size?: number;
}

export function QRCodeGenerator({
  url,
  title = 'QR Code',
  description,
  size = 300,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [url, size]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      setIsGenerating(true);
      setError(null);

      await QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#1f2937', // neutral-800
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError('Erro ao gerar QR Code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `qrcode-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Trigger toast notification
      const event = new CustomEvent('show-toast', {
        detail: { message: 'Link copiado!', type: 'success' },
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-600 mb-4">{description}</p>
        )}

        <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 inline-block mb-4">
          {isGenerating ? (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center flex-col" style={{ width: size, height: size }}>
              <svg className="w-16 h-16 text-danger-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="mx-auto" />
          )}
        </div>

        <div className="bg-neutral-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-neutral-500 mb-1">Link do cardápio:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white px-3 py-2 rounded border flex-1 truncate text-left">
              {url}
            </code>
            <button
              onClick={copyURL}
              className="p-2 hover:bg-neutral-200 rounded transition-colors"
              title="Copiar link"
            >
              <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={downloadQRCode}
            disabled={isGenerating || !!error}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar QR Code
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={copyURL}
            disabled={isGenerating || !!error}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar Link
          </Button>
        </div>

        <p className="text-xs text-neutral-500 mt-4">
          Clientes podem escanear este QR Code para acessar o cardápio
        </p>
      </div>
    </Card>
  );
}

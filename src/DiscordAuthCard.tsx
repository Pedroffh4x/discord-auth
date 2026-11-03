import React, { useState, useEffect, useMemo } from 'react';
import styles from './DiscordAuthCard.module.css';

const CONFETTI_COLORS = [
  '#ff8c00', '#ff6b00', '#ff4500',
  '#3b82f6', '#2563eb', '#60a5fa',
  '#10b981', '#059669',
  '#ffffff', '#fbbf24', '#f59e0b',
];

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number;
  shape: 'rect' | 'circle' | 'star';
}

const SHAPES: ConfettiPiece['shape'][] = ['rect', 'circle', 'star'];

const SUPABASE_URL = "https://cqcuhwsfswdkibswdmqh.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY3Vod3Nmc3dka2lic3dkbXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODU0MzMsImV4cCI6MjA4Mjk2MTQzM30.tR-fxEDqYAkO5UjPFNOttkNsKpaiQhVXk8XJSsA8Zxo";

const DiscordAuthCard: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthProcessed, setOauthProcessed] = useState(false);

  // Processa o callback OAuth ao carregar a página
  useEffect(() => {
    const processOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const oauthError = params.get('error');

      if (oauthError) {
        setError('Autorização cancelada. Volte ao Discord e tente novamente.');
        setOauthProcessed(true);
        return;
      }

      if (!code || !state) {
        // Sem parâmetros OAuth — apenas mostra a animação normal
        setOauthProcessed(true);
        return;
      }

      try {
        const redirectUri = window.location.origin + window.location.pathname;
        const res = await fetch(`${SUPABASE_URL}/functions/v1/discord-oauth-callback`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'complete', code, state, redirect_uri: redirectUri }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          console.error('[verify-callback] Erro:', res.status, data);
          setError(data.error || 'Falha ao concluir verificação.');
          setOauthProcessed(true);
          return;
        }

        // Sucesso — limpa os parâmetros da URL para evitar reprocessamento
        window.history.replaceState({}, document.title, window.location.pathname);
        setOauthProcessed(true);
      } catch (e) {
        console.error('[verify-callback] Exception:', e);
        setError('Não foi possível concluir. Tente novamente.');
        setOauthProcessed(true);
      }
    };

    processOAuth();
  }, []);

  // Inicia a animação de progresso apenas após o OAuth ser processado
  useEffect(() => {
    if (!oauthProcessed) return;

    let current = 0;
    const target = 100;

    const interval = setInterval(() => {
      if (current >= target) {
        clearInterval(interval);
        setIsComplete(true);
      } else {
        current += 1;
        setProgress(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [oauthProcessed]);

  // Redireciona para o servidor Discord ao concluir a animação
  useEffect(() => {
    if (isComplete) {
      window.location.href = 'https://discord.gg/fusion7';
    }
  }, [isComplete]);

  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    if (!isComplete) return [];
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 350,
      y: (Math.random() - 0.5) * 350 - 120,
      r: Math.random() * 720,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.4,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));
  }, [isComplete]);

  const shapeClass = (shape: ConfettiPiece['shape']) => {
    switch (shape) {
      case 'circle': return styles.confettiCircle;
      case 'star': return styles.confettiStar;
      default: return styles.confettiRect;
    }
  };

  // Tela de erro
  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.particles}>
          <div className={styles.particle} />
          <div className={styles.particle} />
          <div className={styles.particle} />
        </div>
        <div className={styles.logoContainer}>
          <div className={styles.logoRingSecondary} />
          <div className={styles.logoRing} />
          <div className={styles.logo}>
            <img src="/logo.webp" alt="Fusion Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
        </div>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>Erro</h1>
        </div>
        <p className={styles.subtitle}>{error}</p>
        <div className={styles.divider} />
        <button
          onClick={() => window.close()}
          className={styles.discordLoginBtn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80%', padding: '12px 0', margin: '16px auto 0', borderRadius: 4, background: '#ED4245', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
        >
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Partículas flutuantes ao redor do card */}
      <div className={styles.particles}>
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      {/* Explosão de Confete */}
      {isComplete && (
        <div className={styles.confettiContainer}>
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className={`${styles.confetti} ${shapeClass(piece.shape)}`}
              style={{
                backgroundColor: piece.color,
                color: piece.color,
                '--x': `${piece.x}px`,
                '--y': `${piece.y}px`,
                '--r': `${piece.r}deg`,
                animationDelay: `${piece.delay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Overlay de Sucesso */}
      {isComplete && (
        <div className={styles.successOverlay}>
          <div className={styles.approvedBadge}>
            <svg className={styles.approvedCheck} viewBox="0 0 24 24">
              <polyline points="4 12 10 18 20 6" />
            </svg>
          </div>
          <p className={styles.approvedText}>Aprovado</p>
          <p className={styles.approvedSubtext}>ACESSO CONCEDIDO</p>
        </div>
      )}

      {/* Logo Fusion com anéis animados */}
      <div className={styles.logoContainer}>
        <div className={styles.logoRingSecondary} />
        <div className={styles.logoRing} />
        <div className={styles.logo}>
          <img
            src="/logo.webp"
            alt="Fusion Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
        </div>
        <div className={styles.logoGlow} />
      </div>

      {/* Nome + Badge Verificado */}
      <div className={styles.nameRow}>
        <h1 className={styles.name}>Fusion</h1>
        <div className={styles.verifiedBadge}>
          <svg
            className={styles.checkmark}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      </div>

      {/* Subtítulo */}
      <p className={styles.subtitle}>DISCORD.GG/fusion7</p>

      {/* Barra de Progresso Circular com Onda */}
      <div className={styles.progressContainer}>
        <div className={styles.progressGlow} />
        <div className={styles.progressCircle}>
          <div
            className={styles.progressFill}
            style={{ height: `${progress}%` }}
          >
            {/* Onda no topo do líquido */}
            <div className={styles.waveContainer}>
              <div className={styles.wave} />
              <div className={`${styles.wave} ${styles.waveSecondary}`} />
            </div>
            {/* Bolhas */}
            <div className={styles.bubbles}>
              <div className={styles.bubble} style={{ left: '15%', animationDelay: '0s' }} />
              <div className={styles.bubble} style={{ left: '40%', animationDelay: '0.6s' }} />
              <div className={styles.bubble} style={{ left: '65%', animationDelay: '1.2s' }} />
              <div className={styles.bubble} style={{ left: '85%', animationDelay: '0.3s' }} />
              <div className={styles.bubble} style={{ left: '30%', animationDelay: '1.8s' }} />
              <div className={styles.bubble} style={{ left: '55%', animationDelay: '0.9s' }} />
            </div>
          </div>
          <span className={styles.progressText}>
            {progress}<span className={styles.progressTextSmall}>%</span>
          </span>
        </div>
      </div>

      {/* Divisor decorativo */}
      <div className={styles.divider} />

      {/* Textos Inferiores */}
      <div className={styles.statusSection}>
        <p className={styles.statusText}>{isComplete ? 'Redirecionando...' : 'Autenticando acesso'}</p>
        <p className={styles.processingText}>
          {isComplete ? 'CONCLUÍDO' : 'PROCESSANDO'}
          <span className={styles.processingDot} />
          <span className={styles.processingDot} />
          <span className={styles.processingDot} />
        </p>
      </div>
    </div>
  );
};

export default DiscordAuthCard;
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

const DiscordAuthCard: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
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
  }, []);

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

      {/* Botão Login com Discord (aparece apenas quando não está autenticado) */}
      {!isComplete && (
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/discord`}
          className={styles.discordLoginBtn}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '80%',
            padding: '12px 0',
            margin: '16px auto 0',
            borderRadius: 4,
            background: '#5865F2',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            transition: 'background 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#4752c4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#5865F2'; }}
        >
          <svg width="20" height="15" viewBox="0 0 71 55" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1045 13.8956C55.5792 11.8214 50.7265 10.2916 45.6527 9.41542C44.968 10.6425 44.1739 12.1395 43.6249 13.3999C38.2225 12.5833 32.8201 12.5833 27.5283 13.3999C26.9793 12.1395 26.158 10.6425 25.5006 9.41542C20.3996 10.2916 15.5469 11.8214 11.0216 13.8956C1.97129 27.5391 -0.491089 40.8493 0.740089 53.968C6.11401 57.9417 11.3241 60.3579 16.4523 61.9303C17.738 60.1779 18.8872 58.3164 19.8727 56.373C18.0201 55.6796 16.2493 54.8225 14.5879 53.8291C15.0244 53.5019 15.4336 53.1746 15.8428 52.8473C25.9749 57.538 37.0879 57.538 47.0291 52.8473C47.4383 53.2019 47.8475 53.5019 48.284 53.8291C46.6226 54.8225 44.8518 55.6796 42.9992 56.373C43.9847 58.3164 45.1339 60.1779 46.4196 61.9303C51.5751 60.3579 56.7852 57.9417 62.1318 53.968C63.5812 38.7949 59.6701 25.5938 50.0681 13.8956H60.1045ZM20.7736 44.0917C17.6653 44.0917 15.1061 41.2333 15.1061 37.7203C15.1061 34.2073 17.6107 31.3489 20.7736 31.3489C23.9638 31.3489 26.4957 34.2073 26.4411 37.7203C26.4411 41.2333 23.9365 44.0917 20.7736 44.0917ZM50.1772 44.0917C47.0689 44.0917 44.5097 41.2333 44.5097 37.7203C44.5097 34.2073 47.0143 31.3489 50.1772 31.3489C53.3674 31.3489 55.8993 34.2073 55.8447 37.7203C55.8447 41.2333 53.3674 44.0917 50.1772 44.0917Z"/>
          </svg>
          Entrar com Discord
        </a>
      )}

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
import React from 'react';
import styles from './HeroWrapper.module.css';
import DiscordAuthCard from './DiscordAuthCard';

interface HeroWrapperProps {
  /** Componente de fundo WebGL/Shader */
  BackgroundComponent?: React.ComponentType;
}

const HeroWrapper: React.FC<HeroWrapperProps> = ({ BackgroundComponent }) => {
  return (
    <div className={styles.wrapper}>
      {/* Camada de fundo: z-index 0, não bloqueia cliques */}
      <div className={styles.backgroundLayer}>
        {BackgroundComponent && <BackgroundComponent />}
      </div>

      {/* Camada de conteúdo: z-index 10, acima do fundo */}
      <div className={styles.contentLayer}>
        <DiscordAuthCard />
      </div>
    </div>
  );
};

export default HeroWrapper;
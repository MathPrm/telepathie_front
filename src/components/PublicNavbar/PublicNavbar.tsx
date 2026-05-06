import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './PublicNavbar.module.css';

interface PublicNavbarProps {
  logoSrc?: string;
  loginLabel?: string;
  onLoginClick?: () => void;
  loginTo?: string;
  signupTo?: string;
}

const PublicNavbar: FC<PublicNavbarProps> = ({
  logoSrc,
  loginLabel = 'Connexion',
  onLoginClick,
  loginTo = '/connexion',
  signupTo = '/inscription',
}) => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link to="/" className={styles.brand}>
          <span className={styles.logoBox} aria-hidden="true">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo Télépathie"
                className={styles.logoImage}
              />
            ) : (
              <span className={styles.logoPlaceholder}>Logo</span>
            )}
          </span>
          <span className={styles.brandName}>Télépathie</span>
        </Link>

        <div className={styles.actions}>
          <Link to={signupTo} className={styles.signupButton}>
            S'inscrire
          </Link>

          {onLoginClick ? (
            <button
              type="button"
              onClick={onLoginClick}
              className={styles.loginButton}
            >
              {loginLabel}
            </button>
          ) : (
            <Link to={loginTo} className={styles.loginButton}>
              {loginLabel}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default PublicNavbar;

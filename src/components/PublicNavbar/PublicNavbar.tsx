import { UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultLogo from '../../assets/logo_telepathie.png';
import { AUTH_CHANGED_EVENT, clearAuthUser, getAuthUser } from '../../utils/auth';
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
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState(getAuthUser());
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const refreshAuthUser = (): void => {
      setAuthUser(getAuthUser());
    };

    window.addEventListener('storage', refreshAuthUser);
    window.addEventListener(AUTH_CHANGED_EVENT, refreshAuthUser);
    return () => {
      window.removeEventListener('storage', refreshAuthUser);
      window.removeEventListener(AUTH_CHANGED_EVENT, refreshAuthUser);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = (): void => {
    clearAuthUser();
    setAuthUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleGoProfile = (): void => {
    setIsMenuOpen(false);
    navigate('/profil');
  };

  const userDisplayName = authUser
    ? `${authUser.firstName} ${authUser.lastName.toUpperCase()}`
    : '';
  const resolvedLogoSrc = logoSrc ?? defaultLogo;

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link to="/" className={styles.brand}>
          <span className={styles.logoBox} aria-hidden="true">
            {resolvedLogoSrc ? (
              <img
                src={resolvedLogoSrc}
                alt="Logo Telepathie"
                className={styles.logoImage}
              />
            ) : (
              <span className={styles.logoPlaceholder}>Logo</span>
            )}
          </span>
          <span className={styles.brandName}>Télépathie</span>
        </Link>

        {authUser ? (
          <div className={styles.userMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <UserRound size={18} />
              <span>{userDisplayName}</span>
            </button>

            {isMenuOpen && (
              <div className={styles.dropdown} role="menu">
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleGoProfile}
                >
                  Profil
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </nav>
    </header>
  );
};

export default PublicNavbar;

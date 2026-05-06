import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { setAuthUser } from '../../utils/auth';
import styles from './PraticienConnexionPage.module.css';

const PraticienConnexionPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          expectedRole: 'practitioner',
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            user?: {
              id: number;
              firstName: string;
              lastName: string;
              email: string;
              role: 'patient' | 'practitioner';
              createdAt: string;
            };
          }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message || 'Identifiants invalides.');
        return;
      }

      setSuccessMessage(payload?.message || 'Connexion réussie.');
      if (payload?.user) {
        setAuthUser(payload.user);
      }
      navigate('/praticiens/calendrier');
    } catch (error) {
      console.error('Erreur réseau pendant la connexion praticien:', error);
      setErrorMessage('Impossible de joindre le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="praticien-login-title">
          <h1 id="praticien-login-title" className={styles.title}>
            Espace praticiens
          </h1>
          <p className={styles.subtitle}>Connectez-vous à votre espace dédié.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field} htmlFor="email">
              Adresse mail
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className={styles.field} htmlFor="password">
              Mot de passe
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              <span className={styles.checkMark} aria-hidden="true" />
              <span className={styles.checkText}>Afficher le mot de passe</span>
            </label>

            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
            {successMessage && (
              <p className={styles.successText}>{successMessage}</p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>

            <Link
              to="/praticiens/inscription"
              className={styles.praticienSignupLink}
            >
              <span>Inscription praticien</span>
              <ArrowRight size={16} />
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PraticienConnexionPage;

import { useState } from 'react';
import type { FormEvent } from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import styles from './ConnexionPage.module.css';

const ConnexionPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="login-title">
          <h1 id="login-title" className={styles.title}>
            Connexion
          </h1>
          <p className={styles.subtitle}>
            Connectez-vous à votre espace Télépathie.
          </p>

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

            <button type="submit" className={styles.submitButton}>
              Se connecter
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ConnexionPage;

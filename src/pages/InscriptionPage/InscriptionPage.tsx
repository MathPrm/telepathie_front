import { useState } from 'react';
import type { FormEvent } from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import styles from './InscriptionPage.module.css';

const InscriptionPage = () => {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMismatch(password !== confirmPassword);
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="signup-title">
          <h1 id="signup-title" className={styles.title}>
            Inscription
          </h1>
          <p className={styles.subtitle}>Créez votre compte Télépathie.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.nameRow}>
              <label className={styles.field} htmlFor="lastName">
                Nom
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={styles.input}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </label>

              <label className={styles.field} htmlFor="firstName">
                Prénom
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={styles.input}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </label>
            </div>

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
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <label className={styles.field} htmlFor="confirmPassword">
              Confirmer le mot de passe
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className={styles.input}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {passwordMismatch && (
              <p className={styles.errorText}>
                Les mots de passe ne correspondent pas.
              </p>
            )}

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
              />
              <span className={styles.checkMark} aria-hidden="true" />
              <span className={styles.checkText}>
                Afficher les mots de passe
              </span>
            </label>

            <label className={styles.checkLabel}>
              <input type="checkbox" className={styles.checkInput} required />
              <span className={styles.checkMark} aria-hidden="true" />
              <span className={styles.checkText}>
                J&apos;accepte les conditions d&apos;utilisation
              </span>
            </label>

            <button type="submit" className={styles.submitButton}>
              M&apos;inscrire
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default InscriptionPage;

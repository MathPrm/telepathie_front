import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import styles from './InscriptionPage.module.css';

const InscriptionPage = () => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const mismatch = password !== confirmPassword;
    setPasswordMismatch(mismatch);
    setErrorMessage('');
    setSuccessMessage('');

    if (mismatch) {
      return;
    }

    if (!acceptTerms) {
      setErrorMessage("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          acceptTerms,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message || "Erreur pendant l'inscription.");
        return;
      }

      setSuccessMessage(payload?.message || 'Inscription reussie.');
      setLastName('');
      setFirstName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPasswords(false);
      setAcceptTerms(false);
      setPasswordMismatch(false);
      navigate('/connexion');
    } catch (error) {
      console.error("Erreur reseau pendant l'inscription:", error);
      setErrorMessage('Impossible de joindre le serveur.');
    } finally {
      setIsSubmitting(false);
    }
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
            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
            {successMessage && (
              <p className={styles.successText}>{successMessage}</p>
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
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                required
              />
              <span className={styles.checkMark} aria-hidden="true" />
              <span className={styles.checkText}>
                J&apos;accepte les conditions d&apos;utilisation
              </span>
            </label>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Inscription...' : "M'inscrire"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default InscriptionPage;

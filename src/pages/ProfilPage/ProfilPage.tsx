import { Navigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './ProfilPage.module.css';

const ProfilPage = () => {
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Profil</h1>
          <p className={styles.line}>
            <strong>Nom :</strong> {user.lastName}
          </p>
          <p className={styles.line}>
            <strong>Prenom :</strong> {user.firstName}
          </p>
          <p className={styles.line}>
            <strong>Adresse mail :</strong> {user.email}
          </p>
        </section>
      </main>
    </div>
  );
};

export default ProfilPage;

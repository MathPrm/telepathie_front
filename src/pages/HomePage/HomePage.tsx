import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleBookAppointment = (): void => {
    navigate('/praticiens/recherche');
  };

  const handleProtectedAction = (): void => {
    const user = getAuthUser();

    if (!user) {
      navigate('/connexion');
      return;
    }

    navigate('/profil');
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Télépathie</h1>
          <p className={styles.subtitle}>La médecine qui vous devine</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleBookAppointment}
            >
              Prendre un RDV
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleProtectedAction}
            >
              Rejoindre une visio
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

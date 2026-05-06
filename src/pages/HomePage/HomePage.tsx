import PublicNavbar from '../../components/PublicNavbar';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Télépathie</h1>
          <p className={styles.subtitle}>La médecine qui vous devine</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton}>
              Prendre un RDV
            </button>
            <button type="button" className={styles.secondaryButton}>
              Rejoindre une visio
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

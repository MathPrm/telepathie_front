import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import PractitionerSearchBar from '../../components/PractitionerSearchBar';
import PublicNavbar from '../../components/PublicNavbar';
import styles from './PractitionerSearchPage.module.css';

const PractitionerSearchPage = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string): void => {
    navigate(`/praticiens/resultats?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Trouver un praticien</h1>
          <p className={styles.subtitle}>
            Recherchez le spécialiste qui vous conviendra.
          </p>
          <div className={styles.searchBox}>
            <PractitionerSearchBar onSearch={handleSearch} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PractitionerSearchPage;

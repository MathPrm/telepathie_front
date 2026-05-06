import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import PractitionerSearchBar from '../../components/PractitionerSearchBar';
import PublicNavbar from '../../components/PublicNavbar';
import styles from './PractitionerSearchResultsPage.module.css';

interface AppointmentType {
  label: string;
  durationMinutes: number;
}

interface PractitionerResult {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  appointmentTypes: AppointmentType[];
}

const PractitionerSearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = (searchParams.get('q') ?? '').trim();

  const [results, setResults] = useState<PractitionerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadResults = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/practitioners/search?q=${encodeURIComponent(query)}`,
        );

        const payload = (await response.json().catch(() => null)) as
          | { results?: PractitionerResult[]; message?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.message || 'Impossible de charger les resultats.');
          setResults([]);
          return;
        }

        setResults(Array.isArray(payload?.results) ? payload.results : []);
      } catch (error) {
        console.error('Erreur recherche praticiens:', error);
        setErrorMessage('Impossible de joindre le serveur.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadResults();
  }, [query]);

  const onSearch = (nextQuery: string): void => {
    navigate(`/praticiens/resultats?q=${encodeURIComponent(nextQuery)}`);
  };

  const resultLabel = results.length > 1 ? 'resultats' : 'resultat';

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.container}>
          <PractitionerSearchBar initialValue={query} onSearch={onSearch} />

          <p className={styles.resultText}>
            {results.length} {resultLabel} pour "{query}"
          </p>

          {isLoading && <p className={styles.infoText}>Chargement...</p>}
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <div className={styles.cards}>
            {!isLoading &&
              results.map((practitioner) => (
                <article key={practitioner.id} className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    {practitioner.firstName} {practitioner.lastName.toUpperCase()}
                  </h2>
                  <p className={styles.specialty}>
                    {practitioner.specialty || 'Specialite non renseignee'}
                  </p>

                  <div className={styles.appointmentList}>
                    {practitioner.appointmentTypes.length > 0 ? (
                      practitioner.appointmentTypes.map((item, index) => (
                        <div key={`${item.label}-${index}`} className={styles.appointmentRow}>
                          <span className={styles.appointmentLabel}>{item.label}</span>
                          <span className={styles.appointmentDuration}>
                            {item.durationMinutes} min
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyAppointments}>
                        Aucun type de rendez-vous renseigne.
                      </p>
                    )}
                  </div>

                  <button type="button" className={styles.availabilityButton}>
                    Voir les disponibilites
                  </button>
                </article>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PractitionerSearchResultsPage;

import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './MesRendezVousPage.module.css';

interface AppointmentItem {
  id: number;
  practitioner: {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  appointmentTypeLabel: string;
  appointmentTypeDurationMinutes: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reservedAt: string;
}

type AppointmentFilter = 'upcoming' | 'past' | 'cancelled';

const normalizeTime = (value: string): string => value.slice(0, 5);

const formatDateFr = (dateIso: string): string => {
  const [year, month, day] = dateIso.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const canCancelOver24h = (dateIso: string, startTime: string): boolean => {
  const [hour, minute] = normalizeTime(startTime).split(':').map(Number);
  const [year, month, day] = dateIso.split('-').map(Number);
  const startDateTime = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
  return startDateTime.getTime() - Date.now() > 24 * 60 * 60 * 1000;
};

const getAppointmentStartTimestamp = (dateIso: string, startTime: string): number => {
  const [hour, minute] = normalizeTime(startTime).split(':').map(Number);
  const [year, month, day] = dateIso.split('-').map(Number);
  return new Date(
    year,
    (month ?? 1) - 1,
    day ?? 1,
    hour ?? 0,
    minute ?? 0,
    0,
    0,
  ).getTime();
};

const MesRendezVousPage = () => {
  const authUser = getAuthUser();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<AppointmentFilter>('upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCancellingId, setIsCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authUser || authUser.role !== 'patient') {
      return;
    }

    const loadAppointments = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/appointments/patient/${authUser.id}`);
        const payload = (await response.json().catch(() => null)) as
          | { appointments?: AppointmentItem[]; message?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.message ?? 'Impossible de charger vos rendez-vous.');
          setAppointments([]);
          return;
        }

        setAppointments(Array.isArray(payload?.appointments) ? payload.appointments : []);
      } catch (error) {
        console.error('Erreur chargement rendez-vous:', error);
        setErrorMessage('Impossible de joindre le serveur.');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
  }, [authUser?.id, authUser?.role]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (left, right) =>
          getAppointmentStartTimestamp(left.appointmentDate, left.startTime) -
          getAppointmentStartTimestamp(right.appointmentDate, right.startTime),
      ),
    [appointments],
  );

  const visibleAppointments = useMemo(() => {
    const now = Date.now();
    if (selectedFilter === 'cancelled') {
      return sortedAppointments.filter((item) => item.status === 'cancelled');
    }

    if (selectedFilter === 'past') {
      return sortedAppointments.filter(
        (item) =>
          item.status === 'booked' &&
          getAppointmentStartTimestamp(item.appointmentDate, item.startTime) <= now,
      );
    }

    return sortedAppointments.filter(
      (item) =>
        item.status === 'booked' &&
        getAppointmentStartTimestamp(item.appointmentDate, item.startTime) > now,
    );
  }, [selectedFilter, sortedAppointments]);

  const onCancelAppointment = async (appointmentId: number): Promise<void> => {
    if (!authUser || authUser.role !== 'patient') {
      return;
    }

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
    );
    if (!confirmed) {
      return;
    }

    setIsCancellingId(appointmentId);
    setErrorMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientUserId: authUser.id,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Impossible d'annuler ce rendez-vous.");
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointmentId ? { ...item, status: 'cancelled' } : item,
        ),
      );
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      setErrorMessage('Impossible de joindre le serveur.');
    } finally {
      setIsCancellingId(null);
    }
  };

  if (!authUser) {
    return <Navigate to="/connexion" replace />;
  }

  if (authUser.role !== 'patient') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.container}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Mes rendez-vous</h1>
            <div className={styles.filterWrap}>
              <label htmlFor="rdv-filter" className={styles.filterLabel}>
                RDV
              </label>
              <select
                id="rdv-filter"
                className={styles.filterSelect}
                value={selectedFilter}
                onChange={(event) => setSelectedFilter(event.target.value as AppointmentFilter)}
              >
                <option value="upcoming">à venir</option>
                <option value="past">passés</option>
                <option value="cancelled">annulés</option>
              </select>
            </div>
          </div>
          <p className={styles.subtitle}>Retrouvez tous les RDV que vous avez réservé.</p>

          {isLoading && <p className={styles.infoText}>Chargement...</p>}
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <div className={styles.list}>
            {!isLoading && visibleAppointments.length === 0 && (
              <p className={styles.infoText}>Aucun rendez-vous à afficher pour le moment.</p>
            )}

            {visibleAppointments.map((appointment) => {
              const appointmentStartTs = getAppointmentStartTimestamp(
                appointment.appointmentDate,
                appointment.startTime,
              );
              const isCancelledAppointment = appointment.status === 'cancelled';
              const isPastAppointment = !isCancelledAppointment && appointmentStartTs <= Date.now();
              const toneClassName = isCancelledAppointment
                ? styles.itemCancelled
                : isPastAppointment
                  ? styles.itemPast
                  : '';

              const canCancel = canCancelOver24h(
                appointment.appointmentDate,
                appointment.startTime,
              ) && appointment.status === 'booked';

              return (
                <article
                  key={appointment.id}
                  className={`${styles.item} ${toneClassName}`}
                >
                  {canCancel && (
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        void onCancelAppointment(appointment.id);
                      }}
                      disabled={isCancellingId === appointment.id}
                    >
                      {isCancellingId === appointment.id ? 'Annulation...' : 'Annuler le RDV'}
                    </button>
                  )}

                  <p className={`${styles.line} ${styles.practitionerName}`}>
                    <strong>
                      {appointment.practitioner.firstName}{' '}
                      {appointment.practitioner.lastName.toUpperCase()}
                    </strong>
                  </p>
                  <p className={styles.line}>
                    <strong>Spécialité :</strong>{' '}
                    {appointment.practitioner.specialty || 'Non renseignée'}
                  </p>
                  <p className={styles.line}>
                    <strong>Type de rendez-vous :</strong> {appointment.appointmentTypeLabel}
                  </p>
                  <p className={styles.line}>
                    <strong>Date :</strong> {formatDateFr(appointment.appointmentDate)}
                  </p>
                  <p className={styles.line}>
                    <strong>Créneau :</strong> {normalizeTime(appointment.startTime)} -{' '}
                    {normalizeTime(appointment.endTime)}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MesRendezVousPage;

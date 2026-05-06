import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './PractitionerPublicPage.module.css';

interface AppointmentType {
  label: string;
  durationMinutes: number;
}

interface DaySchedule {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface PractitionerPublicProfile {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  appointmentTypes: AppointmentType[];
  weeklySchedule: DaySchedule[];
  bookedAppointments: Array<{
    appointmentDate: string;
    startTime: string;
    endTime: string;
  }>;
}

interface DaySlots {
  isoDate: string;
  label: string;
  slots: Array<{
    key: string;
    label: string;
  }>;
}

const DAY_LABELS: Record<DaySchedule['day'], string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

const SCHEDULE_BY_JS_DAY: Array<DaySchedule['day']> = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

const DAYS_PER_PAGE = 5;
const SEARCH_HORIZON_DAYS = 120;

const toMinutes = (value: string): number => {
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const toLocalIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildSlotsForDay = (
  row: DaySchedule,
  durationMinutes: number,
): Array<{ startMinutes: number; endMinutes: number; label: string }> => {
  if (
    !row.startTime ||
    !row.endTime ||
    durationMinutes < 5 ||
    Number.isNaN(toMinutes(row.startTime)) ||
    Number.isNaN(toMinutes(row.endTime))
  ) {
    return [];
  }

  const start = toMinutes(row.startTime);
  const end = toMinutes(row.endTime);
  if (start >= end) {
    return [];
  }

  const breakStart = row.breakStart ? toMinutes(row.breakStart) : null;
  const breakEnd = row.breakEnd ? toMinutes(row.breakEnd) : null;
  const slots: Array<{ startMinutes: number; endMinutes: number; label: string }> = [];

  for (let cursor = start; cursor + durationMinutes <= end; cursor += durationMinutes) {
    const slotEnd = cursor + durationMinutes;
    const overlapsBreak =
      breakStart !== null &&
      breakEnd !== null &&
      cursor < breakEnd &&
      slotEnd > breakStart;

    if (!overlapsBreak) {
      slots.push({
        startMinutes: cursor,
        endMinutes: slotEnd,
        label: `${toTime(cursor)} - ${toTime(slotEnd)}`,
      });
    }
  }

  return slots;
};

const formatDateLabel = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

const formatScheduleRange = (row: DaySchedule): string => {
  if (row.breakStart && row.breakEnd) {
    return `${row.startTime} - ${row.breakStart} / ${row.breakEnd} - ${row.endTime}`;
  }
  return `${row.startTime} - ${row.endTime}`;
};

const PractitionerPublicPage = () => {
  const { practitionerId } = useParams<{ practitionerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = (searchParams.get('q') ?? '').trim();

  const [profile, setProfile] = useState<PractitionerPublicProfile | null>(null);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<number>(0);
  const [carouselPage, setCarouselPage] = useState(0);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState('');
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');

  useEffect(() => {
    if (!practitionerId) {
      setErrorMessage('Praticien introuvable.');
      return;
    }

    const loadProfile = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/practitioners/${practitionerId}/public-profile`,
        );

        const payload = (await response.json().catch(() => null)) as
          | (PractitionerPublicProfile & { message?: string })
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.message || 'Impossible de charger le praticien.');
          setProfile(null);
          return;
        }

        setProfile(payload);
        setSelectedTypeIndex(0);
        setCarouselPage(0);
        setSelectedSlotKey('');
        setBookingErrorMessage('');
        setBookingSuccessMessage('');
      } catch (error) {
        console.error('Erreur chargement praticien public:', error);
        setErrorMessage('Impossible de joindre le serveur.');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [practitionerId]);

  const availableWeeklyDays = useMemo(
    () => (profile?.weeklySchedule ?? []).filter((row) => row.enabled),
    [profile],
  );

  const selectedType =
    profile && profile.appointmentTypes.length > 0
      ? profile.appointmentTypes[selectedTypeIndex] ?? profile.appointmentTypes[0]
      : null;

  const futureDaySlots = useMemo<DaySlots[]>(() => {
    if (!selectedType || !profile) {
      return [];
    }

    const scheduleByDay = new Map(
      profile.weeklySchedule.map((row) => [row.day, row]),
    );

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const now = new Date();
    const todayIso = toLocalIsoDate(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const bookedByDate = new Map<
      string,
      Array<{ startMinutes: number; endMinutes: number }>
    >();

    for (const booked of profile.bookedAppointments ?? []) {
      const dateKey = booked.appointmentDate;
      const startMinutes = toMinutes(booked.startTime);
      const endMinutes = toMinutes(booked.endTime);
      if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) {
        continue;
      }

      const existing = bookedByDate.get(dateKey);
      if (existing) {
        existing.push({ startMinutes, endMinutes });
      } else {
        bookedByDate.set(dateKey, [{ startMinutes, endMinutes }]);
      }
    }

    const result: DaySlots[] = [];

    for (let offset = 0; offset < SEARCH_HORIZON_DAYS; offset += 1) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + offset);

      const scheduleKey = SCHEDULE_BY_JS_DAY[currentDate.getDay()];
      const row = scheduleByDay.get(scheduleKey);
      if (!row || !row.enabled) {
        continue;
      }

      const rawSlots = buildSlotsForDay(row, selectedType.durationMinutes);
      const isoDate = toLocalIsoDate(currentDate);
      const reservedSlots = bookedByDate.get(isoDate) ?? [];
      const slots = rawSlots
        .filter((slot) => {
          return !reservedSlots.some(
            (reserved) =>
              slot.startMinutes < reserved.endMinutes &&
              slot.endMinutes > reserved.startMinutes,
          );
        })
        .map((slot) => ({
          key: `${isoDate}|${slot.label}`,
          label: slot.label,
          startMinutes: slot.startMinutes,
        }))
        .filter((slot) =>
          isoDate === todayIso ? slot.startMinutes > nowMinutes : true,
        )
        .map((slot) => ({ key: slot.key, label: slot.label }));

      if (slots.length === 0) {
        continue;
      }

      result.push({
        isoDate,
        label: formatDateLabel(currentDate),
        slots,
      });
    }

    return result;
  }, [profile, selectedType]);

  useEffect(() => {
    setCarouselPage(0);
    setSelectedSlotKey('');
    setBookingErrorMessage('');
    setBookingSuccessMessage('');
  }, [selectedTypeIndex, practitionerId]);

  const maxCarouselPage = Math.max(
    0,
    Math.ceil(futureDaySlots.length / DAYS_PER_PAGE) - 1,
  );
  const canGoPrevious = carouselPage > 0;
  const canGoNext = carouselPage < maxCarouselPage;

  const visibleDaySlots = futureDaySlots.slice(
    carouselPage * DAYS_PER_PAGE,
    (carouselPage + 1) * DAYS_PER_PAGE,
  );

  const goBack = (): void => {
    navigate(`/praticiens/resultats?q=${encodeURIComponent(query)}`);
  };

  const toggleSlotSelection = (slotKey: string): void => {
    setBookingErrorMessage('');
    setBookingSuccessMessage('');
    setSelectedSlotKey((current) => (current === slotKey ? '' : slotKey));
  };

  const handleReserve = async (): Promise<void> => {
    if (!profile || !selectedType || !selectedSlotKey) {
      return;
    }

    const authUser = getAuthUser();
    if (!authUser) {
      setBookingSuccessMessage('');
      setBookingErrorMessage('Connectez-vous pour reserver un rendez-vous.');
      return;
    }

    if (authUser.role !== 'patient') {
      setBookingSuccessMessage('');
      setBookingErrorMessage('Seuls les utilisateurs patients peuvent reserver.');
      return;
    }

    const [appointmentDate, slotRange] = selectedSlotKey.split('|');
    const [startTime, endTime] = (slotRange ?? '').split(' - ');

    if (!appointmentDate || !startTime || !endTime) {
      setBookingSuccessMessage('');
      setBookingErrorMessage('Le creneau selectionne est invalide.');
      return;
    }

    setIsBooking(true);
    setBookingErrorMessage('');
    setBookingSuccessMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practitionerId: profile.id,
          patientUserId: authUser.id,
          appointmentDate,
          startTime,
          endTime,
          appointmentTypeLabel: selectedType.label,
          appointmentTypeDurationMinutes: selectedType.durationMinutes,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setBookingErrorMessage(payload?.message ?? 'Impossible de reserver ce creneau.');
        return;
      }

      setSelectedSlotKey('');
      setBookingSuccessMessage('Rendez-vous reserve avec succes.');
      navigate('/mes-rendez-vous');
    } catch (error) {
      console.error('Erreur reservation rendez-vous:', error);
      setBookingErrorMessage('Impossible de joindre le serveur.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.container}>
          <div className={styles.topActions}>
            <button type="button" className={styles.backButton} onClick={goBack}>
              <ArrowLeft size={16} />
              <span>Retour</span>
            </button>
          </div>

          {isLoading && <p className={styles.infoText}>Chargement...</p>}
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          {profile && (
            <>
              <div className={styles.card}>
                <h1 className={styles.title}>
                  {profile.firstName} {profile.lastName.toUpperCase()}
                </h1>
                <p className={styles.specialty}>
                  {profile.specialty || 'Spécialité non renseignée'}
                </p>

                <h2 className={styles.blockTitle}>Horaires</h2>
                {availableWeeklyDays.length === 0 ? (
                  <p className={styles.infoText}>Aucun jour disponible.</p>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Jour</th>
                          <th>Plage horaire</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableWeeklyDays.map((row) => (
                          <tr key={row.day}>
                            <td>{DAY_LABELS[row.day]}</td>
                            <td>{formatScheduleRange(row)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <h2 className={styles.blockTitle}>Créneaux disponibles</h2>
                {profile.appointmentTypes.length === 0 ? (
                  <p className={styles.infoText}>Aucun type de rendez-vous disponible.</p>
                ) : (
                  <>
                    <select
                      className={styles.select}
                      value={selectedTypeIndex}
                      onChange={(event) => setSelectedTypeIndex(Number(event.target.value))}
                    >
                      {profile.appointmentTypes.map((item, index) => (
                        <option key={`${item.label}-${index}`} value={index}>
                          {item.label} - {item.durationMinutes} min
                        </option>
                      ))}
                    </select>

                    <div className={styles.carouselNav}>
                      <button
                        type="button"
                        className={styles.carouselButton}
                        onClick={() => setCarouselPage((prev) => Math.max(0, prev - 1))}
                        disabled={!canGoPrevious}
                      >
                        <ChevronLeft size={16} />
                        <span>Précédent</span>
                      </button>
                      <button
                        type="button"
                        className={styles.carouselButton}
                        onClick={() =>
                          setCarouselPage((prev) => Math.min(maxCarouselPage, prev + 1))
                        }
                        disabled={!canGoNext}
                      >
                        <span>Suivant</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {futureDaySlots.length === 0 ? (
                      <p className={styles.infoText}>Aucun créneau disponible.</p>
                    ) : (
                      <div className={styles.slotsGrid}>
                        {visibleDaySlots.map((entry) => (
                          <div key={entry.isoDate} className={styles.slotDayCard}>
                            <p className={styles.slotDayTitle}>{entry.label}</p>
                            <div className={styles.slotList}>
                              {entry.slots.map((slot) => (
                                <button
                                  key={slot.key}
                                  type="button"
                                  className={`${styles.slotChip} ${
                                    selectedSlotKey === slot.key
                                      ? styles.slotChipSelected
                                      : ''
                                  }`}
                                  onClick={() => toggleSlotSelection(slot.key)}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {bookingErrorMessage && (
                      <p className={styles.errorText}>{bookingErrorMessage}</p>
                    )}
                    {bookingSuccessMessage && (
                      <p className={styles.successText}>{bookingSuccessMessage}</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
      {selectedSlotKey && (
        <button
          type="button"
          className={styles.reserveFloatingButton}
          onClick={() => {
            void handleReserve();
          }}
          disabled={isBooking}
        >
          <span>{isBooking ? 'Reservation...' : 'Reserver'}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

export default PractitionerPublicPage;

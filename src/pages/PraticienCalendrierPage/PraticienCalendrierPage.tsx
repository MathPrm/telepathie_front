import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './PraticienCalendrierPage.module.css';

interface DaySchedule {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface PractitionerCalendarAppointment {
  id: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointmentTypeLabel: string;
  patientFirstName: string;
  patientLastName: string;
}

interface PractitionerCalendarPayload {
  weeklySchedule: DaySchedule[];
  appointments: PractitionerCalendarAppointment[];
}

type ViewMode = 'week' | 'month';

const DAY_LABELS: Record<DaySchedule['day'], string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mer',
  thu: 'Jeu',
  fri: 'Ven',
  sat: 'Sam',
  sun: 'Dim',
};

const DAY_KEYS_BY_JS_DAY: Array<DaySchedule['day']> = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

const DAY_ORDER: DaySchedule['day'][] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const toLocalIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const TODAY_ISO = toLocalIsoDate(new Date());

const formatMonthLabel = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(date);

const formatDateLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
};

const formatMonthOnly = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);

const capitalize = (value: string): string =>
  value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;

const formatShortDateLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(year, (month ?? 1) - 1, day ?? 1))
    .replace('.', '');
};

const startOfWeekMonday = (date: Date): Date => {
  const result = new Date(date);
  const weekday = result.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getWeekPeriodLabel = (
  weekCursor: Date,
  weekDays: Array<{ isoDate: string }>,
): string => {
  const sourceDates =
    weekDays.length > 0
      ? weekDays.map((day) => {
          const [year, month, dayNum] = day.isoDate.split('-').map(Number);
          return new Date(year, (month ?? 1) - 1, dayNum ?? 1);
        })
      : Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(weekCursor);
          date.setDate(weekCursor.getDate() + index);
          return date;
        });

  const sorted = sourceDates.sort((a, b) => a.getTime() - b.getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (first.getFullYear() === last.getFullYear()) {
    if (first.getMonth() === last.getMonth()) {
      return `${capitalize(formatMonthOnly(first))} ${first.getFullYear()}`;
    }
    return `${capitalize(formatMonthOnly(first))} - ${capitalize(
      formatMonthOnly(last),
    )} ${first.getFullYear()}`;
  }

  return `${capitalize(formatMonthOnly(first))} ${first.getFullYear()} - ${capitalize(
    formatMonthOnly(last),
  )} ${last.getFullYear()}`;
};

const PraticienCalendrierPage = () => {
  const authUser = getAuthUser();
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [appointments, setAppointments] = useState<PractitionerCalendarAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekCursor, setWeekCursor] = useState<Date>(() => startOfWeekMonday(new Date()));
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [overlayDate, setOverlayDate] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser || authUser.role !== 'practitioner') {
      return;
    }

    const loadCalendar = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/appointments/practitioner/${authUser.id}/calendar`,
        );
        const payload = (await response.json().catch(() => null)) as
          | (Partial<PractitionerCalendarPayload> & { message?: string })
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.message ?? 'Impossible de charger le calendrier.');
          setWeeklySchedule([]);
          setAppointments([]);
          return;
        }

        setWeeklySchedule(Array.isArray(payload?.weeklySchedule) ? payload.weeklySchedule : []);
        setAppointments(Array.isArray(payload?.appointments) ? payload.appointments : []);
      } catch (error) {
        console.error('Erreur chargement calendrier praticien:', error);
        setErrorMessage('Impossible de joindre le serveur.');
        setWeeklySchedule([]);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCalendar();
  }, [authUser?.id, authUser?.role]);

  const enabledDayKeys = useMemo(() => {
    const enabled = new Set(
      weeklySchedule.filter((row) => row.enabled).map((row) => row.day),
    );
    return DAY_ORDER.filter((key) => enabled.has(key));
  }, [weeklySchedule]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, PractitionerCalendarAppointment[]>();
    for (const item of appointments) {
      const existing = map.get(item.appointmentDate);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.appointmentDate, [item]);
      }
    }

    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [appointments]);

  const weekDays = useMemo(() => {
    const days: Array<{
      isoDate: string;
      label: string;
      appointments: PractitionerCalendarAppointment[];
    }> = [];

    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(weekCursor);
      date.setDate(weekCursor.getDate() + offset);
      const dayKey = DAY_KEYS_BY_JS_DAY[date.getDay()];
      if (!enabledDayKeys.includes(dayKey)) {
        continue;
      }

      const isoDate = toLocalIsoDate(date);
      days.push({
        isoDate,
        label: `${DAY_LABELS[dayKey]} ${date.getDate()}`,
        appointments: appointmentsByDate.get(isoDate) ?? [],
      });
    }

    return days;
  }, [appointmentsByDate, enabledDayKeys, weekCursor]);

  const monthWeeks = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekMap = new Map<
      string,
      Array<{
        isoDate: string;
        dayNumber: number;
        dayKey: DaySchedule['day'];
        appointmentCount: number;
      }>
    >();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const dayKey = DAY_KEYS_BY_JS_DAY[date.getDay()];
      if (!enabledDayKeys.includes(dayKey)) {
        continue;
      }

      const isoDate = toLocalIsoDate(date);
      const weekStartIso = toLocalIsoDate(startOfWeekMonday(date));
      const appointmentCount = (appointmentsByDate.get(isoDate) ?? []).length;

      const existingWeek = weekMap.get(weekStartIso);
      const dayEntry = {
        isoDate,
        dayNumber: day,
        dayKey,
        appointmentCount,
      };
      if (existingWeek) {
        existingWeek.push(dayEntry);
      } else {
        weekMap.set(weekStartIso, [dayEntry]);
      }
    }

    return Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStartIso, days]) => {
        const byDayKey = new Map(days.map((item) => [item.dayKey, item]));
        return {
          weekStartIso,
          days: enabledDayKeys.map((dayKey) => byDayKey.get(dayKey) ?? null),
        };
      });
  }, [appointmentsByDate, enabledDayKeys, monthCursor]);

  const overlayAppointments = overlayDate ? appointmentsByDate.get(overlayDate) ?? [] : [];

  if (!authUser) {
    return <Navigate to="/praticiens/connexion" replace />;
  }

  if (authUser.role !== 'practitioner') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <PublicNavbar />
      <main className={styles.main}>
        <section className={styles.container}>
          <div className={styles.titleRow}>
            <div className={styles.titleWrap}>
              <h1 className={styles.title}>Calendrier</h1>
            </div>
            <div className={styles.viewSelectWrap}>
              <label htmlFor="calendar-view-select" className={styles.viewSelectLabel}>
                Vue
              </label>
              <select
                id="calendar-view-select"
                className={styles.viewSelect}
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as ViewMode)}
              >
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
          </div>
          <p className={styles.subtitle}>
            Retrouvez tous les rendez-vous réservés par vos patients.
          </p>

          <div className={styles.topBar}>
            {viewMode === 'week' ? (
              <div className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() =>
                    setWeekCursor((current) => {
                      const next = new Date(current);
                      next.setDate(current.getDate() - 7);
                      return next;
                    })
                  }
                >
                  <ChevronLeft size={16} />
                  <span>Précédent</span>
                </button>
                <p className={styles.periodLabel}>
                  {getWeekPeriodLabel(weekCursor, weekDays)}
                </p>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() =>
                    setWeekCursor((current) => {
                      const next = new Date(current);
                      next.setDate(current.getDate() + 7);
                      return next;
                    })
                  }
                >
                  <span>Suivant</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() =>
                    setMonthCursor(
                      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft size={16} />
                  <span>Précédent</span>
                </button>
                <p className={styles.periodLabel}>{formatMonthLabel(monthCursor)}</p>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() =>
                    setMonthCursor(
                      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                >
                  <span>Suivant</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {isLoading && <p className={styles.infoText}>Chargement...</p>}
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          {!isLoading && !errorMessage && enabledDayKeys.length === 0 && (
            <p className={styles.infoText}>Aucun jour disponible dans le profil praticien.</p>
          )}

          {!isLoading && !errorMessage && enabledDayKeys.length > 0 && viewMode === 'week' && (
            <div className={styles.weekGrid}>
              {weekDays.map((day) => (
                <article key={day.isoDate} className={styles.dayCard}>
                  <p className={styles.dayCardTitle}>{day.label}</p>
                  <div className={styles.dayCardBody}>
                    {day.appointments.length === 0 ? (
                      <p className={`${styles.emptyText} ${styles.emptyTextCentered}`}>
                        Aucun rendez-vous
                      </p>
                    ) : (
                      <div className={styles.appointmentList}>
                        {day.appointments.map((item) => (
                          <div key={item.id} className={styles.appointmentChip}>
                            <p className={styles.appointmentTimeBadge}>
                              {item.startTime} - {item.endTime}
                            </p>
                            <p className={styles.appointmentPatient}>
                              {item.patientFirstName} {item.patientLastName.toUpperCase()}
                            </p>
                            <p className={styles.appointmentType}>{item.appointmentTypeLabel}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && !errorMessage && enabledDayKeys.length > 0 && viewMode === 'month' && (
            <div className={styles.monthGrid}>
              {monthWeeks.map((week) => (
                <div
                  key={week.weekStartIso}
                  className={styles.monthWeekRow}
                  style={{ gridTemplateColumns: `repeat(${enabledDayKeys.length}, minmax(0, 1fr))` }}
                >
                  {week.days.map((day, index) =>
                    day ? (
                      <button
                        key={day.isoDate}
                        type="button"
                  className={styles.monthDayButton}
                  onClick={() => setOverlayDate(day.isoDate)}
                >
                  <p className={styles.monthDayTop}>
                    <span
                      className={
                        day.isoDate === TODAY_ISO ? styles.todayBadge : undefined
                      }
                    >
                      {formatShortDateLabel(day.isoDate)}
                    </span>
                  </p>
                  <p className={styles.monthDayCount}>
                    {day.appointmentCount === 0 ? (
                      <span className={styles.monthZeroDash} />
                    ) : (
                      `${day.appointmentCount} RDV`
                    )}
                  </p>
                </button>
                    ) : (
                      <div
                        key={`${week.weekStartIso}-${enabledDayKeys[index]}`}
                        className={styles.monthEmptyCell}
                        aria-hidden="true"
                      >
                        <span className={styles.monthEmptyDash} />
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {overlayDate && (
        <div
          className={styles.overlayBackdrop}
          onClick={() => setOverlayDate(null)}
          role="presentation"
        >
          <section
            className={styles.overlayPanel}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Détail journée"
          >
            <div className={styles.overlayHeader}>
              <h2 className={styles.overlayTitle}>{formatDateLabel(overlayDate)}</h2>
              <button
                type="button"
                className={styles.overlayClose}
                onClick={() => setOverlayDate(null)}
              >
                <X size={16} />
              </button>
            </div>
            {overlayAppointments.length === 0 ? (
              <p className={styles.emptyText}>Aucun rendez-vous sur cette journée.</p>
            ) : (
              <div className={styles.appointmentList}>
                {overlayAppointments.map((item) => (
                  <div key={item.id} className={styles.appointmentChip}>
                    <p className={styles.appointmentTimeBadge}>
                      {item.startTime} - {item.endTime}
                    </p>
                    <p className={styles.appointmentPatient}>
                      {item.patientFirstName} {item.patientLastName.toUpperCase()}
                    </p>
                    <p className={styles.appointmentType}>{item.appointmentTypeLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PraticienCalendrierPage;

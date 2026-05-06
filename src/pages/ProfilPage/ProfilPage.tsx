import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import { getAuthUser } from '../../utils/auth';
import styles from './ProfilPage.module.css';

interface AppointmentType {
  label: string;
  durationMinutes: string;
}

interface DaySchedule {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface PractitionerSettingsPayload {
  specialty: string;
  appointmentTypes: AppointmentType[];
  weeklySchedule: DaySchedule[];
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

const DEFAULT_SETTINGS: PractitionerSettingsPayload = {
  specialty: '',
  appointmentTypes: [],
  weeklySchedule: [
    {
      day: 'mon',
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'tue',
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'wed',
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'thu',
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'fri',
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'sat',
      enabled: false,
      startTime: '',
      endTime: '',
      breakStart: '',
      breakEnd: '',
    },
    {
      day: 'sun',
      enabled: false,
      startTime: '',
      endTime: '',
      breakStart: '',
      breakEnd: '',
    },
  ],
};

const ProfilPage = () => {
  const user = getAuthUser();
  const userId = user?.id;
  const userRole = user?.role;
  const [settings, setSettings] = useState<PractitionerSettingsPayload>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!userId || userRole !== 'practitioner') {
      return;
    }

    const loadSettings = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(
          `${apiUrl}/api/practitioners/${userId}/settings`,
        );

        const payload = (await response.json().catch(() => null)) as
          | Partial<PractitionerSettingsPayload> & { message?: string }
          | null;

        if (!response.ok) {
          setSettings(DEFAULT_SETTINGS);
          return;
        }

        setSettings({
          specialty: payload?.specialty ?? '',
          appointmentTypes:
            payload?.appointmentTypes && payload.appointmentTypes.length > 0
              ? payload.appointmentTypes.map((item) => ({
                  label: item.label ?? '',
                  durationMinutes: String(Number(item.durationMinutes) || ''),
                }))
              : [],
          weeklySchedule:
            payload?.weeklySchedule && payload.weeklySchedule.length === 7
              ? payload.weeklySchedule
              : DEFAULT_SETTINGS.weeklySchedule,
        });
      } catch (error) {
        console.error('Erreur chargement paramètres praticien:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [userId, userRole]);

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  const onAddAppointmentType = (): void => {
    setSettings((current) => ({
      ...current,
      appointmentTypes: [
        ...current.appointmentTypes,
        { label: '', durationMinutes: '' },
      ],
    }));
  };

  const onRemoveAppointmentType = (index: number): void => {
    setSettings((current) => {
      return {
        ...current,
        appointmentTypes: current.appointmentTypes.filter((_, i) => i !== index),
      };
    });
  };

  const onAppointmentChange = (
    index: number,
    field: keyof AppointmentType,
    value: string,
  ): void => {
    setSettings((current) => ({
      ...current,
      appointmentTypes: current.appointmentTypes.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === 'durationMinutes'
                  ? value.replace(/[^\d]/g, '')
                  : value,
            }
          : item,
      ),
    }));
  };

  const onScheduleChange = (
    day: DaySchedule['day'],
    field: keyof DaySchedule,
    value: string | boolean,
  ): void => {
    setSettings((current) => ({
      ...current,
      weeklySchedule: current.weeklySchedule.map((row) =>
        row.day === day ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const onSaveSettings = async (): Promise<void> => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    const normalizedAppointmentTypes = settings.appointmentTypes.map((item) => ({
      label: item.label.trim(),
      durationMinutes: Number(item.durationMinutes),
    }));

    const hasInvalidDuration = normalizedAppointmentTypes.some(
      (item) =>
        !Number.isInteger(item.durationMinutes) ||
        item.durationMinutes < 5 ||
        item.durationMinutes > 480,
    );

    if (hasInvalidDuration) {
      setErrorMessage('Chaque type de rendez-vous doit durer au minimum 5 minutes.');
      setIsSaving(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/practitioners/${user.id}/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...settings,
            appointmentTypes: normalizedAppointmentTypes,
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message || 'Erreur pendant la sauvegarde.');
        return;
      }

      setSuccessMessage(payload?.message || 'Paramètres enregistrés.');
    } catch (error) {
      console.error('Erreur sauvegarde praticien:', error);
      setErrorMessage('Impossible de joindre le serveur.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <strong>Prénom :</strong> {user.firstName}
          </p>
          <p className={styles.line}>
            <strong>Adresse mail :</strong> {user.email}
          </p>

          {user.role === 'practitioner' && (
            <div className={styles.practitionerSection}>
              <h2 className={styles.sectionTitle}>Paramètres praticien</h2>

              <label className={styles.field}>
                Spécialité
                <input
                  type="text"
                  className={styles.input}
                  value={settings.specialty}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      specialty: event.target.value,
                    }))
                  }
                  placeholder="Médecin généraliste"
                />
              </label>

              <div className={styles.subSection}>
                <div className={styles.subSectionHeader}>
                  <h3 className={styles.subTitle}>Types de rendez-vous</h3>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={onAddAppointmentType}
                  >
                    Ajouter
                  </button>
                </div>

                <div className={styles.appointmentList}>
                  {settings.appointmentTypes.map((item, index) => (
                    <div key={index} className={styles.appointmentRow}>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.label}
                        onChange={(event) =>
                          onAppointmentChange(index, 'label', event.target.value)
                        }
                        placeholder="Type de rendez-vous"
                      />
                      <input
                        type="number"
                        min={5}
                        max={480}
                        className={styles.durationInput}
                        value={item.durationMinutes}
                        onChange={(event) =>
                          onAppointmentChange(index, 'durationMinutes', event.target.value)
                        }
                      />
                      <span className={styles.minutesLabel}>min</span>
                      <button
                        type="button"
                        className={styles.removeIconButton}
                        onClick={() => onRemoveAppointmentType(index)}
                        aria-label="Supprimer ce type de rendez-vous"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Horaires de travail</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.scheduleTable}>
                    <thead>
                      <tr>
                        <th>Jour</th>
                        <th>Disponible</th>
                        <th>Début</th>
                        <th>Fin</th>
                        <th>Pause début</th>
                        <th>Pause fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.weeklySchedule.map((row) => (
                        <tr key={row.day}>
                          <td>{DAY_LABELS[row.day]}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={row.enabled}
                              onChange={(event) =>
                                onScheduleChange(row.day, 'enabled', event.target.checked)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={row.startTime}
                              onChange={(event) =>
                                onScheduleChange(row.day, 'startTime', event.target.value)
                              }
                              disabled={!row.enabled}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={row.endTime}
                              onChange={(event) =>
                                onScheduleChange(row.day, 'endTime', event.target.value)
                              }
                              disabled={!row.enabled}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={row.breakStart}
                              onChange={(event) =>
                                onScheduleChange(row.day, 'breakStart', event.target.value)
                              }
                              disabled={!row.enabled}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={row.breakEnd}
                              onChange={(event) =>
                                onScheduleChange(row.day, 'breakEnd', event.target.value)
                              }
                              disabled={!row.enabled}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {isLoading && <p className={styles.infoText}>Chargement des paramètres...</p>}
              {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
              {successMessage && <p className={styles.successText}>{successMessage}</p>}

              <button
                type="button"
                className={styles.saveButton}
                disabled={isSaving || isLoading}
                onClick={() => void onSaveSettings()}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilPage;

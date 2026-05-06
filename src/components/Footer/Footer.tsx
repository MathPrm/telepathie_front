import styles from './Footer.module.css';

const Footer = () => {
  const legalLinks = [
    'Mentions légales',
    'Politique de confidentialité',
    "Conditions d'utilisation",
    'Accessibilité',
  ];
  const supportLinks = ['Centre d\'aide', 'FAQ', 'Contact', 'Statut du service'];
  const productLinks = [
    'Prendre un RDV',
    'Rejoindre une visio',
    'Nos specialités',
    'Espace praticiens',
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <h2 className={styles.brandTitle}>Télépathie</h2>
          <p className={styles.brandText}>
            La médecine qui vous devine.
          </p>
        </div>

        <div className={styles.linksGrid}>
          <div>
            <h3 className={styles.groupTitle}>Légal</h3>
            <ul className={styles.list}>
              {legalLinks.map((item) => (
                <li key={item}>
                  <a href="#" className={styles.link}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.groupTitle}>Support</h3>
            <ul className={styles.list}>
              {supportLinks.map((item) => (
                <li key={item}>
                  <a href="#" className={styles.link}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.groupTitle}>Plateforme</h3>
            <ul className={styles.list}>
              {productLinks.map((item) => (
                <li key={item}>
                  <a href="#" className={styles.link}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} Télépathie – Tous droits réservés</p>
      </div>
    </footer>
  );
};

export default Footer;

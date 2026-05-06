import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const legalLinks = [
    'Mentions legales',
    'Politique de confidentialite',
    "Conditions d'utilisation",
    'Accessibilite',
  ];
  const supportLinks = ['Centre d aide', 'FAQ', 'Contact', 'Statut du service'];
  const productLinks = [
    { label: 'Prendre un RDV', to: '#' },
    { label: 'Rejoindre une visio', to: '#' },
    { label: 'Nos specialites', to: '#' },
    { label: 'Espace praticiens', to: '/praticiens/connexion' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <h2 className={styles.brandTitle}>Telepathie</h2>
          <p className={styles.brandText}>La medecine qui vous devine.</p>
        </div>

        <div className={styles.linksGrid}>
          <div>
            <h3 className={styles.groupTitle}>Legal</h3>
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
                <li key={item.label}>
                  {item.to === '#' ? (
                    <a href="#" className={styles.link}>
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} className={styles.link}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} Telepathie - Tous droits reserves</p>
      </div>
    </footer>
  );
};

export default Footer;

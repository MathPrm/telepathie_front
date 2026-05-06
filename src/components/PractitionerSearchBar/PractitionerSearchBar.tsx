import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './PractitionerSearchBar.module.css';

interface PractitionerSearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

const PractitionerSearchBar = ({
  initialValue = '',
  onSearch,
}: PractitionerSearchBarProps) => {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(query.trim());
      }}
    >
      <input
        type="search"
        className={styles.input}
        placeholder="Nom, prenom ou specialite"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className={styles.button}>
        <Search size={16} />
        <span>Rechercher</span>
      </button>
    </form>
  );
};

export default PractitionerSearchBar;

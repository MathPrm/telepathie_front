// src/components/HelloWorld.tsx
import styles from './HelloWorld.module.css';

interface HelloWorldProps {
  title: string;
  subtitle: string;
}

const HelloWorld = ({ title, subtitle }: HelloWorldProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
};

export default HelloWorld;
// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import HelloWorld from '../components/HelloWorld';

const HomePage = () => {
  
  const [backendMessage, setBackendMessage] = useState<string>("Chargement des données depuis le serveur...");
  
  const pageTitle = "Connexion Front / Back ! 🔌";

  useEffect(() => {
    const fetchMessage = async () => {
      try {

        const apiUrl = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${apiUrl}/api/hello`);
        
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }

        const data = await response.json();

        setBackendMessage(data.message);
      } catch (error) {
        console.error("Erreur de connexion au backend:", error);
        setBackendMessage("❌ Erreur : Impossible de joindre le serveur Node.js.");
      }
    };

    fetchMessage();
  }, []); // Le tableau vide [] signifie "Exécute ceci une seule fois au démarrage"

  // 4. On envoie les données (qui vont changer dynamiquement) au Dumb Component
  return (
    <HelloWorld title={pageTitle} subtitle={backendMessage} />
  );
};

export default HomePage;
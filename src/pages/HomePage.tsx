// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import HelloWorld from '../components/HelloWorld';

const HomePage = () => {
  // 1. On prépare un "état" pour stocker le message. 
  // Par défaut, on affiche un texte d'attente.
  const [backendMessage, setBackendMessage] = useState<string>("Chargement des données depuis le serveur...");
  
  const pageTitle = "Connexion Front / Back ! 🔌";

  // 2. useEffect s'exécute automatiquement quand le composant apparaît à l'écran
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // 🔥 LA CORRECTION EST ICI 🔥
        // On récupère dynamiquement l'URL depuis le fichier .env
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // On utilise l'URL dynamique pour faire notre requête
        const response = await fetch(`${apiUrl}/api/hello`);
        
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }

        // On convertit la réponse en JSON
        const data = await response.json();
        
        // 3. On met à jour l'état avec le message reçu du back-end
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
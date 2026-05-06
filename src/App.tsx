import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ConnexionPage from './pages/ConnexionPage';
import HomePage from './pages/HomePage';
import InscriptionPage from './pages/InscriptionPage';
import MesRendezVousPage from './pages/MesRendezVousPage';
import PraticienCalendrierPage from './pages/PraticienCalendrierPage';
import PraticienConnexionPage from './pages/PraticienConnexionPage';
import PraticienInscriptionPage from './pages/PraticienInscriptionPage';
import PractitionerPublicPage from './pages/PractitionerPublicPage';
import PractitionerSearchPage from './pages/PractitionerSearchPage';
import PractitionerSearchResultsPage from './pages/PractitionerSearchResultsPage';
import ProfilPage from './pages/ProfilPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/mes-rendez-vous" element={<MesRendezVousPage />} />
        <Route path="/praticiens/calendrier" element={<PraticienCalendrierPage />} />
        <Route path="/praticiens/recherche" element={<PractitionerSearchPage />} />
        <Route
          path="/praticiens/resultats"
          element={<PractitionerSearchResultsPage />}
        />
        <Route path="/praticiens/:practitionerId" element={<PractitionerPublicPage />} />
        <Route
          path="/praticiens/connexion"
          element={<PraticienConnexionPage />}
        />
        <Route
          path="/praticiens/inscription"
          element={<PraticienInscriptionPage />}
        />
        <Route path="/profil" element={<ProfilPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

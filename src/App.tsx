import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ConnexionPage from './pages/ConnexionPage';
import HomePage from './pages/HomePage';
import InscriptionPage from './pages/InscriptionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

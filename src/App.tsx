// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* On associe l'URL "/" à notre Smart Component */}
        <Route path="/" element={<HomePage />} />
        
        {/* Exemple pour plus tard : */}
        {/* <Route path="/consultation" element={<ConsultationPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
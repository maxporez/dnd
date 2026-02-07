import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CharacterSheet } from './pages/CharacterSheet';
import { Homebrew } from './pages/Homebrew';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character/:id" element={<CharacterSheet />} />
        <Route path="/homebrew" element={<Homebrew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

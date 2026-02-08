import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const CharacterSheet = lazy(() => import('./pages/CharacterSheet').then(m => ({ default: m.CharacterSheet })));
const Homebrew = lazy(() => import('./pages/Homebrew').then(m => ({ default: m.Homebrew })));
const NotionSync = lazy(() => import('./pages/NotionSync').then(m => ({ default: m.NotionSync })));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/character/:id" element={<CharacterSheet />} />
          <Route path="/homebrew" element={<Homebrew />} />
          <Route path="/notion" element={<NotionSync />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

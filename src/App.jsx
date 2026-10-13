import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Chat from './pages/Chat';
import About from './pages/About';
import Roadmap from './pages/Roadmap';
import ThoiKhoaBieu from './pages/ThoiKhoaBieu';
import LoginModal from './components/LoginModal';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-nunito bg-base-100 text-neutral" data-theme="locket">
          <Header />
          <main className="flex-grow pt-14 sm:pt-16">
            <Routes>
              <Route path="/" element={<Chat />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/tkb" element={<ThoiKhoaBieu />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Chat />} />
            </Routes>
          </main>
          <LoginModal />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

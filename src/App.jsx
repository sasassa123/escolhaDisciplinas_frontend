import './styles/App.css';
import './styles/components.css';
import './styles/pages.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CompareTray from './components/CompareTray';
import RequireAuth from './components/RequireAuth';
import AuthProvider from './contexts/AuthProvider';
import ToastProvider from './contexts/ToastProvider';
import CompareProvider from './contexts/CompareProvider';
import MetaProvider from './contexts/MetaProvider';
import Home from './pages/Home';
import Disciplines from './pages/Disciplines';
import DisciplineDetail from './pages/DisciplineDetail';
import QuestionDetail from './pages/QuestionDetail';
import Compare from './pages/Compare';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Moderation from './pages/Moderation';
import About from './pages/About';
import NotFound from './pages/NotFound';

/** Volta ao topo ao trocar de página (mas não ao trocar só a aba/filtros da mesma página). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <MetaProvider>
        <AuthProvider>
          <ToastProvider>
            <CompareProvider>
              <ScrollToTop />
              <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
              <Header />
              <div className="container" id="conteudo">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/disciplinas" element={<Disciplines />} />
                  <Route path="/disciplinas/:code" element={<DisciplineDetail />} />
                  <Route path="/perguntas/:id" element={<QuestionDetail />} />
                  <Route path="/comparar" element={<Compare />} />
                  <Route path="/busca" element={<Search />} />
                  <Route path="/entrar" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/confirmar-email" element={<ConfirmEmail />} />
                  <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route path="/usuarios/:id" element={<UserProfile />} />
                  <Route path="/moderacao" element={<RequireAuth moderator><Moderation /></RequireAuth>} />
                  <Route path="/sobre" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <CompareTray />
              <Footer />
            </CompareProvider>
          </ToastProvider>
        </AuthProvider>
      </MetaProvider>
    </BrowserRouter>
  );
}

export default App;

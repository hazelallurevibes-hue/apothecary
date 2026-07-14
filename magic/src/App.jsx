import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Settler from './pages/Settler';
import Pet from './pages/Pet';
import Coach from './pages/Coach';
import Hearth from './pages/Hearth';
import Settings from './pages/Settings';
import Widget from './pages/Widget';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Guides from './pages/Guides';
import GuideHub from './pages/GuideHub';
import Legal from './pages/Legal';
import FreePlayground from './pages/FreePlayground';
import DailyOracle from './pages/DailyOracle';

export default function App() {
  return (
    <Routes>
      <Route path="/widget" element={<Widget />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hearth-court" element={<Settler />} />
              <Route path="/settler" element={<Navigate to="/hearth-court" replace />} />
              <Route path="/familiar" element={<Pet />} />
              <Route path="/pet" element={<Navigate to="/familiar" replace />} />
              <Route path="/before-the-storm" element={<Coach />} />
              <Route path="/coach" element={<Navigate to="/before-the-storm" replace />} />
              <Route path="/cauldron" element={<Hearth />} />
              <Route path="/hearth" element={<Navigate to="/cauldron" replace />} />
              <Route path="/free" element={<FreePlayground />} />
              <Route path="/oracle/daily" element={<DailyOracle />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideHub />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

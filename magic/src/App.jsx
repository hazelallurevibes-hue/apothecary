import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Settler from './pages/Settler';
import Pet from './pages/Pet';
import Coach from './pages/Coach';
import Hearth from './pages/Hearth';
import Settings from './pages/Settings';
import Widget from './pages/Widget';

export default function App() {
  return (
    <Routes>
      <Route path="/widget" element={<Widget />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settler" element={<Settler />} />
              <Route path="/pet" element={<Pet />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/hearth" element={<Hearth />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

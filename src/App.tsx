import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Benefits from './pages/Benefits';
import ActionPlan from './pages/ActionPlan';
import Chat from './pages/Chat';
import AITest from './pages/AITest';
import Classification from './pages/Classification';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/classification" element={<Layout><Classification /></Layout>} />
        <Route path="/benefits" element={<Layout><Benefits /></Layout>} />
        <Route path="/action-plan" element={<Layout><ActionPlan /></Layout>} />
        <Route path="/chat" element={<Layout><Chat /></Layout>} />
        <Route path="/ai-test" element={<Layout><AITest /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import GuideView from './GuideView';
//main component handling navigation
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* traffic rules defined here */}
        <Routes>
          {/* route for dashboard (home page) */}
          <Route path="/" element={<Home />} />
          {/* route for specific guide viewing, :id will change dynamically */}
          <Route path="/guide/:id" element={<GuideView />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import StoryDetail from './views/StoryDetail';
import PageEditor from './views/PageEditor';
import Player from './views/Player';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story/:storyId" element={<StoryDetail />} />
          <Route path="/page/:pageId" element={<PageEditor />} />
          <Route path="/read/:storyId" element={<Player />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
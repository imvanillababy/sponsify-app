import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ThemePage from "./ThemePage/ThemePage.js";
import Main from "./WorkPage/Main.js";
import './App.css';


function App() {
  return (
  
      <div>
        <div className="App bg-[#e5ebff] ">
          <Router>
            <Routes>
              <Route path="/" element={<ThemePage />} />
              <Route path="/sponsify-main" element={< Main />} />     
            </Routes>
          </Router>
        </div>
      </div>
    
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
import "./Common.css"
import "./pages/FormPage.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <HomePage />}>
        </Route>
        <Route path="/join" element={<JoinPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
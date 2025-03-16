import Wrapper from './components/Wrapper';
import ContestList from './pages/Home';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>  {/* Add this Router wrapper */}
      <Navbar />
      <Wrapper>
        <Routes>  {/* Use Routes to wrap your Route components */}
          <Route path="/" element={<ContestList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Wrapper>
      <Toaster position="bottom-right" reverseOrder={false} />
    </Router>
  );
};

export default App;

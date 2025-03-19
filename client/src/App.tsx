// import Wrapper from './components/Wrapper';
import ContestList from './pages/Home';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import { Toaster } from "react-hot-toast";
import HeroSection from './pages/HeroSection';
import PrivateRoute from './components/PrivateRoute';
import BookMarks from './components/BookMarks';
import SearchContest from './components/SearchContest';
import Solutions from './pages/Solutions';
import useDetectDevTools from './hooks/useDevToolsDetechtor';
// import Footer from './components/Footer';
const Samp = () => {
  useDetectDevTools(); 
  return (
    // <div>samp</div>
    null
  )
}
const App = () => {
  return (
    <Router>  {/* Add this Router wrapper */}
    <Samp/>
      <Navbar />
      {/* <Wrapper> */}
        <Routes>  {/* Use Routes to wrap your Route components */}
          <Route path="/" element={<HeroSection />} />
          <Route path="/contests" element={<PrivateRoute element={<ContestList />}/>} />
          <Route path="/contests/bookmarks" element={<PrivateRoute element={<BookMarks />}/>} />
          <Route path="/contests/searchContests" element={<PrivateRoute element={<SearchContest />}/>} />
          <Route path="/contests/solutions" element={<PrivateRoute element={<Solutions />}/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        {/* <Footer/> */}
      {/* </Wrapper> */}
      <Toaster position="bottom-right" reverseOrder={false} />
    </Router>
  );
};

export default App;

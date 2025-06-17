import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomeSection from "../src/components/cfp/pages/HomeSection";
import LoginForm from "../src/components/auth/LoginForm";
import LoginUser from "../src/components/auth/LoginUser";
import RegisterForm from "../src/components/auth/register";
import Navbar from "../src/components/layout/Navbar";
import { Import, User } from "lucide-react";
import { AuthProvider } from "./components/context/AuthContext";
import { UserProvider } from "./components/context/UserContext";
import FormationReport from "./components/cfp/pages/FormationReport";
import ApprenantFormationTimeline  from "./components/cfp/pages/ApprenantFormationTimeline ";
import CustomerReporting  from "./components/cfp/pages/CustomerReporting";
import ProjectReporting from "./components/cfp/pages/ProjectReporting ";

const App = () => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <UserProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomeSection />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/login/user" element={<LoginUser />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/reporting/formation" element={<FormationReport />} />
              <Route path="/reporting/apprenant" element={<ApprenantFormationTimeline />} />
              <Route path="/reporting/client" element={<CustomerReporting />} />
              <Route path="/reporting/cours" element={<ProjectReporting />} />
            </Routes>
          </Router>
        </UserProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;

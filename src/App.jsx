import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import HomeSection from "../src/components/cfp/pages/HomeSection";
import LoginForm from "./components/auth/loginForm";
import LoginUser from "./components/auth/loginUser";
import RegisterForm from "./components/auth/Register";
import Navbar from "../src/components/layout/Navbar";
import { Import, User } from "lucide-react";
import { AuthProvider } from "./components/context/AuthContext";
import { UserProvider } from "./components/context/UserContext";
import FormationReport from "./components/cfp/pages/FormationReport";
import ApprenantFormationTimeline  from "./components/cfp/pages/ApprenantFormationTimeline ";
import CustomerReporting  from "./components/cfp/pages/CustomerReporting";
import ProjectReporting from "./components/cfp/pages/ProjectReporting ";
import RevenueByProject from "./components/cfp/pages/RevenueByProject ";
import RevenueByCourse from "./components/cfp/pages/RevenueByCourse";
import RevenueByClient from "./components/cfp/pages/RevenueByClient";
import RevenueByMonth from "./components/cfp/pages/RevenueByMonth";
import RevenueByReference from "./components/cfp/pages/RevenueByReference";
import RevenueByFolder from "./components/cfp/pages/RevenueByFolder";
import RevenueByCity from "./components/cfp/pages/RevenueByCity";
import FormationReportEtp from "./components/etp/pages/FormationReportEtp";
import ReportingEmploye from "./components/etp/pages/ReportingEmploye";
import CentreFormationReport from "./components/etp/pages/CentreFormationReport ";
import CoursReporting from "./components/etp/pages/CoursReporting";
import ReportingRevenue from "./components/etp/pages/ReportingRevenue";
import Footer from "./components/footer/Footer";

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
              <Route path="/home-cfp" element={<FormationReport />} />
              <Route path="/reporting/apprenant" element={<ApprenantFormationTimeline />} />
              <Route path="/reporting/client" element={<CustomerReporting />} />
              <Route path="/reporting/cours" element={<ProjectReporting />} />
              <Route path="/reporting/revenuebyproject" element={<RevenueByProject />} />
              <Route path="/reporting/revenuebycours" element={<RevenueByCourse />} />
              <Route path="/reporting/revenuebyclients" element={<RevenueByClient />} />
              <Route path="/reporting/revenuebymonth" element={<RevenueByMonth />} />
              <Route path="/reporting/revenuebyreference" element={<RevenueByReference />} />
              <Route path="/reporting/revenuebyfolder" element={<RevenueByFolder />} />
              <Route path="/reporting/revenuebycity" element={<RevenueByCity />} />
              <Route path="/home-etp" element={<FormationReportEtp />} />
              <Route path="/reporting/employe" element={<ReportingEmploye />} />
              <Route path="/reporting/cfpetp" element={<CentreFormationReport  />} />
              <Route path="/reporting/coursEtp" element={<CoursReporting  />} />
              <Route path="/reporting/revenue" element={<ReportingRevenue  />} />
            </Routes>
            <Footer />
          </Router>
        </UserProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styles from './style';
import {
  Navbar,
  About,
  Clients,
  CTA,
  Footer,
  Testimonials,
  Hero,
  Chatbot,
  Services,
} from './components';
import PdfTools from './pages/PdfTools';
import Pomodoro from './pages/Pomodoro';
import FlashCards from './pages/FlashCards';
import ChatInterface from './pages/chatinte';

const Community = () => (
  <div className={`bg-primary ${styles.paddingX} ${styles.paddingY}`}>
    <div className={`${styles.boxWidth}`}>
      <h1 className="font-poppins font-semibold text-[40px] text-white text-center">Community</h1>
      <p className="font-poppins font-normal text-[18px] text-dimWhite text-center mt-4">
        Connect with students in our community platform.
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const showNavbarAndFooter = location.pathname === '/';

  return (
    <div className="bg-primary w-full overflow-hidden min-h-screen">
      {/* Navbar (only on home) */}
      {showNavbarAndFooter && (
        <div className={`${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Navbar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>  
        <div className={`${styles.boxWidth}`}>  
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className={`${styles.flexStart}`}>
                    <div className={`${styles.boxWidth}`}>
                      <Hero />
                    </div>
                  </div>
                  <div id="About">
                    <About />
                  </div>
                  <div id="Services">
                    <Services />
                  </div>
                  <div id="Clients">
                    <Clients />
                  </div>
                  <div id="Testimonials">
                    <div id="Feedbacks">
                      <Testimonials />
                    </div>
                  </div>
                  <CTA />
                </>
              }
            />
            <Route path="/services" element={<Services />} />
            <Route path="/pdf-tools" element={<PdfTools />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/flashcards" element={<FlashCards />} />
            <Route path="/chat-interface" element={<ChatInterface />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedbacks" element={<Testimonials />} />
          </Routes>
        </div>
      </div>

      {/* Footer (only on home) */}
      {showNavbarAndFooter && (
        <div className={`${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Footer />
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default App;

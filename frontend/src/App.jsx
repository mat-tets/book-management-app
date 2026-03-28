import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import styles from "./App.module.css";
import AuthProvider from "./context/AuthProvider";
import ConfirmProvider from "./context/ConfirmProvider";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import MainContents from "./layout/MainContents";
import Menu from "./layout/Menu";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ConfirmProvider>
          <div className={styles.app}>
            <Header onMenuToggle={handleMenuToggle} />
            <Menu isMenuOpen={isMenuOpen} onMenuClose={handleMenuClose} />
            <MainContents />
            <Footer />
          </div>
        </ConfirmProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

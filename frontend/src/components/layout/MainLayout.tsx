import React, { ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../assets/styles/layout/MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="main-layout">
      <Header />
      <Navbar />
      <div className="content-container">
        <main className="main-content">
          {children}
        </main>
        {showSidebar && <Sidebar />}
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;

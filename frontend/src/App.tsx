import AppRoutes from "./AppRoutes";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/theme-provider";
import { ReactLenis } from 'lenis/react'
import { Toaster } from 'react-hot-toast';


export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="docuflow-theme">
        <Toaster position="top-right" />
        <ReactLenis root />
        <Navbar />
        <AppRoutes />
        <Footer />
      </ThemeProvider>
    </>
  );
}

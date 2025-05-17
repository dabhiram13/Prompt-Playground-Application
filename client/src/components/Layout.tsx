import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-sans transition-colors duration-200">
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row flex-grow">
        <Sidebar />
        <div className="w-full lg:flex-1 lg:max-w-[calc(100%-16rem)] xl:max-w-[calc(100%-18rem)]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

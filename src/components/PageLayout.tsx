import { type ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PageLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default PageLayout;

import { useEffect } from "react";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact | Jay Factolarin Esmalla";
  }, []);
  return (
    <>
      <ContactSection />
    </>
  );
};

export default Contact;

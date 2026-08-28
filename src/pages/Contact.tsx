import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact | Jay Factolarin Esmalla";
  }, []);
  return (
    <PageLayout>
      <ContactSection />
    </PageLayout>
  );
};

export default Contact;

import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import CertificationsSection from "@/components/CertificationsSection";

const Certifications = () => {
  useEffect(() => {
    document.title = "Certifications | Jay Factolarin Esmalla";
  }, []);
  return (
    <PageLayout>
      <CertificationsSection />
    </PageLayout>
  );
};

export default Certifications;

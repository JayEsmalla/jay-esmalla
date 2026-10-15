import { useEffect } from "react";
import CertificationsSection from "@/components/CertificationsSection";

const Certifications = () => {
  useEffect(() => {
    document.title = "Certifications | Jay Factolarin Esmalla";
  }, []);
  return (
    <>
      <CertificationsSection />
    </>
  );
};

export default Certifications;

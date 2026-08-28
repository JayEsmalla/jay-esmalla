import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import TestimonialsSection from "@/components/TestimonialsSection";

const Testimonials = () => {
  useEffect(() => {
    document.title = "Testimonials | Jay Factolarin Esmalla";
  }, []);
  return (
    <PageLayout>
      <TestimonialsSection />
    </PageLayout>
  );
};

export default Testimonials;

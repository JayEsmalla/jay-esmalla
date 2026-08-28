import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout>
      <section className="grid min-h-[70vh] place-items-center px-5 py-24">
        <div className="w-full max-w-2xl border-y border-graphite py-12 text-center">
          <p className="section-kicker">404 / NOT FOUND</p>
          <h1 className="mt-5 text-[44px] font-normal tracking-[-0.03em] text-chalk md:text-[63px]">This page isn't here.</h1>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.6] text-smoke">The route may have moved, changed, or never existed.</p>
          <Link to="/" className="ghost-button mt-8"><ArrowLeft size={13} /> RETURN HOME</Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;

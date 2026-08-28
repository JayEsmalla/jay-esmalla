import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/portfolio";

const TestimonialsSection = () => (
  <section id="testimonials" className="section-shell scroll-mt-[72px]">
    <div className="page-container">
      <div className="section-heading-grid">
        <div>
          <p className="section-kicker">05 / TESTIMONIALS</p>
          <h2 className="section-title">Feedback centered on clarity, usability, and execution.</h2>
        </div>
        <p className="self-end text-[15px] leading-[1.6] text-smoke">
          Notes from people who have used, tested, or collaborated on the work shown in this portfolio.
        </p>
      </div>

      <div className="mt-12 grid border-t border-graphite md:mt-14 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.article
            key={testimonial.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className={`border-b border-graphite p-7 md:min-h-[300px] md:p-8 ${index > 0 ? "md:border-l" : ""}`}
          >
            <Quote size={25} strokeWidth={1.5} className="icon-gold" />
            <p className="mt-8 text-[16px] leading-[1.65] text-chalk">“{testimonial.quote}”</p>
            <div className="mt-10 border-t border-graphite pt-5">
              <p className="text-[14px] text-chalk">{testimonial.name}</p>
              <p className="meta-text mt-2 text-smoke">{testimonial.role}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;

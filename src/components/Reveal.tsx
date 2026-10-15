import { motion, type HTMLMotionProps } from "framer-motion";
import { useReveal } from "@/lib/motion";

export default function Reveal({ order = 0, ...props }: HTMLMotionProps<"div"> & { order?: number }) {
  const reveal = useReveal();
  return <motion.div {...reveal(order)} {...props} />;
}

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurInProps {
  children: ReactNode;
  className?: string;
}

export function BlurIn({ children, className }: BlurInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ filter: 'blur(20px)', opacity: 0 }}
      animate={isInView ? { filter: 'blur(0px)', opacity: 1 } : {}}
      transition={{ duration: 1.2 }}
    >
      {children}
    </motion.div>
  );
}

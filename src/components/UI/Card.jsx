import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className = "", transparent = false, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: delay }}
        className={twMerge(
            "rounded-[2.5rem] p-8 transition-all duration-500",
            transparent
            ? 'bg-white/10 backdrop-blur-md border-2 border-white/30 shadow-none'
            : 'nook-glass', // Uses the custom CSS class
            className
        )}
    >
        {children}
    </motion.div>
);
export default Card;
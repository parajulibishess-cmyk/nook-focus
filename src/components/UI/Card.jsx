import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className = "", transparent = false, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: delay }}
        className={twMerge(
            "rounded-[2rem] p-6 transition-colors duration-500",
            transparent
            ? 'bg-white/10 backdrop-blur-none border-2 border-white/20 shadow-none'
            : 'bg-white/80 backdrop-blur-xl shadow-xl border-4 border-white',
            className
        )}
    >
        {children}
    </motion.div>
);
export default Card;
'use client';

import { motion } from 'framer-motion';
import { Button as ShadcnButton, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';

export interface AnimatedButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                }}
                className="inline-block"
            >
                <ShadcnButton
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                />
            </motion.div>
        );
    }
);
AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton, buttonVariants };

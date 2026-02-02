/**
 * cn - Class name merge utility
 * 
 * Combines clsx and tailwind-merge for optimal Tailwind class handling.
 * Use this for all component className merging.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

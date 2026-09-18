import React, { useEffect, useRef, useState } from 'react';
import './style/Reveal.css';

/**
 * Reveal Component - Fade-in animation on scroll
 * 
 * Usage:
 * <Reveal direction="top">Your content</Reveal>
 * <Reveal direction="bottom">Your content</Reveal>
 * <Reveal direction="left">Your content</Reveal>
 * <Reveal direction="right">Your content</Reveal>
 * 
 * Props:
 * - direction: "top" | "bottom" | "left" | "right" (default: "top")
 * - delay: number in ms (default: 0)
 * - duration: number in ms (default: 600)
 */

const Reveal = ({
    children,
    direction = 'top',
    delay = 0,
    duration = 600,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal reveal-${direction} ${isVisible ? 'reveal-visible' : ''} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
                transitionDuration: `${duration}ms`
            }}
        >
            {children}
        </div>
    );
};

export default Reveal;

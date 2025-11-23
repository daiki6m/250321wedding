import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// --- Theme Colors ---
export const COLORS = {
    ORANGE: "#F39800",
    BLUE: "#2E7BF4",
    BLACK: "#0a0a0a",
    DARK_GRAY: "#1a1a1a",
    TEXT_GRAY: "#9ca3af",
    WHITE: "#ffffff"
};

export const INVITATION_URL = "https://www.piary.jp/web_invitation/LsRvZqUprWsYGaZunwIUlpug";

// --- Google Fonts Injection ---
export const FontLink = () => (
    <link
        href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;800&family=Zen+Old+Mincho:wght@400;700;900&display=swap"
        rel="stylesheet"
    />
);

// --- Custom Soccer Ball Icon ---
export const SoccerBall = ({ className = "", color = "currentColor" }: { className?: string, color?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 17l-4.5-3 1.5-5h6l1.5 5z" />
        <path d="M12 17v5" />
        <path d="M7.5 14L4 16" />
        <path d="M7.5 14l-3-4" />
        <path d="M9 9L4 7" />
        <path d="M15 9l5-2" />
        <path d="M16.5 14l3-4" />
        <path d="M16.5 14l3.5 2" />
    </svg>
);

import { PawPrint } from 'lucide-react';

// --- Section Heading ---
export const SectionHeading = ({ children, subtitle, iconType = 'soccer' }: { children: React.ReactNode; subtitle: string, iconType?: 'soccer' | 'paw' }) => (
    <div className="text-center mb-16 relative">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: COLORS.BLUE }}></div>
                <p className="font-zen text-sm tracking-[0.3em] uppercase" style={{ color: COLORS.ORANGE }}>
                    {subtitle}
                </p>
                <div className="w-8 h-px" style={{ backgroundColor: COLORS.BLUE }}></div>
            </div>
            <h2
                className="text-3xl md:text-4xl font-zen font-bold text-white tracking-widest"
            >
                {children}
            </h2>
            <div className="mt-6 flex justify-center gap-3">
                {iconType === 'paw' ? (
                    [...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                            }}
                        >
                            <PawPrint className="w-5 h-5" style={{ color: COLORS.TEXT_GRAY, transform: `rotate(${i % 2 === 0 ? 15 : -15}deg)` }} />
                        </motion.div>
                    ))
                ) : (
                    <SoccerBall className="w-6 h-6 opacity-30 mx-auto" color={COLORS.WHITE} />
                )}
            </div>
        </motion.div>
    </div>
);

// --- Photo Card ---
export const PhotoCard = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.5 }}
        className={`overflow-hidden rounded-sm shadow-2xl relative group ${className}`}
    >
        {/* Frame Decoration */}
        <div className="absolute inset-0 border border-white/10 z-20 pointer-events-none transition-colors duration-500 group-hover:border-[#F39800]/50"></div>
        <img src={src} alt={alt} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000 filter grayscale contrast-125 brightness-90 hover:brightness-100" />
    </motion.div>
);

// --- Sakura Particle System ---
export const SakuraBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const profileSection = document.getElementById('profile-section');
            if (profileSection) {
                const rect = profileSection.getBoundingClientRect();
                // If the top of the profile section is near the top of the viewport (or visible), hide sakura
                // Adjust threshold as needed. Here, when profile section top reaches 50% of viewport height.
                if (rect.top < window.innerHeight * 0.5) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Petal[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Petal {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            rotation: number;
            rotationSpeed: number;
            color: string;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height - canvas!.height;
                // 写真の邪魔にならないよう、サイズを少し控えめに調整 -> 主張を強くする
                this.size = Math.random() * 10 + 5;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 0.6 + 0.3;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 2 - 1;
                // 透明度を上げて、より背景に馴染むように調整 -> 主張を強くする
                // 桜っぽく色をハイライト (ピンク系を強調)
                this.color = Math.random() > 0.5 ? 'rgba(255, 160, 180, 0.9)' : 'rgba(255, 200, 210, 0.8)';
            }

            update() {
                this.y += this.speedY;
                this.x += Math.sin(this.y * 0.005) + this.speedX;
                this.rotation += this.rotationSpeed;

                if (this.y > canvas!.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size, 0);
                ctx.quadraticCurveTo(this.size / 2, this.size, 0, 0);
                ctx.fill();
                ctx.restore();
            }
        }

        const initParticles = () => {
            particles = [];
            const numberOfParticles = window.innerWidth < 768 ? 40 : 80;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Petal());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((petal) => {
                petal.update();
                petal.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed top-0 left-0 w-full h-full pointer-events-none z-20 mix-blend-screen transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />
    );
};

// --- Loading Screen ---
export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 4.5, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] text-white"
        >
            <div className="text-center relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                {/* Kotobuki Animation */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 1],
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative z-20 mb-12 -mt-12"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-20px] border border-white/10 rounded-full border-dashed"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-10px] border-t-2 border-[#F39800] rounded-full opacity-50"
                    />
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-[#F39800] to-[#2E7BF4] flex items-center justify-center relative">
                        <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="font-zen text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#F39800] to-[#2E7BF4]"
                            >
                                寿
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

                {/* Thanks SVG */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="relative z-10 px-8"
                >
                    <img
                        src="/thanks.svg"
                        alt="出会ってくれてありがとう"
                        className="w-full max-w-md h-auto filter brightness-0 invert opacity-90"
                    />

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 2, duration: 1 }}
                        className="h-px bg-gradient-to-r from-transparent via-[#2E7BF4] to-transparent mt-8 mx-auto max-w-xs"
                    />

                    <p className="font-zen text-xs tracking-[0.5em] text-[#2E7BF4] uppercase mt-4">
                        Wedding Reception
                    </p>
                </motion.div>

                {/* Background Decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#F39800]/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0D4FC7]/10 to-transparent"></div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Countdown Timer ---
export const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex justify-center items-center gap-4 md:gap-8 mt-12">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                    <div className="relative">
                        <span className="text-3xl md:text-5xl font-zen font-bold text-white tabular-nums tracking-wider">
                            {String(value).padStart(2, '0')}
                        </span>
                        <div className="absolute -bottom-2 left-0 w-full h-px bg-white/20"></div>
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-400 mt-2">
                        {unit}
                    </span>
                </div>
            ))}
        </div>
    );
};

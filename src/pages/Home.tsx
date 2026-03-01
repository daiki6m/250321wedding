import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ExternalLink, ArrowDown, PawPrint, Car, Building, Info, Menu, X, Users, Clock, Music as MusicIcon, Camera, Video, MessageSquare, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS, SoccerBall, SectionHeading, CountdownTimer, INVITATION_URL } from '../components/Shared';

// --- Demo Controller ---
const DemoController = ({ currentStage, setStage }: { currentStage: string, setStage: (s: 'pre' | 'day' | 'post') => void }) => {
    return (
        <div className="fixed bottom-4 left-4 z-[100] bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Demo Controller</p>
            <div className="flex gap-2">
                {(['pre', 'day', 'post'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStage(s)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${currentStage === s ? 'bg-[#F39800] text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {s.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

const TypewriterVerticalText = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
    const characters = Array.from(text);

    return (
        <motion.h1
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.2,
                        delayChildren: delay,
                    },
                },
            }}
        >
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: { opacity: 0, filter: "blur(10px)" },
                        visible: { opacity: 1, filter: "blur(0px)" },
                    }}
                    transition={{ duration: 0.5 }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.h1>
    );
};


const Navigation = ({ stage }: { stage: 'pre' | 'day' | 'post' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { label: "トップ", id: "hero" },
        { label: "ムービー", id: "movie" },
        { label: "ご挨拶", id: "greeting" },
        { label: "プロフィール", id: "profile-section" },
        { label: "ペット", id: "pets" },
        { label: "ギャラリー", path: "/gallery" },
        ...(stage !== 'pre' ? [{ label: "コメント", path: "/comments" }] : []),
        ...(stage === 'post' ? [{ label: "音楽", path: "/music" }] : []),
        ...(stage !== 'pre' ? [
            { label: "席次表", path: "/seating" },
            { label: "タイムライン", path: "/timeline" }
        ] : []),
        { label: "ご案内", path: "/guest-guide" },
        { label: "アクセス", id: "access" },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-6 right-6 z-50 bg-black/30 backdrop-blur-md border border-white/20 p-3 rounded-full text-white shadow-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                {isOpen ? <X /> : <Menu />}
            </motion.button>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex items-center justify-center"
                    >
                        <nav className="flex flex-col gap-8 text-center">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                >
                                    {item.path ? (
                                        <Link
                                            to={item.path}
                                            className="text-2xl font-zen font-bold text-white hover:text-[#F39800] transition-colors tracking-widest"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => scrollToSection(item.id!)}
                                            className="text-2xl font-zen font-bold text-white hover:text-[#F39800] transition-colors tracking-widest"
                                        >
                                            {item.label}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
const Home = () => {
    const WEDDING_DATE = "2026-03-21T15:00:00";
    const WEDDING_END = "2026-03-21T19:00:00";

    const [stage, setStage] = useState<'pre' | 'day' | 'post'>('pre');

    // Check if this is the first visit in this session
    const [isFirstVisit] = useState(() => {
        const hasVisited = sessionStorage.getItem('home_visited');
        return !hasVisited;
    });

    useEffect(() => {
        if (isFirstVisit) {
            sessionStorage.setItem('home_visited', 'true');
        }

        const updateStage = () => {
            const now = new Date();
            const start = new Date(WEDDING_DATE);
            const end = new Date(WEDDING_END);

            if (now < start) setStage('pre');
            else if (now < end) setStage('day');
            else setStage('post');
        };

        updateStage();
        const timer = setInterval(updateStage, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // For testing: const stage = 'day'; 

    return (
        <>
            {import.meta.env.DEV && <DemoController currentStage={stage} setStage={setStage} />}
            <Navigation stage={stage} />
            {/* --- HERO SECTION --- */}
            <section id="hero" className="relative min-h-screen flex flex-col items-center pt-32 pb-12 p-8 z-10 overflow-hidden">
                <div className="absolute inset-0 z-[-1]">
                    {/* Background Image */}
                    <img
                        src="https://www.nagasakistadiumcity.com/wp-content/themes/stadiumcity/images/top/front_top_sp.webp?20250422"
                        alt="Nagasaki Stadium City"
                        className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-[0.6] opacity-55 z-0"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#000B1F]/70 via-[#000000]/60 to-[#000000] z-10"></div>
                </div>
                {/* Background Text */}
                <div className="z-20 w-full flex justify-center mt-8 mb-8 pointer-events-none">
                    <motion.p
                        initial={{ opacity: 0, scale: 1, rotate: -5 }}
                        animate={{
                            opacity: [0, 1, 1, 1, 0, 0],
                            rotate: -5
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: [0.4, 0, 0.2, 1],
                            times: [0, 0.15, 0.45, 0.65, 0.75, 0.9]
                        }}
                        className="font-zen text-2xl md:text-5xl font-bold tracking-[0.2em] select-none drop-shadow-lg text-center"
                        style={{ color: '#ffffffd2' }}
                    >
                        {stage === 'post' ? (
                            <>
                                A Brand New Day！<br />
                                誠にありがとうございました。
                            </>
                        ) : stage === 'day' ? (
                            <>
                                本日はお越しいただきまして<br />
                                誠にありがとうございます
                            </>
                        ) : (
                            <>
                                感謝を胸に！<br />
                                行くぞ！最高の舞台へ！
                            </>
                        )}
                    </motion.p>
                </div>

                {/* Paw Prints Background Animation for Hero */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {[...Array(15)].map((_, i) => {
                        const randomTop = Math.random() * 100;
                        const randomLeft = Math.random() * 100;
                        const randomRotate = Math.random() * 360;
                        const randomDelay = Math.random() * 5;
                        const randomDuration = 4 + Math.random() * 4;

                        return (
                            <motion.div
                                key={i}
                                className="absolute"
                                style={{
                                    top: `${randomTop}%`,
                                    left: `${randomLeft}%`,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{
                                    scale: [0.8, 1.2, 0.8],
                                    opacity: [0, 0.15, 0],
                                    rotate: [randomRotate, randomRotate + 20, randomRotate]
                                }}
                                transition={{
                                    duration: randomDuration,
                                    repeat: Infinity,
                                    delay: randomDelay + 2,
                                    ease: "easeInOut"
                                }}
                            >
                                <PawPrint className="w-8 h-8 md:w-12 md:h-12 text-white" />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Soccer Balls Background Animation (Left Side) */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => {
                        const randomTop = Math.random() * 100;
                        const randomLeft = Math.random() * 40; // Left side 40%
                        const randomRotate = Math.random() * 360;
                        const randomDelay = Math.random() * 5;
                        const randomDuration = 5 + Math.random() * 5;

                        return (
                            <motion.div
                                key={`soccer-${i}`}
                                className="absolute"
                                style={{
                                    top: `${randomTop}%`,
                                    left: `${randomLeft}%`,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{
                                    scale: [0.8, 1.2, 0.8],
                                    opacity: [0, 0.1, 0],
                                    rotate: [randomRotate, randomRotate + 180, randomRotate]
                                }}
                                transition={{
                                    duration: randomDuration,
                                    repeat: Infinity,
                                    delay: randomDelay + 2,
                                    ease: "easeInOut"
                                }}
                            >
                                <SoccerBall className="w-10 h-10 md:w-16 md:h-16 text-white" />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Nemoline SVG Animation (Left) */}
                <div className="absolute inset-y-0 left-[-10%] md:left-[10%] pointer-events-none z-5 flex items-center justify-center">
                    <motion.img
                        src={`${import.meta.env.BASE_URL}Nemoline.svg`}
                        alt="Nemoline"
                        className="w-48 h-48 md:w-64 md:h-64 opacity-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: [0, 0.4, 0.4, 0],
                            scale: [0.95, 1, 1, 0.95]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.7, 1],
                            delay: isFirstVisit ? 4 : 0
                        }}
                    />
                </div>

                {/* Shumoline SVG Animation (Right) */}
                <div className="absolute inset-y-0 right-[-10%] md:right-[10%] pointer-events-none z-5 flex items-center justify-center">
                    <motion.img
                        src={`${import.meta.env.BASE_URL}Shumoline.svg`}
                        alt="Shumoline"
                        className="w-48 h-48 md:w-64 md:h-64 opacity-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: [0, 0.4, 0.4, 0],
                            scale: [0.95, 1, 1, 0.95]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.7, 1],
                            delay: isFirstVisit ? 0 : 4 // Offset if needed, or keep consistent
                        }}
                    />
                </div>

                <div className="z-20 flex flex-row-reverse items-center justify-center gap-16 md:gap-20 w-full max-max-4xl mx-auto flex-grow">
                    {/* Groom Name */}
                    <div className="min-h-[300px] border-l border-white/20 pl-1 md:pl-6 py-4 relative">
                        <motion.div
                            initial={{ scaleY: isFirstVisit ? 0 : 1 }}
                            animate={{
                                scaleY: [1, 2.5, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                scaleY: {
                                    duration: 1,
                                    ease: "easeOut"
                                },
                                opacity: {
                                    duration: 1,
                                    ease: "easeOut"
                                }
                            }}
                            style={{ transformOrigin: 'top' }}
                            className="absolute top-0 left-[-1px] w-0.5 h-20 bg-gradient-to-b from-[#0D4FC7] to-transparent"
                        >
                            <motion.div
                                animate={{
                                    scaleY: [1, 2.5, 1],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                style={{ transformOrigin: 'top' }}
                                className="absolute inset-0 bg-gradient-to-b from-[#0D4FC7] to-transparent"
                            />
                        </motion.div>
                        <TypewriterVerticalText
                            text="宝本大樹"
                            className="text-3xl md:text-5xl text-white font-zen writing-vertical-rl tracking-[0.2em] drop-shadow-2xl"
                            delay={isFirstVisit ? 0.5 : 0}
                        />
                    </div>

                    {/* Bride Name */}
                    <div className="min-h-[300px] mt-16 border-l border-white/20 pl-1 md:pl-6 py-4 relative">
                        <motion.div
                            initial={{ scaleY: isFirstVisit ? 0 : 1 }}
                            animate={{
                                scaleY: [1, 2.5, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                scaleY: {
                                    duration: 1,
                                    delay: isFirstVisit ? 1.5 : 0,
                                    ease: "easeOut"
                                },
                                opacity: {
                                    duration: 1,
                                    delay: isFirstVisit ? 1.5 : 0,
                                    ease: "easeOut"
                                }
                            }}
                            style={{ transformOrigin: 'top' }}
                            className="absolute top-0 left-[-1px] w-0.5 h-20 bg-gradient-to-b from-[#F39800] to-transparent"
                        >
                            <motion.div
                                animate={{
                                    scaleY: [1, 2.5, 1],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2.5
                                }}
                                style={{ transformOrigin: 'top' }}
                                className="absolute inset-0 bg-gradient-to-b from-[#F39800] to-transparent"
                            />
                        </motion.div>
                        <TypewriterVerticalText
                            text="長谷川真希"
                            className="text-3xl md:text-5xl text-white font-zen writing-vertical-rl tracking-[0.2em] drop-shadow-2xl"
                            delay={isFirstVisit ? 2.0 : 0}
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: isFirstVisit ? 0 : 1, y: isFirstVisit ? 20 : 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isFirstVisit ? 2.5 : 0, duration: 0.8 }}
                    className="flex flex-col items-center text-white z-20 w-full mt-auto"
                >
                    {/* Wedding Title */}


                    {/* Date & Party Block */}
                    <motion.div
                        initial={{ scale: isFirstVisit ? 0.8 : 1, opacity: isFirstVisit ? 0 : 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: isFirstVisit ? 3.8 : 0, type: "spring", stiffness: 200, damping: 10 }}
                        className="flex flex-col items-center mb-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <p className="font-zen text-3xl md:text-4xl tracking-[0.1em] font-bold drop-shadow-lg">
                                2026<span style={{ color: COLORS.ORANGE }}>.</span>03<span style={{ color: COLORS.BLUE }}>.</span>21
                            </p>
                        </div>
                        <motion.p
                            animate={{
                                color: [COLORS.BLUE, COLORS.ORANGE, COLORS.BLUE]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-sm md:text-base font-bold tracking-[0.2em] mb-2"
                        >
                            {stage === 'post' ? 'Full Time!' : 'Kick OFF!'}
                        </motion.p>
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <SoccerBall className="w-5 h-5" color={COLORS.BLUE} />
                            </motion.div>
                            <p className="font-zen text-lg md:text-xl tracking-widest uppercase font-bold opacity-90">
                                WEDDING PARTY
                            </p>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <SoccerBall className="w-5 h-5" color={COLORS.ORANGE} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: isFirstVisit ? 0 : 1, y: isFirstVisit ? 10 : 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: isFirstVisit ? 4.5 : 0, duration: 1 }}
                        className="font-zen text-sm md:text-base tracking-widest mb-6 opacity-80"
                    >
                        Nagasaki StadiumCityHotel
                    </motion.p>

                    {/* Countdown Timer or Post-Wedding Menu */}
                    <motion.div
                        initial={{ opacity: isFirstVisit ? 0 : 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: isFirstVisit ? 5.0 : 0, duration: 1 }}
                        className="mb-12"
                    >
                        {stage === 'pre' ? (
                            <CountdownTimer targetDate={WEDDING_DATE} />
                        ) : stage === 'day' ? (
                            <div className="flex flex-col items-center gap-6">
                                <p className="font-zen text-xl md:text-2xl text-white tracking-widest animate-pulse">
                                    Welcome to our Wedding Day!
                                </p>
                                <p className="font-zen text-sm md:text-base text-white/90 tracking-wider -mt-4 text-center whitespace-nowrap md:whitespace-normal">
                                    本日はお越しいただきまして<br className="md:hidden" />誠にありがとうございます
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link to="/new-gallery" className="px-8 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Camera size={20} />
                                        <span>ギャラリー (Gallery)</span>
                                    </Link>
                                    <Link to="/seating" className="px-8 py-3 bg-[#2E7BF4] text-white font-zen rounded-full hover:bg-[#2E7BF4]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Users size={20} />
                                        <span>席次表 (Seating)</span>
                                    </Link>
                                    <Link to="/timeline" className="px-8 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Clock size={20} />
                                        <span>タイムライン (Timeline)</span>
                                    </Link>
                                    <Link to="/comments" className="px-8 py-3 bg-[#2E7BF4] text-white font-zen rounded-full hover:bg-[#2E7BF4]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <MessageSquare size={20} />
                                        <span>コメント (Comments)</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <p className="font-zen text-xl md:text-2xl text-white tracking-widest">
                                    A Brand New Day！
                                </p>
                                <p className="font-zen text-sm md:text-base text-white/90 tracking-wider -mt-4 text-center">
                                    誠にありがとうございました。
                                </p>

                                {/* Days Counters Grid */}
                                <div className="flex flex-col gap-4 my-4">
                                    {(() => {
                                        const groomBirth = new Date('1993-06-23');
                                        const brideBirth = new Date('1992-03-31');
                                        const weddingDate = new Date('2026-03-21');
                                        const today = new Date();
                                        const groomDays = Math.floor((today.getTime() - groomBirth.getTime()) / (1000 * 60 * 60 * 24));
                                        const brideDays = Math.floor((today.getTime() - brideBirth.getTime()) / (1000 * 60 * 60 * 24));
                                        const weddingDays = Math.floor((today.getTime() - weddingDate.getTime()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <>
                                                {/* Wedding Day Counter - Full Width */}
                                                <div className="flex flex-col items-center bg-white/5 backdrop-blur-md border border-[#F39800]/30 rounded-xl px-8 py-4">
                                                    <span className="text-[#F39800] text-xs tracking-widest mb-2">結婚式から</span>
                                                    <span className="text-white text-3xl md:text-4xl font-bold">{weddingDays.toLocaleString()}</span>
                                                    <span className="text-gray-400 text-xs mt-1">日目</span>
                                                </div>

                                                {/* Birth Counters - Side by Side */}
                                                <div className="flex flex-wrap justify-center gap-4">
                                                    <div className="flex flex-col items-center bg-white/5 backdrop-blur-md border border-[#2E7BF4]/30 rounded-xl px-6 py-4">
                                                        <span className="text-[#2E7BF4] text-xs tracking-widest mb-2">新郎 大樹</span>
                                                        <span className="text-gray-400 text-xs mb-1">生まれてから</span>
                                                        <span className="text-white text-2xl md:text-3xl font-bold">{groomDays.toLocaleString()}</span>
                                                        <span className="text-gray-400 text-xs mt-1">日目</span>
                                                    </div>
                                                    <div className="flex flex-col items-center bg-white/5 backdrop-blur-md border border-[#d4749d]/30 rounded-xl px-6 py-4">
                                                        <span className="text-[#d4749d] text-xs tracking-widest mb-2">新婦 真希</span>
                                                        <span className="text-gray-400 text-xs mb-1">生まれてから</span>
                                                        <span className="text-white text-2xl md:text-3xl font-bold">{brideDays.toLocaleString()}</span>
                                                        <span className="text-gray-400 text-xs mt-1">日目</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                                    <Link to="/new-gallery" className="px-6 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Camera size={20} />
                                        <span>ギャラリー (Gallery)</span>
                                    </Link>
                                    <Link to="/video" className="px-6 py-3 bg-[#2E7BF4] text-white font-zen rounded-full hover:bg-[#2E7BF4]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Video size={20} />
                                        <span>ビデオ (Video)</span>
                                    </Link>
                                    <Link to="/music" className="px-6 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <MusicIcon size={20} />
                                        <span>音楽 (Wedding Music)</span>
                                    </Link>
                                    <Link to="/timeline" className="px-6 py-3 bg-[#2E7BF4] text-white font-zen rounded-full hover:bg-[#2E7BF4]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Clock size={20} />
                                        <span>タイムライン (Timeline)</span>
                                    </Link>
                                    <Link to="/seating" className="px-6 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <Users size={20} />
                                        <span>席次表 (Seating)</span>
                                    </Link>
                                    <Link to="/comments" className="px-6 py-3 bg-[#2E7BF4] text-white font-zen rounded-full hover:bg-[#2E7BF4]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <MessageSquare size={20} />
                                        <span>コメント (Comments)</span>
                                    </Link>
                                    <Link to="/birthday-stats" className="px-6 py-3 bg-[#F39800] text-white font-zen rounded-full hover:bg-[#F39800]/80 transition-colors shadow-lg flex items-center gap-2">
                                        <BarChart3 size={20} />
                                        <span>誕生月クイズ (Birthday Quiz)</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <ArrowDown className="w-6 h-6 opacity-50" />
                    </motion.div>
                </motion.div>
            </section >



            {/* --- MOVIE SECTION (Moved) - Hidden in post stage --- */}
            {stage !== 'post' && (
                <section id="movie" className="py-24 px-6 bg-black relative z-30" >
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-16">
                            <Link to="/guest-guide" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                <div className="bg-[#F39800] p-2 rounded-full text-white">
                                    <Info size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 tracking-widest uppercase">参列者の方へ</p>
                                    <p className="text-lg font-bold text-white tracking-wider">会場案内</p>
                                </div>
                                <ArrowDown className="ml-2 text-gray-500 group-hover:text-white transition-colors -rotate-90" size={20} />
                            </Link>
                        </div>

                        <SectionHeading subtitle="Movie">招待状ムービー</SectionHeading>

                        <div className="aspect-video bg-[#1a1a1a] rounded-sm border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/Sjer15l91B0"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0"
                            ></iframe>
                        </div>
                    </div>
                </section>
            )}

            {/* --- GREETING - Hidden in post stage --- */}
            {stage !== 'post' && (
                <section id="greeting" className="py-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10" >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-[#1a1a1a]/90 backdrop-blur-sm p-12 md:p-16 shadow-2xl border-t-2 relative overflow-hidden"
                        style={{ borderTopColor: COLORS.ORANGE }}
                    >
                        <div className="absolute top-0 left-0 w-16 h-1" style={{ backgroundColor: COLORS.BLUE }}></div>
                        <div className="absolute bottom-0 right-0 w-16 h-1" style={{ backgroundColor: COLORS.ORANGE }}></div>

                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="md:w-1/2 font-zen leading-8 text-justify tracking-wide text-gray-300">
                                <p className="mb-8">
                                    謹啓<br />
                                    師走の候<br />
                                    皆様にはますますご清祥のことと<br />
                                    お慶び申し上げます
                                </p>
                                <p className="mb-8">
                                    私たちは2025年3月3日に<br />
                                    入籍いたしました<br />
                                    つきましては<br />
                                    幾久しくご懇情賜りたく<br />
                                    ご挨拶ならびに披露の小宴を<br />
                                    催したいと存じます
                                </p>
                                <p>
                                    ご多用中<br />
                                    誠に恐縮ではございますが<br />
                                    ご臨席いただきたく<br />
                                    ご案内申し上げます<br />
                                    <span className="block text-right mt-8 text-sm text-gray-500">敬白</span>
                                </p>
                            </div>
                            <div className="md:w-1/2 h-full min-h-[300px]">
                                <video
                                    src={`${import.meta.env.BASE_URL}topmovie.mp4`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="h-full w-full object-cover rounded-sm filter grayscale contrast-125 brightness-90"
                                    style={{
                                        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                                        maskComposite: 'intersect',
                                        WebkitMaskComposite: 'source-in'
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* --- RSVP SECTION (Moved) - Removed --- */}

            {/* --- ENDROLL MOVIE SECTION - Only in post stage --- */}
            {stage === 'post' && (
                <section id="endroll-movie" className="py-24 px-6 bg-black relative z-30" >
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading subtitle="Endroll Movie">エンドロールムービー</SectionHeading>

                        <div className="aspect-video bg-[#1a1a1a] rounded-sm border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl mt-12">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/rsn3K6MwzxA"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0"
                            ></iframe>
                        </div>
                    </div>
                </section>
            )}

            {/* --- PROFILE --- */}
            < section id="profile-section" className="py-24 px-6 bg-black relative z-10" >
                <div className="max-w-6xl mx-auto">
                    <SectionHeading subtitle="Profile">プロフィール</SectionHeading>
                    <div className="grid md:grid-cols-2 gap-16 mt-16">
                        {/* Groom */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >

                            <motion.div
                                className="w-64 h-80 md:w-72 md:h-[22.5rem] mb-12 relative group"
                                animate={{ y: [0, -6, 0] }}
                                transition={{
                                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                                    scale: { duration: 0.3 }
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Tracing Border Animation - Double Lines */}
                                <div className="absolute inset-0 translate-x-4 translate-y-4 z-0 pointer-events-none">
                                    <svg className="w-full h-full overflow-visible">
                                        {/* Outer Line - Smooth Tracing */}
                                        <motion.rect
                                            x="0" y="0" width="100%" height="100%"
                                            fill="none"
                                            stroke={COLORS.BLUE}
                                            strokeWidth="1"
                                            initial={{ pathLength: 0, pathOffset: 0 }}
                                            animate={{ pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 1, 1] }}
                                            transition={{
                                                duration: 10,
                                                times: [0, 0.4, 0.9, 1],
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 0
                                            }}
                                        />
                                        {/* Inner Line - Reverse Direction Solid */}
                                        <motion.rect
                                            x="5%" y="5%" width="90%" height="90%"
                                            fill="none"
                                            stroke={COLORS.BLUE}
                                            strokeWidth="0.5"
                                            initial={{ pathLength: 0, pathOffset: 1 }}
                                            animate={{ pathLength: [0, 1, 1, 0], pathOffset: [1, 0, 0, 0] }}
                                            transition={{
                                                duration: 10,
                                                times: [0, 0.4, 0.9, 1],
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 0,
                                                delay: 0.5
                                            }}
                                        />
                                    </svg>
                                </div>

                                <img
                                    src={`${import.meta.env.BASE_URL}Daiki.png`}
                                    alt="Daiki"
                                    className="w-full h-full object-cover relative z-10"
                                    style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                                />

                                {/* Soccer Ball Icon */}
                                <div className="absolute -top-3 -left-3 z-30 bg-black rounded-full p-1 border border-white/10">
                                    <SoccerBall className="w-8 h-8 animate-[spin_10s_linear_infinite]" color={COLORS.BLUE} />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                    className="absolute top-12 right-4 text-3xl font-bold font-zen z-20 text-gray-400"
                                >
                                    Daiki
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                    className="absolute top-12 left-10 text-3xl font-bold font-zen z-20 text-gray-400"
                                >
                                    6
                                </motion.div>
                            </motion.div>
                            <h3 className="text-2xl font-zen mb-1 text-white">宝本 大樹</h3>
                            <p className="text-sm mb-6 tracking-widest font-bold" style={{ color: COLORS.BLUE }}>HOUMOTO DAIKI</p>
                            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 tracking-widest border-b border-white/10 pb-2 w-full justify-center">
                                <span>佐賀県出身</span>
                                <span>|</span>
                                <span>1993.06.23</span>
                            </div>
                            <p className="text-center text-gray-400 leading-relaxed text-sm font-shippori">
                                建築の世界で<br />
                                デジタル技術を展開・活用する仕事<br />
                                忙しいけれど、充実した毎日。<br />
                                家に帰って<br />
                                ネモとシュモ、そして真希の姿を見ると、<br />
                                胸の奥がふっとほどけて<br />
                                「ああ、帰ってきたな」と思えます。<br />
                                特別なことがなくてもいい。<br />
                                ただ一緒に笑って寄り添って、<br />
                                同じ時間を過ごせることが、何よりの幸せ。<br />
                                この家族と描く未来を、<br />
                                これからも大切にしていきたい。<br />
                                大樹
                            </p>
                        </motion.div>

                        {/* Bride */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >

                            <motion.div
                                className="w-64 h-80 md:w-72 md:h-[22.5rem] mb-12 relative group"
                                animate={{ y: [0, -6, 0] }}
                                transition={{
                                    y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                                    scale: { duration: 0.3 }
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Tracing Border Animation - Double Lines */}
                                <div className="absolute inset-0 translate-x-4 translate-y-4 z-0 pointer-events-none">
                                    <svg className="w-full h-full overflow-visible">
                                        {/* Outer Line - Smooth Tracing */}
                                        <motion.rect
                                            x="0" y="0" width="100%" height="100%"
                                            fill="none"
                                            stroke={COLORS.ORANGE}
                                            strokeWidth="1"
                                            initial={{ pathLength: 0, pathOffset: 0 }}
                                            animate={{ pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 1, 1] }}
                                            transition={{
                                                duration: 10,
                                                times: [0, 0.4, 0.9, 1],
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                delay: 0.5,
                                                repeatDelay: 0
                                            }}
                                        />
                                        {/* Inner Line - Reverse Direction Solid */}
                                        <motion.rect
                                            x="5%" y="5%" width="90%" height="90%"
                                            fill="none"
                                            stroke={COLORS.ORANGE}
                                            strokeWidth="0.5"
                                            initial={{ pathLength: 0, pathOffset: 1 }}
                                            animate={{ pathLength: [0, 1, 1, 0], pathOffset: [1, 0, 0, 0] }}
                                            transition={{
                                                duration: 10,
                                                times: [0, 0.4, 0.9, 1],
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 0,
                                                delay: 0.5
                                            }}
                                        />
                                    </svg>
                                </div>

                                <img
                                    src={`${import.meta.env.BASE_URL}Maki.png`}
                                    alt="Maki"
                                    className="w-full h-full object-cover relative z-10"
                                    style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                                />

                                {/* Soccer Ball Icon */}
                                <div className="absolute -top-3 -left-3 z-30 bg-black rounded-full p-1 border border-white/10">
                                    <SoccerBall className="w-8 h-8 animate-[spin_10s_linear_infinite]" color={COLORS.ORANGE} />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                    className="absolute top-12 left-10 text-3xl font-bold font-zen z-20 text-gray-400"
                                >
                                    Maki
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                    className="absolute top-12 right-6 text-3xl font-bold font-zen z-20 text-gray-400"
                                >
                                    3
                                </motion.div>
                            </motion.div>
                            <h3 className="text-2xl font-zen mb-1 text-white">長谷川 真希</h3>
                            <p className="text-sm mb-6 tracking-widest font-bold" style={{ color: COLORS.ORANGE }}>HASEGAWA MAKI</p>
                            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 tracking-widest border-b border-white/10 pb-2 w-full justify-center">
                                <span>長崎県出身</span>
                                <span>|</span>
                                <span>1992.03.31</span>
                            </div>
                            <p className="text-center text-gray-400 leading-relaxed text-sm font-shippori">
                                家族と過ごす時間が<br />
                                私の毎日をそっと支えてくれています。<br />
                                みんなでごはんを囲んで<br />
                                「おいしい」と聞こえるだけで<br />
                                心の中がふわっと<br />
                                あたたかくなる瞬間があります。<br />
                                ネモとシュモのお世話は<br />
                                大変な日もあるけれど、<br />
                                ふたりの無邪気な姿を見ると<br />
                                自然と笑顔になれます。<br />
                                これからも大切な家族と<br />
                                小さな幸せを積み重ねていきたい<br />
                                真希
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section >

            {/* --- PETS (Moved Back) --- */}
            < section id="pets" className="py-24 px-6 relative z-10 bg-black" >
                <div className="max-w-5xl mx-auto">
                    <SectionHeading subtitle="Beloved Pets">愛しい家族たち</SectionHeading>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Pet 1: Nemo */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            whileHover={{ y: -10 }}
                            className="bg-[#1a1a1a] p-8 shadow-xl rounded-t-full border-b-4 relative overflow-hidden"
                            style={{ borderColor: COLORS.ORANGE }}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="aspect-square rounded-full overflow-hidden mb-8 border-4 border-[#262626] shadow-inner relative bg-black"
                            >
                                {/* Orange ball - right top */}
                                <div className="absolute inset-0 flex items-start justify-end pr-4 pt-8 opacity-30">
                                    <motion.div
                                        animate={{
                                            x: [0, -120, 0],
                                            rotate: [0, -720, 0]
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <SoccerBall className="w-16 h-16" color={COLORS.ORANGE} />
                                    </motion.div>
                                </div>
                                {/* White ball - left bottom */}
                                <div className="absolute inset-0 flex items-end justify-start pl-4 pb-8 opacity-30">
                                    <motion.div
                                        animate={{
                                            x: [0, 120, 0],
                                            rotate: [0, 720, 0]
                                        }}
                                        transition={{
                                            duration: 10,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <SoccerBall className="w-16 h-16" color={COLORS.WHITE} />
                                    </motion.div>
                                </div>
                                {/* Paw Prints Background Animation */}
                                <div className="absolute inset-0 pointer-events-none opacity-40">
                                    {[...Array(6)].map((_, i) => {
                                        const randomTop = 10 + Math.random() * 60; // 10% to 70%
                                        const randomLeft = 10 + Math.random() * 60; // 10% to 70%
                                        const randomRotate = Math.random() * 360;
                                        const randomDelay = Math.random() * 2;
                                        const randomDuration = 3 + Math.random() * 2;

                                        return (
                                            <motion.div
                                                key={i}
                                                className="absolute"
                                                style={{
                                                    top: `${randomTop}%`,
                                                    left: `${randomLeft}%`,
                                                }}
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0, 1, 0],
                                                    rotate: [randomRotate, randomRotate + 45, randomRotate]
                                                }}
                                                transition={{
                                                    duration: randomDuration,
                                                    repeat: Infinity,
                                                    delay: randomDelay,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <PawPrint className="w-10 h-10" style={{ color: COLORS.ORANGE }} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <img
                                    src={`${import.meta.env.BASE_URL}Nemo.png`}
                                    alt="Toy Poodle"
                                    className="w-full h-full object-contain relative z-10 filter grayscale contrast-110"
                                    style={{ objectPosition: '55% center', transform: 'scale(0.85)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                                />
                            </motion.div>
                            <div className="text-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-block"
                                >
                                    <PawPrint className="w-6 h-6 mx-auto mb-3 opacity-80" style={{ color: COLORS.ORANGE }} />
                                </motion.div>
                                <h4 className="text-xl font-bold font-zen mb-2 text-white">ネモ (Nemo)</h4>
                                <p className="text-sm mb-4 opacity-80" style={{ color: COLORS.ORANGE }}>トイプードル / 女の子
                                    <br />2023.08.12 / 北海道うまれ</p>
                                <p className="text-sm text-gray-400 leading-relaxed font-shippori">
                                    明るく人懐っこい、<br />
                                    わが家の癒やし担当。<br />
                                    初めて会う人にもすぐ心を開く、<br />
                                    愛嬌たっぷりの性格です。<br />
                                    嬉しいときはしっぽで<br />
                                    一生懸命気持ちを伝えてくれて、<br />
                                    ふとした瞬間にそっと<br />
                                    寄り添ってくれる優しさもあります。<br />
                                    その無邪気な姿に、<br />
                                    家族みんなが自然と笑顔にさせられる、<br />
                                    小さくても存在感たっぷりの<br />
                                    大切な家族です。
                                </p>
                            </div>
                        </motion.div>

                        {/* Pet 2: Shumo */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            whileHover={{ y: -10 }}
                            className="bg-[#1a1a1a] p-8 shadow-xl rounded-t-full border-b-4 relative overflow-hidden"
                            style={{ borderColor: COLORS.BLUE }}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="aspect-square rounded-full overflow-hidden mb-8 border-4 border-[#262626] shadow-inner relative bg-black"
                            >
                                {/* Blue ball - left bottom */}
                                <div className="absolute inset-0 flex items-end justify-start pl-4 pb-8 opacity-30">
                                    <motion.div
                                        animate={{
                                            x: [0, 120, 0],
                                            rotate: [0, 720, 0]
                                        }}
                                        transition={{
                                            duration: 9,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <SoccerBall className="w-16 h-16" color={COLORS.BLUE} />
                                    </motion.div>
                                </div>
                                {/* White ball - right top */}
                                <div className="absolute inset-0 flex items-start justify-end pr-4 pt-8 opacity-30">
                                    <motion.div
                                        animate={{
                                            x: [0, -120, 0],
                                            rotate: [0, -720, 0]
                                        }}
                                        transition={{
                                            duration: 11,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <SoccerBall className="w-16 h-16" color={COLORS.WHITE} />
                                    </motion.div>
                                </div>
                                {/* Paw Prints Background Animation */}
                                <div className="absolute inset-0 pointer-events-none opacity-40">
                                    {[...Array(6)].map((_, i) => {
                                        const randomTop = 10 + Math.random() * 60; // 10% to 70%
                                        const randomRight = 10 + Math.random() * 60; // 10% to 70%
                                        const randomRotate = Math.random() * 360;
                                        const randomDelay = Math.random() * 2;
                                        const randomDuration = 3 + Math.random() * 2;

                                        return (
                                            <motion.div
                                                key={i}
                                                className="absolute"
                                                style={{
                                                    top: `${randomTop}%`,
                                                    right: `${randomRight}%`,
                                                }}
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0, 1, 0],
                                                    rotate: [randomRotate, randomRotate - 45, randomRotate]
                                                }}
                                                transition={{
                                                    duration: randomDuration,
                                                    repeat: Infinity,
                                                    delay: randomDelay,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <PawPrint className="w-10 h-10" style={{ color: COLORS.BLUE }} />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <img
                                    src={`${import.meta.env.BASE_URL}Shumo.png`}
                                    alt="Miniature Schnauzer"
                                    className="w-full h-full object-contain relative z-10 filter grayscale contrast-110"
                                    style={{ objectPosition: '45% center', transform: 'scale(0.85)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                                />
                            </motion.div>
                            <div className="text-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -10, 10, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1
                                    }}
                                    className="inline-block"
                                >
                                    <PawPrint className="w-6 h-6 mx-auto mb-3 opacity-80" style={{ color: COLORS.BLUE }} />
                                </motion.div>
                                <h4 className="text-xl font-bold font-zen mb-2 text-white">シュモ (Shumo)</h4>
                                <p className="text-sm mb-4 opacity-80" style={{ color: COLORS.BLUE }}>ミニチュアシュナウザー / 男の子
                                    <br />2025.3.12 / 佐賀うまれ</p>
                                <p className="text-sm text-gray-400 leading-relaxed font-shippori">
                                    一度見たら忘れられない・・・<br />
                                    極上の”とろける顔”<br />
                                    誰にでもトコトコとついて<br />
                                    目を輝かせて駆け寄ってくる<br />
                                    愛らしい性格です。<br />
                                    最大の武器は、誰もを骨ぬきにするような、<br />
                                    とろける顔での上目遣です。<br />
                                    撫でてほしいときは<br />
                                    じっと見つめてアピールしてきます。<br />
                                    その一生懸命な姿に、<br />
                                    毎日たくさんの元気をもらっている、<br />
                                    かけがえのない家族です。
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dog Soccer Link */}
                    {/* Dog Soccer Game Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-16 w-full max-w-2xl mx-auto"
                    >
                        <Link to="/dog-soccer" className="block group">
                            <motion.div
                                whileHover={{ scale: 1.02, rotate: 1 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative bg-gradient-to-br from-[#2e7d32] to-[#1b5e20] rounded-2xl p-1 border-4 border-[#F39800] shadow-2xl overflow-hidden"
                            >
                                {/* Pitch Lines Decoration */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="bg-[#0a0a0a]/20 backdrop-blur-sm rounded-xl p-6 md:p-8 relative z-10 flex flex-col items-center">
                                    {/* Badge */}
                                    <div className="absolute top-0 right-0 bg-[#F39800] text-black font-bold px-4 py-1 rounded-bl-xl font-zen text-sm tracking-widest">
                                        NEW GAME
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-3xl md:text-4xl font-black font-zen text-white italic tracking-wider mb-2 drop-shadow-lg text-center">
                                        DOG SOCCER <span className="text-[#F39800]">STRIKER</span>
                                    </h3>
                                    <p className="text-white/80 text-sm md:text-base mb-8 font-shippori tracking-widest">
                                        ネモ vs シュモ！ 夢のドッグサッカー対決
                                    </p>

                                    {/* Visuals */}
                                    <div className="flex items-end justify-center gap-4 md:gap-12 mb-8 w-full">
                                        {/* Nemo */}
                                        <div className="relative w-24 h-24 md:w-32 md:h-32">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full blur-xl"></div>
                                            <img
                                                src={`${import.meta.env.BASE_URL}Nemo.png`}
                                                alt="Nemo"
                                                className="w-full h-full object-contain drop-shadow-2xl transform scale-x-[-1] group-hover:-translate-x-2 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* VS Ball */}
                                        <div className="relative -mb-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            >
                                                <SoccerBall className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                            </motion.div>
                                        </div>

                                        {/* Shumo */}
                                        <div className="relative w-24 h-24 md:w-32 md:h-32">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full blur-xl"></div>
                                            <img
                                                src={`${import.meta.env.BASE_URL}Shumo.png`}
                                                alt="Shumo"
                                                className="w-full h-full object-contain drop-shadow-2xl group-hover:translate-x-2 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="bg-white text-[#1b5e20] px-8 py-3 rounded-full font-bold font-zen tracking-widest flex items-center gap-2 group-hover:bg-[#F39800] group-hover:text-white transition-colors duration-300 shadow-lg">
                                        <SoccerBall className="w-5 h-5" />
                                        PLAY NOW
                                        <SoccerBall className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                </div>
            </section >

            {/* --- GALLERY CTA (Replaces History) --- */}
            < section className="py-24 px-6 bg-[#0a0a0a] relative z-10" >
                <div className="max-w-4xl mx-auto text-center">
                    <SectionHeading subtitle="Gallery">二人の軌跡</SectionHeading>
                    <p className="text-gray-400 mb-12 font-shippori">
                        これまでの歩みや、馴れ初めのマンガをギャラリーページにまとめました。<br />
                        ぜひご覧ください。
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        {/* 3D Gallery Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-2xl mx-auto mb-12"
                        >
                            <a href={`${import.meta.env.BASE_URL}3Dgallery.html`} className="block group">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative h-[300px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={`${import.meta.env.BASE_URL}gallery/04.jpg`}
                                            alt="3D Gallery Background"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            whileInView={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 className="font-zen text-3xl md:text-4xl text-[#d4af37] mb-4 tracking-wider font-bold">
                                                3D MEMORY TOUR
                                            </h3>
                                            <p className="font-shippori text-white/90 text-sm md:text-base mb-6 tracking-wide">
                                                思い出の写真を3D空間で振り返る<br />
                                                特別な体験をあなたに
                                            </p>

                                            <span className="inline-block px-8 py-3 border border-[#d4af37] text-[#d4af37] rounded-full font-zen tracking-widest group-hover:bg-[#d4af37] group-hover:text-white transition-all duration-300 text-sm">
                                                START TOUR
                                            </span>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </a>
                        </motion.div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link to="/gallery">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-12 py-4 border border-white/30 rounded-sm text-white hover:bg-white/10 transition-colors font-zen tracking-widest w-full md:w-auto"
                            >
                                VIEW GALLERY
                            </motion.button>
                        </Link>
                        <Link to="/manga">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-12 py-4 border border-white/30 rounded-sm text-white hover:bg-white/10 transition-colors font-zen tracking-widest w-full md:w-auto"
                            >
                                VIEW MANGA
                            </motion.button>
                        </Link >
                    </div >
                </div >
            </section >

            {/* --- INFORMATION & ACCESS (Moved) --- */}
            < section id="access" className="py-24 px-6 relative z-10 bg-black" >
                <div className="max-w-4xl mx-auto bg-[#1a1a1a] shadow-2xl overflow-hidden">
                    {/* Stadium Image Header */}
                    <div className="relative h-72">
                        <img
                            src="https://www.nagasakistadiumcity.com/wp-content/themes/stadiumcity/images/top/front_top_sp.webp?20250422"
                            alt="Nagasaki Stadium City"
                            className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="border-2 p-4 text-center backdrop-blur-sm" style={{ borderColor: COLORS.WHITE }}>
                                <p className="text-white font-zen text-2xl tracking-widest">STADIUM</p>
                                <p className="text-white text-xs tracking-widest mt-1 opacity-80">ACCESS</p>
                            </div>
                        </div>
                    </div>

                    {/* Information Content */}
                    <div className="p-12 relative">
                        <div className="absolute top-0 right-0 w-20 h-1" style={{ backgroundColor: COLORS.ORANGE }}></div>
                        <div className="absolute bottom-0 left-0 w-20 h-1" style={{ backgroundColor: COLORS.BLUE }}></div>

                        {/* Match Day Info */}
                        <div className="mb-12">
                            <h3 className="font-zen text-xl font-bold mb-6 text-white border-l-4 pl-4" style={{ borderColor: COLORS.ORANGE }}>MATCH DAY</h3>
                            <div className="flex items-start mb-5">
                                <Calendar className="w-5 h-5 mr-4 mt-1 opacity-80" style={{ color: COLORS.ORANGE }} />
                                <div>
                                    <p className="font-bold text-white mb-1 text-lg">2026.03.21 (Sat)</p>
                                    <p className="text-sm text-gray-400">KICKOFF</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 mr-4 mt-1 opacity-80" style={{ color: COLORS.BLUE }} />
                                <div className="flex flex-col gap-2">
                                    <a
                                        href="https://maps.app.goo.gl/MjBbVSL45TTjV5FR8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-white hover:text-orange-400 transition-colors inline-flex items-center gap-2"
                                    >
                                        長崎スタジアムシティ
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <Link
                                        to="/floormap"
                                        className="text-sm text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1"
                                    >
                                        フロアマップを見る
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Parking Info */}
                        <div className="border-t border-white/10 pt-10">
                            <h3 className="font-zen text-xl text-white mb-6 flex items-center gap-2 border-l-4 pl-4" style={{ borderColor: COLORS.BLUE }}>
                                <Car className="w-6 h-6" />
                                PARKING
                            </h3>
                            <div className="mt-4">
                                <Link to="/hotel-parking" className="inline-flex items-center gap-2 text-white border border-white/30 px-4 py-2 rounded hover:bg-white/10 transition-colors">
                                    <Info className="w-4 h-4 text-[#F39800]" />
                                    <span className="text-sm">駐車場の案内はこちら</span>
                                </Link>
                            </div>
                        </div>

                        {/* Hotel Info */}
                        <div className="border-t border-white/10 pt-10 mt-10">
                            <h3 className="font-zen text-xl text-white mb-6 flex items-center gap-2 border-l-4 pl-4" style={{ borderColor: COLORS.ORANGE }}>
                                <Building className="w-6 h-6" />
                                HOTEL
                            </h3>
                            <div className="text-gray-400 text-sm leading-relaxed space-y-4">
                                <p>
                                    <span className="text-white font-bold block mb-1">STADIUM CITY HOTEL NAGASAKI</span>
                                    日本初、サッカースタジアム<br />
                                    ビューホテル。<br />
                                    スタジアムシティ内に位置し、<br />
                                    挙式・披露宴会場への<br />
                                    アクセスも抜群です。
                                </p>
                                <div className="mt-4">
                                    <a
                                        href="https://www.nagasakistadiumcity.com/hotel/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm hover:underline transition-opacity hover:opacity-80"
                                        style={{ color: COLORS.ORANGE }}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        公式サイトで詳細を見る
                                    </a>
                                </div>
                                <div className="mt-6">
                                    <div className="aspect-video w-full bg-black/50 rounded-sm overflow-hidden">
                                        <iframe
                                            src="https://www.youtube.com/embed/yOcTq8xbAvE?autoplay=1&mute=1&loop=1&playlist=yOcTq8xbAvE&controls=0&modestbranding=1"
                                            className="w-full h-full"
                                            style={{ border: 0 }}
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                            title="Stadium City Hotel Nagasaki"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >


            {/* --- LINKS --- */}
            < section className="py-16 px-6 bg-[#0a0a0a] relative z-10 border-t border-white/5" >
                <div className="max-w-4xl mx-auto text-center">
                    <SectionHeading subtitle="Links">関連リンク</SectionHeading>
                    <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
                        <motion.a
                            href="https://www.nagasakistadiumcity.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors group"
                        >
                            <ExternalLink className="w-4 h-4 text-[#0D4FC7] group-hover:text-white transition-colors" />
                            <span className="font-zen tracking-widest text-sm">長崎スタジアムシティ</span>
                        </motion.a>
                        <Link to="/floormap">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors group"
                            >
                                <MapPin className="w-4 h-4 text-[#0D4FC7] group-hover:text-white transition-colors" />
                                <span className="font-zen tracking-widest text-sm">フロアマップ</span>
                            </motion.div>
                        </Link>
                        <motion.a
                            href="https://www.nagasakistadiumcity.com/parking/"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors group"
                        >
                            <ExternalLink className="w-4 h-4 text-[#2E7BF4] group-hover:text-white transition-colors" />
                            <span className="font-zen tracking-widest text-sm">駐車場情報</span>
                        </motion.a>
                        <motion.a
                            href={INVITATION_URL}
                            target="_blank"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 rounded-sm text-white hover:bg-white/5 transition-colors group"
                        >
                            <ExternalLink className="w-4 h-4 text-[#F39800] group-hover:text-white transition-colors" />
                            <span className="font-zen tracking-widest text-sm">Web招待状</span>
                        </motion.a>
                    </div>
                </div>
            </section >

            {/* --- FOOTER --- */}
            < footer className="bg-black text-gray-500 py-16 text-center relative z-10 border-t border-white/5" >
                <div className="mb-8 flex justify-center items-center gap-4">
                    <div className="w-2 h-2 rounded-full opacity-80" style={{ backgroundColor: COLORS.BLUE }}></div>
                    <SoccerBall className="w-6 h-6 opacity-50" color={COLORS.ORANGE} />
                    <div className="w-2 h-2 rounded-full opacity-80" style={{ backgroundColor: COLORS.BLUE }}></div>
                </div>
                <h2 className="font-zen text-2xl text-white tracking-[0.2em] mb-3">Daiki & Maki</h2>
                <p className="font-shippori text-xs tracking-widest mb-10 opacity-70">Thank you for coming to our stadium.</p>
                <p className="text-[10px] opacity-30">&copy; 2026 Daiki & Maki Wedding.</p>
            </footer >

            {/* --- FLOATING INVITATION BUTTON --- */}
            < motion.a
                href={INVITATION_URL}
                target="_blank"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 text-white py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 font-zen tracking-wider text-sm font-bold"
                style={{ backgroundColor: COLORS.ORANGE }}
            >
                <ExternalLink className="w-4 h-4" />
                <span>招待状</span>
            </motion.a >
        </>
    );
};

export default Home;

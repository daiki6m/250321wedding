import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Heart, Camera, Utensils, Star } from 'lucide-react';

const timelineEvents = [
    {
        time: "15:00",
        title: "Wedding Ceremony",
        description: "挙式",
        icon: <Heart className="text-[#ff69b4]" />,
    },
    {
        time: "15:30",
        title: "Photo Session",
        description: "集合写真",
        icon: <Camera className="text-[#2E7BF4]" />,
    },
    {
        time: "16:00",
        title: "Reception",
        description: "受付",
        icon: <Clock className="text-[#F39800]" />,
    },
    {
        time: "16:30",
        title: "Wedding Reception",
        description: "披露宴",
        icon: <Utensils className="text-[#F39800]" />,
    },
    {
        time: "19:00~",
        title: "Send-off",
        description: "お見送り・ホテルでのご宿泊をお楽しみください",
        icon: <Star className="text-white" />,
    }
];

const Timeline = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSlideshowMode, setIsSlideshowMode] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('slideshow') === 'true') {
            setIsSlideshowMode(true);
        }
    }, [location.search]);

    // Auto-scroll logic
    useEffect(() => {
        if (!isSlideshowMode) return;

        let lastTime = 0;
        let hasNavigated = false;
        const scrollSpeed = 1.5; // pixels per frame - increased for faster scroll

        const goToNext = () => {
            if (hasNavigated) return;
            hasNavigated = true;
            navigate('/photo-shower?slideshow=true');
        };

        // Maximum 1 minute timeout
        const maxTimeout = setTimeout(goToNext, 60000);

        const performScroll = (time: number) => {
            if (hasNavigated) return;
            if (!lastTime) lastTime = time;
            const delta = time - lastTime;
            window.scrollBy(0, scrollSpeed * (delta / 16));
            lastTime = time;

            // Check if we reached the bottom
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
            if (isBottom) {
                // Wait a bit at the bottom then transition
                setTimeout(goToNext, 3000);
                return;
            }
            requestAnimationFrame(performScroll);
        };

        const animationId = requestAnimationFrame(performScroll);

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(maxTimeout);
        };
    }, [isSlideshowMode, navigate]);
    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden p-8 pt-12">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <h1 className="text-4xl font-bold mb-16 text-center tracking-widest">
                    <span className="text-[#F39800]">T</span>IMELINE
                </h1>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#F39800] via-[#2E7BF4] to-[#ff69b4] opacity-30 md:-translate-x-1/2"></div>

                    <div className="space-y-12">
                        {timelineEvents.map((event, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={`relative flex items-center gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Icon Circle */}
                                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-[#050505] border-2 border-white/20 flex items-center justify-center z-20 md:-translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    {event.icon}
                                </div>

                                {/* Content Card */}
                                <div className={`flex-grow md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                                        <div className="text-[#F39800] font-bold text-lg mb-1 tracking-wider">{event.time}</div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#2E7BF4] transition-colors">{event.title}</h3>
                                        <p className="text-gray-400 text-sm">{event.description}</p>
                                    </div>
                                </div>

                                {/* Spacer for desktop */}
                                <div className="hidden md:block md:w-1/2"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-gray-500 text-sm tracking-widest italic">
                        ※当日の進行状況により時間が前後する場合がございます
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Timeline;

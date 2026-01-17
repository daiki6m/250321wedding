import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { UploadQRCode } from '../components/QRCode';

type Photo = {
    id: number;
    url: string;
    caption?: string;
    uploader?: string;
    created_at: string;
    isNew?: boolean;
};

const PhotoShower = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [queue, setQueue] = useState<Photo[]>([]);
    const [spotlightPhoto, setSpotlightPhoto] = useState<Photo | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default to unmuted for better experience? Or keep muted? Let's keep user preference.
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);



    // Fetch initial photos
    useEffect(() => {
        const fetchPhotos = async () => {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching photos:', error);
            } else if (data) {
                setPhotos(data);
            }
        };

        fetchPhotos();
    }, []);

    // Realtime subscription - Add to QUEUE instead of direct display
    useEffect(() => {
        const channel = supabase
            .channel('photos-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'photos' },
                (payload: RealtimePostgresInsertPayload<Photo>) => {
                    const newPhoto = { ...payload.new, isNew: true } as Photo;
                    setQueue((prev) => [...prev, newPhoto]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Process Queue
    useEffect(() => {
        if (queue.length > 0 && !spotlightPhoto) {
            const nextPhoto = queue[0];

            // Pre-load image before showing spotlight
            const img = new Image();
            img.src = nextPhoto.url;
            img.onload = () => {
                setSpotlightPhoto(nextPhoto);
                setQueue((prev) => prev.slice(1));

                // Play sound
                if (audioRef.current && !isMuted) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => { });
                }

                // Show spotlight for 5 seconds, then move to gallery
                setTimeout(() => {
                    setSpotlightPhoto(null);
                    setPhotos((prev) => [nextPhoto, ...prev].slice(0, 100));
                }, 5000);
            };
            img.onerror = () => {
                console.error('Failed to load image:', nextPhoto.url);
                // Skip this photo if it fails to load
                setQueue((prev) => prev.slice(1));
            };
        }
    }, [queue, spotlightPhoto, isMuted]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // SCATTER_ORDER: Prioritize center, then corners, then edges
    // Grid 5x4 = 20 slots
    // Center slots: 6, 7, 8, 11, 12, 13
    const SCATTER_ORDER = [
        7, 12, 11, 8, // Center 4
        0, 4, 15, 19, // Corners
        2, 17, 10, 9, // Mid-edges
        5, 14, 1, 18, // Side-edges
        3, 16, 6, 13  // Remaining
    ];

    // Get position for a photo based on its current index
    const getPosition = (id: number, index: number) => {
        // Map current index to a scattered slot
        // Use modulo to cycle through slots if we have more than 20 photos
        const slotIndex = index % SCATTER_ORDER.length;
        const slot = SCATTER_ORDER[slotIndex];

        const cols = 5;
        const rows = 4;

        const row = Math.floor(slot / cols);
        const col = slot % cols;

        // Add randomness within the slot based on ID (deterministic jitter)
        // This ensures the photo stays in the same relative spot within the slot
        // even if it moves to a different slot later (if we wanted to keep it static, but here we want flow)
        // Actually, we want the photo to move to the NEW slot's position.
        // Let's make jitter based on ID so it looks unique to the photo.
        const jitterX = (id % 100) / 100; // 0.0 - 0.99
        const jitterY = ((id * 13) % 100) / 100; // 0.0 - 0.99

        const baseX = (col / cols) * 80 + 5; // 5% to 85%
        const baseY = (row / rows) * 70 + 10; // 10% to 80%

        const randomX = baseX + (jitterX - 0.5) * 10;
        const randomY = baseY + (jitterY - 0.5) * 10;

        return {
            x: `${Math.max(2, Math.min(88, randomX))}%`,
            y: `${Math.max(5, Math.min(85, randomY))}%`,
            rotate: (jitterX - 0.5) * 40,
        };
    };

    const uploadUrl = `${window.location.origin}${import.meta.env.BASE_URL}photo`;

    // Demo function
    const addDemoPhoto = () => {
        const demoPhoto: Photo = {
            id: Date.now(),
            url: `https://picsum.photos/seed/${Date.now()}/400/400`,
            caption: 'Demo Photo',
            uploader: 'Demo User',
            created_at: new Date().toISOString(),
            isNew: true
        };
        setQueue(prev => [...prev, demoPhoto]);
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#fdfbf7] text-gray-800 overflow-hidden relative font-zen"
        >
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://www.nagasakistadiumcity.com/wp-content/themes/stadiumcity/images/top/front_top_sp.webp?20250422')",
                }}
            />
            <div className="absolute inset-0 z-0 bg-white/85 backdrop-blur-sm" />

            {/* Background Particles (Subtle) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#F39800]/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                        }}
                    />
                ))}
            </div>

            {/* Header - Hide in fullscreen */}
            {!isFullscreen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none"
                >
                    <Link
                        to="/new-gallery"
                        className="bg-white/80 backdrop-blur-md p-3 rounded-full text-gray-800 hover:bg-white shadow-lg transition-all flex items-center gap-2 border border-gray-200 pointer-events-auto"
                    >
                        <ArrowLeft size={24} />
                        <span className="hidden md:inline pr-2">ギャラリーへ戻る</span>
                    </Link>

                    <div className="text-right pointer-events-auto">
                        <h1 className="text-3xl md:text-5xl font-bold font-zen tracking-tight text-gray-800">
                            <span className="text-[#F39800]">Photo</span>
                            <span className="text-[#2E7BF4]">Shower</span>
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base font-shippori">
                            リアルタイムで写真が届きます
                        </p>
                    </div>
                </motion.div>
            )}

            {/* QR Code Display (Bottom Left) */}
            <div className="absolute bottom-6 left-6 z-50 flex items-end gap-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 text-center">
                    <p className="text-sm font-bold text-gray-600 mb-2">写真を投稿する</p>
                    <UploadQRCode url={uploadUrl} size={100} />
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
                    <span className="text-gray-600 font-mono text-sm">
                        {photos.length} 枚の写真
                    </span>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-6 right-6 z-50 flex gap-3">
                {/* Demo Button (Temporary) */}
                <button
                    onClick={addDemoPhoto}
                    className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-gray-700 hover:bg-white transition-all border border-gray-200 shadow-lg text-sm font-bold"
                >
                    Demo
                </button>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-full text-gray-700 hover:bg-white transition-all border border-gray-200 shadow-lg"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="bg-white/80 backdrop-blur-md p-3 rounded-full text-gray-700 hover:bg-white transition-all border border-gray-200 shadow-lg"
                >
                    {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
            </div>

            {/* Photo Display Area */}
            <div className="absolute inset-0 pt-24 pb-20 px-4">
                <AnimatePresence>
                    {photos.map((photo, index) => {
                        const pos = getPosition(photo.id, index);
                        return (
                            <motion.div
                                key={photo.id}
                                className="absolute"
                                style={{
                                    left: pos.x,
                                    top: pos.y,
                                    zIndex: photos.length - index,
                                }}
                                initial={photo.isNew ? {
                                    y: -800,
                                    x: (Math.random() - 0.5) * 200,
                                    rotate: (Math.random() - 0.5) * 90,
                                    opacity: 0,
                                    scale: 0.8,
                                } : {
                                    opacity: 1,
                                    rotate: pos.rotate,
                                }}
                                animate={{
                                    y: 0,
                                    x: 0,
                                    rotate: pos.rotate,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    y: 100,
                                }}
                                transition={{
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 60,
                                    mass: 1.2,
                                    duration: photo.isNew ? 2.5 : 0.5,
                                }}
                                onAnimationComplete={() => {
                                    if (photo.isNew) {
                                        setPhotos((prev) =>
                                            prev.map((p) =>
                                                p.id === photo.id ? { ...p, isNew: false } : p
                                            )
                                        );
                                    }
                                }}
                            >
                                <div className="bg-white p-3 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform cursor-pointer border border-gray-100 w-48 md:w-56">
                                    <div className="aspect-square w-full overflow-hidden bg-gray-100 mb-3">
                                        <img
                                            src={photo.url}
                                            alt={photo.caption || 'Wedding Photo'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center px-1">
                                        {photo.uploader && (
                                            <p className="text-gray-800 font-bold text-sm font-zen truncate mb-1">
                                                {photo.uploader}
                                            </p>
                                        )}
                                        {photo.caption && (
                                            <p className="text-gray-500 text-xs font-shippori break-words leading-relaxed line-clamp-2">
                                                {photo.caption}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Empty State */}
                {photos.length === 0 && !spotlightPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center opacity-50">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                                className="text-6xl mb-4"
                            >
                                📸
                            </motion.div>
                            <p className="text-gray-400 text-xl font-zen">
                                写真を待っています...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Spotlight Overlay */}
            <AnimatePresence>
                {spotlightPhoto && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: ['#F39800', '#2E7BF4', '#FFD700', '#FF69B4'][i % 4],
                                        left: '50%',
                                        top: '50%',
                                    }}
                                    initial={{ scale: 0, x: 0, y: 0 }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        x: (Math.random() - 0.5) * 800,
                                        y: (Math.random() - 0.5) * 800,
                                        rotate: Math.random() * 360,
                                    }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeOut",
                                        delay: 0.2,
                                    }}
                                />
                            ))}
                        </div>

                        <motion.div
                            className="bg-white p-4 pb-6 shadow-2xl rounded-sm max-w-2xl w-[90%] md:w-auto transform rotate-[-2deg]"
                            initial={{ scale: 0.5, opacity: 0, y: 100, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0, rotate: -2 }}
                            exit={{ scale: 0.5, opacity: 0, y: -100, rotate: -10 }}
                            transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        >
                            <div className="aspect-square w-full md:w-[500px] overflow-hidden bg-gray-100 mb-4">
                                <img
                                    src={spotlightPhoto.url}
                                    alt="New Photo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <p className="text-2xl font-bold text-gray-800 mb-2 font-zen">
                                        {spotlightPhoto.uploader || 'Guest'}
                                    </p>
                                    <p className="text-lg text-gray-600 font-shippori">
                                        {spotlightPhoto.caption}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sound Effect Audio */}
            <audio
                ref={audioRef}
                src={`${import.meta.env.BASE_URL}shutter.mp3`}
                preload="auto"
            />
        </div>
    );
};

export default PhotoShower;

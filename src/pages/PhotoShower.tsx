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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Store positions to prevent re-randomization on render
    const positionsRef = useRef<Record<number, { x: string; y: string; rotate: number }>>({});

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

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('photos-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'photos' },
                (payload: RealtimePostgresInsertPayload<Photo>) => {
                    const newPhoto = { ...payload.new, isNew: true } as Photo;
                    setPhotos((prev) => [newPhoto, ...prev].slice(0, 100)); // Keep max 100 photos

                    // Play sound effect
                    if (audioRef.current && !isMuted) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(() => { });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isMuted]);

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

    // Get or create position for a photo
    const getPosition = (id: number, index: number) => {
        if (!positionsRef.current[id]) {
            // Create a grid-like scattered layout
            const cols = 6; // Increased columns for better spread
            const row = Math.floor(index / cols);
            const col = index % cols;

            const baseX = (col / cols) * 80 + 5; // 5-85%
            const baseY = (row % 4) * 20 + 10; // Rows wrap around

            // Add randomness
            const randomX = baseX + (Math.random() - 0.5) * 15;
            const randomY = baseY + (Math.random() - 0.5) * 10;

            positionsRef.current[id] = {
                x: `${Math.max(2, Math.min(88, randomX))}%`,
                y: `${Math.max(5, Math.min(80, randomY))}%`,
                rotate: (Math.random() - 0.5) * 30, // Increased rotation for messier look
            };
        }
        return positionsRef.current[id];
    };

    const uploadUrl = `${window.location.origin}${import.meta.env.BASE_URL}photo`;

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#fdfbf7] text-gray-800 overflow-hidden relative font-zen"
        >
            {/* Background Particles (Subtle) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
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
                                    y: -800, // Start higher up
                                    x: (Math.random() - 0.5) * 200, // Random horizontal start
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
                                    duration: photo.isNew ? 2.5 : 0.5, // Slower fall
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
                                {/* Polaroid Frame */}
                                <div className="bg-white p-3 pb-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform cursor-pointer border border-gray-100 w-48 md:w-56"
                                    style={{
                                        boxShadow: photo.isNew
                                            ? '0 0 30px rgba(243, 152, 0, 0.3), 0 20px 50px rgba(0,0,0,0.2)'
                                            : '0 10px 30px rgba(0,0,0,0.15)',
                                    }}
                                >
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
                                        {!photo.uploader && !photo.caption && (
                                            <p className="text-gray-300 text-xs font-serif italic">
                                                Thank you
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* New Photo Glow Effect */}
                                {photo.isNew && (
                                    <motion.div
                                        className="absolute inset-0 bg-white/50 rounded-lg pointer-events-none mix-blend-overlay"
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 0 }}
                                        transition={{ duration: 1.5 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Empty State */}
                {photos.length === 0 && (
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

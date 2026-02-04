import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, X } from 'lucide-react';
import guestsData from '../data/guests.json';
import { useState, useEffect, useMemo } from 'react';

const SeatingChart = () => {
    const { mainTableGuests, cheeringGuests, tables } = useMemo(() => {
        // @ts-ignore
        const main = guestsData.filter(g => g.participation === '本人');
        // @ts-ignore
        const cheering = guestsData.filter(g => g.participation === '応援席');
        // @ts-ignore
        const regular = guestsData.filter(g => g.participation === '出席' || !g.participation);

        const grouped = regular.reduce((acc, guest) => {
            // @ts-ignore - group field exists in updated JSON
            const group = guest.group || "Other";
            if (!acc[group]) acc[group] = [];
            acc[group].push(guest);
            return acc;
        }, {} as Record<string, typeof guestsData>);

        // Sort guests within each group by tableOrder
        Object.keys(grouped).forEach(group => {
            grouped[group].sort((a, b) => {
                // @ts-ignore - tableOrder field exists
                const orderA = parseInt(a.tableOrder || "0", 10);
                // @ts-ignore
                const orderB = parseInt(b.tableOrder || "0", 10);
                return orderA - orderB;
            });
        });

        return { mainTableGuests: main, cheeringGuests: cheering, tables: grouped };
    }, []);

    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showMiniature, setShowMiniature] = useState(false);
    const [isSlideshowMode, setIsSlideshowMode] = useState(false);
    const [slideshowProgress, setSlideshowProgress] = useState(0); // 0: cycling pickup, 1: showing all, 2: transitioning
    const tablesCount = Object.keys(tables).length;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const params = new URLSearchParams(location.search);
        if (params.get('slideshow') === 'true') {
            setIsSlideshowMode(true);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, [location.search]);

    // Periodic animation for mobile view
    useEffect(() => {
        if (!isMobile) return;

        const interval = setInterval(() => {
            setShowMiniature(prev => !prev);
        }, 5000); // Toggle every 5 seconds

        return () => clearInterval(interval);
    }, [isMobile]);

    // Pickup Table Carousel State
    const [pickupIndex, setPickupIndex] = useState(0);

    useEffect(() => {
        const intervalTime = isSlideshowMode ? 5000 : 6000;
        const interval = setInterval(() => {
            setPickupIndex(prev => {
                const next = (prev + 1) % tablesCount;
                if (isSlideshowMode && next === 0) {
                    // We've cycled through all tables
                    setSlideshowProgress(1);
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [tables, isSlideshowMode, tablesCount]);

    // Slideshow overall transition
    useEffect(() => {
        if (!isSlideshowMode || slideshowProgress === 0) return;

        if (slideshowProgress === 1) {
            // Show full grid for 10 seconds before moving to next page
            const timer = setTimeout(() => {
                navigate('/comments?slideshow=true');
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isSlideshowMode, slideshowProgress, navigate]);

    // Time-based link lock: Links DISABLED only during March 21, 2026 00:00 - 16:20 JST
    const LOCK_START = new Date('2026-03-21T00:00:00+09:00');
    const LOCK_END = new Date('2026-03-21T16:20:00+09:00');

    const checkLinksEnabled = () => {
        const now = Date.now();
        // Links are disabled if within the lock window
        return now < LOCK_START.getTime() || now >= LOCK_END.getTime();
    };

    const [isLinksEnabled, setIsLinksEnabled] = useState(checkLinksEnabled);

    useEffect(() => {
        // Check periodically in case page is open when lock window starts/ends
        const checkUnlock = () => {
            setIsLinksEnabled(checkLinksEnabled());
        };

        // Check every minute
        const interval = setInterval(checkUnlock, 60000);
        checkUnlock(); // Also check immediately

        return () => clearInterval(interval);
    }, []);

    const handleTableClick = (groupName: string) => {
        if (isMobile) {
            setSelectedTable(groupName);
        }
    };

    const closeOverlay = () => {
        setSelectedTable(null);
    };

    // In slideshow mode, render only the Pickup Table section fullscreen
    if (isSlideshowMode) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-serif mb-8 text-center text-[#F39800] flex items-center justify-center gap-4">
                        <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#F39800]"></span>
                        <span>Pickup Table</span>
                        <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#F39800]"></span>
                    </h2>

                    <div className="flex justify-center h-[700px] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {(() => {
                                const tableKeys = Object.keys(tables).sort();
                                const currentTableKey = tableKeys[pickupIndex];
                                const guests = tables[currentTableKey];

                                const TABLE_COLORS: Record<string, string> = {
                                    "A": "#d65b75", "B": "#f2a842", "C": "#6987cf",
                                    "D": "#cea1d1", "E": "#87bda2", "F": "#ffc2e8"
                                };
                                const baseColor = TABLE_COLORS[currentTableKey] || "#F39800";
                                const hexToRgb = (hex: string) => {
                                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
                                }
                                const rgb = hexToRgb(baseColor);
                                const bgStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : "rgba(255, 255, 255, 0.1)";

                                return (
                                    <motion.div
                                        key={currentTableKey}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute w-full max-w-3xl aspect-square flex items-center justify-center"
                                    >
                                        <div className="relative w-full h-full">
                                            <div
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 flex items-center justify-center z-0"
                                                style={{
                                                    borderColor: baseColor,
                                                    backgroundColor: bgStyle,
                                                    boxShadow: `0 0 60px ${baseColor}80`
                                                }}
                                            >
                                                <div className="text-center">
                                                    <span className="block text-lg text-gray-300 font-serif">Table</span>
                                                    <span className="block text-6xl font-serif font-bold" style={{ color: baseColor }}>{currentTableKey}</span>
                                                </div>
                                            </div>

                                            {guests.map((guest, index) => {
                                                const totalGuests = guests.length;
                                                const angleStep = (2 * Math.PI) / totalGuests;
                                                const startAngle = -Math.PI / 2;
                                                const angle = startAngle + index * angleStep;
                                                const radius = 240;
                                                const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                                const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

                                                return (
                                                    <div
                                                        key={guest.id}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 w-32 z-10"
                                                        style={{ left, top }}
                                                    >
                                                        <div className="text-sm font-bold" style={{ color: baseColor }}>
                                                            {guest.table}
                                                        </div>
                                                        <div
                                                            className="w-24 h-24 rounded-full overflow-hidden bg-black/40 shadow-xl"
                                                            style={{ borderColor: baseColor, borderWidth: '3px', borderStyle: 'solid' }}
                                                        >
                                                            {guest.image ? (
                                                                <img
                                                                    src={import.meta.env.BASE_URL + guest.image}
                                                                    alt={guest.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                    <Users size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center w-36">
                                                            <div className="text-base font-bold truncate w-full px-2 py-1 bg-black/60 rounded text-white backdrop-blur-sm">
                                                                {guest.name} {(guest as any).honorific || '様'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden p-4 md:p-8 pt-12">
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-2 md:px-8">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-4">
                        <Users className="text-[#F39800]" />
                        <span>席次表</span>
                    </h1>
                    <p className="text-[10px] md:text-xs text-gray-400 opacity-70">
                        {isLinksEnabled
                            ? "※顔写真をタップするとコメントを表示することができます"
                            : "※16:20 以降にゲストページへアクセスできます"
                        }
                    </p>
                </div>

                {/* Takasago (High Table) */}
                <div className="flex justify-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-8 shadow-2xl max-w-2xl w-full text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F39800] to-transparent opacity-50"></div>
                        <h2 className="text-xl md:text-2xl font-serif mb-8 text-white tracking-widest">Main Table</h2>
                        <div className="flex justify-center gap-4 md:gap-12 items-center">
                            {(() => {
                                // @ts-ignore
                                const groom = mainTableGuests.find(g => g.name.includes('宝本') || g.name.includes('大樹')) || { name: 'Daiki', image: null };
                                // @ts-ignore
                                const bride = mainTableGuests.find(g => g.name.includes('長谷川') || g.name.includes('真希')) || { name: 'Maki', image: null };

                                return (
                                    <>
                                        <div className="flex flex-col items-center gap-2 md:gap-4">
                                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#2E7BF4] shadow-[0_0_15px_rgba(46,123,244,0.3)] overflow-hidden">
                                                <img
                                                    // @ts-ignore
                                                    src={groom.image ? (import.meta.env.BASE_URL + groom.image) : `${import.meta.env.BASE_URL}daiki.png`}
                                                    alt={groom.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-base md:text-xl font-medium whitespace-nowrap">{groom.name.includes(' ') ? groom.name.split(' ')[1] : groom.name}</div>
                                        </div>
                                        <div className="text-[#F39800] text-xl md:text-2xl font-serif">&</div>
                                        <div className="flex flex-col items-center gap-2 md:gap-4">
                                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#ff69b4] shadow-[0_0_15px_rgba(255,105,180,0.3)] overflow-hidden">
                                                {/* @ts-ignore */}
                                                {bride.image ? (
                                                    <img
                                                        // @ts-ignore
                                                        src={import.meta.env.BASE_URL + bride.image}
                                                        alt={bride.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-pink-500/20 flex items-center justify-center">
                                                        <Users className="text-pink-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-base md:text-xl font-medium whitespace-nowrap">{bride.name.includes(' ') ? bride.name.split(' ')[1] : bride.name}</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>

                {/* Guest Tables Grid */}
                {/* Mobile: 3 columns, Compact. PC: 2/3 columns, Full. */}
                <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 lg:gap-16">
                    {Object.entries(tables).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, guests]) => {
                        // Define table colors
                        const TABLE_COLORS: Record<string, string> = {
                            "A": "#d65b75",
                            "B": "#f2a842",
                            "C": "#6987cf",
                            "D": "#cea1d1",
                            "E": "#87bda2",
                            "F": "#ffc2e8"
                        };

                        const baseColor = TABLE_COLORS[groupName] || "#F39800"; // Default to Orange if undefined

                        // Convert hex to RGB for background opacity
                        const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                                r: parseInt(result[1], 16),
                                g: parseInt(result[2], 16),
                                b: parseInt(result[3], 16)
                            } : null;
                        }
                        const rgb = hexToRgb(baseColor);
                        const bgStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)` : "rgba(255, 255, 255, 0.05)";


                        // We'll use inline styles for dynamic colors that Tailwind might not purge correctly if constructed dynamically
                        const cardStyle = {
                            backgroundColor: bgStyle,
                            borderColor: baseColor + '80', // 50% opacity
                        };

                        return (
                            <motion.div
                                key={groupName}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={cardStyle}
                                onClick={() => handleTableClick(groupName)}
                                className={`backdrop-blur-md border rounded-xl p-2 md:p-4 shadow-xl flex flex-col relative cursor-pointer md:cursor-default
                                    ${isMobile ? 'h-32 items-center justify-center' : 'h-[500px]'}
                                `}
                            >
                                {/* Circular Layout Container - Only visible on PC or if expanded (handled by overlay for mobile) */}
                                {!isMobile ? (
                                    <div id={`table-pc-${groupName}`} className="relative w-full h-full">
                                        {/* Center Table Label */}
                                        <div
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 flex items-center justify-center z-0"
                                            style={{
                                                borderColor: baseColor,
                                                backgroundColor: bgStyle,
                                                boxShadow: `0 0 20px ${baseColor}40`
                                            }}
                                        >
                                            <div className="text-center">
                                                <span className="block text-xs text-gray-400 font-serif">Table</span>
                                                <span className="block text-3xl font-serif font-bold" style={{ color: baseColor }}>{groupName}</span>
                                            </div>
                                        </div>

                                        {guests.map((guest, index) => {
                                            const totalGuests = guests.length;
                                            const angleStep = (2 * Math.PI) / totalGuests;
                                            const startAngle = -Math.PI / 2;
                                            const angle = startAngle + index * angleStep;
                                            const radius = 120;
                                            const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                            const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

                                            return isLinksEnabled ? (
                                                <Link
                                                    key={guest.id}
                                                    to={`/guest?id=${guest.id}`}
                                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group w-20 z-10"
                                                    style={{ left, top }}
                                                >
                                                    <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                        {guest.table}
                                                    </div>
                                                    <div
                                                        className="w-12 h-12 rounded-full overflow-hidden bg-black/40 border border-white/10 transition-all duration-300 group-hover:scale-110 group-hover:border-opacity-100 shadow-lg"
                                                        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = baseColor }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                                    >
                                                        {guest.image ? (
                                                            <img
                                                                src={import.meta.env.BASE_URL + guest.image}
                                                                alt={guest.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                <Users size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center w-28">
                                                        <div
                                                            className="text-xs font-medium truncate w-full px-1 transition-colors bg-black/20 rounded backdrop-blur-sm"
                                                            onMouseEnter={(e) => { e.currentTarget.style.color = baseColor }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.color = '' }}
                                                        >
                                                            {guest.name} {(guest as any).honorific || '様'}
                                                        </div>
                                                        {guest.title && (
                                                            <div className="text-[9px] text-gray-400 truncate mt-0.5">
                                                                {guest.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div
                                                    key={guest.id}
                                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 w-20 z-10 cursor-default"
                                                    style={{ left, top }}
                                                >
                                                    <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                        {guest.table}
                                                    </div>
                                                    <div
                                                        className="w-12 h-12 rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-lg"
                                                        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                                    >
                                                        {guest.image ? (
                                                            <img
                                                                src={import.meta.env.BASE_URL + guest.image}
                                                                alt={guest.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                <Users size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center w-28">
                                                        <div className="text-xs font-medium truncate w-full px-1 bg-black/20 rounded backdrop-blur-sm">
                                                            {guest.name} {(guest as any).honorific || '様'}
                                                        </div>
                                                        {guest.title && (
                                                            <div className="text-[9px] text-gray-400 truncate mt-0.5">
                                                                {guest.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Mobile Compact View (Animated)
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {!showMiniature ? (
                                                <motion.div
                                                    key="simple"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                >
                                                    <div
                                                        className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                                                        style={{
                                                            borderColor: baseColor,
                                                            backgroundColor: bgStyle,
                                                        }}
                                                    >
                                                        <div className="text-center">
                                                            <span className="block text-[10px] text-gray-400 font-serif">Table</span>
                                                            <span className="block text-xl font-serif font-bold" style={{ color: baseColor }}>{groupName}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="miniature"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8 }}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                >
                                                    {guests.map((guest, index) => {
                                                        const totalGuests = guests.length;
                                                        const angleStep = (2 * Math.PI) / totalGuests;
                                                        const startAngle = -Math.PI / 2;
                                                        const angle = startAngle + index * angleStep;
                                                        // Miniature radius - adjusted for 30px photos
                                                        const radius = 36;
                                                        const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                                        const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

                                                        return (
                                                            <div
                                                                key={guest.id}
                                                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[1px] w-[30px] z-10 pointer-events-none"
                                                                style={{ left, top }}
                                                            >
                                                                <div
                                                                    className="w-[30px] h-[30px] rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-sm"
                                                                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                                                >
                                                                    {guest.image ? (
                                                                        <img
                                                                            src={import.meta.env.BASE_URL + guest.image}
                                                                            alt={guest.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                            <Users size={14} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile Expanded Overlay */}
                <AnimatePresence>
                    {selectedTable && isMobile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                            onClick={closeOverlay}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="w-full max-w-sm aspect-square relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={closeOverlay}
                                    className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                                >
                                    <X size={24} />
                                </button>

                                {(() => {
                                    const guests = tables[selectedTable];
                                    const TABLE_COLORS: Record<string, string> = {
                                        "A": "#d65b75", "B": "#f2a842", "C": "#6987cf",
                                        "D": "#cea1d1", "E": "#87bda2", "F": "#ffc2e8"
                                    };
                                    const baseColor = TABLE_COLORS[selectedTable] || "#F39800";
                                    const hexToRgb = (hex: string) => {
                                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
                                    }
                                    const rgb = hexToRgb(baseColor);
                                    const bgStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : "rgba(255, 255, 255, 0.1)";

                                    return (
                                        <div className="relative w-full h-full bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
                                            style={{ borderColor: baseColor }}
                                        >
                                            {/* Center Label */}
                                            <div
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 flex items-center justify-center z-0"
                                                style={{
                                                    borderColor: baseColor,
                                                    backgroundColor: bgStyle,
                                                    boxShadow: `0 0 30px ${baseColor}60`
                                                }}
                                            >
                                                <div className="text-center">
                                                    <span className="block text-xs text-gray-400 font-serif">Table</span>
                                                    <span className="block text-4xl font-serif font-bold" style={{ color: baseColor }}>{selectedTable}</span>
                                                </div>
                                            </div>

                                            {/* Guests */}
                                            {guests.map((guest, index) => {
                                                const totalGuests = guests.length;
                                                const angleStep = (2 * Math.PI) / totalGuests;
                                                const startAngle = -Math.PI / 2;
                                                const angle = startAngle + index * angleStep;
                                                // Mobile overlay radius
                                                const radius = 130;
                                                const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                                const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

                                                return isLinksEnabled ? (
                                                    <Link
                                                        key={guest.id}
                                                        to={`/guest?id=${guest.id}`}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group w-20 z-10"
                                                        style={{ left, top }}
                                                    >
                                                        <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                            {guest.table}
                                                        </div>
                                                        <div
                                                            className="w-12 h-12 rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-lg"
                                                            style={{ borderColor: baseColor }}
                                                        >
                                                            {guest.image ? (
                                                                <img
                                                                    src={import.meta.env.BASE_URL + guest.image}
                                                                    alt={guest.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                    <Users size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center w-24">
                                                            <div className="text-xs font-medium truncate w-full px-1 bg-black/40 rounded text-white">
                                                                {guest.name} {(guest as any).honorific || '様'}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div
                                                        key={guest.id}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 w-20 z-10 cursor-default"
                                                        style={{ left, top }}
                                                    >
                                                        <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                            {guest.table}
                                                        </div>
                                                        <div
                                                            className="w-12 h-12 rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-lg"
                                                            style={{ borderColor: baseColor }}
                                                        >
                                                            {guest.image ? (
                                                                <img
                                                                    src={import.meta.env.BASE_URL + guest.image}
                                                                    alt={guest.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                    <Users size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center w-24">
                                                            <div className="text-xs font-medium truncate w-full px-1 bg-black/40 rounded text-white">
                                                                {guest.name} {(guest as any).honorific || '様'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pickup Table Section */}
                <div className="mt-24 mb-16">
                    <h2 className="text-2xl font-serif mb-8 text-center text-[#F39800] flex items-center justify-center gap-4">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#F39800]"></span>
                        <span>Pickup Table</span>
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#F39800]"></span>
                    </h2>

                    <div className="flex justify-center h-[400px] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {(() => {
                                const tableKeys = Object.keys(tables).sort();
                                const currentTableKey = tableKeys[pickupIndex];
                                const guests = tables[currentTableKey];

                                // Define table colors (reused)
                                const TABLE_COLORS: Record<string, string> = {
                                    "A": "#d65b75", "B": "#f2a842", "C": "#6987cf",
                                    "D": "#cea1d1", "E": "#87bda2", "F": "#ffc2e8"
                                };
                                const baseColor = TABLE_COLORS[currentTableKey] || "#F39800";
                                const hexToRgb = (hex: string) => {
                                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
                                }
                                const rgb = hexToRgb(baseColor);
                                const bgStyle = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : "rgba(255, 255, 255, 0.1)";

                                return (
                                    <motion.div
                                        key={currentTableKey}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.8 }}
                                        className="absolute w-full max-w-md aspect-square flex items-center justify-center"
                                    >
                                        <div className="relative w-full h-full">
                                            {/* Center Label */}
                                            <div
                                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 flex items-center justify-center z-0"
                                                style={{
                                                    borderColor: baseColor,
                                                    backgroundColor: bgStyle,
                                                    boxShadow: `0 0 30px ${baseColor}60`
                                                }}
                                            >
                                                <div className="text-center">
                                                    <span className="block text-xs text-gray-400 font-serif">Table</span>
                                                    <span className="block text-4xl font-serif font-bold" style={{ color: baseColor }}>{currentTableKey}</span>
                                                </div>
                                            </div>

                                            {/* Guests */}
                                            {guests.map((guest, index) => {
                                                const totalGuests = guests.length;
                                                const angleStep = (2 * Math.PI) / totalGuests;
                                                const startAngle = -Math.PI / 2;
                                                const angle = startAngle + index * angleStep;
                                                const radius = 130;
                                                const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
                                                const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

                                                return isLinksEnabled ? (
                                                    <Link
                                                        key={guest.id}
                                                        to={`/guest?id=${guest.id}`}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group w-20 z-10"
                                                        style={{ left, top }}
                                                    >
                                                        <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                            {guest.table}
                                                        </div>
                                                        <div
                                                            className="w-14 h-14 rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-lg transition-transform duration-300"
                                                            style={{ borderColor: baseColor }}
                                                        >
                                                            {guest.image ? (
                                                                <img
                                                                    src={import.meta.env.BASE_URL + guest.image}
                                                                    alt={guest.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                    <Users size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center w-24">
                                                            <div className="text-xs font-medium truncate w-full px-1 bg-black/40 rounded text-white backdrop-blur-sm">
                                                                {guest.name} {(guest as any).honorific || '様'}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div
                                                        key={guest.id}
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 w-20 z-10 cursor-default"
                                                        style={{ left, top }}
                                                    >
                                                        <div className="text-[10px] font-bold" style={{ color: baseColor }}>
                                                            {guest.table}
                                                        </div>
                                                        <div
                                                            className="w-14 h-14 rounded-full overflow-hidden bg-black/40 border border-white/10 shadow-lg"
                                                            style={{ borderColor: baseColor }}
                                                        >
                                                            {guest.image ? (
                                                                <img
                                                                    src={import.meta.env.BASE_URL + guest.image}
                                                                    alt={guest.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                    <Users size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center w-24">
                                                            <div className="text-xs font-medium truncate w-full px-1 bg-black/40 rounded text-white backdrop-blur-sm">
                                                                {guest.name} {(guest as any).honorific || '様'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Cheering Seats Section */}
                {cheeringGuests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 mb-16"
                    >
                        <h2 className="text-2xl font-serif mb-8 text-center text-[#F39800] flex items-center justify-center gap-4">
                            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#F39800]"></span>
                            <span>応援席</span>
                            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#F39800]"></span>
                        </h2>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {cheeringGuests.map((guest) => (
                                    isLinksEnabled ? (
                                        <Link
                                            // @ts-ignore
                                            key={guest.id}
                                            // @ts-ignore
                                            to={`/guest?id=${guest.id}`}
                                            className="flex flex-col items-center gap-3 group"
                                        >
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 group-hover:border-[#F39800] group-hover:scale-110 transition-all duration-300 shadow-lg relative">
                                                {/* @ts-ignore */}
                                                {guest.image ? (
                                                    <img
                                                        // @ts-ignore
                                                        src={import.meta.env.BASE_URL + guest.image}
                                                        // @ts-ignore
                                                        alt={guest.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <Users size={24} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium text-sm group-hover:text-[#F39800] transition-colors">
                                                    {guest.name}
                                                </div>
                                                {/* @ts-ignore */}
                                                {guest.title && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {/* @ts-ignore */}
                                                        {guest.title}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ) : (
                                        <div
                                            // @ts-ignore
                                            key={guest.id}
                                            className="flex flex-col items-center gap-3 cursor-default"
                                        >
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 shadow-lg relative">
                                                {/* @ts-ignore */}
                                                {guest.image ? (
                                                    <img
                                                        // @ts-ignore
                                                        src={import.meta.env.BASE_URL + guest.image}
                                                        // @ts-ignore
                                                        alt={guest.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <Users size={24} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20"></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium text-sm">
                                                    {guest.name}
                                                </div>
                                                {/* @ts-ignore */}
                                                {guest.title && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {/* @ts-ignore */}
                                                        {guest.title}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SeatingChart;

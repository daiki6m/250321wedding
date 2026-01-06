import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import guestsData from '../data/guests.json';
// import { COLORS } from '../components/Shared';

const SeatingChart = () => {
    // Filter guests by type
    // @ts-ignore
    const mainTableGuests = guestsData.filter(g => g.participation === '本人');
    // @ts-ignore
    const cheeringGuests = guestsData.filter(g => g.participation === '応援席');
    // @ts-ignore
    // Fallback: If participation is missing, treat as '出席' (regular guest)
    const regularGuests = guestsData.filter(g => g.participation === '出席' || !g.participation);

    // Group regular guests by table group (A, B, C...)
    const tables = regularGuests.reduce((acc, guest) => {
        // @ts-ignore - group field exists in updated JSON
        const group = guest.group || "Other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(guest);
        return acc;
    }, {} as Record<string, typeof guestsData>);

    // Sort guests within each group by tableOrder
    Object.keys(tables).forEach(group => {
        tables[group].sort((a, b) => {
            // @ts-ignore - tableOrder field exists
            const orderA = parseInt(a.tableOrder || "0", 10);
            // @ts-ignore
            const orderB = parseInt(b.tableOrder || "0", 10);
            return orderA - orderB;
        });
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden p-8 pt-12">
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <h1 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-4">
                    <Users className="text-[#F39800]" />
                    <span>席次表</span>
                </h1>

                {/* Takasago (High Table) */}
                {/* Takasago (High Table) */}
                <div className="flex justify-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-2xl w-full text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F39800] to-transparent opacity-50"></div>
                        <h2 className="text-2xl font-serif mb-8 text-white tracking-widest">Main Table</h2>
                        <div className="flex justify-center gap-12 items-center">
                            {(() => {
                                // @ts-ignore
                                const groom = mainTableGuests.find(g => g.name.includes('宝本') || g.name.includes('大樹')) || { name: 'Daiki', image: null };
                                // @ts-ignore
                                const bride = mainTableGuests.find(g => g.name.includes('長谷川') || g.name.includes('真希')) || { name: 'Maki', image: null };

                                return (
                                    <>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 rounded-full border-2 border-[#2E7BF4] shadow-[0_0_15px_rgba(46,123,244,0.3)] overflow-hidden">
                                                <img
                                                    // @ts-ignore
                                                    src={groom.image ? (import.meta.env.BASE_URL + groom.image) : `${import.meta.env.BASE_URL}daiki.png`}
                                                    alt={groom.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-xl font-medium whitespace-nowrap">{groom.name.includes(' ') ? groom.name.split(' ')[1] : groom.name}</div>
                                        </div>
                                        <div className="text-[#F39800] text-2xl font-serif">&</div>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 rounded-full border-2 border-[#ff69b4] shadow-[0_0_15px_rgba(255,105,180,0.3)] overflow-hidden">
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
                                            <div className="text-xl font-medium whitespace-nowrap">{bride.name.includes(' ') ? bride.name.split(' ')[1] : bride.name}</div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>

                {/* Guest Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        const titleStyle = {
                            color: baseColor,
                            borderColor: baseColor + '80',
                        };

                        return (
                            <motion.div
                                key={groupName}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={cardStyle}
                                className={`backdrop-blur-md border rounded-xl p-4 shadow-xl flex flex-col h-full min-h-[400px]`}
                            >
                                <h2
                                    className={`text-xl font-serif mb-4 border-b pb-2 text-center`}
                                    style={titleStyle}
                                >
                                    Table {groupName}
                                </h2>

                                {/* 2-Column Grid for Guests */}
                                <div className="grid grid-cols-2 gap-3 flex-grow content-start">
                                    {guests.map((guest) => (
                                        <Link
                                            key={guest.id}
                                            to={`/guest?id=${guest.id}`}
                                            className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-2 transition-all duration-300 flex flex-col items-center gap-2 group h-full hover:border-opacity-100"
                                            style={{ borderColor: 'rgba(255,255,255,0.05)' }} // Default border
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = baseColor }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full overflow-hidden bg-black/20 border border-white/10 transition-colors"
                                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = baseColor }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
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
                                            <div className="text-center w-full">
                                                <div
                                                    className="text-sm font-medium truncate w-full px-1 transition-colors"
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = baseColor }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = '' }}
                                                >
                                                    {guest.name} 様
                                                </div>
                                                {guest.title && (
                                                    <div className="text-[10px] text-gray-400 truncate">
                                                        {guest.title}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                    {/* Fill empty slots to maintain grid structure if needed, or just let min-height handle it */}
                                    {[...Array(Math.max(0, 8 - guests.length))].map((_, i) => (
                                        <div key={`empty-${i}`} className="border border-white/5 rounded-lg p-2 flex items-center justify-center opacity-30">
                                            <span className="text-xs text-gray-600">Vacant</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
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

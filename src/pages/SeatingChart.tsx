import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import guestsData from '../data/guests.json';
// import { COLORS } from '../components/Shared';

const SeatingChart = () => {
    // Group guests by table group (A, B, C...)
    const tables = guestsData.reduce((acc, guest) => {
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(tables).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, guests]) => (
                        <motion.div
                            key={groupName}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 text-[#2E7BF4] border-b border-white/10 pb-2">
                                Table {groupName}
                            </h2>
                            <ul className="space-y-3">
                                {guests.map(guest => (
                                    <li key={guest.id}>
                                        <Link
                                            to={`/guest?id=${guest.id}`}
                                            className="block p-2 hover:bg-white/5 rounded transition-colors flex justify-between items-center group"
                                        >
                                            <span>{guest.name}</span>
                                            <span className="text-xs text-gray-500 group-hover:text-[#F39800] transition-colors">
                                                View
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SeatingChart;

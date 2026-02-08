import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Heart, Star } from 'lucide-react';
import guestsData from '../data/guests.json';

interface Guest {
    id: string;
    name: string;
    birthMonth: string;
    participation: string;
    image: string | null;
}

const BirthdayStats = () => {
    // Filter guests with valid participation (出席, 応援席, 本人)
    const validParticipation = ['出席', '応援席', '本人'];
    const allGuests = guestsData as Guest[];

    // Count by participation type
    const attendingGuests = allGuests.filter(g => g.participation === '出席' && g.birthMonth);
    const cheeringGuests = allGuests.filter(g => g.participation === '応援席' && g.birthMonth);
    const principalGuests = allGuests.filter(g => g.participation === '本人' && g.birthMonth);

    const filteredGuests = allGuests.filter(
        (guest) => validParticipation.includes(guest.participation) && guest.birthMonth
    );

    // Group guests by birth month
    const monthGroups: Record<string, Guest[]> = {};
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    // Initialize all months with empty arrays
    monthNames.forEach((_, i) => {
        monthGroups[String(i + 1)] = [];
    });

    // Add guests to their birth month
    filteredGuests.forEach((guest) => {
        const month = guest.birthMonth.toString();
        if (monthGroups[month]) {
            monthGroups[month].push(guest);
        }
    });

    // Count per month
    const monthCounts = Object.fromEntries(
        Object.entries(monthGroups).map(([k, v]) => [k, v.length])
    );

    // Find the maximum count for scaling
    const maxCount = Math.max(...Object.values(monthCounts), 1);

    // Find the months with most birthdays (handle ties)
    const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
    const topCount = sortedMonths[0][1];
    const topMonths = sortedMonths.filter(([_, count]) => count === topCount).map(([month]) => monthNames[parseInt(month) - 1]);
    const topMonthDisplay = topMonths.length > 1 ? topMonths.join('・') : topMonths[0];

    // Colors for each month
    const monthColors = [
        '#6B8DD6', // 1月 - 冬の青
        '#8B9FD9', // 2月 - 薄い青
        '#FF6B9D', // 3月 - コーラルピンク
        '#C084FC', // 4月 - 紫
        '#98D8AA', // 5月 - 新緑
        '#7FD8BE', // 6月 - ミント
        '#FFD93D', // 7月 - 夏の黄色
        '#FF8C42', // 8月 - オレンジ
        '#F39800', // 9月 - 濃いオレンジ
        '#E17055', // 10月 - 秋
        '#C44536', // 11月 - 赤茶
        '#4A90A4', // 12月 - 冬
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden p-6 md:p-8 pt-12">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#F39800]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-widest">
                        <span className="text-[#F39800]">B</span>IRTHDAY
                        <span className="text-[#2E7BF4]"> S</span>TATS
                    </h1>
                    <p className="text-gray-400 text-sm">ゲストの誕生月統計</p>
                </motion.div>

                {/* Summary Cards - Separated by participation type */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-4 gap-2 md:gap-3 mb-6"
                >
                    <div className="bg-white/5 backdrop-blur-md border border-[#2E7BF4]/30 rounded-xl p-3 text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-[#2E7BF4]" />
                        <p className="text-xl font-bold text-white">{attendingGuests.length}</p>
                        <p className="text-[10px] text-gray-400">出席</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-[#98D8AA]/30 rounded-xl p-3 text-center">
                        <Heart className="w-5 h-5 mx-auto mb-1 text-[#98D8AA]" />
                        <p className="text-xl font-bold text-white">{cheeringGuests.length}</p>
                        <p className="text-[10px] text-gray-400">応援席</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-[#d4749d]/30 rounded-xl p-3 text-center">
                        <Star className="w-5 h-5 mx-auto mb-1 text-[#d4749d]" />
                        <p className="text-xl font-bold text-white">{principalGuests.length}</p>
                        <p className="text-[10px] text-gray-400">新郎新婦</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-[#F39800]/30 rounded-xl p-3 text-center">
                        <BarChart3 className="w-5 h-5 mx-auto mb-1 text-[#F39800]" />
                        <p className="text-lg font-bold text-white leading-tight">{topMonthDisplay}</p>
                        <p className="text-[10px] text-gray-400">最多月({topCount}人)</p>
                    </div>
                </motion.div>

                {/* Bar Chart - Optimized for max 10 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6"
                >
                    <h2 className="text-base font-bold mb-3 text-center flex items-center justify-center gap-2">
                        <BarChart3 className="text-[#F39800]" size={18} />
                        誕生月分布
                    </h2>

                    {/* Chart with fixed scale for max 10 */}
                    <div className="relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 pr-2">
                            <span>{maxCount}</span>
                            <span>{Math.ceil(maxCount / 2)}</span>
                            <span>0</span>
                        </div>

                        {/* Chart bars */}
                        <div className="ml-6 flex items-end justify-between gap-1" style={{ height: '80px' }}>
                            {monthNames.map((name, index) => {
                                const count = monthCounts[String(index + 1)];
                                // Calculate height in pixels (max 72px for the bar)
                                const barHeight = maxCount > 0 ? Math.round((count / maxCount) * 72) : 0;

                                return (
                                    <div
                                        key={name}
                                        className="flex-1 flex flex-col items-center justify-end h-full"
                                    >
                                        {/* Count Label */}
                                        <span className="text-[10px] font-bold mb-1 text-white">
                                            {count > 0 ? count : ''}
                                        </span>

                                        {/* Bar */}
                                        <motion.div
                                            className="w-full rounded-t"
                                            style={{
                                                backgroundColor: count > 0 ? monthColors[index] : 'rgba(255,255,255,0.1)',
                                            }}
                                            initial={{ height: 0 }}
                                            animate={{ height: count > 0 ? barHeight : 2 }}
                                            transition={{ delay: 0.3 + index * 0.02, duration: 0.4 }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Month Labels */}
                        <div className="ml-6 flex justify-between gap-1 mt-1">
                            {monthNames.map((name, index) => (
                                <div key={name} className="flex-1 text-center">
                                    <span
                                        className="text-[9px] font-medium"
                                        style={{ color: monthColors[index] }}
                                    >
                                        {name.replace('月', '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Monthly Guest Details with Photos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                >
                    <h2 className="text-base font-bold text-center mb-3">月別ゲスト一覧</h2>

                    {monthNames.map((name, index) => {
                        const guests = monthGroups[String(index + 1)];
                        if (guests.length === 0) return null;

                        return (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.03 }}
                                className="bg-white/5 backdrop-blur-md border rounded-xl p-3"
                                style={{ borderColor: `${monthColors[index]}40` }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="text-sm font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: `${monthColors[index]}25`, color: monthColors[index] }}
                                    >
                                        {name}
                                    </span>
                                    <span className="text-gray-500 text-xs">{guests.length}名</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {guests.map((guest) => (
                                        <Link
                                            key={guest.id}
                                            to={`/guest?id=${guest.id}`}
                                            className="flex flex-col items-center gap-0.5 group transition-transform hover:scale-110"
                                        >
                                            <div
                                                className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 transition-all group-hover:shadow-lg group-hover:shadow-white/20"
                                                style={{ borderColor: monthColors[index] }}
                                            >
                                                {guest.image ? (
                                                    <img
                                                        src={`${import.meta.env.BASE_URL}${guest.image}`}
                                                        alt={guest.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                                                        style={{ backgroundColor: monthColors[index] }}
                                                    >
                                                        {guest.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-gray-400 text-center max-w-[50px] truncate">
                                                {guest.name.split(' ')[0]}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Quiz Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-600 text-xs italic">
                        💡 クイズの答え合わせはできましたか？
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default BirthdayStats;

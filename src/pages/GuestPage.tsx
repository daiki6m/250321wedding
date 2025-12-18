import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gift } from 'lucide-react';
import guestsData from '../data/guests.json';
// import { COLORS, SectionHeading } from '../components/Shared';

const GuestPage = () => {
    const [searchParams] = useSearchParams();
    const guestId = searchParams.get('id');
    const guest = guestsData.find(g => g.id === guestId);

    if (!guest) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8">
                <p className="font-zen text-xl mb-8">ゲストが見つかりませんでした。</p>
                <Link to="/" className="text-[#F39800] underline">トップへ戻る</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#F39800] rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#2E7BF4] rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto p-8 pt-12">
                <Link to="/seating" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors">
                    <ArrowLeft size={20} />
                    <span>席次表に戻る</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl text-center"
                >
                    <div className="mb-8">

                        {guest.image && (
                            <div className="mb-6">
                                <img
                                    src={guest.image}
                                    alt={guest.name}
                                    className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-[#F39800]/20 shadow-lg"
                                />
                            </div>
                        )}
                        <p className="text-[#F39800] tracking-widest text-sm mb-2">WELCOME</p>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{guest.name}</h1>

                        {guest.title && (
                            <p className="text-gray-400 text-sm mb-4">{guest.title}</p>
                        )}

                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <div className="inline-block px-4 py-1 border border-[#2E7BF4]/50 rounded-full bg-[#2E7BF4]/10 text-[#2E7BF4] text-sm">
                                Table {guest.table}
                            </div>
                            {guest.relationship && (
                                <div className="inline-block px-4 py-1 border border-white/20 rounded-full bg-white/5 text-gray-300 text-sm">
                                    {guest.relationship}
                                </div>
                            )}
                            {guest.birthMonth && (
                                <div className="inline-block px-4 py-1 border border-[#F39800]/50 rounded-full bg-[#F39800]/10 text-[#F39800] text-sm">
                                    {guest.birthMonth}月生まれ
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

                    <div className="text-left leading-loose whitespace-pre-wrap font-shippori text-lg text-gray-200">
                        {guest.message}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10">
                        <Gift className="w-8 h-8 mx-auto mb-4 text-[#F39800]" />
                        <p className="text-sm text-gray-400">
                            本日はお越しいただき<br />本当にありがとうございます。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GuestPage;

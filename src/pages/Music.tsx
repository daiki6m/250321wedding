import { motion } from 'framer-motion';
import { Music as MusicIcon, ExternalLink, ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/Shared';

interface Song {
    title: string;
    artist: string;
    spotifyUrl?: string;
    category: string;
}

const songs: Song[] = [
    {
        title: "Universe",
        artist: "Official髭男dism",
        spotifyUrl: "https://open.spotify.com/track/17Y0t1VvXpYwYwYwYwYwYw",
        category: "入場"
    },
    {
        title: "115万キロのフィルム",
        artist: "Official髭男dism",
        spotifyUrl: "https://open.spotify.com/track/17Y0t1VvXpYwYwYwYwYwYw",
        category: "ケーキ入刀"
    },
    {
        title: "虹",
        artist: "菅田将暉",
        spotifyUrl: "https://open.spotify.com/track/17Y0t1VvXpYwYwYwYwYwYw",
        category: "中座"
    },
    {
        title: "家族になろうよ",
        artist: "福山雅治",
        spotifyUrl: "https://open.spotify.com/track/17Y0t1VvXpYwYwYwYwYwYw",
        category: "手紙・花束贈呈"
    },
    {
        title: "バンザイ 〜好きでよかった〜",
        artist: "ウルフルズ",
        spotifyUrl: "https://open.spotify.com/track/17Y0t1VvXpYwYwYwYwYwYw",
        category: "退場"
    }
];

const Music = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-zen tracking-widest text-sm">トップへ戻る</span>
                    </Link>
                </motion.div>

                <SectionHeading subtitle="Wedding Music">
                    当日使用曲リスト
                </SectionHeading>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <p className="text-center text-gray-400 font-shippori mb-12 leading-relaxed">
                        披露宴当日に使用する楽曲の一部をご紹介します。<br />
                        Spotifyのリンクから試聴も可能です。
                    </p>

                    <div className="grid gap-4">
                        {songs.map((song, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#F39800]/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#F39800]/10 flex items-center justify-center text-[#F39800]">
                                        <MusicIcon size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#F39800] font-bold tracking-widest mb-1 uppercase">
                                            {song.category}
                                        </div>
                                        <h3 className="text-xl font-zen font-bold text-white group-hover:text-[#F39800] transition-colors">
                                            {song.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-shippori">
                                            {song.artist}
                                        </p>
                                    </div>
                                </div>

                                {song.spotifyUrl && (
                                    <a
                                        href={song.spotifyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-white border border-[#1DB954]/30 rounded-full transition-all duration-300 text-sm font-bold"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        <span>Spotifyで聴く</span>
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 text-center"
                >
                    <p className="text-xs text-gray-500 tracking-[0.3em] uppercase">
                        Music makes everything better
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Music;

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/Shared';

interface Song {
    title: string;
    artist: string;
    youtubeUrl?: string;
    spotifyUrl?: string;
    category: string;
    artworkUrl: string;
}

const songs: Song[] = [
    {
        title: "Remember Me",
        artist: "MAN WITH A MISSION",
        youtubeUrl: "https://www.youtube.com/watch?v=bCt-jPWd4QE",
        spotifyUrl: "https://open.spotify.com/search/MAN%20WITH%20A%20MISSION%20Remember%20Me",
        category: "オープニングV",
        artworkUrl: "https://prtimes.jp/i/13546/2030/resize/d13546-2030-388005-1.jpg"
    },
    {
        title: "V-ROAD 2024 ver.",
        artist: "FUNKIST",
        youtubeUrl: "https://www.youtube.com/watch?v=0WKUPOVa-Wo",
        spotifyUrl: "https://open.spotify.com/search/FUNKIST%20V-ROAD",
        category: "入場",
        artworkUrl: "https://baseec-img-mng.akamaized.net/images/item/origin/71ad91741115bb50ce994f81718f4ebd.jpg?imformat=generic"
    },
    {
        title: "ひとりぼっちの晩餐会",
        artist: "美女と野獣 (ルミエール、ポット夫人 他)",
        youtubeUrl: "https://www.youtube.com/watch?v=54Gpo6iG0Lc",
        spotifyUrl: "https://open.spotify.com/search/Be%20Our%20Guest%20%E7%BE%8E%E5%A5%B3%E3%81%A8%E9%87%8E%E7%8D%A3",
        category: "乾杯",
        artworkUrl: "https://i3.gamebiz.jp/images/original/147083749760376e40b5a810011.jpg"
    },
    {
        title: "美女と野獣",
        artist: "美女と野獣 (ポット夫人 / 岩崎宏美)",
        youtubeUrl: "https://www.youtube.com/watch?v=kesedsq3NLo",
        spotifyUrl: "https://open.spotify.com/search/%E7%BE%8E%E5%A5%B3%E3%81%A8%E9%87%8E%E7%8D%A3%20%E5%B2%A9%E5%B4%8E%E5%AE%8F%E7%BE%8E",
        category: "ケーキ入刀",
        artworkUrl: "https://i.ytimg.com/vi/kesedsq3NLo/maxresdefault.jpg"
    },
    {
        title: "UNFINISHED",
        artist: "the GazettE",
        youtubeUrl: "https://www.youtube.com/watch?v=PougFiKu0Gs",
        spotifyUrl: "https://open.spotify.com/search/the%20GazettE%20UNFINISHED",
        category: "新婦お色直し退場",
        artworkUrl: "https://i.ytimg.com/vi/PougFiKu0Gs/maxresdefault.jpg"
    },
    {
        title: "A Question Of Honor",
        artist: "Sarah Brightman",
        youtubeUrl: "https://www.youtube.com/watch?v=QBQlcq_HSdg",
        spotifyUrl: "https://open.spotify.com/search/Sarah%20Brightman%20A%20Question%20Of%20Honor",
        category: "新郎お色直し退場",
        artworkUrl: "https://i.ytimg.com/vi/QBQlcq_HSdg/maxresdefault.jpg"
    },
    {
        title: "Nobody's HOME",
        artist: "ONE OK ROCK",
        youtubeUrl: "https://www.youtube.com/watch?v=hzvd2y6bzqs",
        spotifyUrl: "https://open.spotify.com/search/ONE%20OK%20ROCK%20Nobody%27s%20home",
        category: "プロフィールV (新郎側)",
        artworkUrl: "https://livedoor.blogimg.jp/kruchoro-1ok/imgs/1/9/195d0969.jpg"
    },
    {
        title: "誕生日でも結婚式でも使える歌",
        artist: "ゴールデンボンバー",
        youtubeUrl: "https://www.youtube.com/watch?v=elQw5Hct7SM",
        spotifyUrl: "https://open.spotify.com/search/%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%87%E3%83%B3%E3%83%9C%E3%83%B3%E3%83%90%E3%83%BC%20%E8%AA%95%E7%94%9F%E6%97%A5%E3%81%A7%E3%82%82%E7%B5%90%E5%A9%9A%E5%BC%8F%E3%81%A7%E3%82%82%E4%BD%BF%E3%81%88%E3%82%8B%E6%AD%8C",
        category: "プロフィールV (新婦側)",
        artworkUrl: "https://ogre.natalie.mu/media/news/music/2017/1229/goldenbomber_art201712.jpg?impolicy=m&imwidth=750&imdensity=1"
    },
    {
        title: "A Thousand Miles",
        artist: "Vanessa Carlton",
        youtubeUrl: "https://www.youtube.com/watch?v=Cwkej79U3ek",
        spotifyUrl: "https://open.spotify.com/search/Vanessa%20Carlton%20A%20Thousand%20Miles",
        category: "プロフィールV (二人)",
        artworkUrl: "https://i.ytimg.com/vi/Cwkej79U3ek/maxresdefault.jpg"
    },
    {
        title: "強いぞガストン",
        artist: "美女と野獣 (ル・フウ、ガストン 他)",
        youtubeUrl: "https://www.youtube.com/watch?v=XqKfW9eL8oc",
        spotifyUrl: "https://open.spotify.com/search/%E5%BC%B7%E3%81%84%E3%81%9E%E3%82%AC%E3%82%B9%E3%83%88%E3%83%B3%20%E7%BE%8E%E5%A5%B3%E3%81%A8%E9%87%8E%E7%8D%A3",
        category: "新郎新婦クイズ",
        artworkUrl: "https://content-jp.umgi.net/products/uw/UWCD-8105_mKB_extralarge.jpg?19022020013730"
    },
    {
        title: "愛の芽生え",
        artist: "美女と野獣 (ベル、野獣 他)",
        youtubeUrl: "https://www.youtube.com/watch?v=TeQLgZGz7cs",
        spotifyUrl: "https://open.spotify.com/search/%E6%84%9B%E3%81%AE%E8%8A%BD%E7%94%9F%E3%81%88%20%E7%BE%8E%E5%A5%B3%E3%81%A8%E9%87%8E%E7%8D%A3",
        category: "再入場",
        artworkUrl: "https://content-jp.umgi.net/products/uw/UWCD-8105_mKB_extralarge.jpg?19022020013730"
    },
    {
        title: "輝く未来",
        artist: "塔の上のラプンツェル",
        youtubeUrl: "https://www.youtube.com/watch?v=T216hcAd-Dg",
        spotifyUrl: "https://open.spotify.com/search/%E8%BC%9D%E3%81%8F%E6%9C%AA%E6%9D%A5%20%E3%83%A9%E3%83%97%E3%83%B3%E3%83%84%E3%82%A7%E3%83%AB",
        category: "花束・記念品贈呈",
        artworkUrl: "https://i.ytimg.com/vi/T216hcAd-Dg/maxresdefault.jpg"
    },
    {
        title: "A Brand New Day",
        artist: "D",
        youtubeUrl: "https://www.youtube.com/watch?v=rsn3K6MwzxA",
        spotifyUrl: "https://open.spotify.com/search/D%20A%20Brand%20New%20Day",
        category: "エンドロールV",
        artworkUrl: `${import.meta.env.BASE_URL}a-brand-new-day.png`
    },
    {
        title: "ザ・グロウ",
        artist: "シャノン・サンダース (ディズニープリンセス・ベスト)",
        youtubeUrl: "https://www.youtube.com/watch?v=FDUwls5lbf4",
        spotifyUrl: "https://open.spotify.com/search/%E3%82%B6%E3%83%BB%E3%82%B0%E3%83%AD%E3%82%A6%20%E3%82%B7%E3%83%A3%E3%83%8E%E3%83%B3%E3%82%B5%E3%83%B3%E3%83%80%E3%83%BC%E3%82%B9",
        category: "退場",
        artworkUrl: "https://i.ytimg.com/vi/FDUwls5lbf4/maxresdefault.jpg"
    }
];

const YouTubeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

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
                        披露宴当日に使用する楽曲をご紹介します。<br />
                        各リンクから試聴も可能です。
                    </p>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F39800]/0 via-[#F39800]/50 to-[#F39800]/0 md:-translate-x-1/2" />

                        <div className="space-y-12">
                            {songs.map((song, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ delay: 0.1 }}
                                        className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                            }`}
                                    >
                                        {/* Timeline Dot */}
                                        <div
                                            className="absolute left-4 md:left-1/2 top-8 w-4 h-4 rounded-full bg-[#F39800] shadow-[0_0_10px_#F39800] -translate-x-[7px] md:-translate-x-1/2 z-10"
                                        />

                                        {/* Content Card */}
                                        <div className={`flex-1 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'
                                            }`}>
                                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 hover:border-[#F39800]/30 transition-all duration-300 group">
                                                <div className={`flex flex-col md:flex-row gap-4 md:gap-6 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                                    }`}>
                                                    {/* Artwork */}
                                                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                                                        <img
                                                            src={song.artworkUrl}
                                                            alt={`${song.title} artwork`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>

                                                    {/* Info */}
                                                    <div className={`flex-1 flex flex-col gap-3 w-full ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'
                                                        }`}>
                                                        <div className="inline-block px-3 py-1 rounded-full bg-[#F39800]/10 text-[#F39800] text-xs font-bold tracking-widest uppercase">
                                                            {song.category}
                                                        </div>

                                                        <div>
                                                            <h3 className="text-xl font-zen font-bold text-white group-hover:text-[#F39800] transition-colors mb-1">
                                                                {song.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-400 font-shippori">
                                                                {song.artist}
                                                            </p>
                                                        </div>

                                                        <div className={`flex flex-wrap gap-3 mt-1 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                                                            }`}>
                                                            {song.youtubeUrl && (
                                                                <a
                                                                    href={song.youtubeUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/30 transition-all duration-300"
                                                                    title="YouTube"
                                                                >
                                                                    <YouTubeIcon className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                            {song.spotifyUrl && (
                                                                <a
                                                                    href={song.spotifyUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-white border border-[#1DB954]/30 transition-all duration-300"
                                                                    title="Spotify"
                                                                >
                                                                    <SpotifyIcon className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Spacer for alternating layout */}
                                        <div className="flex-1 hidden md:block" />
                                    </motion.div>
                                );
                            })}
                        </div>
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

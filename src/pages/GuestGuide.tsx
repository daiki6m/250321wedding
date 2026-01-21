import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Video, Car, MapPin, Building, ExternalLink, Download } from 'lucide-react';
import { SectionHeading, FontLink } from '../components/Shared';
import { motion, AnimatePresence } from 'framer-motion';

const GuestGuide = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);



    const videos = [
        { id: 'video1', title: '案内動画', url: 'https://www.youtube.com/embed/mvSfN6FSHoQ' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden pt-24 pb-20 px-4 md:px-6">
            <FontLink />

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <SectionHeading subtitle="参列者の方へ">会場案内</SectionHeading>

                <div className="space-y-16 mt-12">

                    {/* 1. Movies Section (Moved to top) */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <Video className="text-[#F39800]" size={24} />
                            <h2 className="text-2xl font-bold">案内動画</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((video) => (
                                <div key={video.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                                    <div className="aspect-video w-full relative">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={video.url}
                                            title={video.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute inset-0"
                                        ></iframe>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-gray-200">{video.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Documents Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <FileText className="text-[#F39800]" size={24} />
                            <h2 className="text-2xl font-bold">案内資料</h2>
                        </div>

                        <div className="flex justify-center mb-8">
                            <a
                                href="https://bot.talkappi.com/faq?facility_cd=nagasakistadiumcity-hotel-qa&member_id=b01a9ebb-e9b1-e8e0-763f-7d79bc79fabc&lang=ja&h=7&size=87.5%25"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <div className="bg-[#971D64] p-2 rounded-full text-white">
                                    <ExternalLink size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-400 tracking-widest uppercase">FAQ</p>
                                    <p className="text-sm font-bold text-white tracking-wider">
                                        ホテルでよくあるご質問については<br />
                                        こちらをクリック
                                    </p>
                                </div>
                            </a>
                        </div>
                        <div className="w-full max-w-md mx-auto aspect-[9/16] bg-white/5 rounded-xl overflow-hidden border border-white/10 relative">
                            <iframe
                                loading="lazy"
                                className="absolute inset-0 w-full h-full border-0 p-0 m-0"
                                src="https://www.canva.com/design/DAG-NgNoWCY/UzqQJkSILXR2Y4-GiTlIBQ/view?embed"
                                allowFullScreen
                                allow="fullscreen"
                            >
                            </iframe>
                        </div>

                        <div className="flex justify-center mt-6">
                            <a
                                href={`${import.meta.env.BASE_URL}スタジアムシティ案内図.pdf`}
                                download="スタジアムシティ案内図.pdf"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F39800] hover:bg-[#f2a842] text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Download size={20} />
                                <span>PDFをダウンロード</span>
                            </a>
                        </div>
                    </section>

                    {/* 3. Parking Section (Adapted from HotelParking.tsx) */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <Car className="text-[#F39800]" size={24} />
                            <h2 className="text-2xl font-bold">駐車場案内</h2>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                当日はホテル宿泊を予定しております。<br />
                                車でお越しの際は下記の駐車場をご利用ください。
                            </p>

                            <div className="space-y-12">
                                {/* Route to Entrance */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-[#D4A373] border-l-4 border-[#D4A373] pl-3">
                                        ホテル宿泊者専用入場口までのルート
                                    </h3>

                                    <div className="bg-black/30 p-2 rounded-xl border border-white/10 cursor-zoom-in max-w-2xl mx-auto" onClick={() => setSelectedImage(`${import.meta.env.BASE_URL}駐車場/ルート全体図.webp`)}>
                                        <img src={`${import.meta.env.BASE_URL}駐車場/ルート全体図.webp`} alt="ルート全体図" className="w-full h-auto rounded-lg" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { src: '駐車場/A1.webp', text: '八千代町交差点ガソリンスタンドを左折' },
                                            { src: '駐車場/A2.webp', text: '日本自動車連盟（JAF）長崎支店のある交差点を右折' },
                                            { src: '駐車場/B1.webp', text: '長崎県警察署のある交差点を左折' },
                                            { src: '駐車場/B2.webp', text: '日本自動車連盟(JAF)長崎支部のある交差点を左折' }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="cursor-zoom-in aspect-video overflow-hidden rounded-lg border border-white/10" onClick={() => setSelectedImage(`${import.meta.env.BASE_URL}${item.src}`)}>
                                                    <img src={`${import.meta.env.BASE_URL}${item.src}`} alt={`Route ${i}`} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs text-gray-400">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Route to Parking */}
                                <div className="space-y-6 pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-bold text-[#D4A373] border-l-4 border-[#D4A373] pl-3">
                                        ホテル宿泊者専用入場口から駐車場までのルート
                                    </h3>

                                    <div className="bg-black/30 p-2 rounded-xl border border-white/10 cursor-zoom-in max-w-2xl mx-auto" onClick={() => setSelectedImage(`${import.meta.env.BASE_URL}駐車場/駐車場マップ.webp`)}>
                                        <img src={`${import.meta.env.BASE_URL}駐車場/駐車場マップ.webp`} alt="駐車場マップ" className="w-full h-auto rounded-lg" />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            { src: '駐車場/1.webp', text: 'スタジアムシティホテル長崎が左手に見えるまで直進し、分岐を左' },
                                            { src: '駐車場/2.webp', text: '高架下を左折' },
                                            { src: '駐車場/3.webp', text: '右手に駐車場がございます' }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="cursor-zoom-in aspect-video overflow-hidden rounded-lg border border-white/10" onClick={() => setSelectedImage(`${import.meta.env.BASE_URL}${item.src}`)}>
                                                    <img src={`${import.meta.env.BASE_URL}${item.src}`} alt={`Step ${i}`} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs text-gray-400">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Floor Map Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <MapPin className="text-[#F39800]" size={24} />
                            <h2 className="text-2xl font-bold">フロアマップ</h2>
                        </div>
                        <div className="w-full bg-white/5 rounded-xl overflow-hidden border border-white/10" style={{ height: '60vh' }}>
                            <iframe
                                src="https://platinumaps.jp/d/nagasakistadiumcity?floor=2F&area=15"
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                title="Floor Map"
                            />
                        </div>
                    </section>

                    {/* 5. Hotel Information Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                            <Building className="text-[#F39800]" size={24} />
                            <h2 className="text-2xl font-bold">ホテル案内</h2>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-[#D4A373] mb-2">チェックイン / チェックアウト</h3>
                                <p className="text-gray-300">
                                    チェックイン: 15:00<br />
                                    チェックアウト: 11:00
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#D4A373] mb-2">朝食</h3>
                                <p className="text-gray-300">
                                    会場: ホテルレストラン<br />
                                    時間: 7:00 - 10:00 (L.O. 9:30)
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#D4A373] mb-2">アメニティ</h3>
                                <p className="text-gray-300">
                                    タオル、歯ブラシ、シャンプー、コンディショナー、ボディソープ、ドライヤー、ナイトウェア等をご用意しております。
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <a
                                    href="https://www.nagasakistadiumcity.com/stadiumcityhotel/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#2E7BF4] hover:text-[#4a8cf5] transition-colors"
                                >
                                    <span>ホテル公式サイト</span>
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            alt="拡大表示"
                            className="max-w-full max-h-screen object-contain rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestGuide;

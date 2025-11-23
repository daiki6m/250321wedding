import { FontLink } from '../components/Shared';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HotelParking() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-shippori pb-20">
            <FontLink />

            {/* Back Button */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm">戻る</span>
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] py-12 border-b border-white/10">
                <h1 className="text-center text-3xl md:text-4xl font-zen font-bold text-white mb-4">駐車場案内</h1>
                <p className="text-center text-sm md:text-base text-gray-300 max-w-2xl mx-auto px-6">
                    当日はホテル宿泊を予定しております。<br />
                    車でお越しの際は下記の駐車場をご利用ください。
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">

                {/* Route to Entrance Section */}
                <section className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-zen font-bold text-center text-[#D4A373] border-b border-white/10 pb-3">
                        ホテル宿泊者専用入場口までのルート
                    </h2>

                    {/* Main Route Map */}
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 cursor-zoom-in max-w-3xl mx-auto" onClick={() => setSelectedImage('/駐車場/ルート全体図.webp')}>
                        <img src="/駐車場/ルート全体図.webp" alt="ルート全体図" className="w-full h-auto rounded-lg" />
                    </div>

                    {/* Route A & B */}
                    <div className="space-y-4 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/A1.webp')}>
                                    <img src="/駐車場/A1.webp" alt="A-1" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                                </div>
                                <p className="text-xs text-gray-300">八千代町交差点ガソリンスタンドを左折</p>
                            </div>
                            <div className="space-y-2">
                                <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/A2.webp')}>
                                    <img src="/駐車場/A2.webp" alt="A-2" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                                </div>
                                <p className="text-xs text-gray-300">日本自動車連盟（JAF）長崎支店のある交差点を右折</p>
                            </div>
                            <div className="space-y-2">
                                <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/B1.webp')}>
                                    <img src="/駐車場/B1.webp" alt="B-1" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                                </div>
                                <p className="text-xs text-gray-300">長崎県警察署のある交差点を左折</p>
                            </div>
                            <div className="space-y-2">
                                <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/B2.webp')}>
                                    <img src="/駐車場/B2.webp" alt="B-2" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                                </div>
                                <p className="text-xs text-gray-300">日本自動車連盟(JAF)長崎支部のある交差点を左折</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Route from Entrance to Parking */}
                <section className="space-y-6 pt-6 border-t border-white/10">
                    <h2 className="text-xl md:text-2xl font-zen font-bold text-center text-[#D4A373] border-b border-white/10 pb-3">
                        ホテル宿泊者専用入場口から<br />駐車場までのルート
                    </h2>

                    {/* Parking Map */}
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 cursor-zoom-in max-w-3xl mx-auto" onClick={() => setSelectedImage('/駐車場/駐車場マップ.webp')}>
                        <img src="/駐車場/駐車場マップ.webp" alt="駐車場マップ" className="w-full h-auto rounded-lg" />
                    </div>

                    {/* Steps 1-3 */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <div className="space-y-2">
                            <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/1.webp')}>
                                <img src="/駐車場/1.webp" alt="ステップ1" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                            </div>
                            <p className="text-xs text-gray-300">スタジアムシティホテル長崎が左手に見えるまで直進し、分岐を左</p>
                        </div>
                        <div className="space-y-2">
                            <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/2.webp')}>
                                <img src="/駐車場/2.webp" alt="ステップ2" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                            </div>
                            <p className="text-xs text-gray-300">高架下を左折</p>
                        </div>
                        <div className="space-y-2">
                            <div className="cursor-zoom-in" onClick={() => setSelectedImage('/駐車場/3.webp')}>
                                <img src="/駐車場/3.webp" alt="ステップ3" className="w-full h-auto rounded-lg shadow-xl border border-white/10" />
                            </div>
                            <p className="text-xs text-gray-300">右手に駐車場がございます</p>
                        </div>
                    </div>
                </section>

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

            {/* Back to Top Button */}
            <div className="flex justify-center mt-12 mb-12">
                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-8 py-4 border border-white/30 rounded-full text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-zen tracking-widest">TOP PAGE</span>
                    </motion.button>
                </Link>
            </div>
        </div>
    );
}

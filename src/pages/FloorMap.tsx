import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const FloorMap = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#0a0a0a] min-h-screen pt-24 pb-12">
            {/* Header / Nav */}
            <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <Link to="/" className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-zen tracking-widest text-sm">BACK TO TOP</span>
                    </motion.div>
                </Link>
            </div>

            {/* Floor Map */}
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-3xl font-zen text-white text-center mb-8">フロアマップ</h1>
                <div className="w-full bg-black/50 rounded-sm overflow-hidden" style={{ height: '80vh' }}>
                    <iframe
                        src="https://platinumaps.jp/d/nagasakistadiumcity?floor=2F&area=15"
                        className="w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Floor Map"
                    />
                </div>
            </div>

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
};

export default FloorMap;

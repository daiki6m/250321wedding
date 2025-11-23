import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { SectionHeading } from '../components/Shared';

const Manga = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <section className="py-24 px-6 relative z-10 bg-black">
                    <div className="max-w-4xl mx-auto">
                        <SectionHeading subtitle="Manga">馴れ初め漫画</SectionHeading>
                        <p className="text-center text-gray-500 text-sm mb-8 font-shippori">
                            ※ 画像をタップすると拡大表示できます
                        </p>

                        <div className="space-y-8 mt-12">
                            {/* Title */}
                            <div className="w-full cursor-zoom-in" onClick={() => setSelectedImage("/漫画/title.png")}>
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src="/漫画/title.png"
                                    alt="Manga Title"
                                    className="w-full h-auto rounded-sm shadow-2xl"
                                />
                            </div>

                            {/* Page 1 */}
                            <div className="w-full cursor-zoom-in" onClick={() => setSelectedImage("/漫画/1page.png")}>
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src="/漫画/1page.png"
                                    alt="Manga Page 1"
                                    className="w-full h-auto rounded-sm shadow-2xl"
                                />
                            </div>

                            {/* Page 2 */}
                            <div className="w-full cursor-zoom-in" onClick={() => setSelectedImage("/漫画/2page.png")}>
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src="/漫画/2page.png"
                                    alt="Manga Page 2"
                                    className="w-full h-auto rounded-sm shadow-2xl"
                                />
                            </div>

                            {/* Page 3 */}
                            <div className="w-full cursor-zoom-in" onClick={() => setSelectedImage("/漫画/3page.png")}>
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src="/漫画/3page.png"
                                    alt="Manga Page 3"
                                    className="w-full h-auto rounded-sm shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <p className="text-gray-400 font-shippori">
                                To be continued...
                            </p>
                        </div>
                    </div>
                </section>
            </motion.div>

            <footer className="text-center py-12 text-gray-600 text-xs font-shippori">
                &copy; 2026 Daiki & Maki Wedding Gallery.
            </footer>

            {/* Image Modal */}
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

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            alt="Enlarged view"
                            className="max-w-full max-h-screen object-contain rounded-sm"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself? Actually user might want to close by clicking image too, but usually background. Let's keep it simple: click anywhere closes it, or maybe just background.
                        // Let's allow clicking image to do nothing, so user doesn't accidentally close when trying to pan/zoom (though this is simple modal).
                        // Actually, for simple lightbox, clicking anywhere usually closes or clicking image advances. Let's stick to background closes.
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Manga;

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import { SectionHeading } from '../components/Shared';
import { motion } from 'framer-motion';

const VideoPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const videos = [
        { id: 'video1', title: 'Opening Movie', url: 'https://www.youtube.com/embed/Sjer15l91B0' }, // Placeholder
        { id: 'video2', title: 'Profile Movie', url: 'https://www.youtube.com/embed/Sjer15l91B0' }, // Placeholder
        { id: 'video3', title: 'Endroll Movie', url: 'https://www.youtube.com/embed/Sjer15l91B0' }, // Placeholder
        { id: 'video4', title: 'Special Movie', url: 'https://www.youtube.com/embed/Sjer15l91B0' }, // Placeholder
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden pt-24 pb-12 px-6">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#2E7BF4]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span>トップへ戻る</span>
                </Link>

                <SectionHeading subtitle="Wedding Movies">ムービー</SectionHeading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {videos.map((video, index) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl"
                        >
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
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Video size={20} className="text-[#F39800]" />
                                    {video.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;

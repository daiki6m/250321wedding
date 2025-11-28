import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ThreeDGallery = () => {
    useEffect(() => {
        // Prevent scrolling on the body when game is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-black z-50">
            {/* Back Button Overlay */}
            <div className="absolute top-4 left-4 z-50">
                <Link to="/gallery">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-zen tracking-widest text-sm">BACK TO GALLERY</span>
                    </motion.button>
                </Link>
            </div>

            {/* 3D Gallery Iframe */}
            <iframe
                src={`${import.meta.env.BASE_URL}3Dgallery.html`}
                title="3D Gallery"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default ThreeDGallery;

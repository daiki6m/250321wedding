import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS } from '../components/Shared';

const DogSoccer = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#2e7d32] relative">
            {/* Back Button */}
            <Link to="/" className="fixed top-6 left-6 z-50">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                </motion.div>
            </Link>

            {/* Game Iframe */}
            <div className="w-full h-screen">
                <iframe
                    src={`${import.meta.env.BASE_URL}dog-soccer.html`}
                    title="Dog Soccer Striker"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        </div>
    );
};

export default DogSoccer;

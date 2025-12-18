import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { COLORS, FontLink, SakuraBackground, LoadingScreen } from './components/Shared';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Manga from './pages/Manga';
import HotelParking from './pages/HotelParking';
import FloorMap from './pages/FloorMap';
import DogSoccer from './pages/DogSoccer';
import ThreeDGallery from './pages/ThreeDGallery';
import GuestPage from './pages/GuestPage';
import SeatingChart from './pages/SeatingChart';

export default function App() {
    // Skip loading screen if on seating or guest pages
    const shouldShowLoading = !window.location.pathname.includes('/seating') && !window.location.pathname.includes('/guest');
    const [isLoading, setIsLoading] = useState(shouldShowLoading);

    if (isLoading) {
        return (
            <>
                <FontLink />
                <LoadingScreen onComplete={() => setIsLoading(false)} />
            </>
        );
    }

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <div className="bg-[#0a0a0a] min-h-screen relative overflow-hidden font-shippori text-gray-200 selection:text-white">
                <style>{`::selection { background: ${COLORS.ORANGE}; color: white; }`}</style>
                <style>{`
                    .writing-vertical-rl {
                        writing-mode: vertical-rl;
                        -webkit-writing-mode: vertical-rl;
                        -ms-writing-mode: tb-rl;
                    }
                    .text-orientation-upright {
                        text-orientation: upright;
                    }
                `}</style>

                <FontLink />
                <SakuraBackground />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/manga" element={<Manga />} />
                    <Route path="/hotel-parking" element={<HotelParking />} />
                    <Route path="/floormap" element={<FloorMap />} />
                    <Route path="/3d-gallery" element={<ThreeDGallery />} /> {/* Added 3D Gallery route */}
                    <Route path="/dog-soccer" element={<DogSoccer />} />
                    <Route path="/guest" element={<GuestPage />} />
                    <Route path="/seating" element={<SeatingChart />} />
                </Routes>
            </div>
        </Router>
    );
}

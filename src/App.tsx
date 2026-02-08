import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { COLORS, FontLink, SakuraBackground, LoadingScreen } from './components/Shared';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Manga from './pages/Manga';
import HotelParking from './pages/HotelParking';
import FloorMap from './pages/FloorMap';
import DogSoccer from './pages/DogSoccer';
import GuestGallery3D from './pages/GuestGallery3D';
import GuestPage from './pages/GuestPage';
import SeatingChart from './pages/SeatingChart';
import Music from './pages/Music';
import Timeline from './pages/Timeline';
import VideoPage from './pages/VideoPage';
import NewGallery from './pages/NewGallery';
import PhotoUpload from './pages/PhotoUpload';
import GuestComments from './pages/GuestComments';
import CommentForm from './pages/CommentForm';
import PhotoShower from './pages/PhotoShower';
import GuestGuide from './pages/GuestGuide';
import BirthdayStats from './pages/BirthdayStats';

export default function App() {
    // Skip loading screen if on seating, guest, or music pages
    const shouldShowLoading = !window.location.pathname.includes('/seating') && !window.location.pathname.includes('/guest') && !window.location.pathname.includes('/music') && !window.location.pathname.includes('/new-gallery') && !window.location.pathname.includes('/photo') && !window.location.pathname.includes('/guest-gallery-3d') && !window.location.pathname.includes('/comments') && !window.location.pathname.includes('/comment-form') && !window.location.pathname.includes('/guest-guide');
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
                    <Route path="/guest-gallery-3d" element={<GuestGallery3D />} /> {/* Renamed 3D Gallery route */}
                    <Route path="/dog-soccer" element={<DogSoccer />} />
                    <Route path="/guest" element={<GuestPage />} />
                    <Route path="/seating" element={<SeatingChart />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/video" element={<VideoPage />} />
                    <Route path="/new-gallery" element={<NewGallery />} />
                    <Route path="/photo" element={<PhotoUpload />} />
                    <Route path="/comments" element={<GuestComments />} />
                    <Route path="/comment-form" element={<CommentForm />} />
                    <Route path="/photo-shower" element={<PhotoShower />} />
                    <Route path="/guest-guide" element={<GuestGuide />} />
                    <Route path="/birthday-stats" element={<BirthdayStats />} />
                </Routes>
            </div>
        </Router>
    );
}

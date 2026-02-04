import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeading } from '../components/Shared';
import { supabase } from '../lib/supabase';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

type Comment = {
    id: string | number;
    name: string;
    message: string;
    type: 'DAY' | 'POST';
    image_url?: string;
    created_at?: string;
};

const GuestComments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [realtimeComments, setRealtimeComments] = useState<Comment[]>([]);
    const [isSlideshowMode, setIsSlideshowMode] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('slideshow') === 'true') {
            setIsSlideshowMode(true);
        }
    }, [location.search]);

    // Auto-scroll logic
    useEffect(() => {
        if (!isSlideshowMode) return;

        let hasNavigated = false;
        let lastTime = 0;
        const scrollSpeed = 2; // pixels per frame

        const goToNext = () => {
            if (hasNavigated) return;
            hasNavigated = true;
            navigate('/photo-shower?slideshow=true');
        };

        // Maximum 1 minute timeout
        const maxTimeout = setTimeout(goToNext, 60000);

        const performScroll = (time: number) => {
            if (hasNavigated) return;
            if (!lastTime) lastTime = time;
            const delta = time - lastTime;
            window.scrollBy(0, scrollSpeed * (delta / 16));
            lastTime = time;

            // Check if we reached the bottom
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
            if (isBottom) {
                // Wait at the bottom then transition
                setTimeout(goToNext, 5000);
                return;
            }
            requestAnimationFrame(performScroll);
        };

        // Delay start of scrolling by 3 seconds to let page load
        const startDelay = setTimeout(() => {
            // Scroll to top first
            window.scrollTo(0, 0);
            // Start scrolling after small delay
            setTimeout(() => {
                requestAnimationFrame(performScroll);
            }, 500);
        }, 3000);

        return () => {
            clearTimeout(startDelay);
            clearTimeout(maxTimeout);
        };
    }, [isSlideshowMode, navigate]);

    useEffect(() => {
        fetchComments();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload: RealtimePostgresInsertPayload<Comment>) => {
                const newComment = payload.new as Comment;
                setRealtimeComments((prev) => [newComment, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else if (data) {
            setRealtimeComments(data as Comment[]);
        }
    };

    // Split comments into Pre-Wedding and Wedding Day
    const WEDDING_DATE = new Date("2026-03-21T00:00:00+09:00");

    const preWeddingComments = realtimeComments.filter(comment => {
        const commentDate = new Date(comment.created_at || '');
        return commentDate < WEDDING_DATE;
    });

    const weddingDayComments = realtimeComments.filter(comment => {
        const commentDate = new Date(comment.created_at || '');
        return commentDate >= WEDDING_DATE;
    });

    // Tab State
    const [activeTab, setActiveTab] = useState<'WEDDING' | 'PRE'>('PRE');

    useEffect(() => {
        const switchDate = new Date("2026-03-21T16:00:00+09:00");
        const now = new Date();
        if (now >= switchDate) {
            setActiveTab('WEDDING');
        }
    }, []);

    const CommentSection = ({ comments }: { comments: Comment[] }) => (
        <div className="mb-16">
            {comments.length === 0 ? (
                <p className="text-center text-gray-500 font-shippori py-12">まだメッセージはありません</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-[#F39800]/30 transition-colors group"
                        >
                            {comment.image_url && (
                                <div className="w-full bg-black/20">
                                    <img
                                        src={comment.image_url}
                                        alt="Comment attachment"
                                        className="w-full h-auto max-h-[500px] object-contain"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F39800] to-[#2E7BF4] flex items-center justify-center text-white font-bold font-zen shrink-0">
                                        {comment.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-zen font-bold text-white mb-2 group-hover:text-[#F39800] transition-colors">
                                            {comment.name} <span className="text-xs font-normal text-gray-400 ml-2">様</span>
                                        </h3>
                                        <p className="text-gray-300 font-shippori leading-relaxed whitespace-pre-wrap">
                                            {comment.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2 font-mono">
                                            {new Date(comment.created_at || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 relative z-10">
            <SectionHeading subtitle="MESSAGES" iconType="paw">
                Guest Comments
            </SectionHeading>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-zen font-bold">トップへ戻る</span>
                    </Link>
                </div>

                <div className="flex justify-center mb-12">
                    <Link
                        to="/comment-form"
                        className="bg-gradient-to-r from-[#F39800] to-[#2E7BF4] text-white font-bold py-4 px-12 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-3"
                    >
                        <Send className="w-5 h-5" />
                        <span>メッセージを送る</span>
                    </Link>
                </div>

                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab('PRE')}
                        className={`px-6 py-3 rounded-full font-zen font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'PRE'
                            ? 'bg-white text-black shadow-lg scale-105'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>招待状メッセージ</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('WEDDING')}
                        className={`px-6 py-3 rounded-full font-zen font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'WEDDING'
                            ? 'bg-[#F39800] text-white shadow-lg scale-105'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>式当日</span>
                    </button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'WEDDING' ? (
                        <motion.div
                            key="wedding"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CommentSection
                                comments={weddingDayComments}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pre"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CommentSection
                                comments={preWeddingComments}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestComments;

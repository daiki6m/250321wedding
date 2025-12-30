import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Upload, X, Loader2, Download, Heart, Filter, Camera } from 'lucide-react';
import { SectionHeading } from '../components/Shared';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

type Photo = {
    id: number;
    url: string;
    caption?: string;
    uploader?: string;
    created_at: string;
};

const NewGallery = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [caption, setCaption] = useState('');
    const [uploaderName, setUploaderName] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [selectedUploader, setSelectedUploader] = useState<string>('All');
    const [isMobile, setIsMobile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate deterministic random style for each photo based on its ID
    const getStyle = (id: number) => {
        const seed = id * 9301 + 49297;
        const rotate = ((seed % 233280) / 233280) * 20 - 10; // -10deg to 10deg (slightly less than desktop)
        const x = isMobile ? ((seed % 1000) / 1000) * 20 - 10 : ((seed % 1000) / 1000) * 40 - 20; // -10px to 10px on mobile
        const y = isMobile ? ((seed % 500) / 500) * 20 - 10 : ((seed % 500) / 500) * 40 - 20; // -10px to 10px on mobile
        const delay = ((seed % 100) / 100) * 2; // Random delay for floating animation
        return { rotate, x, y, delay };
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Load saved name
        const savedName = localStorage.getItem('uploaderName');
        if (savedName) setUploaderName(savedName);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPhotos();

        // Real-time subscription
        const channel = supabase
            .channel('public:photos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
                const newPhoto = payload.new as Photo;
                setPhotos((prev) => [newPhoto, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPhotos = async () => {
        try {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPhotos(data);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const uniqueUploaders = useMemo(() => {
        const uploaders = photos.map(p => p.uploader).filter(Boolean) as string[];
        return ['All', ...Array.from(new Set(uploaders))];
    }, [photos]);

    const filteredPhotos = useMemo(() => {
        if (selectedUploader === 'All') return photos;
        return photos.filter(p => p.uploader === selectedUploader);
    }, [photos, selectedUploader]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadFiles(Array.from(e.target.files));
        }
    };

    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 1, // Target 1MB as requested
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error('Compression failed:', error);
            return file; // Fallback to original
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        setUploading(true);
        try {
            // Save name
            localStorage.setItem('uploaderName', uploaderName);

            for (const file of uploadFiles) {
                // 1. Compress
                const compressedFile = await compressImage(file);

                // 2. Upload to Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('wedding-photos')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                // 3. Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('wedding-photos')
                    .getPublicUrl(filePath);

                // 4. Insert DB
                const { error: dbError } = await supabase
                    .from('photos')
                    .insert([
                        {
                            url: publicUrl,
                            caption: caption, // Same caption for all batch (or could be empty)
                            uploader: uploaderName,
                        },
                    ]);

                if (dbError) throw dbError;
            }

            setUploadFiles([]);
            // Do not clear name and caption
            // setCaption('');
            // setUploaderName('');
            setIsUploadModalOpen(false);
            alert(`${uploadFiles.length}枚の写真が投稿されました！`);

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('アップロードに失敗しました。');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (photo: Photo) => {
        try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `wedding-photo-${photo.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(photo.url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-zen relative overflow-hidden pt-24 pb-20 px-4">
            {/* Background Decoration - Fun Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight + 100,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            y: -100,
                            rotate: Math.random() * 360,
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear",
                        }}
                        className="absolute text-[#F39800]/20"
                    >
                        {i % 3 === 0 ? <Heart size={24} fill="currentColor" /> : i % 3 === 1 ? <ImageIcon size={24} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 px-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors self-start md:self-center">
                        <ArrowLeft size={20} />
                        <span>トップへ戻る</span>
                    </Link>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <Link
                            to="/3d-gallery"
                            className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <ImageIcon size={24} className="text-[#F39800]" />
                            <span>3D空間で見る</span>
                        </Link>
                        <Link
                            to="/photo"
                            className="bg-gradient-to-r from-[#F39800] to-[#f2a842] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-[#F39800]/50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            <Camera size={24} />
                            <span>写真を投稿する</span>
                        </Link>
                    </div>
                </div>

                <SectionHeading subtitle="Photo Gallery">みんなでつくる<br />ギャラリー</SectionHeading>

                <div className="text-center mb-8 px-4">
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed bg-white/5 inline-block px-6 py-4 rounded-xl backdrop-blur-sm border border-white/10 break-keep">
                        スマホで撮影した写真を<br className="block md:hidden" />その場で共有してみてください！<br />
                        お名前や、コメントも<br className="block md:hidden" />残してくれると嬉しいです！
                    </p>
                </div>

                {/* Uploader Filter */}
                {uniqueUploaders.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 px-4 no-scrollbar justify-center">
                        <div className="flex items-center gap-2 text-gray-400 mr-2 shrink-0">
                            <Filter size={16} />
                            <span className="text-xs">Filter by:</span>
                        </div>
                        {uniqueUploaders.map((name) => (
                            <button
                                key={name}
                                onClick={() => setSelectedUploader(name)}
                                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${selectedUploader === name
                                    ? 'bg-[#F39800] text-white font-bold shadow-md'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                {name === 'All' ? 'すべて' : name}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <Loader2 className="animate-spin text-[#F39800]" size={40} />
                    </div>
                ) : (
                    <div className={`mt-8 pb-32 min-h-[50vh] flex flex-wrap justify-center content-start gap-6 md:gap-8 px-4`}>
                        <AnimatePresence mode='popLayout'>
                            {filteredPhotos.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full text-center text-gray-500 py-20"
                                >
                                    <p>写真が見つかりません。</p>
                                </motion.div>
                            ) : (
                                filteredPhotos.map((photo, index) => {
                                    const style = getStyle(photo.id);
                                    return (
                                        <motion.div
                                            key={photo.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: [style.y, style.y - 10, style.y],
                                                x: style.x,
                                                rotate: style.rotate
                                            }}
                                            transition={{
                                                y: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: style.delay
                                                },
                                                opacity: { duration: 0.5 },
                                                scale: { duration: 0.5 }
                                            }}
                                            whileHover={{
                                                scale: 1.1,
                                                zIndex: 50,
                                                rotate: 0,
                                                transition: { duration: 0.2 }
                                            }}
                                            className={`relative bg-white p-2 pb-6 shadow-xl cursor-pointer overflow-hidden w-[140px] md:w-[180px] md:pb-8 hover:shadow-2xl transition-shadow`}
                                            onClick={() => setSelectedPhoto(photo)}
                                            style={{
                                                transformOrigin: 'center center',
                                                zIndex: index % 10
                                            }}
                                        >
                                            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || 'Wedding Photo'}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            {(photo.caption || photo.uploader) && (
                                                <div className={`absolute bottom-1 left-1 right-1 text-center md:bottom-2 md:left-2 md:right-2`}>
                                                    <p className="text-gray-800 text-[10px] font-handwritten truncate leading-tight">
                                                        {photo.caption || photo.uploader}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl w-full bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                <div className="md:w-2/3 bg-black flex items-center justify-center">
                                    <img
                                        src={selectedPhoto.url}
                                        alt={selectedPhoto.caption}
                                        className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                                    />
                                </div>
                                <div className="md:w-1/3 p-8 flex flex-col justify-between bg-[#1a1a1a]">
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-[#F39800] flex items-center justify-center text-white font-bold">
                                                {selectedPhoto.uploader?.[0] || 'G'}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{selectedPhoto.uploader || 'ゲスト'}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(selectedPhoto.created_at).toLocaleString('ja-JP')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <p className="text-gray-300 leading-relaxed italic">
                                                {selectedPhoto.caption ? `"${selectedPhoto.caption}"` : 'コメントはありません'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-4">
                                        <button
                                            onClick={() => handleDownload(selectedPhoto)}
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={20} />
                                            <span>保存する</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsUploadModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6 text-center">写真を投稿する</h3>

                            <form onSubmit={handleUpload} className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {uploadFiles.slice(0, 6).map((file, i) => (
                                        <div key={i} className="relative aspect-square">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="h-full w-full object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                    {uploadFiles.length > 6 && (
                                        <div className="flex items-center justify-center bg-gray-800 rounded-lg text-xs text-gray-400">
                                            +{uploadFiles.length - 6}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">お名前フルネーム（必須）</label>
                                    <input
                                        type="text"
                                        value={uploaderName}
                                        onChange={(e) => setUploaderName(e.target.value)}
                                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#F39800] outline-none"
                                        placeholder="お名前フルネーム（必須）"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">コメント (任意)</label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#F39800] outline-none"
                                        placeholder="写真の思い出など..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="mt-4 py-3 rounded-full font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#F39800] to-[#f2a842] hover:scale-105 transition-all"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>アップロード中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} />
                                            <span>投稿する ({uploadFiles.length}枚)</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />
        </div>
    );
};

export default NewGallery;

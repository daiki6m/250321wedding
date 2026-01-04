import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, LayoutGrid, Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

const PhotoUpload = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [caption, setCaption] = useState('');
    const [uploaderName, setUploaderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedName = localStorage.getItem('uploaderName');
        if (savedName) setUploaderName(savedName);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!uploaderName) {
            alert('先にお名前を入力してください');
            return;
        }
        if (e.target.files && e.target.files.length > 0) {
            setUploadFiles(Array.from(e.target.files));
            setIsUploadModalOpen(true);
        }
    };

    const handleCameraClick = () => {
        if (!uploaderName) {
            alert('先にお名前を入力してください');
            // Focus the input if possible, or just alert
            return;
        }
        fileInputRef.current?.click();
    };

    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error('Compression failed:', error);
            return file;
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        setUploading(true);
        try {
            // Save name to localStorage
            localStorage.setItem('uploaderName', uploaderName);

            for (const file of uploadFiles) {
                const compressedFile = await compressImage(file);
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('wedding-photos')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('wedding-photos')
                    .getPublicUrl(filePath);

                const { error: dbError } = await supabase
                    .from('photos')
                    .insert([
                        {
                            url: publicUrl,
                            caption: caption,
                            uploader: uploaderName,
                        },
                    ]);

                if (dbError) throw dbError;
            }

            setUploadFiles([]);
            // Do NOT clear name and caption as requested
            // setCaption(''); 
            // setUploaderName('');
            setIsUploadModalOpen(false);
            alert(`${uploadFiles.length}枚の写真が投稿されました！\n続けて撮影できます。`);

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('アップロードに失敗しました。');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-zen relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-sm scale-110"
                style={{
                    backgroundImage: "url('https://www.nagasakistadiumcity.com/wp-content/themes/stadiumcity/images/top/front_top_sp.webp?20250422')",
                    filter: "blur(8px) brightness(0.6)"
                }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 py-8 h-full min-h-screen justify-between overflow-y-auto">

                <div className="w-full flex flex-col items-center gap-8 mt-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-xl tracking-[0.2em] font-light text-white/90 leading-relaxed">
                            みんなでつくる<br />ギャラリー
                        </h1>
                    </div>

                    {/* Step 1: Inputs */}
                    <div className="w-full space-y-4 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#F39800] text-white text-xs font-bold px-2 py-1 rounded">STEP 1</span>
                            <span className="text-sm font-bold">投稿者情報を入力</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    value={uploaderName}
                                    onChange={(e) => setUploaderName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#F39800] focus:bg-black/40 outline-none transition-all"
                                    placeholder="お名前フルネーム（必須）"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#F39800] focus:bg-black/40 outline-none transition-all"
                                    placeholder="コメント (任意・継続されます)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Camera */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#F39800] text-white text-xs font-bold px-2 py-1 rounded">STEP 2</span>
                            <span className="text-sm font-bold">写真を撮影・選択</span>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCameraClick}
                            className={`w-40 h-40 border-2 flex flex-col items-center justify-center gap-4 backdrop-blur-md shadow-2xl relative group overflow-hidden rounded-3xl transition-all ${uploaderName
                                ? 'border-white bg-white/10 cursor-pointer'
                                : 'border-white/30 bg-white/5 cursor-not-allowed opacity-50'
                                }`}
                        >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                            <Camera size={40} strokeWidth={1.5} />
                            <span className="text-sm tracking-[0.2em] font-light">TOUCH</span>
                        </motion.button>
                        <p className="text-xs text-gray-400">
                            ※お名前を入力するとボタンが押せます
                        </p>
                    </div>
                </div>

                {/* Bottom Link */}
                <Link
                    to="/new-gallery"
                    className="my-8 w-full max-w-xs bg-gradient-to-r from-[#F39800] to-[#f2a842] text-white py-4 rounded-full font-bold shadow-lg hover:shadow-[#F39800]/50 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                >
                    <LayoutGrid size={20} />
                    <span>全ての投稿を見る</span>
                </Link>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
            </div>

            {/* Upload Modal (Reused Logic) */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
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

                                <div className="text-center text-sm text-gray-400 mb-2">
                                    <p>{uploaderName ? `${uploaderName} さん` : 'ゲスト さん'}</p>
                                    <p className="text-xs opacity-70 mt-1">{caption}</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="mt-2 py-3 rounded-full font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#F39800] to-[#f2a842] hover:scale-105 transition-all"
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
        </div>
    );
};

export default PhotoUpload;

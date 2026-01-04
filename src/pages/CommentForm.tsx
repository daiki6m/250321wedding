import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

const CommentForm = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedName = localStorage.getItem('commenterName');
        if (savedName) setName(savedName);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setIsSubmitting(true);
        try {
            // Save name to localStorage
            localStorage.setItem('commenterName', name);

            let imageUrl = null;

            // Upload Image if selected
            if (selectedFile) {
                const compressedFile = await compressImage(selectedFile);
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `comment-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `comments/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('wedding-photos')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('wedding-photos')
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
            }

            const { error } = await supabase
                .from('comments')
                .insert([
                    {
                        name: name,
                        message: message,
                        type: 'DAY', // Default type, logic for splitting is in display
                        image_url: imageUrl
                    }
                ]);

            if (error) throw error;

            // Reset form but keep name
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsSuccess(true);

        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('コメントの送信に失敗しました。');
        } finally {
            setIsSubmitting(false);
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
                            お祝いメッセージ<br />を送る
                        </h1>
                    </div>

                    <div className="w-full space-y-6 bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">お名前</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#F39800] focus:bg-black/40 outline-none transition-all"
                                    placeholder="宝本大樹　（フルネーム）"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">メッセージ</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-black/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#F39800] focus:bg-black/40 outline-none transition-all h-32 resize-none"
                                    placeholder="お祝いのメッセージをご記入いただけますと幸いです"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">写真（任意）</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm border border-white/10">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>写真を選択</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            ref={fileInputRef}
                                        />
                                    </label>
                                    {selectedFile && (
                                        <span className="text-xs text-gray-400 truncate max-w-[150px]">
                                            {selectedFile.name}
                                        </span>
                                    )}
                                </div>
                                {previewUrl && (
                                    <div className="mt-4 relative w-full h-32 bg-black/50 rounded-lg overflow-hidden border border-white/10">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-[#F39800] to-[#2E7BF4] text-white font-bold py-4 rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>送信中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>メッセージを送信</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Link */}
                <Link
                    to="/comments"
                    className="my-8 w-full max-w-xs bg-white/10 backdrop-blur-md text-white py-4 rounded-full font-bold border border-white/20 shadow-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 group"
                >
                    <MessageSquare size={20} />
                    <span>コメント一覧に戻る</span>
                </Link>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {isSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-zen font-bold text-white mb-4">
                                Thank You!
                            </h3>
                            <p className="text-gray-300 mb-8">
                                メッセージを送信しました。<br />
                                温かいお言葉ありがとうございます。
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="w-full bg-gradient-to-r from-[#F39800] to-[#2E7BF4] text-white font-bold py-3 rounded-full transition-opacity hover:opacity-90"
                                >
                                    続けて送る
                                </button>
                                <Link
                                    to="/comments"
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition-colors block"
                                >
                                    一覧に戻る
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentForm;

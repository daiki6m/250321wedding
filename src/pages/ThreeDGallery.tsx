import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Download, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = {
    id: number;
    url: string;
    caption?: string;
    uploader?: string;
    created_at: string;
};

const ThreeDGallery = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const groupRef = useRef<THREE.Group | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Interaction state
    const isDragging = useRef(false);
    const previousMouseX = useRef(0);
    const rotationVelocity = useRef(0);
    const currentRotation = useRef(0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchPhotos();
        return () => window.removeEventListener('resize', checkMobile);
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

    useEffect(() => {
        if (loading || photos.length === 0 || !canvasRef.current) return;

        // Initialize Three.js
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = isMobile ? 20 : 25;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create Cylinder Group
        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        // Add Photos to Cylinder
        const radius = isMobile ? 12 : 18;
        const textureLoader = new THREE.TextureLoader();

        photos.forEach((photo, i) => {
            const angle = (i / photos.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * (isMobile ? 10 : 15); // Random vertical spread

            const geometry = new THREE.PlaneGeometry(isMobile ? 4 : 6, isMobile ? 4 : 6);

            // Placeholder texture
            const material = new THREE.MeshBasicMaterial({
                color: 0x333333,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.lookAt(0, y, 0); // Face the center
            mesh.rotateY(Math.PI); // Flip to face outward

            // Store photo data in userData for raycasting
            mesh.userData = { photo };

            group.add(mesh);

            // Load actual texture
            textureLoader.load(photo.url, (texture) => {
                mesh.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
            });
        });

        // Background Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 50;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xF39800,
            transparent: true,
            opacity: 0.5
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Animation Loop
        const animate = () => {
            if (!isDragging.current) {
                rotationVelocity.current *= 0.95; // Friction
                currentRotation.current += rotationVelocity.current;
            }

            if (groupRef.current) {
                groupRef.current.rotation.y = currentRotation.current;
            }

            // Subtle floating for photos
            group.children.forEach((child, i) => {
                if (child instanceof THREE.Mesh) {
                    child.position.y += Math.sin(Date.now() * 0.001 + i) * 0.005;
                }
            });

            particlesMesh.rotation.y += 0.001;

            renderer.render(scene, camera);
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Raycaster for clicking photos
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event: MouseEvent | TouchEvent) => {
            if (rotationVelocity.current > 0.01) return; // Don't click while spinning fast

            const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

            mouse.x = (clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(group.children);

            if (intersects.length > 0) {
                const clickedMesh = intersects[0].object as THREE.Mesh;
                setSelectedPhoto(clickedMesh.userData.photo);
            }
        };

        window.addEventListener('click', handleClick);

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, [loading, photos, isMobile]);

    // Interaction Handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        previousMouseX.current = e.clientX;
        rotationVelocity.current = 0;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        const deltaX = e.clientX - previousMouseX.current;
        previousMouseX.current = e.clientX;
        rotationVelocity.current = deltaX * 0.005;
        currentRotation.current += rotationVelocity.current;
    };

    const handlePointerUp = () => {
        isDragging.current = false;
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
            window.open(photo.url, '_blank');
        }
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-[#050505] text-white overflow-hidden font-zen"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            {/* UI Layer */}
            <div className="absolute inset-0 pointer-events-none p-6 md:p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start pointer-events-auto">
                    <Link to="/new-gallery" className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all flex items-center gap-2">
                        <ArrowLeft size={24} />
                        <span className="hidden md:inline pr-2">ギャラリーへ戻る</span>
                    </Link>
                    <div className="text-right">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">3D SPACE</h1>
                        <p className="text-[#F39800] text-sm md:text-base">Swipe to Explore</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-sm md:text-base text-gray-300">
                        {isMobile ? '左右にスワイプして回転' : 'ドラッグして空間を回転'}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50">
                    <Loader2 className="animate-spin text-[#F39800]" size={48} />
                    <p className="text-gray-400 animate-pulse">3D空間を生成中...</p>
                </div>
            )}

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
        </div>
    );
};

export default ThreeDGallery;

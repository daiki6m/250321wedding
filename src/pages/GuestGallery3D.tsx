import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { supabase } from '../lib/supabase';

type Photo = {
    id: number;
    url: string;
    caption?: string;
    uploader?: string;
    created_at: string;
};

const GuestGallery3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Three.js refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const groupRef = useRef<THREE.Group | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Interaction state
    const mousePos = useRef({ x: 0, y: 0 });
    const targetRotation = useRef({ x: 0, y: 0 });

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
        scene.background = new THREE.Color(0xfdfbf7); // Warm white background
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Dynamically adjust Z position based on aspect ratio to fit the heart
        const aspect = window.innerWidth / window.innerHeight;
        // Base distance for landscape is 50. For portrait, we need to move back.
        // Formula: distance = (width / 2) / (aspect * tan(FOV/2))
        // Simplified heuristic:
        camera.position.z = Math.max(50, 35 / aspect);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Create Group
        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        // Heart Shape Algorithm
        const textureLoader = new THREE.TextureLoader();

        // Helper to check if point is inside heart
        const isInsideHeart = (x: number, y: number) => {
            // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
            // Scale inputs to fit unit heart
            const s = 0.045;
            const nx = x * s;
            const ny = (y - 3) * s; // Offset y to center

            // Standard heart check
            if (Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny > 0) return false;

            // Explicit Wedge Cut for sharper top indentation
            // Cusp is roughly at world y = 25.2 (when ny = 1)
            // We reject points that are too high in the center
            // The "V" shape: y > CuspY + |x| * slope
            if (y > 15 && Math.abs(x) < 10) { // Only check top center area
                // Cusp at ~22. Adjust to taste.
                if (y > 22 + Math.abs(x) * 1.2) return false;
            }

            return true;
        };

        // Prepare display photos (duplicate if necessary)
        const TARGET_COUNT = 350; // Reduced from 450 for performance
        let displayPhotos = [...photos];
        if (displayPhotos.length > 0) {
            while (displayPhotos.length < TARGET_COUNT) {
                displayPhotos = [...displayPhotos, ...photos];
            }
            // Limit to a reasonable max
            if (displayPhotos.length > 400) {
                displayPhotos = displayPhotos.slice(0, 400);
            }
        }

        // Generate positions
        const positions: { x: number, y: number, z: number, rotation: number }[] = [];
        const count = displayPhotos.length;

        let attempts = 0;

        while (positions.length < count && attempts < 50000) {
            const x = (Math.random() - 0.5) * 45;
            const y = (Math.random() - 0.5) * 45 + 5;
            if (isInsideHeart(x, y)) {
                // Check minimum distance to avoid too much overlap
                let tooClose = false;
                for (const pos of positions) {
                    const dx = pos.x - x;
                    const dy = pos.y - y;
                    if (dx * dx + dy * dy < 1.2) {
                        tooClose = true;
                        break;
                    }
                }
                if (!tooClose) {
                    positions.push({
                        x,
                        y,
                        z: (Math.random() - 0.5) * 2,
                        rotation: (Math.random() - 0.5) * 0.2
                    });
                }
            }
            attempts++;
        }

        // Shared Geometries for Performance
        const size = isMobile ? 1.8 : 2.5;
        const photoGeometry = new THREE.PlaneGeometry(size, size);
        const borderSize = size + 0.2;
        const borderGeometry = new THREE.PlaneGeometry(borderSize, borderSize);
        const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

        // Add Photos
        displayPhotos.forEach((photo, i) => {
            if (i >= positions.length) return; // Should not happen if we found enough positions

            const pos = positions[i];

            const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
            borderMesh.position.z = -0.05; // Behind photo

            const photoMaterial = new THREE.MeshBasicMaterial({
                color: 0xeeeeee, // Placeholder gray
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(photoGeometry, photoMaterial);
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotation.z = pos.rotation;

            mesh.add(borderMesh); // Add border as child
            mesh.userData = { photo };

            group.add(mesh);

            textureLoader.load(photo.url, (texture: THREE.Texture) => {
                mesh.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
            });
        });


        // Decorative Flowers/Particles (Optional, simplified for now)
        // Could add some floating petals?

        // Animation Loop
        const animate = () => {
            // Parallax effect based on mouse position
            targetRotation.current.x = mousePos.current.y * 0.05;
            targetRotation.current.y = mousePos.current.x * 0.05;

            if (groupRef.current) {
                // Smooth interpolation
                groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;
                groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.05;

                // Gentle floating
                groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.5;

                // Heartbeat / Breathing Animation
                const time = Date.now() * 0.001;
                const scale = 1 + Math.sin(time) * 0.03 + Math.sin(time * 3) * 0.01;
                groupRef.current.scale.set(scale, scale, scale);
            }

            renderer.render(scene, camera);
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current) return;
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, [loading, photos, isMobile]);

    // Interaction Handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        mousePos.current = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        };
    };

    // Zoom Handler
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!cameraRef.current) return;
            e.preventDefault();

            const zoomSpeed = 0.05;
            const minZ = 10;
            const maxZ = 100;

            cameraRef.current.position.z += e.deltaY * zoomSpeed;
            cameraRef.current.position.z = Math.max(minZ, Math.min(maxZ, cameraRef.current.position.z));
        };

        // Touch Zoom (Pinch)
        let initialPinchDistance: number | null = null;
        let initialCameraZ: number | null = null;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
                if (cameraRef.current) initialCameraZ = cameraRef.current.position.z;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialPinchDistance && initialCameraZ && cameraRef.current) {
                e.preventDefault(); // Prevent page scroll
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);

                const scale = initialPinchDistance / currentDistance;
                // If scale > 1, we are pinching in (zooming out). If < 1, pinching out (zooming in).
                // Adjust Z based on scale.

                let newZ = initialCameraZ * scale;
                newZ = Math.max(10, Math.min(100, newZ));
                cameraRef.current.position.z = newZ;
            }
        };

        const handleTouchEnd = () => {
            initialPinchDistance = null;
            initialCameraZ = null;
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            container.addEventListener('touchstart', handleTouchStart, { passive: false });
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
            container.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
                container.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-[#fdfbf7] text-gray-800 overflow-hidden font-zen"
            onMouseMove={handleMouseMove}
        >
            <canvas ref={canvasRef} className="absolute inset-0" />

            {/* UI Layer */}
            <div className="absolute inset-0 pointer-events-none p-6 md:p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start pointer-events-auto">
                    <Link to="/new-gallery" className="bg-white/80 backdrop-blur-md p-3 rounded-full text-gray-800 hover:bg-white shadow-lg transition-all flex items-center gap-2 border border-gray-200">
                        <ArrowLeft size={24} />
                        <span className="hidden md:inline pr-2">ギャラリーへ戻る</span>
                    </Link>
                    <div className="text-right">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-gray-800">MEMORIES</h1>
                        <p className="text-[#F39800] text-sm md:text-base font-serif italic">Wishing you both a very special day</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 pointer-events-auto text-right">
                    <p className="text-gray-500 text-sm font-serif italic">
                        with lots of wonderful memories
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-[#fdfbf7] flex flex-col items-center justify-center gap-4 z-50">
                    <Loader2 className="animate-spin text-[#F39800]" size={48} />
                    <p className="text-gray-500 animate-pulse">Loading memories...</p>
                </div>
            )}
        </div>
    );
};

export default GuestGallery3D;

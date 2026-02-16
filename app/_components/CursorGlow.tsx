'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CursorGlow() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // --- MOUSE TRACKING ---
        // Initialize off-screen or center
        const mouse = new THREE.Vector2(0.5, 0.5);
        const smoothMouse = new THREE.Vector2(0.5, 0.5);

        // --- SHADER MATERIAL ---
        const material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                u_mouse: { value: smoothMouse },
                u_resolution: { value: new THREE.Vector2() },
                u_time: { value: 0 }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 u_mouse;
                uniform vec2 u_resolution;
                uniform float u_time;

                void main() {
                    // u_mouse is (0..1, 0..1)
                    // u_resolution is physical pixels (e.g. 3840x2160 for 1080p @ 2x DPI)
                    
                    // Convert normalized mouse to physical pixel coordinates
                    vec2 mousePos = u_mouse * u_resolution;
                    
                    // Calculate distance in physical pixels
                    float dist = distance(gl_FragCoord.xy, mousePos);
                    
                    // Glow radius matches approximately 120-150px
                    float glow_radius = 120.0; 
                    float glow = smoothstep(glow_radius, 0.0, dist);

                    vec3 color = vec3(
                        0.2 + sin(u_time * 2.0) * 0.1, 
                        0.7,                           
                        1.0                            
                    );

                    gl_FragColor = vec4(color, glow * 0.6);
                }
            `
        });

        // Helper to update resolution uniform (Defined after material to be safe)
        const updateResolution = () => {
            const size = new THREE.Vector2();
            renderer.getDrawingBufferSize(size);
            material.uniforms.u_resolution.value.copy(size);
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Initial set of resolution
        updateResolution();

        // --- EVENTS ---
        const onMouseMove = (e: MouseEvent) => {
            // Normalize mouse to 0..1
            // In shader: (0,0) is bottom-left (Standard GL)
            // In DOM: (0,0) is top-left
            mouse.x = e.clientX / window.innerWidth;
            mouse.y = 1.0 - (e.clientY / window.innerHeight); // Flip Y for GL
        };

        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateResolution();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);

        // --- ANIMATION LOOP ---
        let requestID: number;
        const animate = (time: number) => {
            requestID = requestAnimationFrame(animate);

            // INSTANT tracking (lerp 1.0) to keep cursor perfectly centered
            smoothMouse.lerp(mouse, 1.0);

            // Update uniforms
            material.uniforms.u_mouse.value = smoothMouse;
            material.uniforms.u_time.value = time * 0.001; // Convert ms to seconds

            renderer.render(scene, camera);
        };

        requestID = requestAnimationFrame(animate);

        // --- CLEANUP ---
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(requestID);

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            aria-hidden="true"
        />
    );
}

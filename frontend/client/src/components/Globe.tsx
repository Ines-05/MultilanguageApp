import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(400, 400);
    containerRef.current.appendChild(renderer.domElement);

    // Create a glowing sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64); // Increased segments for smoother appearance
    const material = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.9,
      shininess: 90,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(2.2, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    // Add multiple lights for better shading
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 3, 5);
    scene.add(mainLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const backLight = new THREE.DirectionalLight(0x4338ca, 0.5);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    camera.position.z = 5;

    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);

      // Smooth rotation animation
      sphere.rotation.y += 0.003;
      glowMesh.rotation.y += 0.003;

      // Subtle floating animation
      sphere.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      glowMesh.position.y = sphere.position.y;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frame);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
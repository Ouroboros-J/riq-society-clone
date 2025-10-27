import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    // 모바일/데스크톱 감지
    const isMobile = window.innerWidth < 768;
    
    // 고해상도 디스플레이에서 성능 최적화
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    camera.position.z = 50;

    // Galaxy Parameters - 모바일/데스크톱 분리
    const galaxyParameters = {
      count: isMobile ? 15000 : 45000, // 모바일에서 파티클 수 대폭 감소
      size: isMobile ? 0.015 : 0.012,
      radius: 23,
      branches: 5,
      spin: 1,
      randomness: 0.5,
      randomnessPower: 3,
      insideColor: '#9d71ea',
      outsideColor: '#6ca5ff',
    };

    // Generate Galaxy
    const generateGalaxy = () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(galaxyParameters.count * 3);
      const colors = new Float32Array(galaxyParameters.count * 3);
      const colorInside = new THREE.Color(galaxyParameters.insideColor);
      const colorOutside = new THREE.Color(galaxyParameters.outsideColor);

      for (let i = 0; i < galaxyParameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * galaxyParameters.radius;
        const spinAngle = radius * galaxyParameters.spin;
        const branchAngle =
          ((i % galaxyParameters.branches) / galaxyParameters.branches) *
          Math.PI *
          2;

        const randomX =
          Math.pow(Math.random(), galaxyParameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          galaxyParameters.randomness *
          radius;
        const randomY =
          Math.pow(Math.random(), galaxyParameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          galaxyParameters.randomness *
          radius;
        const randomZ =
          Math.pow(Math.random(), galaxyParameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          galaxyParameters.randomness *
          radius;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;

        const domeHeight = 8;
        const y_dome =
          domeHeight * Math.cos((radius / galaxyParameters.radius) * (Math.PI / 2));
        positions[i3 + 1] = y_dome + randomY - 20;

        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside
          .clone()
          .lerp(colorOutside, radius / galaxyParameters.radius);
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      return { geometry, material, points };
    };

    const galaxy = generateGalaxy();

    // Mouse Interaction
    let mouseX = 0,
      mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 1000;
      mouseY = (event.clientY - window.innerHeight / 2) / 1000;
    };
    
    // 모바일에서는 마우스 이벤트 리스너 등록 안 함
    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop - 성능 최적화
    const clock = new THREE.Clock();
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (galaxy.points) {
        galaxy.points.rotation.y = elapsedTime * 0.025;
      }

      // Mouse parallax effect - 모바일에서는 비활성화
      if (!isMobile) {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      const newIsMobile = window.innerWidth < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, newIsMobile ? 1 : 2));
    };
    window.addEventListener('resize', handleResize);

    // Cleanup - 메모리 누수 방지
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (!isMobile) {
        document.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      galaxy.geometry.dispose();
      galaxy.material.dispose();
      scene.remove(galaxy.points);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ background: '#000000' }}
    />
  );
}


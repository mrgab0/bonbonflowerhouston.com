"use client";

import React from "react";

export function AnimatedButterflies() {
  return (
    /* z-10 con pointer-events-none para que las mariposas vuelen por encima del fondo y footer, pero debajo de productos y sliders */
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none" style={{ zIndex: 10 }}>
      <style>{`
        /* --- Titileo Suave de Destellos --- */
        @keyframes sparklePulse {
          0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.3; }
          50% { transform: scale(1.1) rotate(45deg); opacity: 0.75; filter: drop-shadow(0 0 5px #FFD700); }
        }

        /* --- Estela Sutil de Corazones y Polvo Dorado --- */
        @keyframes heartTrail1 {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.7; }
          50% { transform: translate(-20px, 25px) scale(0.45); opacity: 0.4; }
          100% { transform: translate(-45px, 55px) scale(0.1); opacity: 0; }
        }
        @keyframes heartTrail2 {
          0% { transform: translate(0px, 0px) scale(0.7); opacity: 0.75; }
          60% { transform: translate(-25px, 30px) scale(0.35); opacity: 0.3; }
          100% { transform: translate(-55px, 65px) scale(0.08); opacity: 0; }
        }

        /* --- TRAYECTORIAS SÚPER LENTAS, HIPNÓTICAS Y SUTILES (65s a 95s) --- */
        @keyframes slowGentleFlight1 {
          0%   { transform: translate3d(0vw, 0vh, 0) rotate(2deg) scale(0.95); }
          25%  { transform: translate3d(-18vw, 12vh, 0) rotate(-4deg) scale(1); }
          50%  { transform: translate3d(-35vw, -8vh, 0) rotate(3deg) scale(0.92); }
          75%  { transform: translate3d(-15vw, -20vh, 0) rotate(-3deg) scale(0.97); }
          100% { transform: translate3d(0vw, 0vh, 0) rotate(2deg) scale(0.95); }
        }

        @keyframes slowGentleFlight2 {
          0%   { transform: translate3d(0vw, 0vh, 0) rotate(-3deg) scale(0.85); }
          30%  { transform: translate3d(22vw, -15vh, 0) rotate(4deg) scale(0.92); }
          65%  { transform: translate3d(40vw, 15vh, 0) rotate(-2deg) scale(0.88); }
          85%  { transform: translate3d(18vw, 22vh, 0) rotate(3deg) scale(0.9); }
          100% { transform: translate3d(0vw, 0vh, 0) rotate(-3deg) scale(0.85); }
        }

        @keyframes slowGentleFlight3 {
          0%   { transform: translate3d(0vw, 0vh, 0) rotate(3deg) scale(0.9); }
          35%  { transform: translate3d(25vw, -25vh, 0) rotate(-4deg) scale(0.96); }
          70%  { transform: translate3d(-18vw, -38vh, 0) rotate(3deg) scale(0.88); }
          100% { transform: translate3d(0vw, 0vh, 0) rotate(3deg) scale(0.9); }
        }

        /* --- Aleteo Ultra Hipnótico y Lento (1.05s a 1.25s) --- */
        @keyframes wingFlapSlow {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-24deg); }
        }

        .fly-slow-1 { animation: slowGentleFlight1 65s ease-in-out infinite; will-change: transform; transform: translateZ(0); }
        .fly-slow-2 { animation: slowGentleFlight2 85s ease-in-out infinite; will-change: transform; transform: translateZ(0); }
        .fly-slow-3 { animation: slowGentleFlight3 75s ease-in-out infinite; will-change: transform; transform: translateZ(0); }
        .fly-slow-4 { animation: slowGentleFlight1 95s ease-in-out infinite reverse; will-change: transform; transform: translateZ(0); }

        .wing-flap-slow {
          animation: wingFlapSlow 1.05s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .sparkle-anim { animation: sparklePulse 2.8s ease-in-out infinite alternate; will-change: transform, opacity; }

        .trail-h1 { animation: heartTrail1 3.2s linear infinite; will-change: transform, opacity; }
        .trail-h2 { animation: heartTrail2 3.6s linear infinite 0.8s; will-change: transform, opacity; }
      `}</style>

      {/* Símbolos SVG para Corazones y Destellos */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="goldHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          <g id="trailHeart">
            <path
              d="M 12 21.35 l -1.45 -1.32 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 c 1.74 0 3.41 0.81 4.5 2.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 c 0 3.78 -3.4 6.86 -8.55 11.54 L 12 21.35 Z"
              fill="url(#goldHeartGrad)"
              stroke="#FFF"
              strokeWidth="0.5"
              filter="drop-shadow(0px 1px 3px rgba(212,175,55,0.6))"
            />
          </g>

          <g id="goldStarSparkle">
            <path d="M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z" fill="#FFF8DC" />
          </g>
        </defs>
      </svg>

      {/* ========================================================================= */}
      {/* 👑 MARIPOSAS PEQUEÑAS DE LUJO (TAMAÑOS DELICADOS DE 40px A 80px) */}
      {/* ========================================================================= */}

      {/* 1A. MARIPOSA DE JOYA DE ORO Y DIAMANTES #1 (Pequeña 64px-80px) */}
      <div className="absolute top-[18%] right-[10%] fly-slow-1">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 opacity-75">
          <div className="wing-flap-slow w-full h-full">
            <img
              src="/images/butterflies/gold_jewel_butterfly_trans.webp"
              alt="Mariposa de Oro y Diamantes #1"
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.5)]"
            />
          </div>

          <div className="absolute top-[5%] left-[8%] sparkle-anim">
            <svg width="10" height="10" viewBox="0 0 20 20"><use href="#goldStarSparkle" /></svg>
          </div>
          <div className="absolute top-[5%] right-[8%] sparkle-anim" style={{ animationDelay: '0.6s' }}>
            <svg width="10" height="10" viewBox="0 0 20 20"><use href="#goldStarSparkle" /></svg>
          </div>

          <div className="absolute bottom-[-5px] left-[-10px] w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 trail-h1">
              <svg width="12" height="12" viewBox="0 0 24 24"><use href="#trailHeart" /></svg>
            </div>
            <div className="absolute top-[8px] left-[10px] trail-h2">
              <svg width="10" height="10" viewBox="0 0 24 24"><use href="#trailHeart" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* 1B. MARIPOSA DE JOYA DE ORO Y DIAMANTES #2 (Pequeña 48px-64px) */}
      <div className="absolute top-[52%] left-[8%] fly-slow-3" style={{ animationDelay: '8s' }}>
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 opacity-70">
          <div className="wing-flap-slow w-full h-full" style={{ animationDuration: '1.15s' }}>
            <img
              src="/images/butterflies/gold_jewel_butterfly_trans.webp"
              alt="Mariposa de Oro y Diamantes #2"
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* 2A. MARIPOSA DE CRISTAL DE DIAMANTE #1 (Pequeña 48px-64px) */}
      <div className="absolute top-[68%] right-[8%] fly-slow-2">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 opacity-75">
          <div className="wing-flap-slow w-full h-full" style={{ animationDuration: '1.2s' }}>
            <img
              src="/images/butterflies/crystal_butterfly_trans.webp"
              alt="Mariposa de Cristal #1"
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(255,255,255,0.65)]"
            />
          </div>
        </div>
      </div>

      {/* 2B. MARIPOSA DE CRISTAL DE DIAMANTE #2 (Pequeña 40px-52px) */}
      <div className="absolute top-[22%] left-[18%] fly-slow-4" style={{ animationDelay: '5s' }}>
        <div className="relative w-10 h-10 sm:w-13 sm:h-13 opacity-70">
          <div className="wing-flap-slow w-full h-full" style={{ animationDuration: '1.1s' }}>
            <img
              src="/images/butterflies/crystal_butterfly_trans.webp"
              alt="Mariposa de Cristal #2"
              width={52}
              height={52}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_3px_10px_rgba(255,255,255,0.6)]"
            />
          </div>
        </div>
      </div>

      {/* 4A. MARIPOSA DE ORO 3D CON AURA #1 (Pequeña 44px-56px) */}
      <div className="absolute top-[12%] left-[5%] fly-slow-1" style={{ animationDelay: '3s' }}>
        <div className="relative w-11 h-11 sm:w-14 sm:h-14 opacity-70">
          <div className="wing-flap-slow w-full h-full" style={{ animationDuration: '0.98s' }}>
            <img
              src="/images/butterflies/gold_aura_butterfly_trans.webp"
              alt="Mariposa Oro Aura #1"
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_3px_10px_rgba(212,175,55,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* 4B. MARIPOSA DE ORO 3D CON AURA #2 (Pequeña 40px-48px) */}
      <div className="absolute top-[75%] left-[32%] fly-slow-2" style={{ animationDelay: '12s' }}>
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 opacity-65">
          <div className="wing-flap-slow w-full h-full" style={{ animationDuration: '1.25s' }}>
            <img
              src="/images/butterflies/gold_aura_butterfly_trans.webp"
              alt="Mariposa Oro Aura #2"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain filter drop-shadow-[0_3px_10px_rgba(212,175,55,0.5)]"
            />
          </div>
        </div>
      </div>

    </div>
  );
}

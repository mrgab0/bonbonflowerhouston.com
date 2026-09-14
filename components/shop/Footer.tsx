"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, Facebook, CheckCircle2 } from "lucide-react";

interface FooterProps {
  siteConfig?: any;
}

export function Footer({ siteConfig }: FooterProps) {
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubscribed(true);
    }
  };

  const instagramUrl = siteConfig?.instagramUrl || "https://www.instagram.com/bonbonflowers__?stkn=MXBnc3hsbHVlM3psMQ==";
  const facebookUrl = siteConfig?.facebookUrl || "https://www.facebook.com/bonbon.flowers.2025";

  return (
    <footer className="bg-white dark:bg-[#0B0C10] text-black dark:text-gray-300 pt-14 pb-8 border-t border-stone-200 dark:border-gray-800 text-xs transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fila Principal: Horarios y Suscripción al Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12 border-b border-stone-200 dark:border-gray-800">
          
          {/* Horarios de Operación */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={siteConfig?.logoUrl || "https://bonbonflowershouston.com/logo.png"}
                alt="Bonbon Flowers Logo"
                className="w-8 h-8 rounded-full object-cover border border-[#C5A059]"
              />
              <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-wider font-serif">
                Hours of operation
              </h3>
            </div>
            <p className="text-black dark:text-gray-300 leading-relaxed text-xs font-medium">
              Monday to Friday: 9 AM - 6 PM<br />
              Saturday: 10 AM - 3 PM<br />
              Sunday: Special event &amp; advance orders delivery
            </p>
            <p className="mt-3 text-[11px] text-[#163422] dark:text-[#C5A059] font-bold tracking-wide">
              Houston, TX &amp; Metro Area • Same Day Delivery Available
            </p>
          </div>

          {/* Formulario de Suscripción */}
          <div>
            <h3 className="font-black text-black dark:text-white text-xs uppercase tracking-wider mb-3 font-serif">
              Subscribe to our emails
            </h3>
            <p className="text-black dark:text-gray-300 text-xs mb-3 font-medium">
              Be the first to know about new seasonal floral collections and exclusive promotions.
            </p>

            {emailSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg text-xs font-bold border border-emerald-200">
                <CheckCircle2 size={16} />
                <span>¡Gracias por suscribirte a Bonbon Flowers!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  type="email"
                  id="footer-email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#15161F] border border-stone-400 dark:border-gray-700 text-xs text-black dark:text-white placeholder-stone-500 focus:outline-none focus:border-black dark:focus:border-gray-400 rounded-sm font-medium"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-stone-800 dark:bg-[#C5A059] dark:hover:bg-[#d8b56f] text-white dark:text-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 rounded-sm"
                >
                  Subscribe
                </button>
              </form>
            )}

            {/* Redes Sociales Oficiales */}
            <div className="flex items-center space-x-4 mt-6 text-black dark:text-gray-300">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Bonbon Flowers"
                className="hover:text-[#163422] dark:hover:text-white transition-colors p-1"
              >
                <Facebook size={18} />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Bonbon Flowers"
                className="hover:text-[#163422] dark:hover:text-white transition-colors p-1"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Insignias de Métodos de Pago Aceptados con Máximo Contraste */}
        <div className="py-6 flex flex-wrap justify-center items-center gap-2">
          {/* AMEX */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#007AC1] shadow-sm">
            AMEX
          </span>
          {/* Apple Pay */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black !text-black dark:!text-white shadow-sm" style={{ color: '#000000' }}>
            Pay
          </span>
          {/* Google Pay */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black !text-black dark:!text-white shadow-sm" style={{ color: '#000000' }}>
            G Pay
          </span>
          {/* Mastercard */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#EB001B] shadow-sm">
            Mastercard
          </span>
          {/* PayPal */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#003087] shadow-sm">
            PayPal
          </span>
          {/* Discover */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#FF6000] shadow-sm">
            Discover
          </span>
          {/* Shop Pay */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-[#5A31F4] rounded text-[10px] font-black !text-white shadow-sm" style={{ color: '#FFFFFF' }}>
            shop Pay
          </span>
          {/* Visa */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#1A1F71] italic shadow-sm">
            VISA
          </span>
          {/* Zelle */}
          <span className="inline-flex items-center justify-center px-2.5 py-1 bg-white dark:bg-gray-900 border border-stone-300 dark:border-gray-700 rounded text-[10px] font-black text-[#7414CA] shadow-sm">
            Zelle
          </span>
        </div>

        {/* Copyright y Enlaces Legales en Negro Puro */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-y-2 text-[11px] text-black dark:text-gray-300 text-center font-medium">
          <span>
            © {new Date().getFullYear()}, Bonbon Flowers Houston. All rights reserved.
          </span>
          <span className="hidden sm:inline mx-2 text-stone-400">·</span>
          <div className="flex flex-wrap justify-center gap-x-2 text-black dark:text-gray-200">
            <Link className="text-black dark:text-gray-200 hover:text-[#163422] font-semibold hover:underline" href="/contacto">
              Contact
            </Link>
            <span className="text-stone-400">·</span>
            <Link className="text-black dark:text-gray-200 hover:text-[#163422] font-semibold hover:underline" href="/nosotros">
              About Us
            </Link>
            <span className="text-stone-400">·</span>
            <Link className="text-black dark:text-gray-200 hover:text-[#163422] font-semibold hover:underline" href="/productos">
              All Flowers
            </Link>
            <span className="text-stone-400">·</span>
            <Link className="text-black dark:text-gray-200 hover:text-[#163422] font-semibold hover:underline" href="/rastreo">
              Order Tracking
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

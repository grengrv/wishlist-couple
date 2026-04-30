import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@context/LanguageContext";

export default function LuckyWheel({ items, onClose }) {
  const { t } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  // Filter items that have names
  const validItems = items.filter(item => item.ten).slice(0, 8); 

  useEffect(() => {
    drawWheel();
  }, [validItems]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    if (validItems.length === 0) return;

    const angleStep = (2 * Math.PI) / validItems.length;

    validItems.forEach((item, i) => {
      const angle = i * angleStep;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + angleStep);
      ctx.fillStyle = i % 2 === 0 ? "#ec4899" : "#f43f5e";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + angleStep / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText(item.ten.substring(0, 15), radius - 10, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.stroke();
  };

  const spin = () => {
    if (isSpinning || validItems.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const targetRotation = rotation + extraSpins * 360 + Math.random() * 360;
    
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = (targetRotation % 360);
      const anglePerItem = 360 / validItems.length;
      const winningIndex = Math.floor(((360 - normalizedRotation + 270) % 360) / anglePerItem) % validItems.length;
      setResult(validItems[winningIndex]);
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card-bg w-full max-w-md rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-border-primary"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-2xl font-black text-text-primary mb-2">🎡 {t("lucky_wheel_title")}</h2>
          <p className="text-text-secondary text-sm mb-8 text-center">{t("lucky_wheel_subtitle")}</p>

          <div className="relative mb-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-6 h-8 bg-text-primary shadow-lg" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", transform: "rotate(180deg)" }}></div>
            </div>

            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.15, 0, 0.15, 1] }}
              className="relative shadow-2xl rounded-full border-8 border-bg-secondary"
            >
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={300} 
                className="rounded-full"
              />
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8 p-6 bg-pink-50 rounded-[24px] border-2 border-pink-200 w-full"
              >
                <p className="text-xs font-black uppercase tracking-widest text-pink-400 mb-2">{t("you_got")}</p>
                <h3 className="text-xl font-black text-pink-600">{result.ten}</h3>
              </motion.div>
            ) : (
              <button
                onClick={spin}
                disabled={isSpinning || validItems.length === 0}
                className={`w-full py-5 rounded-[24px] font-black text-lg shadow-xl transition-all duration-300 mb-8 ${
                  isSpinning 
                    ? "bg-bg-secondary text-text-muted cursor-not-allowed" 
                    : "bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:scale-[1.02] active:scale-95 hover:shadow-pink-500/25"
                }`}
              >
                {isSpinning ? t("spinning") : t("spin_now")}
              </button>
            )}
          </AnimatePresence>

          <button 
            onClick={onClose}
            className="text-text-muted text-sm font-bold hover:text-text-primary transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

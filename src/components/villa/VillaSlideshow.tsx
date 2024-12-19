import React, { useEffect, useCallback, useState, useRef, forwardRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

const villaImages = [
  {
    url: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.interiorAlt',
    title: 'villa.interiorTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.poolAlt',
    title: 'villa.poolTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.exteriorAlt',
    title: 'villa.exteriorTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.bedroomAlt',
    title: 'villa.bedroomTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.livingRoomAlt',
    title: 'villa.livingRoomTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.kitchenAlt',
    title: 'villa.kitchenTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.patioAlt',
    title: 'villa.patioTitle'
  },
  {
    url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
    alt: 'villa.gardenAlt',
    title: 'villa.gardenTitle'
  }
];

const AUTOPLAY_INTERVAL = 5000;
const TRANSITION_DURATION = 0.75;

interface SlideProps {
  url: string;
  alt: string;
  title: string;
  direction: number;
  x: MotionValue<number>;
  index: number;
  currentIndex: number;
  total: number;
  isFullscreen: boolean;
  onDragStart?: () => void;
  onDragEnd?: (e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => void;
}

const MotionDiv = motion.div;

const Slide = forwardRef<HTMLDivElement, SlideProps>(({
  url,
  alt,
  title,
  direction,
  x,
  index,
  currentIndex,
  total,
  isFullscreen,
  onDragStart,
  onDragEnd
}, ref) => {
  const { t } = useTranslation();
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  
  const clampedX = useTransform(x, (value) => {
    return Math.max(-windowWidth, Math.min(windowWidth, value));
  });
  
  const distance = useTransform(clampedX, [-windowWidth, 0, windowWidth], [100, 0, 100]);
  const scale = useTransform(distance, [0, 100], [1, 0.85]);
  const opacity = useTransform(distance, [0, 50, 100], [1, 0.25, 0], {
    clamp: true
  });
  const rotate = useTransform(distance, [0, 100], [0, direction * 15]);
  const blur = useTransform(distance, [0, 100], [0, 10]);
  const translateY = useTransform(distance, [0, 100], [0, direction * 50]);

  const getInitialX = () => {
    if (index === currentIndex) return 0;
    if (index === (currentIndex - 1 + total) % total) return -100;
    if (index === (currentIndex + 1) % total) return 100;
    return direction > 0 ? 100 : -100;
  };

  return (
    <MotionDiv
      ref={ref}
      style={{
        x: clampedX,
        scale,
        opacity,
        rotateY: rotate,
        y: translateY,
      }}
      initial={{ 
        x: getInitialX() + '%',
        scale: 0.9,
        opacity: 0,
        rotateY: direction * 45,
      }}
      animate={{ 
        x: 0,
        scale: 1,
        opacity: 1,
        rotateY: 0,
      }}
      exit={{ 
        x: direction > 0 ? '-100%' : '100%',
        scale: 0.9,
        opacity: 0,
        rotateY: direction * -45,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 1,
        restDelta: 0.001,
      }}
      className="absolute inset-0 will-change-transform perspective-1000"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="absolute inset-0 perspective-2000 transform-gpu">
        <motion.div 
          className="relative h-full transform-gpu"
          style={{
            filter: useTransform(blur, value => `blur(${value}px)`),
          }}
        >
          <img
            src={url}
            alt={t(alt)}
            className={cn(
              "h-full w-full transition-all duration-700",
              isFullscreen ? "object-contain" : "object-cover",
              "transform-gpu hover:scale-105"
            )}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ 
              duration: 0.8,
              ease: [0.19, 1, 0.22, 1],
              delay: 0.2 
            }}
            className="absolute bottom-8 left-8 max-w-xl"
          >
            <h2 className="text-3xl font-bold text-white mb-2 transform-gpu">
              {t(title)}
            </h2>
          </motion.div>
        </motion.div>
      </div>
    </MotionDiv>
  );
});

Slide.displayName = 'Slide';

export function VillaSlideshow() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const slideX = useMotionValue(0);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout>();
  const dragStartX = useRef(0);

  const resetAutoplayTimer = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    if (isAutoPlaying && !isDragging) {
      autoplayTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, AUTOPLAY_INTERVAL);
    }
  }, [isAutoPlaying, isDragging]);

  const handlePrevious = useCallback(() => {
    if (!isDragging) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev === 0 ? villaImages.length - 1 : prev - 1));
      resetAutoplayTimer();
    }
  }, [isDragging, resetAutoplayTimer]);

  const handleNext = useCallback(() => {
    if (!isDragging) {
      setDirection(1);
      setCurrentIndex((prev) => (prev === villaImages.length - 1 ? 0 : prev + 1));
      resetAutoplayTimer();
    }
  }, [isDragging, resetAutoplayTimer]);

  useEffect(() => {
    resetAutoplayTimer();
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, resetAutoplayTimer]);

  const handleDragStart = () => {
    setIsDragging(true);
    dragStartX.current = slideX.get();
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipe = Math.abs(offset) * velocity;
    
    if (swipe < -10000 || offset < -100) {
      handleNext();
    } else if (swipe > 10000 || offset > 100) {
      handlePrevious();
    }
    resetAutoplayTimer();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  }, [handleNext, handlePrevious]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900/5 to-gray-900/20 dark:from-gray-800/5 dark:to-gray-800/20 z-10",
      isFullscreen && "fixed inset-0 z-50 rounded-none bg-black"
    )}>
      <div className={cn(
        "aspect-[16/9] md:aspect-[21/9] w-full relative perspective-2000",
        isFullscreen && "h-full aspect-auto"
      )}>
        <motion.div 
          className="relative h-full transform-gpu"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-full">
            <AnimatePresence initial={false} mode="popLayout">
              {villaImages.map((image, index) => (
                index === currentIndex && (
                  <Slide
                    key={index}
                    url={image.url}
                    alt={image.alt}
                    title={image.title}
                    direction={direction}
                    x={slideX}
                    index={index}
                    currentIndex={currentIndex}
                    total={villaImages.length}
                    isFullscreen={isFullscreen}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                resetAutoplayTimer();
              }}
              className="rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 z-20"
            aria-label={t('Previous image')}
            title={t('Previous image')}
          >
            <ChevronLeft className="h-6 w-6 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 z-20"
            aria-label={t('Next image')}
            title={t('Next image')}
          >
            <ChevronRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.button>

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm backdrop-blur-sm z-20">
            {currentIndex + 1} / {villaImages.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden backdrop-blur-sm">
            <motion.div
              key={`progress-${progressKey}-${currentIndex}`}
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isAutoPlaying ? { 
                scaleX: 1, 
                opacity: 1,
                transition: {
                  duration: AUTOPLAY_INTERVAL / 1000,
                  ease: "linear",
                  opacity: { duration: 0.3 }
                }
              } : { 
                scaleX: 0,
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              style={{
                originX: 0,
                transformOrigin: "left",
              }}
            />
            <motion.div
              className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Thumbnails */}
      <div className={cn(
        "flex space-x-2 p-4 overflow-x-auto scrollbar-hide",
        isFullscreen && "absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm"
      )}>
        {villaImages.map((image, index) => (
          <motion.button
            key={image.url}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
              setProgressKey(prev => prev + 1);
              resetAutoplayTimer();
            }}
            className="relative flex-none group"
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={t(image.alt)}
                className={cn(
                  'h-16 w-24 object-cover transition-all duration-300 group-hover:scale-110',
                  currentIndex === index ? 'opacity-100' : 'opacity-50'
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {currentIndex === index && (
              <motion.div
                layoutId="activeThumb"
                className="absolute inset-0 rounded-lg ring-2 ring-amber-600"
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

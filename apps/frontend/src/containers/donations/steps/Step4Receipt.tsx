import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import fccImg01 from '../../../assets/fcc-img-01.png';
import fccImg02 from '../../../assets/fcc-img-02.png';
import fccImg03 from '../../../assets/fcc-img-03.png';

interface Step4ReceiptProps {
  receiptId: string | null;
}

const SHARE_GRAPHICS = [fccImg01, fccImg02, fccImg03];

export const Step4Receipt: React.FC<Step4ReceiptProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [feedback, setFeedback] = useState('');

  const extendedGraphics = [
    SHARE_GRAPHICS[SHARE_GRAPHICS.length - 1],
    ...SHARE_GRAPHICS,
    SHARE_GRAPHICS[0],
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        return SHARE_GRAPHICS.length;
      }
      return prev - 1;
    });
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === SHARE_GRAPHICS.length + 1) {
        return 1;
      }
      return prev + 1;
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'I just donated to FCC!',
      text: 'Join me in supporting FCC and making a difference in our community.',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        console.log('Web Share API not supported');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="text-center space-y-3">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#3e4684] leading-none">
          THANK YOU
        </h1>
        <p className="text-xl md:text-2xl font-light text-[#3e4684]">
          For making a difference.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="h-px w-20 bg-gray-300" />
        <p>A receipt has been sent to your email.</p>
        <div className="h-px w-20 bg-gray-300" />
      </div>

      <div className="w-full max-w-2xl">
        <label
          htmlFor="feedback"
          className="mb-3 block text-left text-base text-gray-700"
        >
          What made you donate to FCC today?{' '}
          <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share with us here"
          className="min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 placeholder-gray-400 transition-colors focus:border-[#3e4684] focus:outline-none focus:ring-2 focus:ring-[#3e4684]/20"
          rows={4}
        />
      </div>

      <div className="relative w-full max-w-4xl h-[160px] flex items-center justify-center">
        <button
          onClick={handlePrevSlide}
          className="absolute left-0 z-30 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#3e4684]/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center px-16">
          {extendedGraphics.map((graphic, index) => {
            const offset = index - currentSlide;
            const isActive = index === currentSlide;
            const isVisible = Math.abs(offset) <= 1;

            return (
              <div
                key={index}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `
                    translateX(${offset * 40}%)
                    scale(${isActive ? 1 : 0.85})
                    rotateY(${offset * -15}deg)
                  `,
                  zIndex: isActive ? 20 : 10 - Math.abs(offset),
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <img
                  src={graphic}
                  alt={`Share graphic ${index + 1}`}
                  className="w-full h-auto rounded-xl shadow-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    maxWidth: '180px',
                  }}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNextSlide}
          className="absolute right-0 z-30 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#3e4684]/20"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <Button
        onClick={handleShare}
        className="mt-4 flex items-center gap-2 rounded-lg bg-teal-600 px-8 py-6 text-lg font-semibold text-white transition-colors hover:bg-teal-700 focus:ring-2 focus:ring-teal-600/20"
        size="lg"
      >
        Spread the word! <Share2 className="h-5 w-5" />
      </Button>
    </section>
  );
};

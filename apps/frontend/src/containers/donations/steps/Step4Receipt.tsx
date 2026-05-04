'use client';

import React, { useState } from 'react';
import { Textarea } from '@components/ui/textarea';
import { Button } from '@components/ui/button';
import { TestimonialCarousel } from '@components/testimonials/TestimonialCarousel';
import CarouselImage1 from '@components/testimonials/TestimonialImages/Carousel_image1.png';
import CarouselImage2 from '@components/testimonials/TestimonialImages/Carousel_image2.png';
import CarouselImage3 from '@components/testimonials/TestimonialImages/Carousel_image3.png';

interface Step4ReceiptProps {
  receiptId?: string | null;
  onReset: () => void;
}

const TESTIMONIAL_SLIDES = [
  {
    id: 1,
    image: CarouselImage1,
    alt: 'Testimonial image 1',
  },
  {
    id: 2,
    image: CarouselImage2,
    alt: 'Testimonial image 2',
  },
  {
    id: 3,
    image: CarouselImage3,
    alt: 'Testimonial image 3',
  },
];

export const Step4Receipt: React.FC<Step4ReceiptProps> = ({
  receiptId,
  onReset,
}) => {
  const [feedback, setFeedback] = useState('');

  const handleSpreadTheWord = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'I just donated to FCC!',
          text: 'Join me in supporting FCC and making a difference in our community.',
          url: window.location.origin,
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error);
          }
        });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight text-[#2d3161] md:text-6xl scale-y-125 scale-x-90 [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif] [font-weight:900]">
          THANK YOU
        </h1>
        <p className="mt-2 text-black text-[32px] leading-[25px] tracking-[0] text-center [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif] [font-weight:200]">
          For making a difference.
        </p>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="h-px w-20 bg-gray-300" />
        <p className="text-[14px] text-gray-400 whitespace-nowrap">
          A receipt has been sent to your email.
        </p>
        <div className="h-px w-20 bg-gray-300" />
      </div>
      {receiptId && (
        <p className="mt-2 text-center text-[12px] text-gray-400">
          Receipt ID: {receiptId}
        </p>
      )}
      <div className="mt-10">
        <label className="mb-3 block text-left">
          <span className="text-black text-[16px] leading-[100%] tracking-[0] font-normal [font-family:Helvetica,Arial,sans-serif]">
            What made you donate to FCC today?
          </span>{' '}
          <span className="text-gray-400 text-[16px] leading-[100%] tracking-[0] font-normal [font-family:Helvetica,Arial,sans-serif]">
            (optional)
          </span>
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share with us here"
          className="min-h-[120px] border-[#4E4E4E] border-[1.5px] rounded-lg shadow-none focus-visible:ring-0"
          rows={4}
        />
      </div>
      <div className="mt-8 mb-4">
        <TestimonialCarousel slides={TESTIMONIAL_SLIDES} />
      </div>
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant="unstyled"
          withShareIcon
          className="flex-1 rounded-[2cqh] bg-[#007b64] text-white font-semibold h-[2.5rem] flex justify-center items-center text-center text-[2.5cqh] hover:bg-[#006b54] gap-2"
          onClick={handleSpreadTheWord}
        >
          Spread the word!
        </Button>
        <Button
          variant="unstyled"
          className="flex-1 rounded-[2cqh] bg-[#007b64] text-white font-semibold h-[2.5rem] flex justify-center items-center text-center text-[2.5cqh] hover:bg-[#006b54]"
          onClick={onReset}
        >
          Donate again
        </Button>
      </div>
      <div className="flex justify-center gap-10 mb-8">
        <a
          href="https://www.facebook.com/sharer/sharer.php"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img
            src="/src/assets/facebook.png"
            alt="Share on Facebook"
            className="w-12 h-12"
          />
        </a>
        <a
          href="https://twitter.com/intent/tweet"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img src="/src/assets/x.png" alt="Share on X" className="w-12 h-12" />
        </a>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img
            src="/src/assets/linkedin.png"
            alt="Share on LinkedIn"
            className="w-12 h-12"
          />
        </a>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';

interface Step4ReceiptProps {
  receiptId?: string | null;
}

export const Step4Receipt: React.FC<Step4ReceiptProps> = () => {
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
        <h1 className="text-6xl font-black tracking-tight text-[#2d3161] md:text-7xl scale-y-125 scale-x-90 [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif] [font-weight:900]">
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
      <div className="mt-10">
        <label className="mb-3 block text-left">
          <span className="text-black text-[16px] leading-[100%] tracking-[0] font-normal [font-family:Helvetica,Arial,sans-serif]">
            What made you donate to FCC today?
          </span>{' '}
          <span className="text-gray-400 text-[16px] leading-[100%] tracking-[0] font-normal [font-family:Helvetica,Arial,sans-serif]">
            (optional)
          </span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share with us here"
          className="min-h-[120px] w-full rounded-lg border border-black bg-white px-4 py-3 text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
          rows={4}
        />
      </div>
      {/* placeholder for carousel */}
      <div className="mt-8 mb-8">
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">Carousel Placeholder</p>
        </div>
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
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSpreadTheWord}
          className="flex items-center justify-center gap-2 w-[269px] h-[71px] bg-[#007B64] text-white rounded-[10px] opacity-100 hover:bg-[#006654] transition-colors font-semibold text-lg"
        >
          Spread the word!
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

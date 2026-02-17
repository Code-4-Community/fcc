import { Button } from '@components/ui/button';
import React, { useState } from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  XIcon,
  TwitterShareButton,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';

const ShareOptions = ({ activeSlideUrl }: { activeSlideUrl: string }) => {
  const [isCopyingText, setIsCopyingText] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const message = `Want to support your community? Join me in donating to the Fenway Community Center!\n\n${window.location.href}`;

  const handleCopyTextClick = async () => {
    try {
      setIsCopyingText(true);
      await navigator.clipboard.writeText(message);
      setTimeout(() => setIsCopyingText(false), 1000);
    } catch (err) {
      console.error('Failed to copy message to clipboard');
      alert('Failed to copy message to clipboard');
    }
  };

  const handleCopyImageClick = async () => {
    try {
      const response = await fetch(activeSlideUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const imageType = blob.type || 'image/png';
      const imageItem = new ClipboardItem({ [imageType]: blob });
      await navigator.clipboard.write([imageItem]);

      setIsCopyingImage(true);
      setTimeout(() => setIsCopyingImage(false), 1000);
    } catch (err) {
      console.error('Failed to copy image to clipboard', err);
      alert('Failed to copy image to clipboard');
    }
  };

  return (
    <div>
      <div
        className="flex flex-wrap justify-center gap-3"
        style={{ marginTop: '1.5rem' }}
      >
        <Button
          variant="unstyled"
          size="sm"
          style={{
            backgroundColor: '#007b64',
            color: 'white',
            padding: '1.5rem',
            fontWeight: 'bold',
          }}
          className="w-[13rem] gap-3 rounded-[10px] min-h-[2.5rem] flex justify-center items-center text-center text-[1.3rem] hover:opacity-90 transition-opacity"
          onClick={handleCopyTextClick}
        >
          {isCopyingText ? 'Copied!' : 'Copy message'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: '10px' }}
          >
            <path
              fill="none"
              d="M12 2v13m4-9l-4-4l-4 4m-4 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
            />
          </svg>
        </Button>
        <Button
          variant="unstyled"
          size="sm"
          style={{
            backgroundColor: '#007b64',
            color: 'white',
            padding: '1.5rem',
            fontWeight: 'bold',
          }}
          className="w-[13rem] gap-3 rounded-[10px] min-h-[2.5rem] flex justify-center items-center text-center text-[1.3rem] hover:opacity-90 transition-opacity"
          onClick={handleCopyImageClick}
        >
          {isCopyingImage ? 'Copied!' : 'Copy image'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: '10px' }}
          >
            <path
              fill="none"
              d="M12 2v13m4-9l-4-4l-4 4m-4 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
            />
          </svg>
        </Button>
      </div>
      <div
        className="flex justify-center"
        style={{ gap: '3rem', marginTop: '2rem' }}
      >
        <FacebookShareButton url={window.location.href}>
          <FacebookIcon
            className="rounded-full"
            style={{ maxWidth: '2.5rem', height: 'auto' }}
          />
        </FacebookShareButton>
        <TwitterShareButton url={window.location.href}>
          <XIcon
            className="rounded-full"
            style={{ maxWidth: '2.5rem', height: 'auto' }}
          />
        </TwitterShareButton>
        <LinkedinShareButton url={window.location.href}>
          <LinkedinIcon
            className="rounded-full"
            style={{ maxWidth: '2.5rem', height: 'auto' }}
          />
        </LinkedinShareButton>
      </div>
    </div>
  );
};

export default ShareOptions;

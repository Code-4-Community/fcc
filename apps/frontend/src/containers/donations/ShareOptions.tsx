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
import CopyButton from '../../components/CopyButton';

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
        <CopyButton
          text={isCopyingText ? 'Copied!' : 'Copy message'}
          copyAction={handleCopyTextClick}
        />
        <CopyButton
          text={isCopyingImage ? 'Copied!' : 'Copy image'}
          copyAction={handleCopyImageClick}
        />
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

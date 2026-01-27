import TestimonialCarousel from '@components/testimonials/TestimonialCarousel';
import Carousel_image1 from '@components/testimonials/TestimonialImages/Carousel_image1.png';
import Carousel_image2 from '@components/testimonials/TestimonialImages/Carousel_image2.png';
import Carousel_image3 from '@components/testimonials/TestimonialImages/Carousel_image3.png';

const slides = [
  { id: 1, image: Carousel_image1, objectPosition: '100% 100%' },
  { id: 2, image: Carousel_image2, objectPosition: '100% 100%' },
  { id: 3, image: Carousel_image3, objectPosition: '100% 100%' },
];

export default function TestimonialTester() {
  return (
    <div className="min-h-screen w-full bg-neutral-100">
      {/* Center the stage like Figma */}
      <div className="mx-auto flex min-h-screen max-w-[100px] items-center justify-center px-6">
        {/* Important: allow overlap to be visible */}
        <div className="w-full overflow-visible">
          <TestimonialCarousel slides={slides} />
        </div>
      </div>
    </div>
  );
}

import { render, screen } from '@testing-library/react';
import { TestimonialCarousel } from './TestimonialCarousel';

describe('TestimonialCarousel', () => {
  describe('Rendering with default props', () => {
    it('renders with default title', () => {
      render(<TestimonialCarousel />);

      expect(screen.getByText('Make a Difference')).toBeTruthy();
    });

    it('renders with default body text', () => {
      render(<TestimonialCarousel />);

      expect(
        screen.getByText(
          /Read below for more about FCC and how your gift supports our small organization/i,
        ),
      ).toBeTruthy();
    });

    it('renders with default link text', () => {
      render(<TestimonialCarousel />);

      expect(screen.getByText('Contact Us for any questions!')).toBeTruthy();
    });

    it('renders the contact link with correct href', () => {
      render(<TestimonialCarousel />);

      const link = screen.getByRole('link', {
        name: /contact us for any questions/i,
      });
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('#contact');
    });
  });

  describe('Rendering with custom props', () => {
    it('renders with custom title', () => {
      render(<TestimonialCarousel title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    it('renders with custom body text', () => {
      render(<TestimonialCarousel body="Custom body content here" />);

      expect(screen.getByText('Custom body content here')).toBeTruthy();
    });

    it('renders with custom link text', () => {
      render(<TestimonialCarousel linkText="Learn More" />);

      expect(screen.getByText('Learn More')).toBeTruthy();
    });

    it('renders all custom props together', () => {
      render(
        <TestimonialCarousel
          title="Support Us"
          body="Your donations help our community"
          linkText="Get in Touch"
        />,
      );

      expect(screen.getByText('Support Us')).toBeTruthy();
      expect(
        screen.getByText('Your donations help our community'),
      ).toBeTruthy();
      expect(screen.getByText('Get in Touch')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('renders title as h2 heading', () => {
      render(<TestimonialCarousel />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe('Make a Difference');
    });

    it('renders link as accessible anchor element', () => {
      render(<TestimonialCarousel />);

      const link = screen.getByRole('link');
      expect(link).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<TestimonialCarousel />);
      expect(() => unmount()).not.toThrow();
    });
  });
});

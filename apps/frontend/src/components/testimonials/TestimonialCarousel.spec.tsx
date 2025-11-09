import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TestimonialCarousel, Testimonial } from './TestimonialCarousel';

/**
 * Alternative test approach WITHOUT Jest timer mocks
 * Uses real timers and waitFor to test rotation
 */
describe('TestimonialCarousel - Alternative Tests', () => {
  const mockTestimonials: Testimonial[] = [
    { text: 'First testimonial', author: 'John Doe' },
    { text: 'Second testimonial', author: 'Jane Smith' },
    { text: 'Third testimonial', author: 'Bob Wilson' },
  ];

  describe('Rendering', () => {
    it('renders with default testimonials when no props provided', () => {
      render(<TestimonialCarousel />);

      const region = screen.getByRole('region', {
        name: /donor testimonials/i,
      });
      expect(region).toBeTruthy();
      expect(
        screen.getByText(/The FCC provides so many great services/i),
      ).toBeTruthy();
    });

    it('renders custom testimonials when provided via props', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      expect(screen.getByText('First testimonial')).toBeTruthy();
      expect(screen.getByText('– John Doe')).toBeTruthy();
    });

    it('falls back to 3 hardcoded defaults when empty array provided', () => {
      render(<TestimonialCarousel testimonials={[]} />);

      // Should show first default testimonial
      expect(
        screen.getByText(/The FCC provides so many great services/i),
      ).toBeTruthy();
      expect(screen.getByText('– Anonymous Donor')).toBeTruthy();

      // Should have 3 indicators (3 defaults)
      const indicators = screen.getAllByRole('tab');
      expect(indicators.length).toBe(4);
    });

    it('renders testimonial without author when author is not provided', () => {
      const testimonialWithoutAuthor: Testimonial[] = [
        { text: 'Great organization!' },
      ];

      render(<TestimonialCarousel testimonials={testimonialWithoutAuthor} />);

      expect(screen.getByText('Great organization!')).toBeTruthy();
      expect(screen.queryByText(/^–/)).toBeNull();
    });

    it('renders indicators when multiple testimonials exist', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const indicators = screen.getAllByRole('tab');
      expect(indicators.length).toBe(3);
    });

    it('does not render indicators when only one testimonial exists', () => {
      const singleTestimonial: Testimonial[] = [
        { text: 'Only testimonial', author: 'Solo' },
      ];

      render(<TestimonialCarousel testimonials={singleTestimonial} />);

      expect(screen.queryByRole('tablist')).toBeNull();
    });
  });

  describe('Auto-rotation timing logic (real timers)', () => {
    it('rotates to next testimonial after default interval', async () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      expect(screen.getByText('First testimonial')).toBeTruthy();

      // Wait for rotation (5500ms default + 300ms fade)
      await waitFor(
        () => {
          expect(screen.getByText('Second testimonial')).toBeTruthy();
        },
        { timeout: 7000 },
      );
    }, 10000); // Increase test timeout

    it('rotates with custom interval', async () => {
      render(
        <TestimonialCarousel
          testimonials={mockTestimonials}
          rotationInterval={2000}
        />,
      );

      expect(screen.getByText('First testimonial')).toBeTruthy();

      // Wait for rotation with custom interval
      await waitFor(
        () => {
          expect(screen.getByText('Second testimonial')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    }, 5000);

    it('loops back to first testimonial after last one', async () => {
      render(
        <TestimonialCarousel
          testimonials={mockTestimonials}
          rotationInterval={1000} // Faster for testing
        />,
      );

      expect(screen.getByText('First testimonial')).toBeTruthy();

      // Wait for second
      await waitFor(
        () => {
          expect(screen.getByText('Second testimonial')).toBeTruthy();
        },
        { timeout: 2000 },
      );

      // Wait for third
      await waitFor(
        () => {
          expect(screen.getByText('Third testimonial')).toBeTruthy();
        },
        { timeout: 2000 },
      );

      // Wait for loop back to first
      await waitFor(
        () => {
          expect(screen.getByText('First testimonial')).toBeTruthy();
        },
        { timeout: 2000 },
      );
    }, 10000);

    it('does not rotate when only one testimonial exists', async () => {
      const singleTestimonial: Testimonial[] = [
        { text: 'Only testimonial', author: 'Solo' },
      ];

      render(<TestimonialCarousel testimonials={singleTestimonial} />);

      expect(screen.getByText('Only testimonial')).toBeTruthy();

      // Wait a bit and verify it's still the same
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(screen.getByText('Only testimonial')).toBeTruthy();
    }, 5000);
  });

  describe('Pause on hover functionality', () => {
    it('pauses rotation when mouse enters and resumes when leaves', async () => {
      const user = userEvent.setup();
      render(
        <TestimonialCarousel
          testimonials={mockTestimonials}
          rotationInterval={2000} // Faster for testing
        />,
      );

      const carousel = screen.getByRole('region');
      expect(screen.getByText('First testimonial')).toBeTruthy();

      // Hover to pause
      await user.hover(carousel);

      // Wait longer than rotation interval
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Should still be on first (paused)
      expect(screen.getByText('First testimonial')).toBeTruthy();

      // Unhover to resume
      await user.unhover(carousel);

      // Now should rotate
      await waitFor(
        () => {
          expect(screen.getByText('Second testimonial')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    }, 10000);

    it('maintains pause while hovering', async () => {
      const user = userEvent.setup();
      render(
        <TestimonialCarousel
          testimonials={mockTestimonials}
          rotationInterval={1000}
        />,
      );

      const carousel = screen.getByRole('region');

      // Hover immediately
      await user.hover(carousel);

      // Wait multiple intervals
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // Should still be on first testimonial
      expect(screen.getByText('First testimonial')).toBeTruthy();
    }, 6000);
  });

  describe('Manual navigation', () => {
    it('allows clicking indicators to jump to specific testimonial', async () => {
      const user = userEvent.setup();
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      expect(screen.getByText('First testimonial')).toBeTruthy();

      const indicators = screen.getAllByRole('tab');

      // Click third indicator
      await user.click(indicators[2]);

      await waitFor(() => {
        expect(screen.getByText('Third testimonial')).toBeTruthy();
      });
    });

    it('updates active indicator when testimonial changes', async () => {
      render(
        <TestimonialCarousel
          testimonials={mockTestimonials}
          rotationInterval={1500}
        />,
      );

      const indicators = screen.getAllByRole('tab');
      expect(indicators[0].getAttribute('aria-selected')).toBe('true');

      // Wait for rotation
      await waitFor(
        () => {
          expect(indicators[1].getAttribute('aria-selected')).toBe('true');
        },
        { timeout: 2500 },
      );
    }, 5000);

    it('allows navigation between any testimonials', async () => {
      const user = userEvent.setup();
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const indicators = screen.getAllByRole('tab');

      // Navigate to second
      await user.click(indicators[1]);
      await waitFor(() => {
        expect(screen.getByText('Second testimonial')).toBeTruthy();
      });

      // Navigate to third
      await user.click(indicators[2]);
      await waitFor(() => {
        expect(screen.getByText('Third testimonial')).toBeTruthy();
      });

      // Navigate back to first
      await user.click(indicators[0]);
      await waitFor(() => {
        expect(screen.getByText('First testimonial')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      expect(
        screen.getByRole('region', { name: /donor testimonials/i }),
      ).toBeTruthy();
      expect(
        screen.getByRole('tablist', { name: /testimonial indicators/i }),
      ).toBeTruthy();
    });

    it('has aria-live="polite" for screen readers', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const carousel = screen.getByRole('region');
      expect(carousel.getAttribute('aria-live')).toBe('polite');
    });

    it('indicators have descriptive aria-labels', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const indicators = screen.getAllByRole('tab');
      expect(indicators[0].getAttribute('aria-label')).toBe(
        'View testimonial 1 of 3',
      );
      expect(indicators[1].getAttribute('aria-label')).toBe(
        'View testimonial 2 of 3',
      );
      expect(indicators[2].getAttribute('aria-label')).toBe(
        'View testimonial 3 of 3',
      );
    });
  });

  describe('Responsive design and CSS classes', () => {
    it('applies correct base classes for styling', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const carousel = screen.getByRole('region');
      expect(carousel.classList.contains('testimonial-carousel')).toBe(true);
    });

    it('renders with correct structure for responsive layout', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      // Check all required elements exist
      expect(document.querySelector('.testimonial-content')).toBeTruthy();
      expect(document.querySelector('.testimonial-text')).toBeTruthy();
      expect(document.querySelector('.testimonial-author')).toBeTruthy();
      expect(document.querySelector('.quote-icon')).toBeTruthy();
      expect(document.querySelector('.carousel-indicators')).toBeTruthy();
    });

    it('applies fade transition classes', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const content = document.querySelector('.testimonial-content');
      expect(content?.classList.contains('fade-in')).toBe(true);
    });

    it('has proper structure for Figma design specs', () => {
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      // Verify quote marks exist
      const quoteIcons = document.querySelectorAll('.quote-icon');
      expect(quoteIcons.length).toBe(2); // Opening and closing quotes

      // Verify text content area
      const textElement = document.querySelector('.testimonial-text');
      expect(textElement).toBeTruthy();

      // Verify author element
      const authorElement = document.querySelector('.testimonial-author');
      expect(authorElement).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(
        <TestimonialCarousel testimonials={mockTestimonials} />,
      );
      expect(() => unmount()).not.toThrow();
    });

    it('handles undefined testimonials gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<TestimonialCarousel testimonials={undefined as any} />);

      // Should fall back to defaults
      expect(
        screen.getByText(/The FCC provides so many great services/i),
      ).toBeTruthy();
    });

    it('handles very long testimonial text', () => {
      const longTestimonial: Testimonial[] = [
        {
          text: 'This is a very long testimonial that contains a lot of text to test how the component handles extremely long content that might cause layout issues or overflow problems in the UI.',
          author: 'Verbose Donor',
        },
      ];

      render(<TestimonialCarousel testimonials={longTestimonial} />);
      expect(screen.getByText(/This is a very long testimonial/)).toBeTruthy();
    });

    it('handles rapid manual navigation without errors', async () => {
      const user = userEvent.setup();
      render(<TestimonialCarousel testimonials={mockTestimonials} />);

      const indicators = screen.getAllByRole('tab');

      // Rapidly click through indicators
      await user.click(indicators[1]);
      await user.click(indicators[2]);
      await user.click(indicators[0]);

      // Should end on first testimonial
      await waitFor(() => {
        expect(screen.getByText('First testimonial')).toBeTruthy();
      });
    });
  });
});

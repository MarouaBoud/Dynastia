/**
 * Unit tests for EmotionalText component
 *
 * Verifies that the component:
 * - Renders text correctly
 * - Applies type-based styling
 * - Validates text for emotional safety
 * - Throws errors for unsafe text in test mode
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { EmotionalText } from '../EmotionalText';

describe('EmotionalText', () => {
  // Suppress console warnings for tests
  const originalWarn = console.warn;
  beforeAll(() => {
    console.warn = jest.fn();
  });
  afterAll(() => {
    console.warn = originalWarn;
  });

  describe('Rendering', () => {
    it('should render text correctly', () => {
      const { getByText } = render(
        <EmotionalText text="Welcome back" validate={false} />
      );
      expect(getByText('Welcome back')).toBeTruthy();
    });

    it('should apply base styles', () => {
      const { getByText } = render(
        <EmotionalText text="Test text" validate={false} />
      );
      const element = getByText('Test text');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 16 }),
        ])
      );
    });

    it('should accept custom styles', () => {
      const customStyle = { fontWeight: 'bold' as const };
      const { getByText } = render(
        <EmotionalText text="Test text" style={customStyle} validate={false} />
      );
      const element = getByText('Test text');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ fontWeight: 'bold' }),
        ])
      );
    });
  });

  describe('Type-based styling', () => {
    it('should apply error styling', () => {
      const { getByText } = render(
        <EmotionalText text="Test error" type="error" validate={false} />
      );
      const element = getByText('Test error');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ color: '#DC2626' }),
        ])
      );
    });

    it('should apply success styling', () => {
      const { getByText } = render(
        <EmotionalText text="Test success" type="success" validate={false} />
      );
      const element = getByText('Test success');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ color: '#16A34A' }),
        ])
      );
    });

    it('should apply info styling', () => {
      const { getByText } = render(
        <EmotionalText text="Test info" type="info" validate={false} />
      );
      const element = getByText('Test info');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ color: '#1F2937' }),
        ])
      );
    });

    it('should apply progress styling', () => {
      const { getByText } = render(
        <EmotionalText text="Test progress" type="progress" validate={false} />
      );
      const element = getByText('Test progress');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ color: '#2563EB' }),
        ])
      );
    });

    it('should default to info styling when type not specified', () => {
      const { getByText } = render(
        <EmotionalText text="Default text" validate={false} />
      );
      const element = getByText('Default text');
      expect(element.props.style).toMatchObject(
        expect.arrayContaining([
          expect.objectContaining({ color: '#1F2937' }),
        ])
      );
    });
  });

  describe('Emotional safety validation', () => {
    it('should not throw for safe language', () => {
      expect(() => {
        render(
          <EmotionalText
            text="Let's try again"
            type="error"
            validate={true}
          />
        );
      }).not.toThrow();
    });

    it('should not throw for safe language from copy constants', () => {
      expect(() => {
        render(
          <EmotionalText
            text="We couldn't find that email. Let's try again."
            type="error"
            validate={true}
          />
        );
      }).not.toThrow();
    });

    it('should throw error for banned phrases in test mode', () => {
      expect(() => {
        render(
          <EmotionalText
            text="Invalid credentials"
            type="error"
            validate={true}
          />
        );
      }).toThrow(/EMOTIONAL SAFETY VIOLATION/);
    });

    it('should throw error for blame language in test mode', () => {
      expect(() => {
        render(
          <EmotionalText
            text="You failed to log in"
            type="error"
            validate={true}
          />
        );
      }).toThrow(/EMOTIONAL SAFETY VIOLATION/);
    });

    it('should throw error for comparison language in test mode', () => {
      expect(() => {
        render(
          <EmotionalText
            text="You're behind on your savings"
            type="progress"
            validate={true}
          />
        );
      }).toThrow(/EMOTIONAL SAFETY VIOLATION/);
    });

    it('should skip validation when validate=false', () => {
      expect(() => {
        render(
          <EmotionalText
            text="Invalid credentials"
            type="error"
            validate={false}
          />
        );
      }).not.toThrow();
    });

    it('should provide specific suggestions in error message', () => {
      try {
        render(
          <EmotionalText
            text="Invalid credentials"
            type="error"
            validate={true}
          />
        );
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Issues:');
        expect(error.message).toContain('Suggestions:');
        expect(error.message).toContain('invalid');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByText } = render(
        <EmotionalText text="Accessible text" validate={false} />
      );
      const element = getByText('Accessible text');
      expect(element.props.accessibilityRole).toBe('text');
    });
  });

  describe('Additional props', () => {
    it('should pass through additional Text props', () => {
      const { getByText } = render(
        <EmotionalText
          text="Test text"
          validate={false}
          numberOfLines={2}
          ellipsizeMode="tail"
        />
      );
      const element = getByText('Test text');
      expect(element.props.numberOfLines).toBe(2);
      expect(element.props.ellipsizeMode).toBe('tail');
    });
  });
});

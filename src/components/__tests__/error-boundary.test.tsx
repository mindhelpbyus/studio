import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { ApiErrorBoundary, ComponentErrorBoundary } from '../error-boundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We apologize for the inconvenience. An unexpected error has occurred.')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development Only):')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development Only):')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should reset error when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should call custom onError handler', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should render custom fallback component', () => {
    const CustomFallback = ({ error, resetError }: any) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});

describe('ApiErrorBoundary', () => {
  it('should render API-specific error message', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError />
      </ApiErrorBoundary>
    );

    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});

describe('ComponentErrorBoundary', () => {
  it('should render component-specific error message', () => {
    render(
      <ComponentErrorBoundary>
        <ThrowError />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText('This component failed to load')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MoreEventsLink } from '../more-events-link';

describe('MoreEventsLink', () => {
  const defaultProps = {
    count: 3,
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct count text', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    expect(screen.getByText('+3 more...')).toBeInTheDocument();
  });

  it('renders with different count values', () => {
    render(<MoreEventsLink {...defaultProps} count={1} />);
    expect(screen.getByText('+1 more...')).toBeInTheDocument();

    render(<MoreEventsLink {...defaultProps} count={10} />);
    expect(screen.getByText('+10 more...')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    const linkElement = screen.getByText('+3 more...');
    expect(linkElement).toHaveClass(
      'text-xs',
      'text-blue-600',
      'hover:text-blue-800',
      'hover:underline',
      'w-full',
      'text-left',
      'p-1',
      'rounded',
      'transition-colors',
      'hover:bg-blue-50'
    );
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<MoreEventsLink {...defaultProps} onClick={onClick} />);
    
    const linkElement = screen.getByText('+3 more...');
    fireEvent.click(linkElement);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('passes click event to onClick handler', () => {
    const onClick = jest.fn();
    render(<MoreEventsLink {...defaultProps} onClick={onClick} />);
    
    const linkElement = screen.getByText('+3 more...');
    fireEvent.click(linkElement);
    
    expect(onClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('renders as a button element', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    const linkElement = screen.getByRole('button');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveTextContent('+3 more...');
  });

  it('has proper accessibility attributes', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    const linkElement = screen.getByRole('button');
    expect(linkElement).toBeInTheDocument();
  });

  it('handles zero count gracefully', () => {
    render(<MoreEventsLink {...defaultProps} count={0} />);
    
    expect(screen.getByText('+0 more...')).toBeInTheDocument();
  });

  it('handles large count numbers', () => {
    render(<MoreEventsLink {...defaultProps} count={999} />);
    
    expect(screen.getByText('+999 more...')).toBeInTheDocument();
  });

  it('maintains hover state styling', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    const linkElement = screen.getByText('+3 more...');
    
    // Check hover classes are present
    expect(linkElement).toHaveClass('hover:text-blue-800', 'hover:underline', 'hover:bg-blue-50');
  });

  it('has full width and left alignment', () => {
    render(<MoreEventsLink {...defaultProps} />);
    
    const linkElement = screen.getByText('+3 more...');
    expect(linkElement).toHaveClass('w-full', 'text-left');
  });
});
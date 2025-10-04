import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GrokLayout } from '../GrokLayout'

// Mock the hooks
jest.mock('@/hooks/useGrokTheme', () => ({
  useGrokTheme: () => ({
    theme: 'dark',
    isLoading: false
  })
}))

jest.mock('@/hooks/useGrokAnimations', () => ({
  useGrokAnimations: () => ({
    getFadeInClasses: () => 'grok-animate-fade-in'
  })
}))

describe('GrokLayout', () => {
  it('renders children correctly', () => {
    render(
      <GrokLayout>
        <div>Main content</div>
      </GrokLayout>
    )
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    const header = <div>Header content</div>
    render(
      <GrokLayout header={header}>
        <div>Main content</div>
      </GrokLayout>
    )
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('renders sidebar when provided and showSidebar is true', () => {
    const sidebar = <div>Sidebar content</div>
    render(
      <GrokLayout sidebar={sidebar} showSidebar={true}>
        <div>Main content</div>
      </GrokLayout>
    )
    expect(screen.getByText('Sidebar content')).toBeInTheDocument()
  })

  it('does not render sidebar when showSidebar is false', () => {
    const sidebar = <div>Sidebar content</div>
    render(
      <GrokLayout sidebar={sidebar} showSidebar={false}>
        <div>Main content</div>
      </GrokLayout>
    )
    expect(screen.queryByText('Sidebar content')).not.toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    const footer = <div>Footer content</div>
    render(
      <GrokLayout footer={footer}>
        <div>Main content</div>
      </GrokLayout>
    )
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies collapsed sidebar styles when sidebarCollapsed is true', () => {
    const sidebar = <div>Sidebar content</div>
    render(
      <GrokLayout sidebar={sidebar} sidebarCollapsed={true}>
        <div>Main content</div>
      </GrokLayout>
    )
    const sidebarElement = screen.getByText('Sidebar content').parentElement
    expect(sidebarElement).toHaveClass('lg:w-16')
  })

  it('applies expanded sidebar styles when sidebarCollapsed is false', () => {
    const sidebar = <div>Sidebar content</div>
    render(
      <GrokLayout sidebar={sidebar} sidebarCollapsed={false}>
        <div>Main content</div>
      </GrokLayout>
    )
    const sidebarElement = screen.getByText('Sidebar content').parentElement
    expect(sidebarElement).toHaveClass('lg:w-64')
  })

  it('applies custom className', () => {
    render(
      <GrokLayout className="custom-layout-class">
        <div>Main content</div>
      </GrokLayout>
    )
    const layoutElement = screen.getByText('Main content').closest('.min-h-screen')
    expect(layoutElement).toHaveClass('custom-layout-class')
  })

  it('has proper layout structure', () => {
    const header = <div>Header</div>
    const sidebar = <div>Sidebar</div>
    const footer = <div>Footer</div>
    
    render(
      <GrokLayout header={header} sidebar={sidebar} footer={footer}>
        <div>Main content</div>
      </GrokLayout>
    )

    // Check that all elements are present
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()

    // Check header is in a header element
    const headerElement = screen.getByText('Header').closest('header')
    expect(headerElement).toBeInTheDocument()

    // Check sidebar is in an aside element
    const sidebarElement = screen.getByText('Sidebar').closest('aside')
    expect(sidebarElement).toBeInTheDocument()

    // Check footer is in a footer element
    const footerElement = screen.getByText('Footer').closest('footer')
    expect(footerElement).toBeInTheDocument()
  })
})
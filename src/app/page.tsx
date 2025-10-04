
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturesList } from '@/components/features-list';
import { Header } from '@/components/header';
import { MentalHealthChecker } from '@/components/mental-health-checker';
import { NexusButton } from '@/components/nexus-ui/NexusButton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const footer = (
    <div className="py-8 bg-surface border-t border-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-6 gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Nexus. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link href="#" className="text-sm text-muted-foreground hover:text-primary nexus-transition">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-primary nexus-transition">
            Terms of Service
          </Link>
          <Link href="/provider-portal/calendar" className="text-sm text-muted-foreground hover:text-primary nexus-transition">
            Provider Portal
          </Link>
          <Link href="/calendar-demo" className="text-sm text-primary hover:text-primary-hover nexus-transition font-medium">
            📅 Calendar Demo
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header />
      <main className="flex-1 relative">
        {/* Hero Section - Zoho-inspired clean design */}
        <section className="relative w-full bg-background overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-primary/5"></div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh] py-20">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Build stronger
                    <br />
                    <span className="text-primary">patient relationships</span>
                  </h1>
                  
                  <p className="text-xl text-text-secondary leading-relaxed max-w-lg">
                    Nexus CRM helps healthcare providers deliver personalized patient experiences, streamline operations, and grow their practice with intelligent automation.
                  </p>
                </div>
                
                {/* Key Features */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🔒', text: 'HIPAA Compliant' },
                    { icon: '🤖', text: 'AI-Powered' },
                    { icon: '📊', text: 'Real-time Analytics' },
                    { icon: '🔗', text: 'Easy Integration' }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-foreground font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-semibold rounded-lg hover:border-primary transition-all duration-200">
                    Watch demo
                  </button>
                </div>
              </div>
              
              {/* Right Visual */}
              <div className="relative">
                {/* Main Dashboard */}
                <div className="relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* Browser Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-error rounded-full"></div>
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">nexus-crm.com</div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">Patient Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Today, March 15, 2024</p>
                      </div>
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">247</div>
                        <div className="text-xs text-muted-foreground">Patients</div>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <div className="text-2xl font-bold text-success">18</div>
                        <div className="text-xs text-muted-foreground">Today</div>
                      </div>
                      <div className="text-center p-3 bg-accent-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-accent-primary">94%</div>
                        <div className="text-xs text-muted-foreground">Satisfaction</div>
                      </div>
                    </div>
                    
                    {/* Patient List */}
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah Johnson', time: '10:30 AM', status: 'active' },
                        { name: 'Michael Chen', time: '11:15 AM', status: 'waiting' },
                        { name: 'Emma Davis', time: '2:00 PM', status: 'scheduled' }
                      ].map((patient, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-card-foreground text-sm">{patient.name}</div>
                              <div className="text-xs text-muted-foreground">{patient.time}</div>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            patient.status === 'active' ? 'bg-success' :
                            patient.status === 'waiting' ? 'bg-warning' : 'bg-primary'
                          }`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-card rounded-lg shadow-lg border border-border p-4 transform -rotate-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs font-medium text-card-foreground">Online</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-card rounded-lg shadow-lg border border-border p-4 transform rotate-6">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span className="text-xs font-medium text-card-foreground">3 new messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-surface">
          <div className="container mx-auto px-4 md:px-6">
            <FeaturesList />
          </div>
        </section>

        {/* Mental Health Checker Section */}
        <section id="mental-health-checker" className="w-full py-20 md:py-32 bg-gradient-to-br from-background to-surface relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-primary/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <MentalHealthChecker />
          </div>
        </section>
      </main>
      {footer}
    </div>
  );
}

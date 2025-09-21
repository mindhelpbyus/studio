# Vivalé Healthcare Platform

Enterprise-grade healthcare management platform built with Next.js 15, TypeScript, and Clean Architecture. HIPAA/GDPR compliant with multi-cloud deployment support.

## 🏥 Key Features

- **Provider Portal** - Calendar management, patient records, telehealth
- **Patient Portal** - Online booking, secure messaging, health records
- **AI Health Tools** - Mental health assessments and symptom analysis
- **Multi-Cloud Ready** - Deploy on AWS, Azure, GCP, or OCI
- **Enterprise Security** - HIPAA/GDPR compliance with audit logging

## 📚 Documentation

- **[Complete Architecture Guide](docs/architecture/clean-architecture.md)** - Clean Architecture + Multi-Cloud + Healthcare modules
- **[Healthcare Structure Refactor](HEALTHCARE_STRUCTURE_REFACTOR.md)** - Industry standard project structure
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Multi-cloud deployment instructions
- **[Compliance Standards](COMPLIANCE_STANDARDS_REPORT.md)** - HIPAA/GDPR compliance details
- **[GCP Integration](GCP_COMPATIBILITY_REPORT.md)** - Google Cloud Platform setup

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Deploy to cloud
npm run deploy
```

### Platform Features
- **Enterprise Security** - JWT authentication, RBAC, CSRF protection
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance** - Optimized for speed and scalability
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live notifications and updates
- **Offline Support** - PWA capabilities for offline access

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing
- **Repository Pattern** - Clean data layer architecture

### Development & Testing
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates

### AI & Analytics
- **Google Genkit** - AI integration framework
- **Mental Health AI** - Symptom analysis and recommendations

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vivale-healthcare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-chars
   NEXT_PUBLIC_APP_URL=http://localhost:9002
   # Add other required variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

### Test Accounts
- **Provider**: `provider@example.com` / `password123`
- **Patient**: `patient@example.com` / `password123`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (portal)/          # Patient portal
│   ├── (provider)/        # Provider portal
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── provider-portal/   # Provider-specific components
│   └── patient-portal/    # Patient-specific components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── database/         # Data layer
│   ├── validation/       # Schema validation
│   ├── errors/           # Error handling
│   └── accessibility/    # A11y utilities
└── hooks/                # Custom React hooks
```

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run with coverage report
```

### End-to-End Tests
```bash
npm run e2e              # Run E2E tests
npm run e2e:ui           # Run with Playwright UI
```

### Code Quality
```bash
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
npm run typecheck        # TypeScript type checking
npm run format           # Format code with Prettier
npm run validate         # Run all quality checks
```

## 🔒 Security Features

- **Authentication**: JWT-based with secure HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive schema validation with Zod
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: API endpoint protection
- **Security Headers**: Comprehensive security header configuration
- **Environment Validation**: Strict environment variable validation

## ♿ Accessibility

This application is built with accessibility as a core requirement:

- **WCAG 2.1 AA Compliance** - Meets international accessibility standards
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - Comprehensive ARIA labels and live regions
- **Focus Management** - Proper focus trapping and restoration
- **Color Contrast** - Meets AA contrast requirements
- **Responsive Design** - Accessible on all device sizes

## 🚀 Performance

- **Core Web Vitals** - Optimized for Google's performance metrics
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Next.js Image component with optimization
- **Caching Strategy** - Comprehensive caching at multiple levels
- **Bundle Analysis** - Regular bundle size monitoring

## 📊 Monitoring & Analytics

- **Error Tracking** - Comprehensive error logging and monitoring
- **Performance Monitoring** - Real-time performance metrics
- **User Analytics** - Privacy-compliant usage analytics
- **Health Checks** - Application health monitoring
- **Structured Logging** - Detailed application logging

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes | `http://localhost:9002` |
| `DATABASE_URL` | Database connection string | No | - |
| `REDIS_URL` | Redis connection string | No | - |

See `.env.local` for a complete list of configuration options.

### Feature Flags

Control application features through environment variables:

- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics tracking
- `NEXT_PUBLIC_ENABLE_PWA` - Enable PWA features
- `NEXT_PUBLIC_ENABLE_OFFLINE` - Enable offline support

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
docker build -t vivale-healthcare .
docker run -p 3000:3000 vivale-healthcare
```

### Environment Setup
1. Set production environment variables
2. Configure database connections
3. Set up monitoring and logging
4. Configure CDN and caching
5. Set up SSL certificates

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Run tests** (`npm run validate`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Ensure accessibility compliance
- Follow the established code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/vivale-healthcare/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/vivale-healthcare/discussions)

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core authentication and authorization
- ✅ Provider calendar and scheduling
- ✅ Patient portal foundation
- ✅ Basic telehealth integration

### Phase 2 (Next Quarter)
- 🔄 Electronic Health Records (EHR)
- 🔄 Advanced reporting and analytics
- 🔄 Mobile application
- 🔄 Integration APIs

### Phase 3 (Future)
- 📋 AI-powered diagnostics
- 📋 Wearable device integration
- 📋 Advanced telemedicine features
- 📋 Multi-language support

---

**Built with ❤️ for healthcare providers and patients worldwide.**

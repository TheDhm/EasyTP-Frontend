import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { Header } from '@/components/layout/Header';
import {
  Cloud,
  Network,
  Code,
  Shield,
  Server,
  Database,
  ExternalLink,
  Github as GitHubIcon,
  Heart,
  CheckCircle
} from 'lucide-react';

// Custom CSS animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 1s ease;
  }
`;

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen pt-16" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center text-center text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')"
          }}
        />

        <div className="relative z-10 w-full px-8">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up" style={{
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            animationDelay: '0s'
          }}>
            EasyTP SERVER
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95 font-normal leading-relaxed animate-fade-in-up" style={{
            animationDelay: '0.2s',
            animationFillMode: 'both'
          }}>
            Cloud-native labs & storage management platform deployed on Hetzner Cloud with Kubernetes (k3s).
            Experience modern infrastructure with enterprise-grade scalability and performance.
          </p>

          {/* Technology Badges */}
          <div className="flex justify-center flex-wrap gap-4 mb-12 animate-fade-in-up" style={{
            animationDelay: '0.4s',
            animationFillMode: 'both'
          }}>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Cloud size={16} />
              Hetzner Cloud
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Network size={16} />
              Kubernetes (k3s)
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Code size={16} />
              React
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Code size={16} />
              Django
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Database size={16} />
              Django REST Framework
            </span>
            <span className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white font-medium text-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-1 flex items-center gap-2">
              <Shield size={16} />
              Cloud-Native
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 animate-fade-in-up" style={{
            animationDelay: '0.6s',
            animationFillMode: 'both'
          }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Link to="/apps">Manage Apps</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Link to="/login">Sign in to Try Live Demo</Link>
                  </Button>
                  <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Link to="/login?guest=true">Or Continue as Guest</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-6">
              <Button asChild size="lg" className="bg-gray-900/90 hover:bg-black text-white border border-gray-700 hover:border-gray-600 px-8 py-3 rounded-full transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                <a href="https://github.com/TheDhm/EasyTP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <GitHubIcon size={20} />
                  View Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="flex-1 w-full px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Modern Cloud Infrastructure
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-5xl mx-auto">
            Built with cutting-edge technologies and deployed on enterprise-grade infrastructure
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <Card className="flex-1 min-w-64 max-w-80 p-8 text-left hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border-t-4 border-t-blue-500 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Cloud className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Hetzner Cloud Deployment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deployed on Hetzner's high-performance cloud infrastructure with SSD storage and premium networking
              </p>
            </Card>

            <Card className="flex-1 min-w-64 max-w-80 p-8 text-left hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border-t-4 border-t-purple-500 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Network className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Kubernetes Orchestration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Leveraging k3s for lightweight, production-ready Kubernetes with automated scaling and healing
              </p>
            </Card>

            <Card className="flex-1 min-w-64 max-w-80 p-8 text-left hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border-t-4 border-t-red-500 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Server className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Enterprise Performance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                High-availability setup with load balancing, persistent storage, and 99.9% uptime SLA
              </p>
            </Card>

            <Card className="flex-1 min-w-64 max-w-80 p-8 text-left hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl border-t-4 border-t-green-500 relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Cloud-Native Security
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Container security, network policies, TLS encryption, and automated security updates
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Deployment Showcase */}
      <div id="deployment" className="bg-gray-50 py-16">
        <div className="flex-1 w-full px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Deployment Architecture
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-5xl mx-auto">
            Explore the cloud-native architecture powering EasyTP SERVER
          </p>

          <Card className="p-12 shadow-xl border-l-4 border-l-purple-500 mb-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Network className="text-white" size={20} />
                  </div>
                  Kubernetes Deployment
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  EasyTP is deployed using k3s on Hetzner Cloud, providing a lightweight yet powerful Kubernetes experience.
                  The application runs in containers with automated scaling, health checks, and zero-downtime deployments.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">Automated container orchestration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">Horizontal pod autoscaling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">Persistent volume storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-gray-700">Rolling updates with health checks</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-gray-900 text-gray-300 p-6 rounded-xl font-mono text-sm overflow-x-auto">
{`# Example k3s deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: easytp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: easytp
  template:
    spec:
      containers:
      - name: easytp
        image: easytp:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: easytp-secrets
              key: database-url`}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-12 text-center shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-3">
              <GitHubIcon className="text-gray-800" size={28} />
              Open Source & Available on GitHub
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Complete source code, Kubernetes manifests, and deployment scripts available for exploration and contribution.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-3 rounded-full transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl">
              <a href="https://github.com/TheDhm/EasyTP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                <GitHubIcon size={20} />
                View on GitHub
                <ExternalLink size={16} />
              </a>
            </Button>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-12">
        <div className="flex-1 w-full px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6 text-white/30">
              <div className="w-px h-8 bg-white/20"></div>
              <Heart className="text-red-400" size={20} />
              <span className="text-lg font-medium">Built with Modern DevOps</span>
              <div className="w-px h-8 bg-white/20"></div>
            </div>
            <p className="text-white/80 mb-4">
              &copy; 2025 EasyTP SERVER. Cloud-native educational labs and application management platform.
            </p>
            <p className="text-white/60">
              Powered by Hetzner Cloud • Orchestrated with k3s • Built with Django
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
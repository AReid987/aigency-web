import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, Users, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Aigency ✨
            </div>
            <Button 
              onClick={onLogin}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            From Idea to Launch
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Powered by AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Aigency helps individual creators and small teams accelerate their journey from initial concepts to market-ready products using AI-guided project management and infinite canvas collaboration.
          </p>
          <Button 
            size="lg" 
            onClick={onLogin}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Infinite Canvas</CardTitle>
              <CardDescription>
                Visualize and organize your ideas on an unlimited canvas with AI-powered nodes and connections.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">AI-Guided Documents</CardTitle>
              <CardDescription>
                Generate structured documents like PRDs, project briefs, and lean canvases through AI-powered brainstorming.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Team Collaboration</CardTitle>
              <CardDescription>
                Share your canvases with team members for asynchronous collaboration, viewing, and commenting.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Ideas?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators accelerating their journey from concept to launch.
          </p>
          <Button 
            size="lg" 
            onClick={onLogin}
            variant="secondary"
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Start Your Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
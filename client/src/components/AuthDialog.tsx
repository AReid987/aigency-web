import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { User } from '../../../server/src/schema';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

export function AuthDialog({ open, onOpenChange, onLogin, onSignup }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await trpc.login.mutate({
        email: loginData.email,
        password: loginData.password
      });
      
      onLogin(response.user);
      onOpenChange(false);
      
      // Reset form
      setLoginData({ email: '', password: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await trpc.signup.mutate({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });
      
      onSignup(response.user);
      onOpenChange(false);
      
      // Reset form
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Aigency ✨
          </DialogTitle>
          <DialogDescription className="text-center">
            Join thousands of creators accelerating their ideas to launch
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="user@example.com"
                      value={loginData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="password"
                      value={loginData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  
                  <div className="text-sm text-gray-600 text-center">
                    Demo: use <code className="bg-gray-100 px-1 rounded">user@example.com</code> / <code className="bg-gray-100 px-1 rounded">password</code>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Get started with your free Aigency account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSignupData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john@example.com"
                      value={signupData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSignupData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={signupData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSignupData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
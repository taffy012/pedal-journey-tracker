import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bike } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="bg-primary rounded-full p-4 mb-4">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Track your rides with precision</p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg border-gray-200 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg border-gray-200 focus:border-primary"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:text-primary/90 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
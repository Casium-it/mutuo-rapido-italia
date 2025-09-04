import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { signIn, user, loading: authLoading } = useAuth();
  const { isAdmin, roleLoading, roleChecked } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect after successful login and role check
  useEffect(() => {
    if (user && !authLoading && roleChecked && !roleLoading) {
      const from = (location.state as any)?.from?.pathname;
      
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        // Regular users go to requested page or home
        navigate(from || '/', { replace: true });
      }
    }
  }, [user, authLoading, roleChecked, roleLoading, isAdmin, navigate, location]);

  // Show loading while logging in or checking role
  const isLoading = loginLoading || (user && (!roleChecked || roleLoading));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password",
        variant: "destructive"
      });
      return;
    }

    setLoginLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Errore di accesso",
            description: "Email o password non corretti",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Errore",
            description: error.message,
            variant: "destructive"
          });
        }
        setLoginLoading(false);
      }
      // Don't set loading to false here - let the useEffect handle redirect
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore imprevisto durante l'accesso",
        variant: "destructive"
      });
      setLoginLoading(false);
    }
  };

  // Show loading screen during login process
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {loginLoading ? 'Accesso in corso...' : 'Verifica permessi...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#245C4F]">GoMutuo</CardTitle>
          <CardDescription>Accedi per continuare</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inserisci la tua email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="inserisci la tua password"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44]"
              disabled={isLoading}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
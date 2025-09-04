
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !authLoading) {
      // For admin users, always redirect to admin - let ProtectedRoute handle role verification
      const from = (location.state as any)?.from?.pathname;
      
      if (from && from.startsWith('/admin')) {
        // If coming from admin route, go back there
        navigate(from, { replace: true });
      } else {
        // Default: try admin first, if not admin ProtectedRoute will handle the redirect
        navigate('/admin', { replace: true });
      }
    }
  }, [user, authLoading, navigate, location]);

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

    setLoading(true);
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
      }
      // Remove success toast to prevent showing before redirect
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore imprevisto durante l'accesso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44]"
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

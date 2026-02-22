import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAddAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSetupPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const addAdmin = useAddAdmin();
  const [principalId, setPrincipalId] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    if (currentPrincipal) {
      setPrincipalId(currentPrincipal);
    }
  }, [currentPrincipal]);

  const handleCopyPrincipal = () => {
    if (currentPrincipal) {
      navigator.clipboard.writeText(currentPrincipal);
      setShowCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (principalId.trim()) {
      addAdmin.mutate(principalId.trim(), {
        onSuccess: () => {
          toast.success('Admin added successfully! Redirecting to dashboard...');
          setTimeout(() => {
            navigate({ to: '/admin/dashboard' });
          }, 1500);
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-2xl shadow-warm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Admin Setup</CardTitle>
          <CardDescription>Configure administrator access for Cognify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need to log in with Internet Identity to set up admin access. Your Internet Identity principal will be used as the admin identifier.
                </AlertDescription>
              </Alert>
              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  You are logged in. Your principal ID is displayed below.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Your Principal ID</Label>
                  <p className="text-sm text-muted-foreground">
                    This is your unique identifier on the Internet Computer. Copy this ID to grant yourself admin access.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={currentPrincipal || ''}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPrincipal}
                      className="flex-shrink-0"
                    >
                      {showCopied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="principalId" className="text-base font-semibold">
                        Add Admin Principal ID
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enter the principal ID of the user you want to grant admin access to. This is typically your own principal ID shown above.
                      </p>
                      <Input
                        id="principalId"
                        type="text"
                        placeholder="Enter principal ID"
                        value={principalId}
                        onChange={(e) => setPrincipalId(e.target.value)}
                        required
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={addAdmin.isPending || !principalId.trim()}
                        className="flex-1"
                      >
                        {addAdmin.isPending ? 'Adding Admin...' : 'Grant Admin Access'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate({ to: '/' })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> Only existing admins can add new admins. If this is the first admin setup, the system will automatically grant admin access to the first authenticated user.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

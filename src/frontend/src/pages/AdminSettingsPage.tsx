import { useState } from 'react';
import { useIsCallerAdmin, useAddAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Shield, Copy, CheckCircle, Info, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();
  const addAdmin = useAddAdmin();
  const [newAdminPrincipal, setNewAdminPrincipal] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString();

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
    if (newAdminPrincipal.trim()) {
      addAdmin.mutate(newAdminPrincipal.trim(), {
        onSuccess: () => {
          setNewAdminPrincipal('');
        }
      });
    }
  };

  if (adminLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Admin Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage administrator access and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your Admin Principal ID
            </CardTitle>
            <CardDescription>
              This is your unique administrator identifier on the Internet Computer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Share this principal ID with other users who need admin access. They can use it during the admin setup process.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Administrator
            </CardTitle>
            <CardDescription>
              Grant admin privileges to another user by entering their principal ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newAdminPrincipal">Principal ID</Label>
                <Input
                  id="newAdminPrincipal"
                  type="text"
                  placeholder="Enter principal ID of the new admin"
                  value={newAdminPrincipal}
                  onChange={(e) => setNewAdminPrincipal(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The user must first log in with Internet Identity to obtain their principal ID
                </p>
              </div>

              <Button
                type="submit"
                disabled={addAdmin.isPending || !newAdminPrincipal.trim()}
              >
                {addAdmin.isPending ? 'Adding Admin...' : 'Add Administrator'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to add a new admin:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Ask the user to log in with Internet Identity</li>
              <li>Have them navigate to their profile or use the admin setup page to view their principal ID</li>
              <li>Copy their principal ID and paste it in the form above</li>
              <li>Click "Add Administrator" to grant them admin access</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

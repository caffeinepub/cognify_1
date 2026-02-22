import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ChevronDown, ChevronUp, Key, UserCheck, Info, ExternalLink } from 'lucide-react';

export default function OwnerAccessGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-2 border-primary/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Owner Access Guide</CardTitle>
                <CardDescription>How to access Cognify as an administrator</CardDescription>
              </div>
            </div>
            {isOpen ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Cognify uses <strong>Internet Identity</strong> for secure, blockchain-based authentication. No passwords needed!
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      What is Internet Identity?
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Internet Identity is a secure authentication system built on the Internet Computer blockchain. It uses your device's biometrics (fingerprint, Face ID) or hardware security keys instead of passwords. Once created, your Internet Identity works across all Internet Computer applications.
                    </p>
                    <a
                      href="https://identity.ic0.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      Learn more about Internet Identity
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      First-Time Admin Setup
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      The first user to log in automatically becomes an administrator. Here's how to get started:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                      <li>Click the "Login" button in the header</li>
                      <li>Create a new Internet Identity (or use an existing one)</li>
                      <li>Complete the authentication using your device's biometrics or security key</li>
                      <li>You'll be automatically granted admin access as the first user</li>
                      <li>Set up your profile name when prompted</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Finding Your Principal ID</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      Your Principal ID is your unique identifier on the Internet Computer. You'll need it to add other admins:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                      <li>After logging in, navigate to Admin Settings</li>
                      <li>Your Principal ID will be displayed at the top</li>
                      <li>Click the copy button to copy it to your clipboard</li>
                      <li>Share this ID with other users you want to grant admin access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Adding Additional Admins</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      Once you're an admin, you can grant admin access to other users:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                      <li>Have the new admin log in with Internet Identity</li>
                      <li>Ask them to copy their Principal ID</li>
                      <li>Go to Admin Settings in your admin dashboard</li>
                      <li>Paste their Principal ID in the "Add New Administrator" form</li>
                      <li>Click "Add Administrator" to grant them access</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/admin-setup" className="flex-1">
                  <Button variant="default" className="w-full">
                    Go to Admin Setup
                  </Button>
                </Link>
                <a
                  href="https://identity.ic0.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Create Internet Identity
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

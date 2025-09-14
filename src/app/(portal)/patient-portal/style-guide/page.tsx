import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PatientPortalHeader } from '@/components/patient-portal/header';
import { HeartPulse, AlertCircle, Terminal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export default function StyleGuidePage() {
  const colors = [
    { name: 'Primary', value: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' },
    { name: 'Secondary', value: 'hsl(var(--secondary))', text: 'hsl(var(--secondary-foreground))' },
    { name: 'Destructive', value: 'hsl(var(--destructive))', text: 'hsl(var(--destructive-foreground))' },
    { name: 'Accent', value: 'hsl(var(--accent))', text: 'hsl(var(--accent-foreground))' },
    { name: 'Background', value: 'hsl(var(--background))', text: 'hsl(var(--foreground))' },
    { name: 'Foreground', value: 'hsl(var(--foreground))', text: 'hsl(var(--background))' },
    { name: 'Card', value: 'hsl(var(--card))', text: 'hsl(var(--card-foreground))' },
    { name: 'Muted', value: 'hsl(var(--muted))', text: 'hsl(var(--muted-foreground))' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <PatientPortalHeader />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">Style Guide</h1>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {colors.map(color => (
              <div key={color.name} className="flex flex-col items-center">
                <div 
                  className="w-full h-24 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: color.value, color: color.text }}
                >
                  <span className="font-bold">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Components</h2>
          <div className="space-y-10">

            {/* Buttons */}
            <div>
              <h3 className="text-xl font-medium mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button>Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button size="lg">Large</Button>
                <Button size="sm">Small</Button>
                <Button><HeartPulse className="mr-2" />With Icon</Button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-xl font-medium mb-4">Cards</h3>
              <Card className="max-w-sm">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>This is a card description.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the main content area of the card. It can contain any information you need.</p>
                </CardContent>
              </Card>
            </div>

            {/* Avatars */}
            <div>
              <h3 className="text-xl font-medium mb-4">Avatars</h3>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/avatar1/100/100" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                 <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-xl font-medium mb-4">Badges</h3>
              <div className="flex gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

             {/* Alerts */}
             <div>
              <h3 className="text-xl font-medium mb-4">Alerts</h3>
              <div className="space-y-4">
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can add components to your app using the cli.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            
            {/* Modal (Alert Dialog) */}
            <div>
              <h3 className="text-xl font-medium mb-4">Modal (Alert Dialog)</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Show Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

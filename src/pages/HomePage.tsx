// Home page of the app.
// This is a showcase demo demonstrating the component library.
// Replace this file with your actual app UI. Do not delete it to use some other file as homepage. Simply replace the entire contents of this file.

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Layers,
  LayoutDashboard,
  Moon,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'
import { HAS_TEMPLATE_DEMO, TemplateDemo } from '@/components/TemplateDemo'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster, toast } from '@/components/ui/sonner'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Vite with instant HMR and optimized production builds.',
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: '46+ polished components with dark mode and animations.',
  },
  {
    icon: Shield,
    title: 'Production Ready',
    description: 'TypeScript, security headers, rate limiting, and error handling.',
  },
  {
    icon: Layers,
    title: 'Cloudflare Workers',
    description: 'Edge-first deployment with Durable Objects and KV storage.',
  },
]

const stats = [
  { label: 'Components', value: '46+' },
  { label: 'TypeScript', value: '100%' },
  { label: 'Bundle Size', value: '<50KB' },
  { label: 'Lighthouse', value: '100' },
]

export function HomePage() {
  const [progress, setProgress] = useState(67)
  const [sliderValue, setSliderValue] = useState([50])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // If template has a custom demo, show that instead
  if (HAS_TEMPLATE_DEMO) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden relative">
        <ThemeToggle />
        <div className="absolute inset-0 bg-gradient-rainbow opacity-10 dark:opacity-20 pointer-events-none" />
        <div className="text-center space-y-8 relative z-10 animate-fade-in w-full">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary floating">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
              Creating your <span className="text-gradient">app</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
              Your application would be ready soon.
            </p>
          </div>
          <div className="max-w-5xl mx-auto text-left">
            <TemplateDemo />
          </div>
        </div>
        <Toaster richColors closeButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ThemeToggle />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-rainbow opacity-[0.07] dark:opacity-[0.15]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Production-Ready Template
            </Badge>

            {/* Heading */}
            <h1 className="text-display mb-6">
              Build stunning apps with{' '}
              <span className="text-gradient">modern tools</span>
            </h1>

            {/* Subheading */}
            <p className="text-body max-w-2xl mx-auto mb-10">
              A beautiful, fully-featured React template with 46+ components, TypeScript, Tailwind CSS,
              and Cloudflare Workers. Start building your next project in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="btn-gradient px-8 text-base font-semibold"
                onClick={() => toast.success('Welcome!', { description: 'Start building something amazing.' })}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 text-base">
                <Code2 className="w-4 h-4 mr-2" />
                View Components
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need to ship fast
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built with the latest technologies and best practices for modern web development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Component Showcase Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Components</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Beautiful, accessible components
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              46+ production-ready components built with Radix UI and shadcn/ui.
            </p>
          </div>

          <Tabs defaultValue="inputs" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="inputs" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Form Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Notifications</Label>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>
                    <Button className="w-full">Subscribe</Button>
                  </div>
                </Card>

                {/* Slider Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Volume: {sliderValue[0]}%</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSliderValue([0])}>
                        Mute
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSliderValue([100])}>
                        Max
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Buttons Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Button Variants</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Default</Button>
                      <Button size="sm" variant="secondary">Secondary</Button>
                      <Button size="sm" variant="outline">Outline</Button>
                      <Button size="sm" variant="ghost">Ghost</Button>
                      <Button size="sm" variant="destructive">Destructive</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Avatar Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Team Members</Label>
                    <div className="flex -space-x-3">
                      {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                        <Avatar key={letter} className="border-2 border-background">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${letter}`} />
                          <AvatarFallback style={{ animationDelay: `${i * 50}ms` }}>{letter}</AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                        +12
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Badges Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Status Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" /> Success
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Progress Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Project Progress</Label>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                        -10%
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                        +10%
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Toast Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Toast Notifications</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => toast.success('Success!', { description: 'Your changes have been saved.' })}>
                        Success
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => toast.info('Info', { description: 'Here is some useful information.' })}>
                        Info
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => toast.error('Error', { description: 'Something went wrong.' })}>
                        Error
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Dark Mode Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Theme Switcher</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark modes using the button in the corner.
                    </p>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Light</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <Moon className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm">Dark</span>
                    </div>
                  </div>
                </Card>

                {/* Loading States Card */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <Label>Loading States</Label>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-0 bg-gradient-primary p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
            <div className="relative z-10 text-center text-white">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to build something amazing?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Start with this template and customize it to fit your needs.
                Ship faster with production-ready components.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="px-8">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Explore Components
                </Button>
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 px-8">
                  Documentation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Fabricate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with React, Tailwind CSS, and Cloudflare Workers.
          </p>
        </div>
      </footer>

      <Toaster richColors closeButton />
    </div>
  )
}

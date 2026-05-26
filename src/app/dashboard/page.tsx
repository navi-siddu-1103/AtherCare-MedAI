
'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Scan, FileText, Hospital, MessageSquare, Activity, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import StatisticCard from '@/components/statistic-card';
import RecentActivity from '@/components/recent-activity';
import EmergencyHotlineWidget from '@/components/emergency-hotline-widget';

const features = [
  {
    title: 'AI Skin Analysis',
    description: 'Upload a skin image to detect conditions like acne with AI-powered analysis.',
    href: '/skin-analysis',
    icon: <Scan className="h-8 w-8 text-accent" />,
  },
  {
    title: 'Blood Report Analysis',
    description: 'Get intelligent explanations of your blood report PDFs for better understanding.',
    href: '/blood-report',
    icon: <FileText className="h-8 w-8 text-accent" />,
  },
  {
    title: 'Nearby Hospitals',
    description: 'Quickly locate hospitals near you in case of an emergency.',
    href: '/hospitals',
    icon: <Hospital className="h-8 w-8 text-accent" />,
  },
  {
    title: 'AI Health Chatbot',
    description: 'Ask questions about your health reports and get instant answers from our AI.',
    href: '/chat',
    icon: <MessageSquare className="h-8 w-8 text-accent" />,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg bg-primary/10 p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="font-headline text-3xl font-bold text-primary-foreground md:text-4xl">
            Welcome, {user?.displayName || 'User'}!
          </h1>
          <p className="mt-2 max-w-2xl text-primary-foreground/80">
            Your personal AI health assistant for diagnostics, reports, and guidance. Get started by exploring one of our features below.
          </p>
        </div>
        <Image
          data-ai-hint="abstract medical background"
          src="https://picsum.photos/1200/300"
          alt="Abstract medical background"
          fill
          className="object-cover opacity-20"
        />
      </section>

      {/* Statistics Cards */}
      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">Your Health Stats</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatisticCard
            title="Total Analyses"
            value="12"
            description="Analyses this month"
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            trend="up"
            trendValue="+3 from last month"
            backgroundColor="bg-blue-50"
          />
          <StatisticCard
            title="Reports Analyzed"
            value="5"
            description="Blood reports processed"
            icon={<FileText className="h-5 w-5 text-purple-600" />}
            trend="up"
            trendValue="+2 new"
            backgroundColor="bg-purple-50"
          />
          <StatisticCard
            title="Hospitals Visited"
            value="3"
            description="Recent searches"
            icon={<Hospital className="h-5 w-5 text-green-600" />}
            backgroundColor="bg-green-50"
          />
          <StatisticCard
            title="Avg Response Time"
            value="2.1s"
            description="AI analysis speed"
            icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
            backgroundColor="bg-orange-50"
          />
        </div>
      </section>

      {/* Main Features */}
      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">Get Started</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
              <CardFooter>
                  <Button asChild className="w-full" variant="secondary">
                      <Link href={feature.href}>
                          Explore <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Two Column Layout for Recent Activity and Emergency Hotline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Emergency Hotline Widget - Takes 1 column */}
        <div>
          <EmergencyHotlineWidget />
        </div>
      </div>

      {/* Quick Links */}
      <section className="mt-8">
        <h2 className="font-headline text-2xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="justify-start h-auto py-3">
            <Link href="/health-profile">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 mt-0.5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Manage Health Profile</div>
                  <div className="text-xs text-muted-foreground">Update your personal health information</div>
                </div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start h-auto py-3">
            <Link href="/chat">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-0.5 text-accent" />
                <div className="text-left">
                  <div className="font-semibold">Ask AI Chatbot</div>
                  <div className="text-xs text-muted-foreground">Get answers to health questions</div>
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

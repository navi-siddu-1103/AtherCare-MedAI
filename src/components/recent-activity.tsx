'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, FileText, Hospital, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  type: 'skin-analysis' | 'blood-report' | 'hospital' | 'chat';
  title: string;
  timestamp: Date;
  description?: string;
  href: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    'skin-analysis': <Scan className="h-4 w-4" />,
    'blood-report': <FileText className="h-4 w-4" />,
    'hospital': <Hospital className="h-4 w-4" />,
    'chat': <MessageSquare className="h-4 w-4" />,
  };
  return icons[type];
};

const getActivityColor = (type: Activity['type']) => {
  const colors = {
    'skin-analysis': 'bg-blue-50',
    'blood-report': 'bg-purple-50',
    'hospital': 'bg-green-50',
    'chat': 'bg-orange-50',
  };
  return colors[type];
};

const getActivityLabel = (type: Activity['type']) => {
  const labels = {
    'skin-analysis': 'Skin Analysis',
    'blood-report': 'Blood Report',
    'hospital': 'Hospital Search',
    'chat': 'Chatbot',
  };
  return labels[type];
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'skin-analysis',
      title: 'Skin Analysis Completed',
      description: 'Analyzed skin condition from uploaded image',
      timestamp: new Date(Date.now() - 2 * 3600000),
      href: '/skin-analysis',
    },
    {
      id: '2',
      type: 'blood-report',
      title: 'Blood Report Analyzed',
      description: 'PDF report processed and summarized',
      timestamp: new Date(Date.now() - 24 * 3600000),
      href: '/blood-report',
    },
    {
      id: '3',
      type: 'hospital',
      title: 'Hospital Search Performed',
      description: 'Searched for nearby hospitals in Delhi',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      href: '/hospitals',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <Link key={activity.id} href={activity.href}>
              <div className={`flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-accent/10 cursor-pointer ${getActivityColor(activity.type)}`}>
                <div className="mt-1 p-2 rounded-lg bg-white">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {getActivityLabel(activity.type)}
                </Badge>
              </div>
            </Link>
          ))}
          {displayActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity yet</p>
              <p className="text-sm">Start by exploring one of our features</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

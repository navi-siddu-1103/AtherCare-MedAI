'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Apple,
  Zap,
  Moon,
  Droplet,
  Activity,
  Brain,
  Wind,
  Clock,
  Users,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HealthTip {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'nutrition' | 'fitness' | 'sleep' | 'mental' | 'hydration' | 'general';
  icon: React.ReactNode;
  readTime: number;
  date: string;
  featured?: boolean;
}

const healthTips: HealthTip[] = [
  {
    id: '1',
    title: 'Stay Hydrated for Better Health',
    description: 'Discover why proper hydration is crucial for your daily wellness and mental performance.',
    content: `Drinking enough water is one of the simplest yet most effective ways to maintain your health. 
    The recommended daily intake is about 8-10 glasses of water. Proper hydration helps:
    - Improve cognitive function and concentration
    - Aid digestion and nutrient absorption
    - Regulate body temperature
    - Maintain joint lubrication
    - Support skin health`,
    category: 'hydration',
    icon: <Droplet className="h-5 w-5 text-blue-600" />,
    readTime: 3,
    date: '2026-05-24',
    featured: true,
  },
  {
    id: '2',
    title: 'The Importance of Regular Exercise',
    description: 'Learn how even 30 minutes of daily activity can transform your health.',
    content: `Regular physical activity is essential for maintaining a healthy lifestyle. 
    It helps prevent chronic diseases and improves overall well-being.
    Benefits of regular exercise:
    - Strengthens heart and bones
    - Improves weight management
    - Reduces risk of type 2 diabetes
    - Enhances mood and reduces anxiety
    - Increases energy levels`,
    category: 'fitness',
    icon: <Activity className="h-5 w-5 text-green-600" />,
    readTime: 4,
    date: '2026-05-23',
    featured: true,
  },
  {
    id: '3',
    title: 'Sleep: Your Body\'s Natural Healer',
    description: 'Understand how quality sleep impacts your immune system and mental health.',
    content: `Getting 7-9 hours of quality sleep is crucial for optimal health. During sleep, your body repairs itself and consolidates memories.
    Tips for better sleep:
    - Maintain a consistent sleep schedule
    - Keep your bedroom cool and dark
    - Avoid screens before bedtime
    - Limit caffeine intake after 2 PM
    - Practice relaxation techniques`,
    category: 'sleep',
    icon: <Moon className="h-5 w-5 text-indigo-600" />,
    readTime: 3,
    date: '2026-05-22',
  },
  {
    id: '4',
    title: 'Nutrition 101: Building Healthy Eating Habits',
    description: 'A guide to understanding macronutrients and creating balanced meals.',
    content: `Balanced nutrition is the foundation of good health. Focus on these key components:
    - Proteins: Build and repair tissues
    - Carbohydrates: Provide energy
    - Fats: Essential for hormone production and nutrient absorption
    - Vitamins & Minerals: Support various body functions
    
    Aim to fill half your plate with vegetables, one quarter with lean protein, and one quarter with whole grains.`,
    category: 'nutrition',
    icon: <Apple className="h-5 w-5 text-red-600" />,
    readTime: 5,
    date: '2026-05-21',
  },
  {
    id: '5',
    title: 'Managing Stress for Better Mental Health',
    description: 'Practical techniques to reduce stress and improve emotional well-being.',
    content: `Chronic stress can negatively impact your physical and mental health. Try these proven stress-management techniques:
    - Practice meditation and deep breathing
    - Engage in regular physical activity
    - Maintain social connections
    - Take regular breaks from screens
    - Keep a gratitude journal`,
    category: 'mental',
    icon: <Brain className="h-5 w-5 text-purple-600" />,
    readTime: 4,
    date: '2026-05-20',
  },
  {
    id: '6',
    title: 'Quick Morning Breathing Exercises',
    description: 'Start your day with energizing breathing techniques.',
    content: `Breathing exercises can improve oxygen circulation and boost energy levels.
    Try this simple 5-minute routine:
    1. Diaphragmatic breathing (2 min): Breathe deeply into your belly
    2. Box breathing (2 min): Inhale 4, hold 4, exhale 4, hold 4
    3. Energizing breath (1 min): Quick, rhythmic breathing
    
    Practice these daily for better alertness and focus.`,
    category: 'general',
    icon: <Wind className="h-5 w-5 text-cyan-600" />,
    readTime: 2,
    date: '2026-05-19',
  },
];

const categoryConfig: Record<
  HealthTip['category'],
  { label: string; color: string }
> = {
  nutrition: { label: 'Nutrition', color: 'bg-red-100 text-red-800' },
  fitness: { label: 'Fitness', color: 'bg-green-100 text-green-800' },
  sleep: { label: 'Sleep', color: 'bg-indigo-100 text-indigo-800' },
  mental: { label: 'Mental Health', color: 'bg-purple-100 text-purple-800' },
  hydration: { label: 'Hydration', color: 'bg-blue-100 text-blue-800' },
  general: { label: 'General Health', color: 'bg-gray-100 text-gray-800' },
};

export default function HealthTipsClient() {
  const featuredTips = healthTips.filter((tip) => tip.featured);
  const otherTips = healthTips.filter((tip) => !tip.featured);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Tips & Articles</h1>
        <p className="text-muted-foreground mt-2">
          Expert-curated wellness advice and health information to support your wellbeing journey.
        </p>
      </div>

      {/* Featured Tips */}
      {featuredTips.length > 0 && (
        <section>
          <h2 className="font-headline text-2xl font-semibold mb-4">Featured</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredTips.map((tip) => (
              <Card
                key={tip.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-muted">{tip.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {tip.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{tip.readTime} min read</span>
                    </div>
                    <div>{tip.date}</div>
                  </div>
                  <Badge className={categoryConfig[tip.category].color}>
                    {categoryConfig[tip.category].label}
                  </Badge>
                  <Button variant="outline" className="w-full">
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Tips */}
      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">All Articles</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherTips.map((tip) => (
            <Card key={tip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">
                      {tip.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="line-clamp-2">
                  {tip.description}
                </CardDescription>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{tip.readTime} min</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={categoryConfig[tip.category].color}
                  >
                    {categoryConfig[tip.category].label}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Read
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Summary */}
      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = healthTips.filter(
              (tip) => tip.category === key
            ).length;
            return (
              <Button
                key={key}
                variant="outline"
                className="h-auto flex-col gap-2 py-3"
              >
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{count} articles</span>
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

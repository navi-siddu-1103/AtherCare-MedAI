import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

const FeatureCard = ({ title, description, icon: Icon, onClick, className = '' }: FeatureCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-hover-medical bg-gradient-card border-medical-border hover:border-primary/30 ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-gradient-medical rounded-full group-hover:scale-110 transition-transform duration-300 shadow-medical">
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
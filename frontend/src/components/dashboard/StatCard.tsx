import React from 'react';
import { Video as LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: typeof LucideIcon | string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'blue',
}) => {
  const displayChange = change || trend;
  
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {displayChange && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-sm font-medium ${
                    (change?.type === 'increase' || trend?.isPositive) ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {(change?.type === 'increase' || trend?.isPositive) ? '+' : '-'}
                  {Math.abs(change?.value || trend?.value || 0)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            {typeof Icon === 'string' ? (
              <span className="text-2xl">{Icon}</span>
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
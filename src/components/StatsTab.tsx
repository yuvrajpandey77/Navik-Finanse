import { Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsTabProps {
  requestCount: number;
}

export function StatsTab({ requestCount }: StatsTabProps) {
  const [activeDuration, setActiveDuration] = useState('');

  useEffect(() => {
    const calculateDuration = () => {
      const startDate = new Date('2024-11-01');
      const now = new Date();

      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;

      if (diffMonths > 0) {
        setActiveDuration(`${diffMonths} month${diffMonths > 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`);
      } else {
        setActiveDuration(`${diffDays} day${diffDays !== 1 ? 's' : ''}`);
      }
    };

    calculateDuration();
    const interval = setInterval(calculateDuration, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-600 rounded-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Since</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-1">November 2024</p>
            <p className="text-gray-600">Running for {activeDuration}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Requests</h3>
            <p className="text-4xl font-bold text-blue-600 mb-1">
              {requestCount.toLocaleString()}
            </p>
            <p className="text-gray-600">Questions answered successfully</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About Navik Finance Bot</h3>
        <div className="space-y-3 text-gray-600">
          <p>
            Navik Finance Bot is your intelligent assistant for financial queries and analysis.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Upload documents for context-aware responses</li>
            <li>Get instant answers to finance-related questions</li>
            <li>Powered by advanced AI technology</li>
            <li>Secure and reliable 24/7 service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

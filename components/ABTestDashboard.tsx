'use client';

import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, Target, Clock } from 'lucide-react';

interface ABTestData {
  summary: {
    totalInterventions: number;
    totalEffective: number;
    overallEffectiveness: string;
    bestVariant: {
      type: string;
      timing: number;
      effectiveness: string;
    } | null;
  };
  variantComparison: Array<{
    variant: string;
    count: number;
    effectiveCount: number;
    effectivenessRate: number;
  }>;
  timingComparison: Array<{
    timingOffset: number;
    count: number;
    effectiveCount: number;
    effectivenessRate: number;
  }>;
  detailedStats: Array<{
    variantType: string;
    timingOffset: number;
    totalInterventions: number;
    effectiveCount: number;
    effectivenessRate: number;
  }>;
}

export default function ABTestDashboard() {
  const [data, setData] = useState<ABTestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchABTestData();
  }, []);

  const fetchABTestData = async () => {
    try {
      const response = await fetch('/api/analytics/ab-tests');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching A/B test data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading A/B test results...</div>
      </div>
    );
  }

  if (!data || data.summary.totalInterventions === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <BarChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No A/B Test Data Yet</h3>
        <p className="text-gray-600">Complete some sessions to generate A/B test results</p>
      </div>
    );
  }

  const getVariantColor = (variant: string) => {
    switch (variant) {
      case 'direct': return 'bg-blue-500';
      case 'question': return 'bg-purple-500';
      case 'challenge': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getVariantLabel = (variant: string) => {
    return variant.charAt(0).toUpperCase() + variant.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Tests</span>
            <Target className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.summary.totalInterventions}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Effective</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.summary.totalEffective}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Success Rate</span>
            <BarChart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.summary.overallEffectiveness}%
          </div>
        </div>

        {data.summary.bestVariant && (
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 shadow-sm text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-teal-100">Best Performer</span>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold">
              {getVariantLabel(data.summary.bestVariant.type)}
            </div>
            <div className="text-sm text-teal-100 mt-1">
              {data.summary.bestVariant.timing}min • {data.summary.bestVariant.effectiveness}%
            </div>
          </div>
        )}
      </div>

      {/* Variant Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart className="w-5 h-5 mr-2 text-teal-500" />
          Message Variant Performance
        </h3>
        <div className="space-y-4">
          {data.variantComparison.map((variant) => (
            <div key={variant.variant}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {getVariantLabel(variant.variant)}
                </span>
                <span className="text-sm text-gray-600">
                  {variant.effectiveCount}/{variant.count} ({variant.effectivenessRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getVariantColor(variant.variant)} transition-all duration-500`}
                  style={{ width: `${variant.effectivenessRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-teal-500" />
          Timing Offset Performance
        </h3>
        <div className="space-y-4">
          {data.timingComparison.map((timing) => (
            <div key={timing.timingOffset}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {timing.timingOffset} minutes before predicted drop
                </span>
                <span className="text-sm text-gray-600">
                  {timing.effectiveCount}/{timing.count} ({timing.effectivenessRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${timing.effectivenessRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Detailed Combination Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Variant
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Timing
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Effective
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {data.detailedStats.map((stat, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`inline-block w-3 h-3 rounded-full ${getVariantColor(stat.variantType)} mr-2`} />
                    {getVariantLabel(stat.variantType)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {stat.timingOffset} min
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {stat.totalInterventions}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {stat.effectiveCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${
                      stat.effectivenessRate >= 70 ? 'text-green-600' :
                      stat.effectivenessRate >= 50 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {stat.effectivenessRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
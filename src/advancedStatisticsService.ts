/**
 * Advanced Statistics Service
 * Provides real-time earthquake statistics and analytics
 */

import type { Earthquake } from './types';

export interface StatisticsSummary {
  totalEarthquakes: number;
  last1Hour: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  averageMagnitude: number;
  maxMagnitude: number;
  minMagnitude: number;
  averageDepth: number;
  mostActiveArea: string;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  significantEvents: number; // magnitude >= 5.0
  criticalEvents: number; // magnitude >= 6.0
}

class AdvancedStatisticsService {
  /**
   * Calculate comprehensive statistics from earthquake data
   */
  calculateStatistics(earthquakes: Earthquake[]): StatisticsSummary {
    if (!earthquakes || earthquakes.length === 0) {
      return this.getEmptyStatistics();
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    const last1Hour = earthquakes.filter(eq => now - eq.time < oneHour);
    const last24Hours = earthquakes.filter(eq => now - eq.time < oneDay);
    const last7Days = earthquakes.filter(eq => now - eq.time < sevenDays);
    const last30Days = earthquakes.filter(eq => now - eq.time < thirtyDays);

    const magnitudes = earthquakes.map(eq => eq.magnitude);
    const depths = earthquakes.map(eq => eq.depth);

    // Calculate trend
    const recent = earthquakes.filter(eq => now - eq.time < 3 * oneDay).length;
    const previous = earthquakes.filter(eq => 
      now - eq.time >= 3 * oneDay && now - eq.time < 6 * oneDay
    ).length;
    
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recent > previous * 1.2) trendDirection = 'increasing';
    else if (recent < previous * 0.8) trendDirection = 'decreasing';

    // Find most active area
    const areaCount: { [key: string]: number } = {};
    earthquakes.forEach(eq => {
      const area = this.extractArea(eq.place);
      areaCount[area] = (areaCount[area] || 0) + 1;
    });
    const mostActiveArea = Object.entries(areaCount).reduce((a, b) => 
      b[1] > a[1] ? b : a, ['Unknown', 0]
    )[0];

    return {
      totalEarthquakes: earthquakes.length,
      last1Hour: last1Hour.length,
      last24Hours: last24Hours.length,
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      averageMagnitude: this.average(magnitudes),
      maxMagnitude: Math.max(...magnitudes),
      minMagnitude: Math.min(...magnitudes),
      averageDepth: this.average(depths),
      mostActiveArea,
      trendDirection,
      significantEvents: earthquakes.filter(eq => eq.magnitude >= 5.0).length,
      criticalEvents: earthquakes.filter(eq => eq.magnitude >= 6.0).length
    };
  }

  /**
   * Get empty statistics object
   */
  private getEmptyStatistics(): StatisticsSummary {
    return {
      totalEarthquakes: 0,
      last1Hour: 0,
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0,
      averageMagnitude: 0,
      maxMagnitude: 0,
      minMagnitude: 0,
      averageDepth: 0,
      mostActiveArea: 'N/A',
      trendDirection: 'stable',
      significantEvents: 0,
      criticalEvents: 0
    };
  }

  /**
   * Calculate average of an array
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Extract area name from place string
   */
  private extractArea(place: string): string {
    if (!place) return 'Unknown';
    
    // Try to extract region/province name
    const parts = place.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    
    return place.split(' ').slice(0, 2).join(' ');
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  /**
   * Get trend color
   */
  getTrendColor(trend: 'increasing' | 'decreasing' | 'stable'): string {
    switch (trend) {
      case 'increasing': return '#dc2626';
      case 'decreasing': return '#10b981';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  }

  /**
   * Generate advanced statistics HTML
   */
  getStatisticsHTML(stats: StatisticsSummary): string {
    const trendIcon = this.getTrendIcon(stats.trendDirection);
    const trendColor = this.getTrendColor(stats.trendDirection);

    return `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Last Hour</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-300">${stats.last1Hour}</div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 24h</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-300">${stats.last24Hours}</div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 7 Days</div>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-300">${stats.last7Days}</div>
        </div>
        
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 30 Days</div>
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-300">${stats.last30Days}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Magnitude Range</div>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              M${stats.minMagnitude.toFixed(1)} - M${stats.maxMagnitude.toFixed(1)}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Avg: M${stats.averageMagnitude.toFixed(1)}
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Activity Trend</div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">${trendIcon}</span>
            <span class="text-lg font-semibold" style="color: ${trendColor}">
              ${stats.trendDirection.charAt(0).toUpperCase() + stats.trendDirection.slice(1)}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Last 3 days vs previous 3 days
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Most Active Area</div>
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate" title="${stats.mostActiveArea}">
            ${stats.mostActiveArea}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Avg depth: ${stats.averageDepth.toFixed(1)}km
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 border-l-4 border-yellow-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Significant Events</div>
          <div class="text-xl font-bold text-yellow-600 dark:text-yellow-300">
            ${stats.significantEvents}
          </div>
          <div class="text-xs text-gray-500">M ≥ 5.0</div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border-l-4 border-red-500">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical Events</div>
          <div class="text-xl font-bold text-red-600 dark:text-red-300">
            ${stats.criticalEvents}
          </div>
          <div class="text-xs text-gray-500">M ≥ 6.0</div>
        </div>
      </div>
    `;
  }
}

export const advancedStatisticsService = new AdvancedStatisticsService();

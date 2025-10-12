import { Chart, ChartConfiguration, registerables } from 'chart.js';
import type { Earthquake } from './types';

Chart.register(...registerables);

class VisualizationService {
  private charts: Map<string, Chart> = new Map();

  createMagnitudeTrendChart(containerId: string, earthquakes: Earthquake[]): Chart | null {
    const canvas = document.getElementById(containerId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas element ${containerId} not found`);
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(containerId)) {
      this.charts.get(containerId)?.destroy();
    }

    // Sort earthquakes by time
    const sortedEarthquakes = [...earthquakes].sort((a, b) => a.time - b.time);

    // Group by day
    const dailyData = this.groupByDay(sortedEarthquakes);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dailyData.map(d => d.date),
        datasets: [
          {
            label: 'Average Magnitude',
            data: dailyData.map(d => d.avgMagnitude),
            borderColor: 'rgb(0, 51, 102)',
            backgroundColor: 'rgba(0, 51, 102, 0.1)',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Max Magnitude',
            data: dailyData.map(d => d.maxMagnitude),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Earthquake Magnitude Trends',
          },
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Magnitude',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
        },
      },
    };

    const chart = new Chart(canvas, config);
    this.charts.set(containerId, chart);
    return chart;
  }

  createFrequencyChart(containerId: string, earthquakes: Earthquake[]): Chart | null {
    const canvas = document.getElementById(containerId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas element ${containerId} not found`);
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(containerId)) {
      this.charts.get(containerId)?.destroy();
    }

    // Group by magnitude ranges
    const ranges = [
      { label: '< 2.0', min: 0, max: 2.0, color: 'rgb(22, 163, 74)' },
      { label: '2.0 - 3.0', min: 2.0, max: 3.0, color: 'rgb(34, 197, 94)' },
      { label: '3.0 - 4.0', min: 3.0, max: 4.0, color: 'rgb(250, 204, 21)' },
      { label: '4.0 - 5.0', min: 4.0, max: 5.0, color: 'rgb(249, 115, 22)' },
      { label: '5.0+', min: 5.0, max: 10.0, color: 'rgb(220, 38, 38)' },
    ];

    const counts = ranges.map(range => 
      earthquakes.filter(eq => eq.magnitude >= range.min && eq.magnitude < range.max).length
    );

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ranges.map(r => r.label),
        datasets: [{
          label: 'Number of Earthquakes',
          data: counts,
          backgroundColor: ranges.map(r => r.color),
          borderColor: ranges.map(r => r.color),
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Earthquake Frequency by Magnitude',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: 'Count',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Magnitude Range',
            },
          },
        },
      },
    };

    const chart = new Chart(canvas, config);
    this.charts.set(containerId, chart);
    return chart;
  }

  createDepthChart(containerId: string, earthquakes: Earthquake[]): Chart | null {
    const canvas = document.getElementById(containerId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas element ${containerId} not found`);
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(containerId)) {
      this.charts.get(containerId)?.destroy();
    }

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Earthquake Depth vs Magnitude',
          data: earthquakes.map(eq => ({ x: eq.magnitude, y: eq.depth })),
          backgroundColor: 'rgba(0, 51, 102, 0.6)',
          borderColor: 'rgb(0, 51, 102)',
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Earthquake Depth vs Magnitude',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            reverse: true,
            title: {
              display: true,
              text: 'Depth (km)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Magnitude',
            },
          },
        },
      },
    };

    const chart = new Chart(canvas, config);
    this.charts.set(containerId, chart);
    return chart;
  }

  private groupByDay(earthquakes: Earthquake[]): Array<{ date: string; avgMagnitude: number; maxMagnitude: number; count: number }> {
    const grouped = new Map<string, Earthquake[]>();

    earthquakes.forEach(eq => {
      const date = new Date(eq.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(eq);
    });

    return Array.from(grouped.entries()).map(([date, eqs]) => ({
      date,
      avgMagnitude: eqs.reduce((sum, eq) => sum + eq.magnitude, 0) / eqs.length,
      maxMagnitude: Math.max(...eqs.map(eq => eq.magnitude)),
      count: eqs.length,
    }));
  }

  destroyChart(containerId: string): void {
    const chart = this.charts.get(containerId);
    if (chart) {
      chart.destroy();
      this.charts.delete(containerId);
    }
  }

  destroyAllCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}

export const visualizationService = new VisualizationService();

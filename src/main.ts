import './style.css';
import { earthquakeService } from './earthquakeService';
import { mapService } from './mapService';
import { alertService } from './alertService';
import type { Earthquake } from './types';

let currentEarthquakes: Earthquake[] = [];

async function init(): Promise<void> {
  console.log('🌏 Initializing Southern Leyte Earthquake Alert System...');

  alertService.init();
  mapService.initMap('earthquake-map');

  setupEventListeners();

  await refreshData();

  setInterval(refreshData, 60000);

  console.log('✅ System initialized successfully!');
}

async function refreshData(): Promise<void> {
  try {
    console.log('🔄 Fetching earthquake data...');
    currentEarthquakes = await earthquakeService.fetchEarthquakes('week');

    updateDashboard(currentEarthquakes);
    updateEarthquakeList(currentEarthquakes);
    mapService.addEarthquakeMarkers(currentEarthquakes);
    alertService.checkForAlerts(currentEarthquakes);

    updateSystemStatus('api', 'online');
    console.log(`✅ Loaded ${currentEarthquakes.length} earthquakes`);
  } catch (error) {
    console.error('❌ Error refreshing data:', error);
    updateSystemStatus('api', 'offline');
  }
}

function updateDashboard(earthquakes: Earthquake[]): void {
  const last24h = earthquakeService.getEarthquakesByTimeRange(earthquakes, 24);
  const last7d = earthquakeService.getEarthquakesByTimeRange(earthquakes, 168);
  const today = earthquakeService.getEarthquakesByTimeRange(earthquakes, 24);
  const strongest = earthquakeService.getStrongestEarthquake(today);

  document.getElementById('stat-24h')!.textContent = last24h.length.toString();
  document.getElementById('stat-7d')!.textContent = last7d.length.toString();
  document.getElementById('stat-strongest')!.textContent =
    strongest ? `M${strongest.magnitude.toFixed(1)}` : 'N/A';

  // Update alerts sent count
  const alertsCount = last24h.filter(eq => eq.magnitude >= 4.0).length;
  document.getElementById('stat-alerts')!.textContent = alertsCount.toString();
}

function updateEarthquakeList(earthquakes: Earthquake[]): void {
  const listContainer = document.getElementById('earthquake-list');
  if (!listContainer) return;

  const recentEarthquakes = earthquakes.slice(0, 10);

  if (recentEarthquakes.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <p>No recent earthquakes detected in Southern Leyte region.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = recentEarthquakes.map(earthquake => {
    const color = earthquakeService.getMagnitudeColor(earthquake.magnitude);
    const label = earthquakeService.getMagnitudeLabel(earthquake.magnitude);
    const time = earthquakeService.formatTime(earthquake.time);

    return `
      <div class="border rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
           onclick="window.open('${earthquake.url}', '_blank')">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl font-bold" style="color: ${color};">
                M${earthquake.magnitude.toFixed(1)}
              </span>
              <span class="px-2 py-1 rounded text-xs font-semibold" 
                    style="background-color: ${color}; color: white;">
                ${label}
              </span>
            </div>
            <p class="text-gray-800 font-medium mb-1">${earthquake.place}</p>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>⏰ ${time}</span>
              <span>📏 ${earthquake.depth.toFixed(1)} km deep</span>
              ${earthquake.felt ? `<span>👥 ${earthquake.felt} felt reports</span>` : ''}
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    `;
  }).join('');
}

function updateSystemStatus(service: 'api' | 'alerts' | 'map', status: 'online' | 'offline'): void {
  const indicator = document.getElementById(`status-${service}`);
  if (!indicator) return;

  indicator.classList.remove('bg-safe-green', 'bg-alert-red');
  indicator.classList.add(status === 'online' ? 'bg-safe-green' : 'bg-alert-red');
}

function setupEventListeners(): void {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  document.getElementById('refresh-btn')?.addEventListener('click', async () => {
    await refreshData();
  });

  document.getElementById('alert-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const thresholdSelect = document.getElementById('magnitude-threshold') as HTMLSelectElement;
    const locationInput = document.getElementById('location') as HTMLInputElement;

    if (locationInput.value) {
      alertService.subscribeAlerts(
        parseFloat(thresholdSelect.value),
        locationInput.value,
      );

      locationInput.value = '';
    }
  });

  document.getElementById('checkin-btn')?.addEventListener('click', () => {
    handleCheckIn();
  });

  updateSystemStatus('alerts', 'online');
  updateSystemStatus('map', 'online');
}

function handleCheckIn(): void {
  const location = prompt('Enter your location (city/municipality in Southern Leyte):');
  if (!location) return;

  const checkIn = {
    location,
    timestamp: Date.now(),
  };

  const checkIns = JSON.parse(localStorage.getItem('check_ins') || '[]');
  checkIns.unshift(checkIn);
  localStorage.setItem('check_ins', JSON.stringify(checkIns.slice(0, 50)));

  updateCheckInList();
  alertService.showAlert(`✅ Check-in recorded for ${location}. Stay safe!`, 'info');
}

function updateCheckInList(): void {
  const container = document.getElementById('checkin-list');
  if (!container) return;

  const checkIns = JSON.parse(localStorage.getItem('check_ins') || '[]');

  if (checkIns.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No recent check-ins</p>';
    return;
  }

  container.innerHTML = checkIns.slice(0, 10).map((checkIn: any) => `
    <div class="flex items-center gap-2 text-sm">
      <svg class="w-4 h-4 text-safe-green" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span class="text-gray-700">${checkIn.location}</span>
      <span class="text-gray-400">• ${earthquakeService.formatTime(checkIn.timestamp)}</span>
    </div>
  `).join('');
}

(window as any).closeAlert = () => {
  alertService.hideAlert();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

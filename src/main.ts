import './style.css';
import { earthquakeService } from './earthquakeService';
import { mapService } from './mapService';
import { alertService } from './alertService';
import { indexedDBService } from './indexedDBService';
import { notificationService } from './notificationService';
import { visualizationService } from './visualizationService';
import { themeService } from './themeService';
import { filterService } from './filterService';
import { shareService } from './shareService';
import { errorTrackingService } from './errorTrackingService';
import { performanceService } from './performanceService';
import { communityService } from './communityService';
import { adminService } from './adminService';
import type { Earthquake } from './types';

let currentEarthquakes: Earthquake[] = [];
let filteredEarthquakes: Earthquake[] = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentSort: { field: 'time' | 'magnitude' | 'depth' | 'place'; order: 'asc' | 'desc' } = { field: 'time', order: 'desc' };

async function init(): Promise<void> {
  console.log('🌏 Initializing Southern Leyte Earthquake Alert System...');
  
  // Initialize services
  errorTrackingService.init();
  performanceService.init();
  alertService.init();
  themeService.init();
  adminService.init();
  await indexedDBService.init();
  await notificationService.init();
  await communityService.init();
  
  mapService.initMap('earthquake-map');

  setupEventListeners();

  await refreshData();

  setInterval(refreshData, 60000);

  // Clear old data from IndexedDB every hour
  setInterval(async () => {
    await indexedDBService.clearOldData(30);
  }, 3600000);

  console.log('✅ System initialized successfully!');
}

async function refreshData(): Promise<void> {
  try {
    console.log('🔄 Fetching earthquake data...');
    currentEarthquakes = await earthquakeService.fetchEarthquakes('week');
    filteredEarthquakes = currentEarthquakes;
    
    updateDashboard(currentEarthquakes);
    applyFiltersAndSort();
    mapService.addEarthquakeMarkers(currentEarthquakes);
    alertService.checkForAlerts(currentEarthquakes);
    
    // Send notifications for significant earthquakes
    await notificationService.notifyMultipleEarthquakes(currentEarthquakes, 4.0);
    
    // Update visualizations if elements exist
    updateVisualizations(currentEarthquakes);
    
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

  // Paginate earthquakes
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEarthquakes = earthquakes.slice(startIndex, endIndex);

  if (earthquakes.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center text-gray-500 dark:text-gray-400 py-8">
        <p>No earthquakes found matching your filters.</p>
      </div>
    `;
    updatePaginationControls(earthquakes.length);
    return;
  }

  listContainer.innerHTML = paginatedEarthquakes.map(earthquake => {
    const color = earthquakeService.getMagnitudeColor(earthquake.magnitude);
    const label = earthquakeService.getMagnitudeLabel(earthquake.magnitude);
    const time = earthquakeService.formatTime(earthquake.time);

    return `
      <div class="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white dark:bg-gray-700" 
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
            <p class="text-gray-800 dark:text-gray-200 font-medium mb-1">${earthquake.place}</p>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
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

  updatePaginationControls(earthquakes.length);
}

function updateSystemStatus(service: 'api' | 'alerts' | 'map', status: 'online' | 'offline'): void {
  const indicator = document.getElementById(`status-${service}`);
  if (!indicator) return;

  indicator.classList.remove('bg-safe-green', 'bg-alert-red');
  indicator.classList.add(status === 'online' ? 'bg-safe-green' : 'bg-alert-red');
}

function applyFiltersAndSort(): void {
  // Get filter values
  const minMag = parseFloat((document.getElementById('filter-min-mag') as HTMLInputElement)?.value || '0');
  const maxMag = parseFloat((document.getElementById('filter-max-mag') as HTMLInputElement)?.value || '10');
  const searchTerm = (document.getElementById('filter-search') as HTMLInputElement)?.value || '';

  // Apply filters
  filteredEarthquakes = filterService.filterEarthquakes(currentEarthquakes, {
    minMagnitude: minMag,
    maxMagnitude: maxMag,
    searchTerm: searchTerm,
  });

  // Apply sort
  filteredEarthquakes = filterService.sortEarthquakes(filteredEarthquakes, currentSort.field, currentSort.order);

  // Reset to page 1 when filters change
  currentPage = 1;

  // Update the list
  updateEarthquakeList(filteredEarthquakes);
  
  // Update results count
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filteredEarthquakes.length} of ${currentEarthquakes.length} earthquakes`;
  }
}

function updatePaginationControls(totalItems: number): void {
  const paginationContainer = document.getElementById('pagination-controls');
  if (!paginationContainer) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let pagesHTML = '';
  
  // Previous button
  pagesHTML += `
    <button 
      onclick="changePage(${currentPage - 1})"
      ${currentPage === 1 ? 'disabled' : ''}
      class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : 'bg-phivolcs-blue text-white hover:bg-blue-800'}"
    >
      Previous
    </button>
  `;

  // Page numbers (show max 5 pages)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pagesHTML += `
      <button 
        onclick="changePage(${i})"
        class="px-3 py-1 rounded ${i === currentPage ? 'bg-phivolcs-blue text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}"
      >
        ${i}
      </button>
    `;
  }

  // Next button
  pagesHTML += `
    <button 
      onclick="changePage(${currentPage + 1})"
      ${currentPage === totalPages ? 'disabled' : ''}
      class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : 'bg-phivolcs-blue text-white hover:bg-blue-800'}"
    >
      Next
    </button>
  `;

  paginationContainer.innerHTML = pagesHTML;
}

function changePage(page: number): void {
  currentPage = page;
  updateEarthquakeList(filteredEarthquakes);
  
  // Scroll to top of list
  const listContainer = document.getElementById('earthquake-list');
  if (listContainer) {
    listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function sortBy(field: 'time' | 'magnitude' | 'depth' | 'place'): void {
  if (currentSort.field === field) {
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.order = 'desc';
  }
  applyFiltersAndSort();
  
  // Update sort indicators in UI
  updateSortIndicators();
}

function updateSortIndicators(): void {
  const sortButtons = ['sort-time', 'sort-magnitude', 'sort-depth', 'sort-place'];
  sortButtons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      const field = btnId.replace('sort-', '') as 'time' | 'magnitude' | 'depth' | 'place';
      if (field === currentSort.field) {
        btn.innerHTML = btn.innerHTML.replace('↕', currentSort.order === 'asc' ? '↑' : '↓');
      } else {
        btn.innerHTML = btn.innerHTML.replace(/[↑↓]/, '↕');
      }
    }
  });
}

function updateVisualizations(earthquakes: Earthquake[]): void {
  if (document.getElementById('magnitude-trend-chart')) {
    visualizationService.createMagnitudeTrendChart('magnitude-trend-chart', earthquakes);
  }
  if (document.getElementById('frequency-chart')) {
    visualizationService.createFrequencyChart('frequency-chart', earthquakes);
  }
  if (document.getElementById('depth-chart')) {
    visualizationService.createDepthChart('depth-chart', earthquakes);
  }
}

function exportData(format: 'csv' | 'json'): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `southern-leyte-earthquakes-${timestamp}.${format}`;
  
  if (format === 'csv') {
    filterService.exportToCSV(filteredEarthquakes, filename);
  } else {
    filterService.exportToJSON(filteredEarthquakes, filename);
  }
  
  alertService.showAlert(`Data exported as ${filename}`, 'info');
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
        locationInput.value
      );
      
      locationInput.value = '';
    }
  });

  document.getElementById('checkin-btn')?.addEventListener('click', () => {
    handleCheckIn();
  });

  // Theme toggle - both desktop and mobile
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    themeService.toggle();
    updateThemeIcon();
  });
  
  document.getElementById('theme-toggle-mobile')?.addEventListener('click', () => {
    themeService.toggle();
    updateThemeIcon();
  });

  // Notification permission request
  document.getElementById('enable-notifications')?.addEventListener('click', async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      alertService.showAlert('Notifications enabled! You will receive alerts for significant earthquakes.', 'info');
    } else {
      alertService.showAlert('Notification permission denied. Please enable it in your browser settings.', 'warning');
    }
  });

  // Filter controls
  document.getElementById('filter-min-mag')?.addEventListener('input', () => {
    applyFiltersAndSort();
  });
  document.getElementById('filter-max-mag')?.addEventListener('input', () => {
    applyFiltersAndSort();
  });
  document.getElementById('filter-search')?.addEventListener('input', () => {
    applyFiltersAndSort();
  });

  // Export buttons
  document.getElementById('export-csv')?.addEventListener('click', () => {
    exportData('csv');
  });
  document.getElementById('export-json')?.addEventListener('click', () => {
    exportData('json');
  });

  // Sort buttons
  document.getElementById('sort-time')?.addEventListener('click', () => sortBy('time'));
  document.getElementById('sort-magnitude')?.addEventListener('click', () => sortBy('magnitude'));
  document.getElementById('sort-depth')?.addEventListener('click', () => sortBy('depth'));
  document.getElementById('sort-place')?.addEventListener('click', () => sortBy('place'));

  updateSystemStatus('alerts', 'online');
  updateSystemStatus('map', 'online');
  updateThemeIcon();
}

function updateThemeIcon(): void {
  const themeIcon = document.getElementById('theme-icon');
  const themeIconMobile = document.getElementById('theme-icon-mobile');
  const isDark = themeService.getTheme() === 'dark';
  const icon = isDark ? '☀️' : '🌙';
  
  if (themeIcon) {
    themeIcon.textContent = icon;
  }
  if (themeIconMobile) {
    themeIconMobile.textContent = icon;
  }
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

(window as any).changePage = changePage;
(window as any).sortBy = sortBy;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

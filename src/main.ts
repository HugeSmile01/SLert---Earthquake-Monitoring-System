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
import { userAuthService } from './userAuthService';
import { sidebarService } from './sidebarService';
import type { Earthquake } from './types';

let currentEarthquakes: Earthquake[] = [];
let filteredEarthquakes: Earthquake[] = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentSort: { field: 'time' | 'magnitude' | 'depth' | 'place'; order: 'asc' | 'desc' } = { field: 'time', order: 'desc' };

async function init(): Promise<void> {
  try {
    console.log('🌏 Initializing Southern Leyte Earthquake Alert System...');
    
    try {
      errorTrackingService.init();
    } catch (error) {
      console.error('Error initializing error tracking:', error);
    }
    
    try {
      performanceService.init();
    } catch (error) {
      console.error('Error initializing performance service:', error);
    }
    
    try {
      alertService.init();
    } catch (error) {
      console.error('Error initializing alert service:', error);
    }
    
    try {
      themeService.init();
    } catch (error) {
      console.error('Error initializing theme service:', error);
    }
    
    try {
      adminService.init();
    } catch (error) {
      console.error('Error initializing admin service:', error);
    }
    
    try {
      userAuthService.init();
    } catch (error) {
      console.error('Error initializing user auth service:', error);
    }
    
    try {
      sidebarService.init();
    } catch (error) {
      console.error('Error initializing sidebar service:', error);
    }
    
    try {
      await indexedDBService.init();
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
    
    try {
      await notificationService.init();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
    
    try {
      await communityService.init();
    } catch (error) {
      console.error('Error initializing community service:', error);
    }
    
    try {
      mapService.initMap('earthquake-map');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    try {
      setupEventListeners();
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }

    try {
      await refreshData();
    } catch (error) {
      console.error('Error on initial data refresh:', error);
    }

    setInterval(() => {
      refreshData().catch(error => {
        console.error('Error in periodic data refresh:', error);
      });
    }, 60000);

    setInterval(async () => {
      try {
        await indexedDBService.clearOldData(30);
      } catch (error) {
        console.error('Error clearing old data:', error);
      }
    }, 3600000);

    console.log('✅ System initialized successfully!');
  } catch (error) {
    console.error('❌ Critical error during system initialization:', error);
    errorTrackingService.captureException(error as Error, { context: 'init' });
    alertService.showAlert('System initialization failed. Please refresh the page.', 'danger');
  }
}

async function refreshData(): Promise<void> {
  try {
    console.log('🔄 Fetching earthquake data...');
    
    try {
      currentEarthquakes = await earthquakeService.fetchEarthquakes('week');
      filteredEarthquakes = currentEarthquakes;
    } catch (error) {
      console.error('Error fetching earthquakes:', error);
      throw error;
    }
    
    try {
      updateDashboard(currentEarthquakes);
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
    
    try {
      applyFiltersAndSort();
    } catch (error) {
      console.error('Error applying filters:', error);
    }
    
    try {
      mapService.addEarthquakeMarkers(currentEarthquakes);
    } catch (error) {
      console.error('Error adding map markers:', error);
    }
    
    try {
      alertService.checkForAlerts(currentEarthquakes);
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
    
    try {
      await notificationService.notifyMultipleEarthquakes(currentEarthquakes, 4.0);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
    
    try {
      updateVisualizations(currentEarthquakes);
    } catch (error) {
      console.error('Error updating visualizations:', error);
    }
    
    updateSystemStatus('api', 'online');
    console.log(`✅ Loaded ${currentEarthquakes.length} earthquakes`);
  } catch (error) {
    console.error('❌ Error refreshing data:', error);
    errorTrackingService.captureException(error as Error, { context: 'refreshData' });
    updateSystemStatus('api', 'offline');
    alertService.showAlert('Failed to fetch earthquake data. Retrying in 60 seconds...', 'danger');
  }
}

function updateDashboard(earthquakes: Earthquake[]): void {
  try {
    if (!earthquakes || earthquakes.length === 0) {
      console.warn('No earthquakes to display in dashboard');
      return;
    }

    const last24h = earthquakeService.getEarthquakesByTimeRange(earthquakes, 24);
    const last7d = earthquakeService.getEarthquakesByTimeRange(earthquakes, 168);
    const today = earthquakeService.getEarthquakesByTimeRange(earthquakes, 24);
    const strongest = earthquakeService.getStrongestEarthquake(today);

    const stat24hEl = document.getElementById('stat-24h');
    const stat7dEl = document.getElementById('stat-7d');
    const statStrongestEl = document.getElementById('stat-strongest');
    const statAlertsEl = document.getElementById('stat-alerts');

    if (stat24hEl) stat24hEl.textContent = last24h.length.toString();
    if (stat7dEl) stat7dEl.textContent = last7d.length.toString();
    if (statStrongestEl) {
      statStrongestEl.textContent = strongest ? `M${strongest.magnitude.toFixed(1)}` : 'N/A';
    }
    
    if (statAlertsEl) {
      const alertsCount = last24h.filter(eq => eq.magnitude >= 4.0).length;
      statAlertsEl.textContent = alertsCount.toString();
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
    errorTrackingService.captureException(error as Error, { context: 'updateDashboard' });
  }
}

function updateEarthquakeList(earthquakes: Earthquake[]): void {
  try {
    const listContainer = document.getElementById('earthquake-list');
    if (!listContainer) {
      console.error('Earthquake list container not found');
      return;
    }

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

    try {
      listContainer.innerHTML = paginatedEarthquakes.map(earthquake => {
        const color = earthquakeService.getMagnitudeColor(earthquake.magnitude);
        const label = earthquakeService.getMagnitudeLabel(earthquake.magnitude);
        const time = earthquakeService.formatTime(earthquake.time);
        const editedLabel = earthquake.editedByAdmin ? 
          '<span class="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs rounded">✏️ Edited by Admin</span>' : '';

        return `
          <div class="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-700 fade-in">
            <div class="flex items-start justify-between">
              <div class="flex-1" onclick="window.open('${earthquake.url}', '_blank')" style="cursor: pointer;" role="button" tabindex="0" aria-label="View earthquake details">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <span class="text-2xl font-bold" style="color: ${color};">
                    M${earthquake.magnitude.toFixed(1)}
                  </span>
                  <span class="px-2 py-1 rounded text-xs font-semibold" 
                        style="background-color: ${color}; color: white;">
                    ${label}
                  </span>
                  ${editedLabel}
                </div>
                <p class="text-gray-800 dark:text-gray-200 font-medium mb-1">${earthquake.place}</p>
                <div class="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>⏰ ${time}</span>
                  <span>📏 ${earthquake.depth.toFixed(1)} km deep</span>
                  ${earthquake.felt ? `<span>👥 ${earthquake.felt} felt reports</span>` : ''}
                </div>
              </div>
              <div class="flex flex-col gap-2 ml-2">
                <button onclick="shareEarthquake('${earthquake.id}'); event.stopPropagation();" 
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition" 
                        title="Share earthquake"
                        aria-label="Share earthquake information">
                  <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                </button>
                <button onclick="window.open('${earthquake.url}', '_blank'); event.stopPropagation();" 
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition" 
                        title="View details"
                        aria-label="View earthquake details on USGS">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Error generating earthquake list HTML:', error);
      listContainer.innerHTML = '<p class="text-red-500 text-center">Error displaying earthquakes</p>';
    }

    updatePaginationControls(earthquakes.length);
  } catch (error) {
    console.error('Error updating earthquake list:', error);
    errorTrackingService.captureException(error as Error, { context: 'updateEarthquakeList' });
  }
}

function updateSystemStatus(service: 'api' | 'alerts' | 'map', status: 'online' | 'offline'): void {
  try {
    const indicator = document.getElementById(`status-${service}`);
    if (!indicator) {
      console.warn(`Status indicator not found for: ${service}`);
      return;
    }

    indicator.classList.remove('bg-safe-green', 'bg-alert-red');
    indicator.classList.add(status === 'online' ? 'bg-safe-green' : 'bg-alert-red');
  } catch (error) {
    console.error(`Error updating system status for ${service}:`, error);
  }
}

function applyFiltersAndSort(): void {
  try {
    const minMagEl = document.getElementById('filter-min-mag') as HTMLInputElement;
    const maxMagEl = document.getElementById('filter-max-mag') as HTMLInputElement;
    const searchTermEl = document.getElementById('filter-search') as HTMLInputElement;

    const minMag = parseFloat(minMagEl?.value || '0');
    const maxMag = parseFloat(maxMagEl?.value || '10');
    const searchTerm = searchTermEl?.value || '';

    if (isNaN(minMag) || isNaN(maxMag)) {
      console.error('Invalid magnitude filter values');
      return;
    }

    filteredEarthquakes = filterService.filterEarthquakes(currentEarthquakes, {
      minMagnitude: minMag,
      maxMagnitude: maxMag,
      searchTerm: searchTerm,
    });

    filteredEarthquakes = filterService.sortEarthquakes(filteredEarthquakes, currentSort.field, currentSort.order);

    currentPage = 1;

    updateEarthquakeList(filteredEarthquakes);
    
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      resultsCount.textContent = `Showing ${filteredEarthquakes.length} of ${currentEarthquakes.length} earthquakes`;
    }
  } catch (error) {
    console.error('Error applying filters and sort:', error);
    errorTrackingService.captureException(error as Error, { context: 'applyFiltersAndSort' });
  }
}

function updatePaginationControls(totalItems: number): void {
  try {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) {
      console.warn('Pagination container not found');
      return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let pagesHTML = '';
    
    pagesHTML += `
      <button 
        onclick="changePage(${currentPage - 1})"
        ${currentPage === 1 ? 'disabled' : ''}
        class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : 'bg-phivolcs-blue text-white hover:bg-blue-800'}"
      >
        Previous
      </button>
    `;

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
  } catch (error) {
    console.error('Error updating pagination controls:', error);
    errorTrackingService.captureException(error as Error, { context: 'updatePaginationControls' });
  }
}

function changePage(page: number): void {
  try {
    if (page < 1 || !Number.isInteger(page)) {
      console.error('Invalid page number:', page);
      return;
    }

    currentPage = page;
    updateEarthquakeList(filteredEarthquakes);
    
    const listContainer = document.getElementById('earthquake-list');
    if (listContainer) {
      listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    console.error('Error changing page:', error);
    errorTrackingService.captureException(error as Error, { context: 'changePage' });
  }
}

function sortBy(field: 'time' | 'magnitude' | 'depth' | 'place'): void {
  try {
    if (currentSort.field === field) {
      currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.field = field;
      currentSort.order = 'desc';
    }
    applyFiltersAndSort();
    
    updateSortIndicators();
  } catch (error) {
    console.error('Error sorting earthquakes:', error);
    errorTrackingService.captureException(error as Error, { context: 'sortBy' });
  }
}

function updateSortIndicators(): void {
  try {
    const sortButtons = ['sort-time', 'sort-magnitude', 'sort-depth', 'sort-place'];
    sortButtons.forEach(btnId => {
      try {
        const btn = document.getElementById(btnId);
        if (btn) {
          const field = btnId.replace('sort-', '') as 'time' | 'magnitude' | 'depth' | 'place';
          if (field === currentSort.field) {
            btn.innerHTML = btn.innerHTML.replace('↕', currentSort.order === 'asc' ? '↑' : '↓');
          } else {
            btn.innerHTML = btn.innerHTML.replace(/[↑↓]/, '↕');
          }
        }
      } catch (btnError) {
        console.error(`Error updating sort button ${btnId}:`, btnError);
      }
    });
  } catch (error) {
    console.error('Error updating sort indicators:', error);
  }
}

function updateVisualizations(earthquakes: Earthquake[]): void {
  try {
    if (!earthquakes || earthquakes.length === 0) {
      console.warn('No earthquake data for visualizations');
      return;
    }

    if (document.getElementById('magnitude-trend-chart')) {
      try {
        visualizationService.createMagnitudeTrendChart('magnitude-trend-chart', earthquakes);
      } catch (error) {
        console.error('Error creating magnitude trend chart:', error);
      }
    }
    
    if (document.getElementById('frequency-chart')) {
      try {
        visualizationService.createFrequencyChart('frequency-chart', earthquakes);
      } catch (error) {
        console.error('Error creating frequency chart:', error);
      }
    }
    
    if (document.getElementById('depth-chart')) {
      try {
        visualizationService.createDepthChart('depth-chart', earthquakes);
      } catch (error) {
        console.error('Error creating depth chart:', error);
      }
    }
  } catch (error) {
    console.error('Error updating visualizations:', error);
    errorTrackingService.captureException(error as Error, { context: 'updateVisualizations' });
  }
}

function exportData(format: 'csv' | 'json'): void {
  try {
    if (!filteredEarthquakes || filteredEarthquakes.length === 0) {
      alertService.showAlert('No earthquake data to export', 'warning');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `southern-leyte-earthquakes-${timestamp}.${format}`;
    
    if (format === 'csv') {
      filterService.exportToCSV(filteredEarthquakes, filename);
    } else if (format === 'json') {
      filterService.exportToJSON(filteredEarthquakes, filename);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
    
    alertService.showAlert(`Data exported as ${filename}`, 'info');
  } catch (error) {
    console.error('Error exporting data:', error);
    errorTrackingService.captureException(error as Error, { context: 'exportData' });
    alertService.showAlert('Failed to export data', 'danger');
  }
}

function setupEventListeners(): void {
  try {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn?.addEventListener('click', () => {
      try {
        mobileMenu?.classList.toggle('hidden');
      } catch (error) {
        console.error('Error toggling mobile menu:', error);
      }
    });

    document.getElementById('open-sidebar-btn-mobile')?.addEventListener('click', () => {
      try {
        sidebarService.openSidebar();
      } catch (error) {
        console.error('Error opening sidebar:', error);
      }
    });

    document.getElementById('refresh-btn')?.addEventListener('click', async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Error refreshing data:', error);
        alertService.showAlert('Failed to refresh data', 'danger');
      }
    });

    document.getElementById('alert-form')?.addEventListener('submit', (e) => {
      try {
        e.preventDefault();
        
        const thresholdSelect = document.getElementById('magnitude-threshold') as HTMLSelectElement;
        const locationInput = document.getElementById('location') as HTMLInputElement;

        if (!thresholdSelect || !locationInput) {
          console.error('Alert form elements not found');
          return;
        }

        if (locationInput.value) {
          alertService.subscribeAlerts(
            parseFloat(thresholdSelect.value),
            locationInput.value
          );
          
          locationInput.value = '';
        }
      } catch (error) {
        console.error('Error handling alert form submission:', error);
        alertService.showAlert('Failed to subscribe to alerts', 'danger');
      }
    });

    document.getElementById('checkin-btn')?.addEventListener('click', () => {
      try {
        handleCheckIn();
      } catch (error) {
        console.error('Error handling check-in:', error);
        alertService.showAlert('Failed to process check-in', 'danger');
      }
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      try {
        themeService.toggle();
        updateThemeIcon();
      } catch (error) {
        console.error('Error toggling theme:', error);
      }
    });
    
    document.getElementById('theme-toggle-mobile')?.addEventListener('click', () => {
      try {
        themeService.toggle();
        updateThemeIcon();
      } catch (error) {
        console.error('Error toggling mobile theme:', error);
      }
    });

    document.getElementById('enable-notifications')?.addEventListener('click', async () => {
      try {
        const granted = await notificationService.requestPermission();
        if (granted) {
          alertService.showAlert('Notifications enabled! You will receive alerts for significant earthquakes.', 'info');
        } else {
          alertService.showAlert('Notification permission denied. Please enable it in your browser settings.', 'warning');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        alertService.showAlert('Failed to enable notifications', 'danger');
      }
    });

    document.getElementById('filter-min-mag')?.addEventListener('input', () => {
      try {
        applyFiltersAndSort();
      } catch (error) {
        console.error('Error applying min magnitude filter:', error);
      }
    });
    
    document.getElementById('filter-max-mag')?.addEventListener('input', () => {
      try {
        applyFiltersAndSort();
      } catch (error) {
        console.error('Error applying max magnitude filter:', error);
      }
    });
    
    document.getElementById('filter-search')?.addEventListener('input', () => {
      try {
        applyFiltersAndSort();
      } catch (error) {
        console.error('Error applying search filter:', error);
      }
    });

    document.getElementById('export-csv')?.addEventListener('click', () => {
      try {
        exportData('csv');
      } catch (error) {
        console.error('Error exporting CSV:', error);
        alertService.showAlert('Failed to export CSV', 'danger');
      }
    });
    
    document.getElementById('export-json')?.addEventListener('click', () => {
      try {
        exportData('json');
      } catch (error) {
        console.error('Error exporting JSON:', error);
        alertService.showAlert('Failed to export JSON', 'danger');
      }
    });

    document.getElementById('sort-time')?.addEventListener('click', () => {
      try {
        sortBy('time');
      } catch (error) {
        console.error('Error sorting by time:', error);
      }
    });
    
    document.getElementById('sort-magnitude')?.addEventListener('click', () => {
      try {
        sortBy('magnitude');
      } catch (error) {
        console.error('Error sorting by magnitude:', error);
      }
    });
    
    document.getElementById('sort-depth')?.addEventListener('click', () => {
      try {
        sortBy('depth');
      } catch (error) {
        console.error('Error sorting by depth:', error);
      }
    });
    
    document.getElementById('sort-place')?.addEventListener('click', () => {
      try {
        sortBy('place');
      } catch (error) {
        console.error('Error sorting by place:', error);
      }
    });

    document.getElementById('community-news-form')?.addEventListener('submit', handleCommunityNewsSubmit);
    document.getElementById('news-content')?.addEventListener('input', updateCharCount);
    document.getElementById('donate-btn')?.addEventListener('click', handleDonation);

    updateSystemStatus('alerts', 'online');
    updateSystemStatus('map', 'online');
    updateThemeIcon();
    updateCommunityNewsUI();
  } catch (error) {
    console.error('Error setting up event listeners:', error);
    errorTrackingService.captureException(error as Error, { context: 'setupEventListeners' });
  }
}

function updateThemeIcon(): void {
  try {
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
  } catch (error) {
    console.error('Error updating theme icon:', error);
  }
}

function handleCheckIn(): void {
  try {
    const location = prompt('Enter your location (city/municipality in Southern Leyte):');
    if (!location || location.trim() === '') {
      return;
    }

    const checkIn = {
      location: location.trim(),
      timestamp: Date.now(),
    };

    try {
      const checkIns = JSON.parse(localStorage.getItem('check_ins') || '[]');
      checkIns.unshift(checkIn);
      localStorage.setItem('check_ins', JSON.stringify(checkIns.slice(0, 50)));
    } catch (storageError) {
      console.error('Error saving check-in to localStorage:', storageError);
      throw new Error('Failed to save check-in');
    }

    updateCheckInList();
    alertService.showAlert(`✅ Check-in recorded for ${location}. Stay safe!`, 'info');
  } catch (error) {
    console.error('Error handling check-in:', error);
    errorTrackingService.captureException(error as Error, { context: 'handleCheckIn' });
    alertService.showAlert('Failed to record check-in', 'danger');
  }
}

function updateCheckInList(): void {
  try {
    const container = document.getElementById('checkin-list');
    if (!container) {
      console.warn('Check-in list container not found');
      return;
    }

    let checkIns: Array<{ location: string; timestamp: number }> = [];
    
    try {
      checkIns = JSON.parse(localStorage.getItem('check_ins') || '[]');
    } catch (parseError) {
      console.error('Error parsing check-ins from localStorage:', parseError);
      container.innerHTML = '<p class="text-red-500 text-sm">Error loading check-ins</p>';
      return;
    }
    
    if (checkIns.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">No recent check-ins</p>';
      return;
    }

    try {
      container.innerHTML = checkIns.slice(0, 10).map((checkIn: { location: string; timestamp: number }) => `
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-4 h-4 text-safe-green" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-gray-700">${checkIn.location}</span>
          <span class="text-gray-400">• ${earthquakeService.formatTime(checkIn.timestamp)}</span>
        </div>
      `).join('');
    } catch (renderError) {
      console.error('Error rendering check-in list:', renderError);
      container.innerHTML = '<p class="text-red-500 text-sm">Error displaying check-ins</p>';
    }
  } catch (error) {
    console.error('Error updating check-in list:', error);
    errorTrackingService.captureException(error as Error, { context: 'updateCheckInList' });
  }
}

function updateCharCount(): void {
  try {
    const textarea = document.getElementById('news-content') as HTMLTextAreaElement;
    const charCount = document.getElementById('news-char-count');
    
    if (!textarea || !charCount) {
      console.warn('News content textarea or char count element not found');
      return;
    }
    
    charCount.textContent = `${textarea.value.length}/500`;
  } catch (error) {
    console.error('Error updating character count:', error);
  }
}

async function handleCommunityNewsSubmit(e: Event): Promise<void> {
  try {
    e.preventDefault();
    
    const textarea = document.getElementById('news-content') as HTMLTextAreaElement;
    if (!textarea) {
      console.error('News content textarea not found');
      alertService.showAlert('Form element not found', 'danger');
      return;
    }

    const content = textarea.value.trim();
    
    if (content.length < 10) {
      alertService.showAlert('Post must be at least 10 characters long', 'warning');
      return;
    }
    
    if (!communityService.canPostToday()) {
      alertService.showAlert('Daily post limit reached (2 posts per day)', 'warning');
      return;
    }
    
    try {
      await communityService.postNews(content);
      textarea.value = '';
      updateCharCount();
      alertService.showAlert('News posted successfully!', 'info');
      await updateCommunityNewsUI();
    } catch (postError) {
      console.error('Error posting news:', postError);
      throw postError;
    }
  } catch (error) {
    console.error('Error handling community news submission:', error);
    errorTrackingService.captureException(error as Error, { context: 'handleCommunityNewsSubmit' });
    alertService.showAlert((error as Error).message || 'Failed to post news', 'danger');
  }
}

async function updateCommunityNewsUI(): Promise<void> {
  try {
    const remainingEl = document.getElementById('posts-remaining');
    if (remainingEl) {
      try {
        const remaining = communityService.getRemainingPosts();
        remainingEl.textContent = `${remaining} post${remaining !== 1 ? 's' : ''} remaining today`;
      } catch (error) {
        console.error('Error updating remaining posts:', error);
      }
    }
    
    let newsList;
    try {
      newsList = await communityService.getNews(20);
    } catch (error) {
      console.error('Error fetching community news:', error);
      throw error;
    }

    const container = document.getElementById('community-news-list');
    
    if (!container) {
      console.warn('Community news list container not found');
      return;
    }
    
    if (newsList.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No news yet. Be the first to post!</p>';
      return;
    }
    
    try {
      container.innerHTML = newsList.map(news => {
        const date = new Date(news.timestamp).toLocaleString('en-PH');
        const hasHearted = news.heartedBy?.includes(communityService.getCurrentUserId() || '') || false;
        
        return `
          <div class="border dark:border-gray-700 rounded-lg p-4 fade-in">
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-semibold text-gray-700 dark:text-gray-300">${news.userName}</span>
                <span class="text-sm text-gray-500 ml-2">${date}</span>
              </div>
              <button onclick="toggleHeart('${news.id}')" 
                      class="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition ${hasHearted ? 'text-red-500' : 'text-gray-500'}">
                ${hasHearted ? '❤️' : '🤍'} ${news.hearts || 0}
              </button>
            </div>
            <p class="text-gray-800 dark:text-gray-200">${escapeHtml(news.content)}</p>
          </div>
        `;
      }).join('');
    } catch (renderError) {
      console.error('Error rendering community news:', renderError);
      throw renderError;
    }
  } catch (error) {
    console.error('Error updating community news UI:', error);
    errorTrackingService.captureException(error as Error, { context: 'updateCommunityNewsUI' });
    const container = document.getElementById('community-news-list');
    if (container) {
      container.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center py-4">Failed to load community news. Please try again later.</p>';
    }
  }
}

function escapeHtml(text: string): string {
  try {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  } catch (error) {
    console.error('Error escaping HTML:', error);
    return text;
  }
}

async function handleDonation(): Promise<void> {
  try {
    const SwalModule = await import('sweetalert2');
    const result = await SwalModule.default.fire({
      title: '💖 Support the Community',
      html: `
        <p class="mb-4">Your donations help maintain this earthquake alert system and support affected communities.</p>
        <div class="space-y-2 text-left">
          <p><strong>Development & Maintenance:</strong> Server costs, API fees, development time</p>
          <p><strong>Community Support:</strong> Helping those affected by earthquakes</p>
        </div>
        <p class="mt-4 text-sm text-gray-600">Contact: admin@johnrish.website for donation details</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Contact Admin',
      cancelButtonText: 'Close'
    });
    
    if (result.isConfirmed) {
      window.location.href = 'mailto:admin@johnrish.website?subject=Donation%20Inquiry';
    }
  } catch (error) {
    console.error('Error handling donation dialog:', error);
    errorTrackingService.captureException(error as Error, { context: 'handleDonation' });
    alertService.showAlert('Failed to open donation dialog', 'danger');
  }
}

(window as any).toggleHeart = async (newsId: string) => {
  try {
    await communityService.toggleHeart(newsId);
    await updateCommunityNewsUI();
  } catch (error) {
    console.error('Error toggling heart:', error);
    errorTrackingService.captureException(error as Error, { context: 'toggleHeart' });
    alertService.showAlert('Failed to update heart', 'danger');
  }
};

(window as any).shareEarthquake = async (earthquakeId: string) => {
  try {
    if (!earthquakeId) {
      console.error('Invalid earthquake ID');
      return;
    }

    const earthquake = currentEarthquakes.find(eq => eq.id === earthquakeId);
    if (!earthquake) {
      console.error('Earthquake not found:', earthquakeId);
      alertService.showAlert('Earthquake not found', 'warning');
      return;
    }

    try {
      await shareService.shareEarthquake(earthquake);
      alertService.showAlert('Earthquake data shared successfully!', 'info');
    } catch (shareError) {
      console.error('Error sharing earthquake:', shareError);
      throw shareError;
    }
  } catch (error) {
    console.error('Error in shareEarthquake:', error);
    errorTrackingService.captureException(error as Error, { context: 'shareEarthquake' });
    alertService.showAlert('Failed to share earthquake data', 'danger');
  }
};

(window as any).closeAlert = () => {
  try {
    alertService.hideAlert();
  } catch (error) {
    console.error('Error closing alert:', error);
  }
};

(window as any).changePage = changePage;
(window as any).sortBy = sortBy;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
      console.error('Error initializing system:', error);
    });
  });
} else {
  init().catch(error => {
    console.error('Error initializing system:', error);
  });
}

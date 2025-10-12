import './style.css';
import { adminService } from './adminService';
import { errorTrackingService } from './errorTrackingService';
import Swal from 'sweetalert2';

// Initialize services
errorTrackingService.init();
adminService.init();

// Setup admin sidebar
setupAdminSidebar();

// Check authentication state
setTimeout(() => {
  checkAuthState();
}, 500);

function checkAuthState(): void {
  if (adminService.isAdminUser()) {
    showDashboard();
    loadAdminData();
  } else {
    showLogin();
  }
}

function showLogin(): void {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const logoutBtn = document.getElementById('admin-logout-btn');
  
  if (loginSection) loginSection.classList.remove('hidden');
  if (dashboardSection) dashboardSection.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
}

function showDashboard(): void {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const logoutBtn = document.getElementById('admin-logout-btn');
  
  if (loginSection) loginSection.classList.add('hidden');
  if (dashboardSection) dashboardSection.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
}

// Login form handler
const loginForm = document.getElementById('admin-login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = (document.getElementById('admin-email') as HTMLInputElement).value;
    const password = (document.getElementById('admin-password') as HTMLInputElement).value;
    
    try {
      await Swal.fire({
        title: 'Logging in...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await adminService.login(email, password);
      
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to Admin Portal',
        timer: 2000,
        showConfirmButton: false
      });
      
      showDashboard();
      await loadAdminData();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: (error as Error).message || 'Invalid credentials or unauthorized access',
      });
    }
  });
}

// Logout handler
const logoutBtn = document.getElementById('admin-logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await adminService.logout();
      showLogin();
      
      await Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}

// Magnitude edit form handler
const magnitudeForm = document.getElementById('admin-magnitude-form');
if (magnitudeForm) {
  magnitudeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const earthquakeId = (document.getElementById('magnitude-earthquake-id') as HTMLInputElement).value;
    const newMagnitude = parseFloat((document.getElementById('magnitude-new-value') as HTMLInputElement).value);
    const reason = (document.getElementById('magnitude-reason') as HTMLTextAreaElement).value;
    
    try {
      await Swal.fire({
        title: 'Updating magnitude...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await adminService.updateEarthquakeMagnitude(earthquakeId, newMagnitude, reason);
      
      await Swal.fire({
        icon: 'success',
        title: 'Magnitude Updated',
        text: `Earthquake ${earthquakeId} magnitude updated to ${newMagnitude}`,
      });
      
      // Reset form
      (magnitudeForm as HTMLFormElement).reset();
      
      // Reload edit history
      await loadEarthquakeEdits();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: (error as Error).message || 'Failed to update magnitude',
      });
    }
  });
}

// Load admin data
async function loadAdminData(): Promise<void> {
  try {
    // Load statistics
    const stats = await adminService.getSystemStats();
    
    const newsEl = document.getElementById('admin-stat-news');
    const reportsEl = document.getElementById('admin-stat-reports');
    const commentsEl = document.getElementById('admin-stat-comments');
    
    if (newsEl) newsEl.textContent = stats.totalNews.toString();
    if (reportsEl) reportsEl.textContent = stats.totalReports.toString();
    if (commentsEl) commentsEl.textContent = stats.totalComments.toString();
    
    // Load recent activity
    await loadRecentActivity();
    
    // Load earthquake edits
    await loadEarthquakeEdits();
  } catch (error) {
    console.error('Error loading admin data:', error);
    errorTrackingService.captureException(error as Error, { context: 'loadAdminData' });
  }
}

// Load recent activity
async function loadRecentActivity(): Promise<void> {
  try {
    const activities = await adminService.getRecentActivity(20);
    const container = document.getElementById('admin-activity-list');
    
    if (!container) return;
    
    if (activities.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No recent activity</p>';
      return;
    }
    
    container.innerHTML = activities.map(activity => {
      const date = new Date(activity.timestamp).toLocaleString('en-PH');
      let icon = '📝';
      let typeLabel = 'News';
      let actionButtons = '';
      
      if (activity.type === 'report') {
        icon = '📊';
        typeLabel = 'Report';
        actionButtons = `<button onclick="deleteReport('${activity.id}')" class="text-red-600 hover:text-red-800 text-sm">Delete</button>`;
      } else if (activity.type === 'comment') {
        icon = '💬';
        typeLabel = 'Comment';
        actionButtons = `<button onclick="deleteComment('${activity.id}')" class="text-red-600 hover:text-red-800 text-sm">Delete</button>`;
      } else {
        actionButtons = `<button onclick="deleteNews('${activity.id}')" class="text-red-600 hover:text-red-800 text-sm">Delete</button>`;
      }
      
      return `
        <div class="border dark:border-gray-700 rounded p-4 flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">${icon}</span>
              <span class="font-semibold text-gray-700 dark:text-gray-300">${typeLabel}</span>
              <span class="text-sm text-gray-500">by ${activity.userName || 'Anonymous'}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${activity.content || activity.experience || 'N/A'}</p>
            <p class="text-xs text-gray-400">${date}</p>
          </div>
          <div class="ml-4">
            ${actionButtons}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading recent activity:', error);
  }
}

// Load earthquake edits
async function loadEarthquakeEdits(): Promise<void> {
  try {
    const edits = await adminService.getAllEarthquakeEdits();
    const container = document.getElementById('admin-edits-list');
    
    if (!container) return;
    
    if (edits.length === 0) {
      container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No magnitude edits yet</p>';
      return;
    }
    
    container.innerHTML = edits.map(edit => {
      const date = new Date(edit.editedAt).toLocaleString('en-PH');
      return `
        <div class="border dark:border-gray-700 rounded p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Earthquake ID: ${edit.earthquakeId}</span>
              <span class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">
                Edited by Admin
              </span>
            </div>
            <span class="text-sm text-gray-500">${date}</span>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-2">
            ${edit.originalMagnitude ? `<div class="text-sm"><span class="text-gray-500">Original:</span> <span class="font-semibold">${edit.originalMagnitude}</span></div>` : ''}
            <div class="text-sm"><span class="text-gray-500">New:</span> <span class="font-semibold text-phivolcs-blue">${edit.editedMagnitude}</span></div>
          </div>
          ${edit.reason ? `<p class="text-sm text-gray-600 dark:text-gray-400"><strong>Reason:</strong> ${edit.reason}</p>` : ''}
          <p class="text-xs text-gray-500 mt-2">Edited by: ${edit.editedBy}</p>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading earthquake edits:', error);
  }
}

// Global functions for delete actions
(window as any).deleteNews = async (id: string) => {
  const result = await Swal.fire({
    title: 'Delete News Post?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it'
  });
  
  if (result.isConfirmed) {
    try {
      await adminService.deleteNewsPost(id);
      await Swal.fire('Deleted!', 'News post has been deleted.', 'success');
      await loadRecentActivity();
      await loadAdminData();
    } catch (error) {
      await Swal.fire('Error!', 'Failed to delete news post', 'error');
    }
  }
};

(window as any).deleteReport = async (id: string) => {
  const result = await Swal.fire({
    title: 'Delete Report?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it'
  });
  
  if (result.isConfirmed) {
    try {
      await adminService.deleteReport(id);
      await Swal.fire('Deleted!', 'Report has been deleted.', 'success');
      await loadRecentActivity();
      await loadAdminData();
    } catch (error) {
      await Swal.fire('Error!', 'Failed to delete report', 'error');
    }
  }
};

(window as any).deleteComment = async (id: string) => {
  const result = await Swal.fire({
    title: 'Delete Comment?',
    text: 'This action cannot be undone',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it'
  });
  
  if (result.isConfirmed) {
    try {
      await adminService.deleteComment(id);
      await Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
      await loadRecentActivity();
      await loadAdminData();
    } catch (error) {
      await Swal.fire('Error!', 'Failed to delete comment', 'error');
    }
  }
};

// Setup admin sidebar functionality
function setupAdminSidebar(): void {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const openBtn = document.getElementById('open-admin-sidebar-btn');
  const closeBtn = document.getElementById('close-admin-sidebar-btn');

  if (!sidebar || !overlay) return;

  const openSidebar = () => {
    sidebar.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    updateAdminSidebarContent();
  };

  const closeSidebar = () => {
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
  };

  openBtn?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Update sidebar when auth state changes
  setTimeout(() => {
    updateAdminSidebarContent();
  }, 1000);
}

function updateAdminSidebarContent(): void {
  const content = document.getElementById('admin-sidebar-content');
  if (!content) return;

  if (adminService.isAdminUser()) {
    content.innerHTML = `
      <div class="flex items-center gap-3 mb-6">
        <div class="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white text-2xl">
          🔐
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Admin</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">System Administrator</p>
        </div>
      </div>

      <div class="space-y-3 mb-6">
        <div class="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
          <p class="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">Admin Privileges</p>
          <ul class="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li>✓ Edit earthquake data</li>
            <li>✓ Manage community content</li>
            <li>✓ View system statistics</li>
            <li>✓ Delete inappropriate content</li>
          </ul>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Logged in as</p>
        <p class="font-semibold">admin@johnrish.website</p>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="text-center py-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Not Logged In</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please log in to access admin features
        </p>
      </div>
    `;
  }
}

console.log('✅ Admin portal initialized');

import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages (repository name)
  base: '/EarthquakeSys/',
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external access
    strictPort: false,
  },
  
  // Production build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production (security)
    minify: 'terser', // Optimize bundle size
    
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase from main bundle
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore'
          ],
          // Separate security libraries
          'security': ['dompurify'],
        },
        // Asset naming for cache optimization
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Performance optimization
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers for better performance
    target: 'es2020',
  },
  
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'dompurify'],
  },
});

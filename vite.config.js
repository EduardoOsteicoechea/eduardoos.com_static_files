import { defineConfig } from 'vite';
import { resolve, relative, extname } from 'path';
import fs from 'fs';

// This function dynamically finds all JS and CSS files in your src folder
function getAllInputFiles(dir) {
  const entries = {};
  // Recursively read all files in the directory
  const files = fs.readdirSync(dir, { recursive: true });

  files.forEach((file) => {
    const fullPath = resolve(__dirname, dir, file);
    
    // Check if it's a file (not a folder)
    if (fs.statSync(fullPath).isFile()) {
      const ext = extname(file);
      // We only want Vite to process JS and CSS
      if (ext === '.js' || ext === '.css') {
        // Create a unique key preserving the folder structure (e.g., 'components/main')
        const key = relative(dir, fullPath).replace(ext, '');
        entries[key] = fullPath;
      }
    }
  });
  return entries;
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Automatically feed ALL found files into the bundler
      input: getAllInputFiles('src'),
      output: {
        // Keep the original names and folder structures in the output
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      }
    }
  }
});
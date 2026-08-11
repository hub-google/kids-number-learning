import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function autoVersionPlugin() {
  return {
    name: 'auto-version-plugin',
    buildStart() {
      const buildVersion = Date.now().toString();
      const versionData = JSON.stringify({
        version: buildVersion,
        buildTime: new Date().toISOString()
      }, null, 2);
      
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicDir, 'version.json'), versionData);
    },
    writeBundle(options) {
      const buildVersion = Date.now().toString();
      const versionData = JSON.stringify({
        version: buildVersion,
        buildTime: new Date().toISOString()
      }, null, 2);
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      if (fs.existsSync(outDir)) {
        fs.writeFileSync(path.join(outDir, 'version.json'), versionData);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoVersionPlugin()],
  base: './', // 確保 GitHub Pages 相對路徑正確
});


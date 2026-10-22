import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
function autoVersionPlugin() {
  return {
    name: 'auto-version-plugin',
    writeBundle(options) {
      const outputDir = options.dir || path.resolve(projectDir, 'dist');
      const versionData = {
        version: process.env.GITHUB_SHA || Date.now().toString(),
        buildTime: new Date().toISOString()
      };
      fs.writeFileSync(path.join(outputDir, 'version.json'), JSON.stringify(versionData));
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoVersionPlugin()],
  base: './', // 確保 GitHub Pages 相對路徑正確
});


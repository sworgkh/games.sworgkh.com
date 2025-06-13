import { defineConfig, Plugin } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Custom plugin to move HTML files to the root of the output directory
function moveHtmlToRoot(): Plugin {
  return {
    name: 'move-html-to-root',
    closeBundle: async () => {
      const distDir = path.resolve(__dirname, 'dist')
      const pagesDir = path.resolve(distDir, 'src/pages')

      if (fs.existsSync(pagesDir)) {
        // Find all HTML files in the pages directory
        const findHtmlFiles = (dir: string): string[] => {
          let results: string[] = []
          const list = fs.readdirSync(dir)
          
          list.forEach(file => {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            
            if (stat.isDirectory()) {
              results = results.concat(findHtmlFiles(filePath))
            } else if (path.extname(file) === '.html') {
              results.push(filePath)
            }
          })
          
          return results
        }

        const htmlFiles = findHtmlFiles(pagesDir)
        
        // Map of directory names to their corresponding HTML files
        const gamePages = new Map<string, string>()
        
        // Move each HTML file to the root with a proper name
        htmlFiles.forEach(filePath => {
          const dirName = path.basename(path.dirname(filePath))
          const destFileName = dirName === 'home' ? 'index.html' : `${dirName}.html`
          const destPath = path.join(distDir, destFileName)
          
          // Store the mapping for link fixing
          gamePages.set(dirName, destFileName)
          
          // Copy the file
          fs.copyFileSync(filePath, destPath)
          console.log(`Moved ${filePath} to ${destPath}`)
        })
        
        // Fix links in all HTML files at the root
        gamePages.forEach((destFileName, dirName) => {
          const htmlPath = path.join(distDir, destFileName)
          
          if (fs.existsSync(htmlPath)) {
            let content = fs.readFileSync(htmlPath, 'utf-8')
            
            // Replace links to other pages
            gamePages.forEach((targetFile, targetDir) => {
              // Replace links like "../page-name/index.html" with "./page-name.html"
              const linkPattern = new RegExp(`href=["']\\.\\./${targetDir}/index.html["']`, 'g')
              content = content.replace(linkPattern, `href="./${targetFile}"`)
            })
            
            fs.writeFileSync(htmlPath, content)
            console.log(`Fixed links in ${htmlPath}`)
          }
        })
      }
    }
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/utils': resolve(__dirname, 'src/shared/utils'),
      '@/components': resolve(__dirname, 'src/shared/components')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'index': resolve(__dirname, 'src/pages/home/index.html'),
        'tic-tac-toe': resolve(__dirname, 'src/pages/tic-tac-toe/index.html'),
        'five-in-row': resolve(__dirname, 'src/pages/five-in-row/index.html'),
        'connect-four': resolve(__dirname, 'src/pages/connect-four/index.html'),
        'language-cards': resolve(__dirname, 'src/pages/language-cards/index.html')
      },
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          
          if (assetInfo.name && /\.(css)$/i.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  plugins: [moveHtmlToRoot()],
  server: {
    open: '/src/pages/home/index.html'
  }
}) 
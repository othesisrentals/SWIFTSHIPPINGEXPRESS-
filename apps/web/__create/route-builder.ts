import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Get current directory
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Recursively find all route.js files
async function findRouteFiles(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    let routes: string[] = [];

    for (const file of files) {
      try {
        const filePath = join(dir, file);
        const statResult = await stat(filePath);

        if (statResult.isDirectory()) {
          routes = routes.concat(await findRouteFiles(filePath));
        } else if (file === 'route.js') {
          // Handle root route.js specially
          if (filePath === join(__dirname, 'route.js')) {
            routes.unshift(filePath); // Add to beginning of array
          } else {
            routes.push(filePath);
          }
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }

    return routes;
  } catch (error) {
    console.warn(`Directory ${dir} not found, skipping route file discovery:`, error);
    return [];
  }
}

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '').replace(/\\/g, '/');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import all known route files directly for production
const routeModules = import.meta.glob('../src/app/api/**/route.js', {
  eager: true,
});

// Helper to get absolute path for a route module
function getRouteFilePath(modulePath: string): string {
  return join(fileURLToPath(new URL('.', import.meta.url)), modulePath.replace('../', ''));
}

// Import and register all routes
async function registerRoutes() {
  const routeFiles: string[] = [];
  
  if (import.meta.env.DEV) {
    // In dev: dynamically find files
    const foundFiles = await findRouteFiles(__dirname).catch((error) => {
      console.error('Error finding route files:', error);
      return [];
    });
    routeFiles.push(...foundFiles);
  } else {
    // In production: use statically imported files from import.meta.glob
    routeFiles.push(...Object.keys(routeModules).map(getRouteFilePath));
  }

  // Sort routes by length descending
  routeFiles.sort((a, b) => b.length - a.length);

  // Clear existing routes
  api.routes = [];

  for (const routeFile of routeFiles) {
    try {
      let route;
      const importPath = process.platform === 'win32' 
        ? `${pathToFileURL(routeFile).href}?update=${Date.now()}`
        : `${routeFile}?update=${Date.now()}`;
        
      if (import.meta.env.DEV) {
        route = await import(/* @vite-ignore */ importPath);
      } else {
        // Find the module in our static import
        const modulePath = Object.keys(routeModules).find((path) => {
          const fullPath = getRouteFilePath(path);
          return fullPath === routeFile;
        });
        if (modulePath) {
          route = routeModules[modulePath];
        }
      }

      if (!route) continue;

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            const handler: Handler = async (c) => {
              const params = c.req.param();
              if (import.meta.env.DEV) {
                const updatedImportPath = process.platform === 'win32' 
                  ? `${pathToFileURL(routeFile).href}?update=${Date.now()}`
                  : `${routeFile}?update=${Date.now()}`;
                const updatedRoute = await import(
                  /* @vite-ignore */ updatedImportPath
                );
                return await updatedRoute[method](c.req.raw, { params });
              }
              return await route[method](c.req.raw, { params });
            };
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routeFile}:`, error);
    }
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };

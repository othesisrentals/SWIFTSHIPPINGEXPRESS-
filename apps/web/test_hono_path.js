

const __dirname = 'C:\\Users\\user\\Downloads\\New folder (3)\\anything\\apps\\web\\src\\app\\api';
const routeFile = 'C:\\Users\\user\\Downloads\\New folder (3)\\anything\\apps\\web\\src\\app\\api\\admin\\consignments\\route.js';

const relativePath = routeFile.replace(__dirname, '');
console.log('relativePath:', relativePath);

const parts = relativePath.split('/').filter(Boolean);
console.log('parts:', parts);

const routeParts = parts.slice(0, -1); // Remove 'route.js'
console.log('routeParts:', routeParts);

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

console.log('transformedParts:', transformedParts);

const honoPath = `/${transformedParts.map(({ pattern }) => pattern).join('/')}`;
console.log('honoPath:', honoPath);

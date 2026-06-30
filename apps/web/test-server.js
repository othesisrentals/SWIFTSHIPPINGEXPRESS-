import { createServer } from 'node:http';
import handler from './api/index.js';

const server = createServer(handler);

server.listen(3000, () => {
  console.log('Test server running at http://localhost:3000');
});

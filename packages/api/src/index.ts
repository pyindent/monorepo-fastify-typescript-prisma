import { createServer } from './config/server';
import { registerRoutes } from './routes/index';

async function start() {
  const server = createServer();
  
  // Register all routes
  await registerRoutes(server);

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server started on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
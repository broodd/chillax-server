import cluster from 'cluster';
import server from './server';

if (cluster.isMaster) {
  const cpuLength = require('os').cpus().length;

  for (let i = 0; i < cpuLength - 1; i += 1) {
    cluster.fork();
  }
} else {
  server();
}

cluster.on('exit', () => {
  // Replace the dead worker,
  cluster.fork();
});
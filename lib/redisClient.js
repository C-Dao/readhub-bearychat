const Redis = require('ioredis');
const redisAddress = process.env.REDIS_ADRESS ||
  'redis://localhost:6379/';
const redisClient = new Redis(redisAddress);

redisClient.on('error', (err) => {
  console.log(err);
  process.exit(1);
});
redisClient.on('connect', () => {
  console.log('redisClient connect success');
});
redisClient.on('close', () => {
  console.log('redisClient connect closed');
  process.exit(1);
});

module.exports = redisClient;
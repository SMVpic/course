import getApp from './routes/index.js';

const app = await getApp();

const port = process.env.PORT || 4000;

const host = '0.0.0.0'

app.listen({ port, host }, () => {
  console.log(`Example app listening on ${host}:${port}`);
});
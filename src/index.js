import getApp from './routes/index.js';

const app = await getApp();

const port = process.env.PORT || 4000;

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
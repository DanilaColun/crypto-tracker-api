import { createApp } from './http/createApp';

const port = 3000;

const app = createApp();

app.listen(port, () => {
  console.log(`app started on port ${port}`);
});

import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`);
  if (!config.githubToken) {
    console.warn(
      'No GITHUB_TOKEN set — GitHub allows only 60 requests/hour unauthenticated.',
    );
  }
});

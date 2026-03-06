import app from './app';
import { env, validateEnv } from './config/env';

// Validate environment variables
validateEnv();

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`🚀 LMS Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

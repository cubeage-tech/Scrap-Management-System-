// Runs before any test modules are loaded — sets env vars so db.js config
// picks them up before dotenv overwrites them (dotenv.config skips already-set vars).
process.env.JWT_SECRET = 'test-secret-phase4';
process.env.NODE_ENV = 'test';

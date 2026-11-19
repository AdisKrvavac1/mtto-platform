// Pokreće API (interni port) i Next.js (javni $PORT) u jednom Render servisu.
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '3000';
const API_PORT = process.env.API_PORT || '4000';
const env = { ...process.env };

function run(name, cmd, args, cwd, extra) {
  const p = spawn(cmd, args, { cwd, env: { ...env, ...extra }, stdio: 'inherit' });
  p.on('exit', (code) => {
    console.error(`[${name}] završio s kodom ${code}; gasim servis`);
    process.exit(code ?? 1);
  });
  return p;
}

const api = run('api', 'sh', ['-c', 'node dist/seed.js --if-empty && node dist/main.js'], path.join(__dirname, '..', 'apps/api'), { PORT: API_PORT });
const web = run('web', 'npx', ['next', 'start', '-p', PORT, '-H', '0.0.0.0'], path.join(__dirname, '..', 'apps/web'), { API_INTERNAL_URL: `http://127.0.0.1:${API_PORT}` });

for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { api.kill(sig); web.kill(sig); process.exit(0); });

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '======================================================================');
console.log('\x1b[35m%s\x1b[0m', '           SMARTHIRE PLATFORM - CONTINUOUS RUNTIME SUPERVISOR         ');
console.log('\x1b[36m%s\x1b[0m', '======================================================================');
console.log('Project Directory:', projectRoot);
console.log('Node Runtime:', process.execPath);
console.log('Supervisor Mode: Continuous (Auto-Restart on Crash)');
console.log('----------------------------------------------------------------------');

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

function startBackend() {
  if (isShuttingDown) return;
  console.log('\x1b[34m[API]\x1b[0m Starting Backend API on http://localhost:3001 ...');

  const backendScript = path.join(projectRoot, 'server', 'index.js');
  backendProcess = spawn(process.execPath, [backendScript], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, PORT: '3001' },
  });

  backendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.error(`\x1b[31m[API CRASH/EXIT]\x1b[0m Backend exited (code: ${code}, signal: ${signal}). Auto-restarting in 2s...`);
      setTimeout(startBackend, 2000);
    }
  });

  backendProcess.on('error', (err) => {
    console.error('\x1b[31m[API ERROR]\x1b[0m Failed to spawn backend process:', err.message);
  });
}

function startFrontend() {
  if (isShuttingDown) return;
  console.log('\x1b[35m[UI]\x1b[0m Starting Vite Frontend on http://localhost:5173 ...');

  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  frontendProcess = spawn(process.execPath, [viteBin, '--host', '0.0.0.0', '--port', '5173'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  frontendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.error(`\x1b[31m[UI CRASH/EXIT]\x1b[0m Vite exited (code: ${code}, signal: ${signal}). Auto-restarting in 2s...`);
      setTimeout(startFrontend, 2000);
    }
  });

  frontendProcess.on('error', (err) => {
    console.error('\x1b[31m[UI ERROR]\x1b[0m Failed to spawn Vite frontend:', err.message);
  });
}

// Graceful termination handling
function cleanExit() {
  isShuttingDown = true;
  console.log('\n\x1b[33mStopping SmartHire services gracefully...\x1b[0m');

  if (backendProcess) {
    try { backendProcess.kill(); } catch (e) {}
  }
  if (frontendProcess) {
    try { frontendProcess.kill(); } catch (e) {}
  }

  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

// Start both services
startBackend();
startFrontend();

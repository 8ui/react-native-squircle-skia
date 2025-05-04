const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const options = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  encoding: 'utf-8',
};

if (os.type() === 'Windows_NT') {
  options.shell = true;
}

let result;

if (process.cwd() !== root || args.length) {
  // We're not in the root of the project, or additional arguments were passed
  // In this case, forward the command to `yarn`
  result = execSync('yarn', {
    ...options,
    input: args.join(' '),
  });
} else {
  // If `yarn` is run without arguments, perform bootstrap
  result = execSync('yarn', {
    ...options,
    input: 'bootstrap',
  });
}

process.exitCode = result.status;

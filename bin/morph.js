#!/usr/bin/env node

// Check if node_modules exists, if not, install dependencies
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Dependencies installed!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies. Please run: npm install');
    process.exit(1);
  }
}

// Now we can require the dependencies
const { program } = require('commander');
const chalk = require('chalk');
const os = require('os');

// Setup logging
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLog = path.join(logDir, 'error.log');
const logError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}${error ? '\n' + error.stack : ''}\n`;
  fs.appendFileSync(errorLog, logEntry);
  console.error(chalk.red(message));
  if (error && process.env.DEBUG) {
    console.error(error);
  }
};

// Check if we're running inside MorphBox
const isInsideMorphBox = () => {
  return process.env.MORPHBOX_CONTAINER === 'true' || 
         process.env.LIMA_INSTANCE === 'morphbox' ||
         fs.existsSync('/.morphbox-marker');
};

// Check if MorphBox is installed
const isMorphBoxInstalled = () => {
  try {
    execSync('which morphbox', { stdio: 'ignore' });
    // Also check if Lima is installed on Linux
    if (process.platform === 'linux') {
      execSync('which limactl', { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
};

// Check if QEMU is installed (for Linux)
const isQemuInstalled = () => {
  if (process.platform !== 'linux') return true;
  try {
    execSync('which qemu-img', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Detect package manager
const detectPackageManager = () => {
  const managers = [
    { cmd: 'apt-get', check: 'which apt-get', install: 'sudo apt-get install -y qemu-system-x86 qemu-utils' },
    { cmd: 'dnf', check: 'which dnf', install: 'sudo dnf install -y qemu' },
    { cmd: 'yum', check: 'which yum', install: 'sudo yum install -y qemu' },
    { cmd: 'pacman', check: 'which pacman', install: 'sudo pacman -S --noconfirm qemu' },
    { cmd: 'zypper', check: 'which zypper', install: 'sudo zypper install -y qemu' }
  ];
  
  for (const mgr of managers) {
    try {
      execSync(mgr.check, { stdio: 'ignore' });
      return mgr;
    } catch {
      // Try next
    }
  }
  return null;
};

// Check if Claude CLI is installed
const isClaudeInstalled = () => {
  try {
    execSync('which claude', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Launch MorphBox and re-run morph inside it
const launchInMorphBox = () => {
  console.log(chalk.blue('🔒 Launching MorphBox for safe Claude execution...'));
  
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  
  // Build the command to run inside MorphBox
  const morphCommand = `cd /workspace && morph ${args.join(' ')}`;
  
  // Launch MorphBox with our command
  console.log(chalk.gray('Running: morphbox --shell -c ' + morphCommand));
  const morphbox = spawn('morphbox', ['--shell', '-c', morphCommand], {
    stdio: ['inherit', 'pipe', 'pipe'],
    cwd: cwd
  });
  
  morphbox.on('error', (err) => {
    logError('Failed to launch MorphBox', err);
    process.exit(1);
  });
  
  let morphboxOutput = '';
  morphbox.stdout?.on('data', (data) => {
    process.stdout.write(data); // Show output to user
    morphboxOutput += data.toString();
  });
  morphbox.stderr?.on('data', (data) => {
    process.stderr.write(data); // Show errors to user
    morphboxOutput += data.toString();
  });
  
  morphbox.on('exit', (code) => {
    if (code !== 0) {
      logError(`MorphBox exited with code ${code}\nOutput:\n${morphboxOutput}`);
      
      // Check if Lima mentioned an error log
      let kvmError = false;
      if (morphboxOutput.includes('ha.stderr.log')) {
        // Try to read the Lima error log
        const limaErrorLog = path.join(os.homedir(), '.lima/morphbox/ha.stderr.log');
        try {
          const errorContent = fs.readFileSync(limaErrorLog, 'utf8');
          if (errorContent.includes('Could not access KVM kernel module') || 
              errorContent.includes('failed to initialize kvm')) {
            kvmError = true;
          }
        } catch (e) {
          // Ignore if we can't read the file
        }
      }
      
      // Check if the error is due to Lima not being installed
      if (morphboxOutput.includes('Lima is not installed') || morphboxOutput.includes('limactl: command not found')) {
        console.log(chalk.yellow('\n⚠️  Lima is not installed. MorphBox requires Lima to create VMs.'));
        console.log(chalk.yellow('Please run morph again to install Lima, or install it manually.'));
      }
      
      // Check if the error is due to KVM not being available
      if (kvmError || morphboxOutput.includes('Could not access KVM kernel module') || 
          morphboxOutput.includes('failed to initialize kvm') ||
          morphboxOutput.includes('qemu[stderr]: qemu-system-x86_64: Could not access KVM')) {
        console.log(chalk.red('\n❌ KVM virtualization is required but not available on this system.'));
        console.log(chalk.yellow('\nMorphBox requires hardware virtualization to provide security isolation.'));
        console.log(chalk.yellow('This typically fails on:'));
        console.log(chalk.gray('  • VPS/cloud servers (no nested virtualization)'));
        console.log(chalk.gray('  • Docker containers'));
        console.log(chalk.gray('  • Some WSL2 setups'));
        console.log('');
        console.log(chalk.blue('This tool is designed for local development machines.'));
        console.log(chalk.cyan('Please run on a system with KVM support (most modern desktops/laptops).'));
      }
    }
    process.exit(code);
  });
};

// Launch Claude with enhancements
const launchClaude = (args) => {
  console.log(chalk.green('✨ Starting Claude with Morph enhancements...'));
  
  // TODO: Start queue manager in background
  // TODO: Set up context hooks
  
  // For now, just launch Claude with --dangerously-skip-permissions
  const claudeArgs = ['--dangerously-skip-permissions', ...args];
  
  console.log(chalk.gray('Running: claude ' + claudeArgs.join(' ')));
  
  const claude = spawn('claude', claudeArgs, {
    stdio: 'inherit'
  });
  
  claude.on('error', (err) => {
    logError('Failed to launch Claude CLI', err);
    process.exit(1);
  });
  
  claude.on('exit', (code) => {
    // TODO: Save context before exit
    if (code !== 0 && args.length === 0) {
      // Don't log error for interactive mode exit
    } else if (code !== 0) {
      logError(`Claude CLI exited with code ${code}`);
    }
    process.exit(code);
  });
};


// Main program
program
  .name('morph')
  .description('Safe Claude CLI wrapper with MorphBox integration')
  .version('0.1.0')
  .option('--mode', 'Enable morph mode for self-modification')
  .option('--skip-morphbox', 'Skip MorphBox check (unsafe!)')
  .argument('[claude-args...]', 'Arguments to pass to Claude CLI')
  .allowUnknownOption()
  .action((claudeArgs = [], options) => {
    // Show warning if skipping MorphBox
    if (options.skipMorphbox) {
      console.log(chalk.yellow('⚠️  Warning: Running without MorphBox protection!'));
      console.log(chalk.yellow('This flag should only be used for testing purposes.'));
    }
    
    // Check if we're inside MorphBox
    if (!isInsideMorphBox() && !options.skipMorphbox) {
      // Check if MorphBox is installed
      if (!isMorphBoxInstalled()) {
        console.log(chalk.yellow('📦 MorphBox not found. Installing...'));
        
        // Check if morphbox directory exists
        const morphboxPath = path.join(__dirname, '..', '..', 'morphbox');
        if (!fs.existsSync(morphboxPath)) {
          console.log(chalk.yellow('📦 MorphBox repository not found.'));
          
          // Create a prompt to clone it
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
          });
          
          rl.question(chalk.green('Clone MorphBox from GitHub? [Y/n] '), (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'n') {
              console.log(chalk.gray('Installation cancelled.'));
              console.log(chalk.yellow('To install manually:'));
              console.log(chalk.cyan('  git clone https://github.com/MicahBly/morphbox ../morphbox'));
              process.exit(0);
            }
            
            // Clone MorphBox
            console.log(chalk.blue('Cloning MorphBox repository...'));
            const gitProcess = spawn('git', [
              'clone', 
              'https://github.com/MicahBly/morphbox',
              morphboxPath
            ], {
              stdio: 'inherit'
            });
            
            gitProcess.on('error', (err) => {
              logError('Failed to clone MorphBox', err);
              console.log(chalk.red('Make sure git is installed.'));
              process.exit(1);
            });
            
            gitProcess.on('exit', (code) => {
              if (code === 0) {
                console.log(chalk.green('✅ MorphBox cloned successfully!'));
                // Re-run morph to continue with installation
                const morphProcess = spawn(process.argv[0], process.argv.slice(1), {
                  stdio: 'inherit'
                });
                morphProcess.on('exit', (code) => process.exit(code));
              } else {
                logError(`Git clone failed with code ${code}`);
                process.exit(1);
              }
            });
          });
          
          return; // Wait for clone to complete
        }
        
        // Check if Lima is installed first
        const isLimaInstalled = () => {
          try {
            execSync('which limactl', { stdio: 'ignore' });
            return true;
          } catch {
            return false;
          }
        };
        
        if (!isLimaInstalled() && process.platform === 'linux') {
          console.log(chalk.yellow('⚠️  Lima is not installed. It is required for MorphBox on Linux.'));
          console.log(chalk.blue('Lima installation requires sudo access to copy binaries to /usr/local/bin'));
          
          // Create a prompt to install Lima
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
          });
          
          rl.question(chalk.green('Install Lima now? (requires sudo password) [Y/n] '), (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'n') {
              console.log(chalk.gray('Installation cancelled.'));
              console.log(chalk.yellow('To install Lima manually, run the MorphBox installer:'));
              console.log(chalk.cyan(`  cd ${morphboxPath} && ./install.sh`));
              process.exit(0);
            }
            
            console.log(chalk.blue('Installing Lima (this will prompt for sudo password)...\n'));
            
            // Run the installer with proper terminal handling for sudo
            const installScript = path.join(morphboxPath, 'install.sh');
            const installProcess = spawn('bash', [installScript], {
              stdio: 'inherit',
              cwd: morphboxPath
            });
            
            installProcess.on('error', (err) => {
              logError('Failed to run MorphBox installer', err);
              process.exit(1);
            });
            
            installProcess.on('exit', (code) => {
              if (code === 0) {
                console.log(chalk.green('\n✅ MorphBox and Lima installed successfully!'));
                console.log(chalk.blue('Continuing with morph...\n'));
                
                // Re-run morph after installation
                const morphProcess = spawn(process.argv[0], process.argv.slice(1), {
                  stdio: 'inherit'
                });
                
                morphProcess.on('exit', (code) => {
                  process.exit(code);
                });
              } else {
                logError(`MorphBox installation failed with code ${code}`);
                console.log(chalk.red('\n❌ Installation failed'));
                console.log(chalk.yellow('You may need to install Lima manually.'));
                process.exit(1);
              }
            });
          });
          
          return; // Wait for user response
        }
        
        // If Lima is already installed or on macOS, just run the installer
        console.log(chalk.blue('Running MorphBox installer...'));
        const installScript = path.join(morphboxPath, 'install.sh');
        
        const installProcess = spawn('bash', [installScript], {
          stdio: 'inherit',
          cwd: morphboxPath
        });
        
        installProcess.on('error', (err) => {
          logError('Failed to run MorphBox installer', err);
          process.exit(1);
        });
        
        installProcess.on('exit', (code) => {
          if (code === 0) {
            console.log(chalk.green('\n✅ MorphBox installed successfully!'));
            console.log(chalk.blue('Continuing with morph...\n'));
            
            // Re-run morph after installation
            const morphProcess = spawn(process.argv[0], process.argv.slice(1), {
              stdio: 'inherit'
            });
            
            morphProcess.on('exit', (code) => {
              process.exit(code);
            });
          } else {
            logError(`MorphBox installation failed with code ${code}`);
            process.exit(1);
          }
        });
        
        return; // Don't continue, let the installer finish
      }
      
      // Check for QEMU on Linux
      if (process.platform === 'linux' && !isQemuInstalled()) {
        console.log(chalk.yellow('⚠️  QEMU is required for MorphBox on Linux'));
        
        const pkgMgr = detectPackageManager();
        if (pkgMgr) {
          console.log(chalk.blue(`QEMU can be installed with: ${pkgMgr.cmd}`));
          
          // Read user input
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
          });
          
          rl.question(chalk.green('Install QEMU now? [Y/n] '), (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'n') {
              console.log(chalk.gray('Installation cancelled. Run morph again after installing QEMU.'));
              process.exit(0);
            } else {
              // Default to yes for empty input or 'y'
              console.log(chalk.blue('Installing QEMU (requires sudo password)...'));
              console.log(chalk.gray(`Running: ${pkgMgr.install}`));
              console.log('');
              
              // Run the install command interactively
              const installProcess = spawn('sh', ['-c', pkgMgr.install], {
                stdio: 'inherit'
              });
              
              installProcess.on('exit', (code) => {
                if (code === 0) {
                  console.log(chalk.green('\n✅ QEMU installed successfully!'));
                  console.log(chalk.blue('Starting morph...'));
                  console.log('');
                  
                  // Re-run morph after successful installation
                  const morphProcess = spawn(process.argv[0], process.argv.slice(1), {
                    stdio: 'inherit'
                  });
                  
                  morphProcess.on('exit', (code) => {
                    process.exit(code);
                  });
                } else {
                  logError(`QEMU installation failed with code ${code}`);
                  console.log(chalk.red('\n❌ QEMU installation failed'));
                  console.log(chalk.yellow('Please install QEMU manually and try again.'));
                  process.exit(1);
                }
              });
            }
          });
          
          return; // Don't continue past this point
        } else {
          console.log(chalk.red('Could not detect package manager.'));
          console.log(chalk.yellow('Please install QEMU manually for your distribution.'));
          process.exit(1);
        }
      }
      
      // Launch in MorphBox
      launchInMorphBox();
    } else {
      // We're inside MorphBox (or skipping check)
      
      // Check if Claude is installed
      if (!isClaudeInstalled()) {
        console.log(chalk.red('❌ Claude CLI not found!'));
        console.log(chalk.yellow('Please install Claude CLI first:'));
        console.log(chalk.cyan('  npm install -g @anthropic-ai/claude-code'));
        process.exit(1);
      }
      
      // Launch Claude with enhancements
      launchClaude(claudeArgs);
    }
  });

// Global error handlers
process.on('uncaughtException', (err) => {
  logError('Uncaught exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled rejection at: ' + promise + ' reason: ' + reason);
  process.exit(1);
});

// Parse arguments
program.parse();
#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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
    return true;
  } catch {
    return false;
  }
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
  const morphbox = spawn('morphbox', ['--shell', '-c', morphCommand], {
    stdio: 'inherit',
    cwd: cwd
  });
  
  morphbox.on('exit', (code) => {
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
  
  claude.on('exit', (code) => {
    // TODO: Save context before exit
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
    }
    
    // Check if we're inside MorphBox
    if (!isInsideMorphBox() && !options.skipMorphbox) {
      // Check if MorphBox is installed
      if (!isMorphBoxInstalled()) {
        console.log(chalk.red('❌ MorphBox not found!'));
        console.log(chalk.yellow('Please install MorphBox first:'));
        console.log(chalk.cyan('  curl -sSf https://morphbox.iu.dev/install.sh | bash'));
        process.exit(1);
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

// Parse arguments
program.parse();
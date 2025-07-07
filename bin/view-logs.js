#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const errorLog = path.join(__dirname, '..', 'logs', 'error.log');

if (!fs.existsSync(errorLog)) {
  console.log(chalk.green('No errors logged yet! 🎉'));
  process.exit(0);
}

// Show last N lines (default 20)
const lines = parseInt(process.argv[2]) || 20;

const content = fs.readFileSync(errorLog, 'utf8');
const allLines = content.trim().split('\n');
const lastLines = allLines.slice(-lines);

console.log(chalk.blue(`=== Last ${lines} lines of error.log ===\n`));
console.log(lastLines.join('\n'));

// Show file size
const stats = fs.statSync(errorLog);
console.log(chalk.gray(`\nLog file size: ${(stats.size / 1024).toFixed(2)} KB`));
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');

function checkFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log(`[PASS] ${filePath}`);
  } catch (error) {
    console.error(`[FAIL] ${filePath}`);
    console.error(error.message);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      checkFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src'));

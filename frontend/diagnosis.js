// Diagnóstico para Challenge Plans Frontend
console.log('Diagnóstico de Challenge Plans Frontend');

const fs = require('fs');
const path = require('path');

// Verificar archivos críticos
const criticalFiles = [
  'src/main.tsx',
  'src/App.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx',
  'src/pages/Home/HomePage.tsx',
  'public/images/logo.svg',
  'public/favicon.svg',
];

console.log('Verificando archivos críticos...');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${file}: ${exists ? '✅' : '❌'}`);
});

// Verificar recursos de imágenes
const imageDirectories = [
  'public/images',
  'public/images/avatars'
];

console.log('\nVerificando directorios de recursos...');
imageDirectories.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`${dir}: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    console.log(`  Archivos: ${files.length > 0 ? files.join(', ') : 'Directorio vacío ❌'}`);
  }
});

// Verificar caso sensible de nombres de archivos
const sensitiveFiles = [
  { import: 'NavBar', actual: 'Navbar' }
];

console.log('\nVerificando nombres de archivos con mayúsculas/minúsculas...');
sensitiveFiles.forEach(item => {
  const importPath = path.join(__dirname, 'src/components/layout', `${item.import}.tsx`);
  const actualPath = path.join(__dirname, 'src/components/layout', `${item.actual}.tsx`);
  
  console.log(`Import: ${item.import}.tsx, Actual: ${item.actual}.tsx`);
  console.log(`  Import existe: ${fs.existsSync(importPath) ? '✅' : '❌'}`);
  console.log(`  Actual existe: ${fs.existsSync(actualPath) ? '✅' : '❌'}`);
});

console.log('\nDiagnóstico completado. Si ves algún ❌, necesitas corregir estos problemas.');

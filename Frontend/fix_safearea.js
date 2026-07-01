const fs = require('fs');
const glob = require('glob');
const files = glob.sync('app/**/*.tsx');
let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('SafeAreaView') && content.includes('react-native') && !content.includes('react-native-safe-area-context')) {
    // Remove SafeAreaView from the named imports
    content = content.replace(/SafeAreaView,\s*/g, '');
    content = content.replace(/,\s*SafeAreaView/g, '');
    content = content.replace(/\{\s*SafeAreaView\s*\}/g, '{}');
    
    // Add the new import after the react-native import
    content = content.replace(/(import\s*{[^}]*}\s*from\s*'react-native';)/, "$1\nimport { SafeAreaView } from 'react-native-safe-area-context';");
    
    fs.writeFileSync(file, content);
    count++;
    console.log('Fixed', file);
  }
}
console.log('Total fixed:', count);

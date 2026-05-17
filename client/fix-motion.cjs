const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f)) {
      let c = fs.readFileSync(p, 'utf8');
      const orig = c;
      c = c.replace(/<motion(\s|>)/g, '<div$1');
      c = c.replace(/<\/motion>/g, '</div>');
      c = c.replace(/\nconst motion = \([\s\S]*?\);\n/g, '\n');
      if (c !== orig) fs.writeFileSync(p, c);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('done');

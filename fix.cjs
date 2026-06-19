const fs = require('fs');
const files = [
  'src/components/Timeline/Timeline.jsx',
  'src/components/Tickets/Tickets.jsx',
  'src/components/NewData/NewData.jsx',
  'src/components/Metrics/Metrics.jsx',
  'src/components/Innovation/Innovation.jsx',
  'src/components/Features/Features.jsx',
  'src/components/CTA/CTA.jsx',
  'src/pages/Panelistas.jsx'
];
files.forEach(f => {
  if(fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/className="relative py-28 overflow-hidden"/g, 'className="relative min-h-[100dvh] flex flex-col justify-center py-10 overflow-hidden"');
    content = content.replace(/className="relative py-40 overflow-hidden"/g, 'className="relative min-h-[100dvh] flex flex-col justify-center py-10 overflow-hidden"');
    content = content.replace(/className="relative py-24 overflow-hidden"/g, 'className="relative min-h-[100dvh] flex flex-col justify-center py-10 overflow-hidden"');
    content = content.replace(/className="relative py-32 overflow-hidden"/g, 'className="relative min-h-[100dvh] flex flex-col justify-center py-10 overflow-hidden"');
    fs.writeFileSync(f, content);
  }
});
console.log('Done');

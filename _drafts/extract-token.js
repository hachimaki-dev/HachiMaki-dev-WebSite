import fs from 'fs';
import path from 'path';

const dir = '/home/hachimaki/.config/google-chrome/Default/Local Storage/leveldb';
const files = fs.readdirSync(dir);

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.statSync(filePath).isFile()) continue;
  
  const content = fs.readFileSync(filePath);
  
  // Search for the token pattern
  const idx = content.indexOf(Buffer.from('sb-rieloabfccxbczsbxtnh-auth-token'));
  if (idx !== -1) {
    console.log('Found in:', file);
    // Find the next '{' after the key
    const rawChunk = content.slice(idx, idx + 4000).toString('binary');
    console.log('Raw chunk length:', rawChunk.length);
    // Let's search for the first '{' and the last '}' that closes it
    const startIdx = rawChunk.indexOf('{');
    if (startIdx !== -1) {
      let braceCount = 0;
      let endIdx = -1;
      for (let i = startIdx; i < rawChunk.length; i++) {
        if (rawChunk[i] === '{') braceCount++;
        else if (rawChunk[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
      if (endIdx !== -1) {
        const potentialJson = rawChunk.slice(startIdx, endIdx + 1);
        // Remove non-printable characters or weird characters inserted by leveldb
        const cleaned = potentialJson.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        console.log('Cleaned JSON:', cleaned);
        try {
          const parsed = JSON.parse(cleaned);
          fs.writeFileSync('_drafts/supabase-session.json', JSON.stringify(parsed, null, 2));
          console.log('Saved to _drafts/supabase-session.json');
        } catch (err) {
          console.log('Parse error:', err.message);
        }
      }
    }
  }
}

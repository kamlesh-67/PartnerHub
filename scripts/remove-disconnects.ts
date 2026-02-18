import fs from 'fs';
import path from 'path';

const searchDir = 'src';

function processDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Pattern: finally { await prisma.$disconnect() }
            const disconnectPattern = /\s*finally\s*{\s*(?:await\s+)?prisma\.\$disconnect\(\)(?:;)?\s*}/g;

            if (disconnectPattern.test(content)) {
                console.log(`Removing $disconnect from ${fullPath}`);
                content = content.replace(disconnectPattern, '');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

processDirectory(searchDir);
console.log('Done!');

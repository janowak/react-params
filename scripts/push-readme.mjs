#!/usr/bin/env zx
// @ts-nocheck
$.verbose = true;

import {dirname, join, relative} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const rootReadmePath = join(process.cwd(), 'README.md');
let rootReadmeContent = readFileSync(rootReadmePath, 'utf8');

const readmeFiles = (await $`find . -name "README.md" -not -path "./README.md" -not -path "./node_modules/*" -not -path "./test/*"`)
    .stdout.trim().split('\n')
    .filter(Boolean); // Filter out empty strings

console.log(`Found ${readmeFiles.length} README.md files to update.`);

for (const readmePath of readmeFiles) {
    const nestedDir = dirname(readmePath);
    const relativeToRoot = relative(nestedDir, '.');

    let modifiedContent = rootReadmeContent;

    modifiedContent = modifiedContent.replace(
        /(\[.*?\]\(|\<a\s+href=["'])(\/[^)'"]+\.tsx)([)"'])/g,
        (_, prefix, path, suffix) => {
            // Adjust the path to be relative to the nested README
            const adjustedPath = join(relativeToRoot, path.substring(1));
            return `${prefix}${adjustedPath}${suffix}`;
        }
    );


    // Write the modified content to the nested README
    writeFileSync(readmePath, modifiedContent);
    console.log(`✅ Updated ${readmePath}`);
}

console.log('🎉 All README files have been successfully updated!');

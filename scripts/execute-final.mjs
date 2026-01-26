#!/usr/bin/env node
import fs from 'fs';

// Read all 4 migration files and output individual SQL statements
const files = [
  'contacts-migration-part1.sql',
  'contacts-migration-part2.sql',
  'contacts-migration-part3.sql',
  'contacts-migration-part4.sql'
];

console.log('Reading migration files and extracting statements...\n');

let allStatements = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const statements = content
    .split(/\n\n\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.includes('INSERT INTO contacts'));

  allStatements = allStatements.concat(statements);
  console.log(`${file}: ${statements.length} statements`);
}

console.log(`\nTotal statements to execute: ${allStatements.length}`);

// Save to a JSON file for programmatic execution
fs.writeFileSync('contact-statements.json', JSON.stringify(allStatements, null, 2));
console.log('\nSaved to contact-statements.json');

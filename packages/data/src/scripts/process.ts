import * as fs from 'fs';
import * as path from 'path';
import { parseMatchCSV, saveProcessedMatches } from '../parser';
import { ProcessedMatch } from '../types';

const DATA_DIR = path.join(__dirname, '../../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');

async function processAllMatches(): Promise<void> {
  console.log('Processing ATP match data...\n');

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const allMatches: ProcessedMatch[] = [];

  // Read all yearly match files
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('atp_matches_') && f.endsWith('.csv'))
    .sort();

  for (const file of files) {
    const filePath = path.join(RAW_DIR, file);
    console.log(`Processing ${file}...`);

    try {
      const matches = await parseMatchCSV(filePath);
      allMatches.push(...matches);
      console.log(`  ✓ Parsed ${matches.length} matches`);
    } catch (error) {
      console.log(`  ✗ Error processing ${file}: ${error}`);
    }
  }

  // Sort by date
  allMatches.sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log(`\nTotal matches processed: ${allMatches.length}`);
  console.log(`Date range: ${allMatches[0]?.date.toISOString().split('T')[0]} to ${allMatches[allMatches.length - 1]?.date.toISOString().split('T')[0]}`);

  // Save processed data
  const outputPath = path.join(PROCESSED_DIR, 'all_matches.csv');
  await saveProcessedMatches(allMatches, outputPath);
  console.log(`\nProcessed data saved to: ${outputPath}`);

  // Generate summary statistics
  const surfaces = new Map<string, number>();
  const years = new Map<number, number>();

  for (const match of allMatches) {
    const surface = match.surface;
    surfaces.set(surface, (surfaces.get(surface) || 0) + 1);

    const year = match.date.getFullYear();
    years.set(year, (years.get(year) || 0) + 1);
  }

  console.log('\nMatches by surface:');
  Array.from(surfaces.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([surface, count]) => {
      console.log(`  ${surface}: ${count}`);
    });

  console.log('\nMatches by decade:');
  const decades = new Map<number, number>();
  for (const [year, count] of years.entries()) {
    const decade = Math.floor(year / 10) * 10;
    decades.set(decade, (decades.get(decade) || 0) + count);
  }
  Array.from(decades.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([decade, count]) => {
      console.log(`  ${decade}s: ${count}`);
    });
}

processAllMatches().catch(console.error);

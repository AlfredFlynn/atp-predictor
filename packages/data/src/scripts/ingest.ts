import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const DATA_DIR = path.join(__dirname, '../../../../data');
const RAW_DIR = path.join(DATA_DIR, 'raw');

// Jeff Sackmann's tennis_atp repository - the most comprehensive public ATP dataset
// Covers 1968-present with detailed match statistics
const BASE_URL = 'https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master';

const YEARS = Array.from({ length: 2024 - 1968 + 1 }, (_, i) => 1968 + i);

interface FileDownload {
  url: string;
  path: string;
  description: string;
}

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
          });
        }
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadATPData(): Promise<void> {
  console.log('Starting ATP data download...');
  console.log(`Data source: ${BASE_URL}`);
  console.log('Source: Jeff Sackmann\'s tennis_atp GitHub repository');
  console.log('Coverage: 1968-2024 ATP matches with detailed statistics\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
  }

  const downloads: FileDownload[] = [];

  // Download yearly match files
  for (const year of YEARS) {
    downloads.push({
      url: `${BASE_URL}/atp_matches_${year}.csv`,
      path: path.join(RAW_DIR, `atp_matches_${year}.csv`),
      description: `ATP matches ${year}`
    });
  }

  // Download player and rankings data
  downloads.push({
    url: `${BASE_URL}/atp_players.csv`,
    path: path.join(RAW_DIR, 'atp_players.csv'),
    description: 'ATP players database'
  });

  downloads.push({
    url: `${BASE_URL}/atp_rankings_current.csv`,
    path: path.join(RAW_DIR, 'atp_rankings_current.csv'),
    description: 'Current ATP rankings'
  });

  let successful = 0;
  let failed = 0;

  for (const download of downloads) {
    try {
      console.log(`Downloading: ${download.description}...`);
      await downloadFile(download.url, download.path);
      console.log(`✓ Downloaded: ${download.description}`);
      successful++;
    } catch (error) {
      console.log(`✗ Failed: ${download.description} - ${error}`);
      failed++;
    }
  }

  console.log(`\nDownload complete: ${successful} successful, ${failed} failed`);

  // Create metadata file
  const metadata = {
    source: 'Jeff Sackmann tennis_atp GitHub repository',
    sourceUrl: 'https://github.com/JeffSackmann/tennis_atp',
    dataUrl: BASE_URL,
    coverage: '1968-2024',
    downloadDate: new Date().toISOString(),
    description: 'Comprehensive ATP match data including player info, rankings, and detailed match statistics',
    files: downloads.map(d => ({
      name: path.basename(d.path),
      description: d.description,
      url: d.url
    }))
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'data-provenance.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\nData provenance saved to data/data-provenance.json');
}

downloadATPData().catch(console.error);

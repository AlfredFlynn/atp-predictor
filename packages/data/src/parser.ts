import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import * as fs from 'fs';
import * as path from 'path';
import { RawMatch, ProcessedMatch } from './types';

const parseNumber = (val: string | undefined): number | null => {
  if (!val || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const parseDate = (dateStr: string): Date => {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
};

export async function parseMatchCSV(filePath: string): Promise<ProcessedMatch[]> {
  return new Promise((resolve, reject) => {
    const matches: ProcessedMatch[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (raw: RawMatch) => {
        try {
          const match: ProcessedMatch = {
            date: parseDate(raw.tourney_date),
            tourneyId: raw.tourney_id,
            tourneyName: raw.tourney_name,
            surface: raw.surface || 'Unknown',
            tourneyLevel: raw.tourney_level,
            round: raw.round,
            winnerId: raw.winner_id,
            winnerName: raw.winner_name,
            winnerRank: parseNumber(raw.winner_rank),
            winnerAge: parseNumber(raw.winner_age),
            winnerHeight: parseNumber(raw.winner_ht),
            loserId: raw.loser_id,
            loserName: raw.loser_name,
            loserRank: parseNumber(raw.loser_rank),
            loserAge: parseNumber(raw.loser_age),
            loserHeight: parseNumber(raw.loser_ht),
            score: raw.score,
            bestOf: parseInt(raw.best_of) || 3,
            minutes: parseNumber(raw.minutes),
            winnerAces: parseNumber(raw.w_ace),
            winnerDoubleFaults: parseNumber(raw.w_df),
            winnerFirstServeIn: parseNumber(raw.w_1stIn),
            winnerFirstServeTotal: parseNumber(raw.w_svpt),
            winnerFirstServeWon: parseNumber(raw.w_1stWon),
            winnerSecondServeWon: parseNumber(raw.w_2ndWon),
            loserAces: parseNumber(raw.l_ace),
            loserDoubleFaults: parseNumber(raw.l_df),
            loserFirstServeIn: parseNumber(raw.l_1stIn),
            loserFirstServeTotal: parseNumber(raw.l_svpt),
            loserFirstServeWon: parseNumber(raw.l_1stWon),
            loserSecondServeWon: parseNumber(raw.l_2ndWon),
          };
          matches.push(match);
        } catch (error) {
          console.error(`Error parsing match: ${error}`);
        }
      })
      .on('end', () => resolve(matches))
      .on('error', reject);
  });
}

export async function saveProcessedMatches(matches: ProcessedMatch[], outputPath: string): Promise<void> {
  const records = matches.map(m => ({
    date: m.date.toISOString().split('T')[0],
    tourneyId: m.tourneyId,
    tourneyName: m.tourneyName,
    surface: m.surface,
    tourneyLevel: m.tourneyLevel,
    round: m.round,
    winnerId: m.winnerId,
    winnerName: m.winnerName,
    winnerRank: m.winnerRank ?? '',
    winnerAge: m.winnerAge ?? '',
    winnerHeight: m.winnerHeight ?? '',
    loserId: m.loserId,
    loserName: m.loserName,
    loserRank: m.loserRank ?? '',
    loserAge: m.loserAge ?? '',
    loserHeight: m.loserHeight ?? '',
    score: m.score,
    bestOf: m.bestOf,
    minutes: m.minutes ?? '',
    winnerAces: m.winnerAces ?? '',
    winnerDoubleFaults: m.winnerDoubleFaults ?? '',
    winnerFirstServeIn: m.winnerFirstServeIn ?? '',
    winnerFirstServeTotal: m.winnerFirstServeTotal ?? '',
    winnerFirstServeWon: m.winnerFirstServeWon ?? '',
    winnerSecondServeWon: m.winnerSecondServeWon ?? '',
    loserAces: m.loserAces ?? '',
    loserDoubleFaults: m.loserDoubleFaults ?? '',
    loserFirstServeIn: m.loserFirstServeIn ?? '',
    loserFirstServeTotal: m.loserFirstServeTotal ?? '',
    loserFirstServeWon: m.loserFirstServeWon ?? '',
    loserSecondServeWon: m.loserSecondServeWon ?? '',
  }));

  return new Promise((resolve, reject) => {
    stringify(records, { header: true }, (err, output) => {
      if (err) return reject(err);
      fs.writeFileSync(outputPath, output);
      resolve();
    });
  });
}

export async function loadProcessedMatches(inputPath: string): Promise<ProcessedMatch[]> {
  return new Promise((resolve, reject) => {
    const matches: ProcessedMatch[] = [];

    fs.createReadStream(inputPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (record: any) => {
        matches.push({
          date: new Date(record.date),
          tourneyId: record.tourneyId,
          tourneyName: record.tourneyName,
          surface: record.surface,
          tourneyLevel: record.tourneyLevel,
          round: record.round,
          winnerId: record.winnerId,
          winnerName: record.winnerName,
          winnerRank: parseNumber(record.winnerRank),
          winnerAge: parseNumber(record.winnerAge),
          winnerHeight: parseNumber(record.winnerHeight),
          loserId: record.loserId,
          loserName: record.loserName,
          loserRank: parseNumber(record.loserRank),
          loserAge: parseNumber(record.loserAge),
          loserHeight: parseNumber(record.loserHeight),
          score: record.score,
          bestOf: parseInt(record.bestOf),
          minutes: parseNumber(record.minutes),
          winnerAces: parseNumber(record.winnerAces),
          winnerDoubleFaults: parseNumber(record.winnerDoubleFaults),
          winnerFirstServeIn: parseNumber(record.winnerFirstServeIn),
          winnerFirstServeTotal: parseNumber(record.winnerFirstServeTotal),
          winnerFirstServeWon: parseNumber(record.winnerFirstServeWon),
          winnerSecondServeWon: parseNumber(record.winnerSecondServeWon),
          loserAces: parseNumber(record.loserAces),
          loserDoubleFaults: parseNumber(record.loserDoubleFaults),
          loserFirstServeIn: parseNumber(record.loserFirstServeIn),
          loserFirstServeTotal: parseNumber(record.loserFirstServeTotal),
          loserFirstServeWon: parseNumber(record.loserFirstServeWon),
          loserSecondServeWon: parseNumber(record.loserSecondServeWon),
        });
      })
      .on('end', () => resolve(matches))
      .on('error', reject);
  });
}

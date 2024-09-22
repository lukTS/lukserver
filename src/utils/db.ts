import fs from 'fs';
import path from 'path';
import { Data } from '../models/models';

const dbFilePath = path.join(__dirname, '../db.json');

export function readData(): Data {
  const data = fs.readFileSync(dbFilePath, 'utf-8');
  return JSON.parse(data);
}

export function writeData(data: Data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

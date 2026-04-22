import Dexie, { Table } from 'dexie';
import { Project } from '../types';

export class UIDB extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('UltraLightGlassUI');
    this.version(1).stores({
      projects: 'id, name, updatedAt'
    });
  }
}

export const db = new UIDB();

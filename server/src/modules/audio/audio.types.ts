export interface Category {
  category: string;
  value: string | number;
}

export interface ProcessAudioResponse {
  transcription: string;
  categories: Category[];
}

export interface ConfirmSaveInput {
  transcription: string;
  categories: Category[];
  date: string;
  source?: 'audio' | 'text' | 'image';
}

export interface ConfirmSaveResponse {
  entryId: string;
}

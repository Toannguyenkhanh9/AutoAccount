import { STORAGE_KEY } from 'src/app/_shared/constants';

export type StorageKeyKeys = keyof typeof STORAGE_KEY;
export type StorageKeyValues = (typeof STORAGE_KEY)[StorageKeyKeys];

import path from 'path';
import { cache_get, cache_has, cache_set } from './cache';
import { getFontFiles } from '../api/font';

const CACHE_KEY_FONTFILES = 'fontfiles';

export const fontfiles_index = () => {
  if (cache_has(CACHE_KEY_FONTFILES)){
    return cache_get(CACHE_KEY_FONTFILES);
  }

  const fontfiles = getFontFiles().reduce((acc, filepath) => {
    const basename = path.basename(filepath);
    acc[basename] = filepath;
    return acc;
  }, {});

  cache_set(CACHE_KEY_FONTFILES, fontfiles);
  return fontfiles;
}

export const fontfile_path = (filepath) => {
  const index = fontfiles_index();
  const filename = path.basename(filepath);
  if (index.hasOwnProperty(filename)){
    return index[filename]
  }
  return undefined
}

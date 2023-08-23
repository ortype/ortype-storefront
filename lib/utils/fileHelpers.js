import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'

export const LOCAL_DIR = 'public/'

export function checkDir(dirPath) {
  const dirInfo = path.parse(dirPath)
  if (!fs.existsSync(dirInfo.dir)) {
    fs.mkdirSync(dirInfo.dir)
  }
}

export function exists(file) {
  return fs.existsSync(file)
}

export function getFontDirectory(path) {
  const dir = `${LOCAL_DIR}fonts`
  checkDir(dir)
  if (path) {
    return dir + `/${path}`
  }
  return dir
}

export function getPathInfo(source) {
  return path.parse(source)
}


export const getFile = (filePath) => {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return  fs.readFileSync(filePath, 'utf-8');
  } else {
    throw new Error('Provided path is not a valid file.');
  }
};

export function getFontDirectories(fontName) {
  return fs.readdirSync(getFontDirectory(), { withFileTypes: true })
    .filter(dirent => dirent && dirent.isDirectory())
    // .filter(dirent => typeof(fontName) !== undefined ? fontName === dirent.name : true)
    .map(dirent => dirent.name)
}

export function getFontFiles(fontName) {
  return fs.readdirSync(getFontDirectory(fontName), { withFileTypes: true })
    .filter(dirent => dirent && dirent.isFile() && dirent.name
      && (path.extname(dirent.name) === '.ttf' || path.extname(dirent.name) === '.otf'))
    .map(dirent => getFontDirectory(`${fontName}/${dirent.name}`))
}

export function getFileMetadata(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}
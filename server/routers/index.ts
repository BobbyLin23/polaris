import {
  createFile,
  createFolder,
  deleteFile,
  getFile,
  getFilePath,
  getFiles,
  getFolderContent,
  renameFile,
  updateFile,
} from './files'
import {
  createProject,
  getProjectById,
  getProjects,
  getProjectsPartial,
  renameProject,
} from './projects'

export const routers = {
  projects: {
    get: getProjects,
    create: createProject,
    getPartial: getProjectsPartial,
    getById: getProjectById,
    rename: renameProject,
  },
  files: {
    getFolder: getFolderContent,
    getFiles,
    createFile,
    createFolder,
    renameFile,
    deleteFile,
    updateFile,
    getFile,
    getFilePath,
  },
}

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
}

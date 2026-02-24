import { createProject, getProjects, getProjectsPartial } from './projects'

export const routers = {
  projects: {
    get: getProjects,
    create: createProject,
    getPartial: getProjectsPartial,
  },
}

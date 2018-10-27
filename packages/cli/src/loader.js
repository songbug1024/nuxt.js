import consola from 'consola'
import NuxtCommand from '../command'

const nuxtModuleError = (name, err) => {
  consola.error('Could not load any matching module.')
  throw err
}

const getModuleMetadata = (name) => {
  const { name, version } = require(`${name}/package.json`)
  return { name, version }
}

const loadModule = async (name) => {
  let nuxtModule
  let nuxtModuleName
  try {
    nuxtModuleName = `@nuxt/${name}`
    nuxtModule = await import(nuxtModuleName)
  } catch (firstPass) {
    try {
      nuxtModuleName = `@nuxtjs/${name}`
      nuxtModule = await import(nuxtModuleName)
    } catch (secondPass) {
      try {
        nuxtModuleName = name
        nuxtModule = await import(nuxtModuleName)
      } catch (thirdPass) {
        nuxtModuleError(name, thirdPass)
      }
    }
  }
  return { nuxtModule, ...getModuleMetadata(nuxtModuleName) }
}

export default async function loader(moduleName) {
  const nuxtModule = await loadModule(moduleName)
  const nuxtCmd = new NuxtCommand({ external: nuxtModule.cli })
  nuxtCmd.run().then(() => {
    process.exit(0)
  }).catch(err => consola.fatal(err))
}

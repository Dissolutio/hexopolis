// ! Three Options:
// * A local game (for game development) `npm run start`
// * Client that connects to a local server `npm run devstart` (`npm run devserver` will run the local server)
// * Run a production server that serves up the client on localhost:8000: `npm run build` THEN `npm run server`

const isDeploymentEnv = process.env.NODE_ENV === 'production'
const isDevEnv = process.env.NODE_ENV === 'development'
const isSeparateServer = Boolean(process.env.REACT_APP_WITH_SEPARATE_SERVER)
export const isLocalApp = isDevEnv && !isSeparateServer

// use appropriate address for server
const hostname = window?.location?.hostname ?? ''
const protocol = window?.location?.protocol ?? ''
const port = window?.location?.port ?? ''
const deploymentServerAddr = `${protocol}//${hostname}${port ? `:${port}` : ``}`
const localServerAddr = `http://localhost:8000`
export const SERVER = isDeploymentEnv ? deploymentServerAddr : localServerAddr

export const HEXGRID_SPACING = 1.05

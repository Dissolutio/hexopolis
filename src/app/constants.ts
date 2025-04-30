// ! Three Options:
// * A local game (for game development) `npm run start`
// * Client that connects to a local server `npm run devstart` (`npm run devserver` will run the local server)
// * Run a production server that serves up the client on localhost:8000: `npm run build` THEN `npm run server`

const isDeploymentEnv = process.env.NODE_ENV === 'production'
const isDevEnv = process.env.NODE_ENV === 'development'
const isSeparateServer = Boolean(process.env.REACT_APP_WITH_SEPARATE_SERVER)
export const isLocalApp = isDevEnv && !isSeparateServer
export const specialMatchIdToTellHeaderNavThisMatchIsLocal = 'localGameId'
// use appropriate address for server
const hostname = window?.location?.hostname ?? ''
const protocol = window?.location?.protocol ?? ''
const port = window?.location?.port ?? ''
const deploymentServerAddr = `${protocol}//${hostname}${port ? `:${port}` : ``}`
const localServerAddr = `http://localhost:8000`
export const SERVER = isDeploymentEnv ? deploymentServerAddr : localServerAddr

export const HEXGRID_SPACING = 1
export const SVG_HEX_RADIUS = 10
export const SVG_HEX_APOTHEM = (Math.sqrt(3) / 2) * SVG_HEX_RADIUS
export const LAYOUT_POINTY = {
  f0: Math.sqrt(3.0),
  f1: Math.sqrt(3.0) / 2.0,
  f2: 0.0,
  f3: 3.0 / 2.0,
  b0: Math.sqrt(3.0) / 3.0,
  b1: -1.0 / 3.0,
  b2: 0.0,
  b3: 2.0 / 3.0,
  startAngle: 0.5,
}
// const LAYOUT_FLAT = {
//   f0: 3.0 / 2.0,
//   f1: 0.0,
//   f2: Math.sqrt(3.0) / 2.0,
//   f3: Math.sqrt(3.0),
//   b0: 2.0 / 3.0,
//   b1: 0.0,
//   b2: -1.0 / 3.0,
//   b3: Math.sqrt(3.0) / 3.0,
//   startAngle: 0.0,
// }
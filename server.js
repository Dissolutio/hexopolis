import { Origins, Server } from 'boardgame.io/server'
import path from 'path'
import serve from 'koa-static'
import { scoretopiaGame } from './server/game'
import { HexedMeadow } from './server/game'

const server = Server({
  games: [HexedMeadow, scoretopiaGame],
  origins: [
    // Allow your game site to connect.
    // 'https://www.mygame.domain',
    // Allow localhost to connect, except when NODE_ENV is 'production'.
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
})
const PORT = process.env.PORT || 8000

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, './build')
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) =>
      await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: 'index.html' }),
        next
      )
  )
})

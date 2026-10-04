FROM node:24.19.0-bookworm-slim AS build
WORKDIR /app
COPY party-game/package.json party-game/package-lock.json ./
RUN npm ci
COPY party-game/ ./
RUN npm run build

FROM node:24.19.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/data/nomadia.sqlite
COPY party-game/package.json party-game/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/shared ./src/shared
COPY --from=build /app/src/engine ./src/engine
COPY --from=build /app/content ./content
COPY --from=build /app/scripts/container.mjs ./scripts/container.mjs
COPY --from=build /app/scripts/database.ts ./scripts/database.ts
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "scripts/container.mjs"]

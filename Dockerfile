FROM docker.1ms.run/library/node as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

FROM docker.1ms.run/library/node as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install --production

EXPOSE 3005

CMD [ "node", "/app/main.js" ]


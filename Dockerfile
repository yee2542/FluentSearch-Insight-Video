
FROM rickydunlop/nodejs-ffmpeg as base
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install

FROM base as dev
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install
ADD . .
CMD ["yarn", "start:dev"]

FROM base as prod 
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install
ADD . .
RUN yarn build
CMD [ "yarn", "start:prod" ]
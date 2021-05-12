
FROM node:14-alpine3.12 as base
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
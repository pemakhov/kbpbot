FROM node:12

WORKDIR /usr/src/app

COPY ./build/ ./build

COPY ./assets/ ./assets

COPY ./.env ./.env

COPY ./package.json ./package.json

COPY ./package-lock.json ./package-lock.json

RUN npm install

EXPOSE 5000

CMD ["node", "build/index"]

FROM node:14.15-slim
WORKDIR /usr/app

COPY ./src ./jwt-auth-service
COPY ./package.json .
COPY tsconfig.json .
COPY jest.config.js .
COPY .env .env

RUN npm install
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]

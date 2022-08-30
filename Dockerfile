FROM node:16.15.1
WORKDIR /app

RUN npm install -g @nestjs/cli
COPY ["package.json", "./"]
RUN yarn install

COPY . .
RUN cp .env.production .env
RUN yarn build

EXPOSE 3001
CMD ["yarn", "start:prod"]

FROM node:14-alpine As development

WORKDIR /app
COPY package*.json ./
RUN yarn

COPY . .

EXPOSE 3000:3000
CMD yarn start:dev

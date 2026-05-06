FROM node:22-alpine

ARG FRONT_PORT=5173

ENV PORT=${FRONT_PORT}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${PORT}

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
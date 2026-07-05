FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Dev-mode server for docker-compose local use. Production deploys (Vercel/
# Netlify) build a static bundle instead — see README.
CMD ["npm", "run", "dev", "--", "--host"]

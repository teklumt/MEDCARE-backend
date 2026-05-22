FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
# Remove --production so devDependencies (like typescript) are installed for the build
RUN npm install

COPY . .
RUN npm run build

# Optional: prune dev dependencies after build to save space
RUN npm prune --production

EXPOSE 5001
CMD ["npm", "start"]

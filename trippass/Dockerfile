# Step 1: Build the React application
FROM node:14 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . ./

COPY src/secret.json ./src/secret.json

RUN npm run build

# Step 2: Serve the application with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
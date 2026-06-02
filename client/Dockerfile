# Stage 1: Build the Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package definition first for caching
COPY package.json ./
RUN npm install

# Copy all source files
COPY . .

# Accept build argument for the backend API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the static application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy built assets from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx SPA routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# syntax=docker/dockerfile:1

# ---- Stage 1: build the static bundle ----
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first so source changes don't bust the npm cache layer.
COPY package.json package-lock.json ./
RUN npm ci

# Vite reads VITE_* env vars at *build* time and bakes them into the bundle.
# Pass them in with `--build-arg` when running `docker build`.
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY . .
RUN npm run build

# ---- Stage 2: serve the static bundle with nginx ----
FROM nginx:alpine

# SPA fallback config so client-side routes like /park/:id don't 404 on refresh.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy just the build output from stage 1.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

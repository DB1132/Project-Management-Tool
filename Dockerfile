# --- Stage 1: Build the Frontend React SPA ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Run the Express Backend Server ---
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --only=production
COPY backend/ ./

# Copy the frontend built assets to the relative path the backend expects (../frontend/dist)
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000
ENV NODE_ENV=production

CMD ["npm", "start"]

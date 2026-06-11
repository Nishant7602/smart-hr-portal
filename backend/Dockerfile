# ═══════════════════════════════════════════════════════════════
#  SmartHR Portal — Single Dockerfile (React + Spring Boot)
#  Location: hr-portal/Dockerfile
#  Docker Context: hr-portal/
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Build React Frontend ────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
ENV REACT_APP_API_URL=/api
ENV CI=false
RUN npm run build

# ── Stage 2: Build Spring Boot Backend ───────────────────────
FROM maven:3.9.5-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B 2>/dev/null || true
COPY backend/src ./src
COPY --from=frontend-build /frontend/build ./src/main/resources/static
RUN mvn clean package -DskipTests -B

# ── Stage 3: Run ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads/resumes
EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","app.jar"]
# Fix ajv/react-scripts conflict
RUN npm install --legacy-peer-deps && \
    npm install ajv@^8.0.0 --legacy-peer-deps
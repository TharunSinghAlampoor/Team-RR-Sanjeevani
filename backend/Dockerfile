# ── Stage 1: Build Java Spring Boot Executable JAR ──
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code & package application
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Minimal Production JRE Runtime ──
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

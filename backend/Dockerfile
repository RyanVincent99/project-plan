# =========================
# 🏗️  BUILD STAGE
# =========================
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom and source
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn -DskipTests clean package


# =========================
# 🚀 RUNTIME STAGE
# =========================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (same as Spring Boot default)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

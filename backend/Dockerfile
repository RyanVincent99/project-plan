# =========================
# 📦 BUILD STAGE
# =========================
# Use a specific Maven and Java version for reproducible builds
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory
WORKDIR /app

# 1. Copy only the pom.xml to leverage Docker's layer caching.
# This layer is only rebuilt when pom.xml changes.
COPY pom.xml .

# 2. Download all dependencies into the local Maven repository.
# The 'go-offline' goal is designed for this purpose.
RUN mvn dependency:go-offline

# 3. Copy the source code into the container.
# This layer is rebuilt when your source code changes.
COPY src ./src

# 4. Build the application using the pre-downloaded dependencies.
RUN mvn -DskipTests clean package


# =========================
# 🚀 RUNTIME STAGE
# =========================
# Use a lightweight Java runtime
FROM eclipse-temurin:21-jre-jammy

# Set the working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
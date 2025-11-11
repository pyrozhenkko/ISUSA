# --- 1-й Етап: "Будівельник" (Збирає .jar файл) ---
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Копіюємо pom.xml і завантажуємо залежності
COPY pom.xml .
RUN mvn dependency:go-offline

# Копіюємо решту коду і збираємо .jar
COPY src ./src
RUN mvn package -DskipTests

# --- 2-й Етап: "Запускач" (Тонкий образ для запуску) ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Копіюємо лише зібраний .jar файл з 1-го етапу
COPY --from=builder /app/target/ISUSA-0.0.1-SNAPSHOT.jar app.jar

# Порт, на якому працює твій Spring (8081)
EXPOSE 8081

# Команда для запуску твого додатку
ENTRYPOINT ["java", "-jar", "app.jar"]
# Gateway Service

This is the Spring Boot backend service. It acts as the API Gateway, handles User Authentication (JWT), and manages database persistence for users and blogs.

## Prerequisites
- Java 21
- PostgreSQL database
- Maven

## Development Setup
1. Configure your database and environment variables in `src/main/resources/application.yml` or via `.env`.
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `INTERNAL_SECRET`
2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## Build
```bash
./mvnw clean package
```

# API-Implementierung Anleitung

Diese Anleitung beschreibt, wie die Hochzeits-RSVP API mit **Spring Boot** oder **Ktor** implementiert werden kann.

## 📋 Voraussetzungen

### Spring Boot (Java/Kotlin)
- Java 17+ oder Kotlin 1.9+
- Spring Boot 3.x
- Maven oder Gradle

### Ktor (Kotlin)
- Kotlin 1.9+
- Ktor 2.x
- Gradle

## 🚀 Spring Boot Implementierung

### 1. Abhängigkeiten (build.gradle.kts)

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("com.h2database:h2") // oder PostgreSQL
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0")
}
```

### 2. Data Model (Entity)

```kotlin
import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "rsvp")
data class RSVP(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    
    @field:NotBlank(message = "Name ist erforderlich")
    @field:Size(min = 2, max = 200)
    @Column(nullable = false)
    val name: String,
    
    @field:NotBlank(message = "Zusage-Status ist erforderlich")
    @field:Pattern(regexp = "^(yes|no)$", message = "Status muss 'yes' oder 'no' sein")
    @Column(nullable = false)
    val attending: String,
    
    @field:Pattern(regexp = "^\\d+$", message = "Muss eine Zahl sein")
    val guestCount: String? = "1",
    
    @field:Size(max = 1000)
    @Column(length = 1000)
    val musicWishes: String? = null,
    
    @field:Size(max = 1000)
    @Column(length = 1000)
    val dietaryRestrictions: String? = null,
    
    @Column(nullable = false)
    val submittedAt: Instant,
    
    @Column(nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now()
)
```

### 3. DTO Klassen

```kotlin
import java.time.Instant
import java.util.UUID

data class RSVPRequest(
    val name: String,
    val attending: String,
    val guestCount: String? = "1",
    val musicWishes: String? = null,
    val dietaryRestrictions: String? = null,
    val submittedAt: Instant
)

data class RSVPResponse(
    val id: UUID,
    val message: String,
    val status: String,
    val submittedAt: Instant
)

data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: Instant = Instant.now(),
    val details: Map<String, String>? = null
)
```

### 4. Repository

```kotlin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface RSVPRepository : JpaRepository<RSVP, UUID> {
    fun findByAttending(attending: String, pageable: Pageable): Page<RSVP>
}
```

### 5. Service

```kotlin
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class RSVPService(private val repository: RSVPRepository) {
    
    @Transactional
    fun createRSVP(request: RSVPRequest): RSVPResponse {
        val rsvp = RSVP(
            name = request.name,
            attending = request.attending,
            guestCount = request.guestCount,
            musicWishes = request.musicWishes,
            dietaryRestrictions = request.dietaryRestrictions,
            submittedAt = request.submittedAt
        )
        
        val saved = repository.save(rsvp)
        
        return RSVPResponse(
            id = saved.id!!,
            message = "Vielen Dank für eure Rückmeldung!",
            status = "success",
            submittedAt = saved.submittedAt
        )
    }
    
    fun getAllRSVPs(attending: String?, pageable: Pageable): Page<RSVP> {
        return if (attending != null) {
            repository.findByAttending(attending, pageable)
        } else {
            repository.findAll(pageable)
        }
    }
    
    fun getRSVPById(id: UUID): RSVP? {
        return repository.findById(id).orElse(null)
    }
    
    @Transactional
    fun updateRSVP(id: UUID, request: RSVPRequest): RSVPResponse? {
        val existing = repository.findById(id).orElse(null) ?: return null
        
        val updated = existing.copy(
            name = request.name,
            attending = request.attending,
            guestCount = request.guestCount,
            musicWishes = request.musicWishes,
            dietaryRestrictions = request.dietaryRestrictions,
            updatedAt = Instant.now()
        )
        
        val saved = repository.save(updated)
        
        return RSVPResponse(
            id = saved.id!!,
            message = "Rückmeldung erfolgreich aktualisiert",
            status = "success",
            submittedAt = saved.submittedAt
        )
    }
    
    @Transactional
    fun deleteRSVP(id: UUID): Boolean {
        return if (repository.existsById(id)) {
            repository.deleteById(id)
            true
        } else {
            false
        }
    }
}
```

### 6. Controller

```kotlin
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/v1/wedding-rsvp")
@CrossOrigin(origins = ["*"]) // In Produktion spezifische Origins angeben!
class RSVPController(private val service: RSVPService) {
    
    @PostMapping
    fun createRSVP(@Valid @RequestBody request: RSVPRequest): ResponseEntity<RSVPResponse> {
        val response = service.createRSVP(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
    
    @GetMapping
    fun getAllRSVPs(
        @RequestParam(required = false) attending: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<RSVP>> {
        val pageable = PageRequest.of(page, size.coerceAtMost(100))
        val rsvps = service.getAllRSVPs(attending, pageable)
        return ResponseEntity.ok(rsvps)
    }
    
    @GetMapping("/{id}")
    fun getRSVPById(@PathVariable id: UUID): ResponseEntity<RSVP> {
        val rsvp = service.getRSVPById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(rsvp)
    }
    
    @PutMapping("/{id}")
    fun updateRSVP(
        @PathVariable id: UUID,
        @Valid @RequestBody request: RSVPRequest
    ): ResponseEntity<RSVPResponse> {
        val response = service.updateRSVP(id, request)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(response)
    }
    
    @DeleteMapping("/{id}")
    fun deleteRSVP(@PathVariable id: UUID): ResponseEntity<Void> {
        return if (service.deleteRSVP(id)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
```

### 7. Error Handler

```kotlin
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "Ungültiger Wert")
        }
        
        val response = ErrorResponse(
            error = "Validation Error",
            message = "Ungültige Eingabedaten",
            details = errors
        )
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }
    
    @ExceptionHandler(Exception::class)
    fun handleGenericError(ex: Exception): ResponseEntity<ErrorResponse> {
        val response = ErrorResponse(
            error = "Internal Server Error",
            message = "Ein unerwarteter Fehler ist aufgetreten."
        )
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}
```

### 8. Application Configuration (application.yml)

```yaml
spring:
  application:
    name: wedding-rsvp-api
  
  datasource:
    url: jdbc:h2:mem:weddingdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
  
  h2:
    console:
      enabled: true

server:
  port: 8080

springdoc:
  api-docs:
    path: /v1/api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

## 🔷 Ktor Implementierung

### 1. Abhängigkeiten (build.gradle.kts)

```kotlin
val ktorVersion = "2.3.7"
val exposedVersion = "0.45.0"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")
    
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")
    
    implementation("com.h2database:h2:2.2.224")
    implementation("ch.qos.logback:logback-classic:1.4.14")
}
```

### 2. Data Models

```kotlin
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.timestamp
import java.time.Instant
import java.util.UUID

// Database Table
object RSVPTable : UUIDTable("rsvp") {
    val name = varchar("name", 200)
    val attending = varchar("attending", 10)
    val guestCount = varchar("guest_count", 10).nullable()
    val musicWishes = varchar("music_wishes", 1000).nullable()
    val dietaryRestrictions = varchar("dietary_restrictions", 1000).nullable()
    val submittedAt = timestamp("submitted_at")
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
}

// DTO Classes
@Serializable
data class RSVPRequest(
    val name: String,
    val attending: String,
    val guestCount: String? = "1",
    val musicWishes: String? = null,
    val dietaryRestrictions: String? = null,
    val submittedAt: String // ISO-8601 String
)

@Serializable
data class RSVPResponse(
    val id: String,
    val message: String,
    val status: String,
    val submittedAt: String
)

@Serializable
data class RSVPDetail(
    val id: String,
    val name: String,
    val attending: String,
    val guestCount: String?,
    val musicWishes: String?,
    val dietaryRestrictions: String?,
    val submittedAt: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: String
)
```

### 3. Repository/Service

```kotlin
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import java.util.UUID

class RSVPService(private val database: Database) {
    
    fun createRSVP(request: RSVPRequest): RSVPResponse = transaction(database) {
        val id = UUID.randomUUID()
        val now = Instant.now()
        
        RSVPTable.insert {
            it[RSVPTable.id] = id
            it[name] = request.name
            it[attending] = request.attending
            it[guestCount] = request.guestCount
            it[musicWishes] = request.musicWishes
            it[dietaryRestrictions] = request.dietaryRestrictions
            it[submittedAt] = Instant.parse(request.submittedAt)
            it[createdAt] = now
            it[updatedAt] = now
        }
        
        RSVPResponse(
            id = id.toString(),
            message = "Vielen Dank für eure Rückmeldung!",
            status = "success",
            submittedAt = request.submittedAt
        )
    }
    
    fun getAllRSVPs(attending: String? = null): List<RSVPDetail> = transaction(database) {
        val query = if (attending != null) {
            RSVPTable.select { RSVPTable.attending eq attending }
        } else {
            RSVPTable.selectAll()
        }
        
        query.map { toRSVPDetail(it) }
    }
    
    fun getRSVPById(id: UUID): RSVPDetail? = transaction(database) {
        RSVPTable.select { RSVPTable.id eq id }
            .map { toRSVPDetail(it) }
            .singleOrNull()
    }
    
    fun updateRSVP(id: UUID, request: RSVPRequest): RSVPResponse? = transaction(database) {
        val count = RSVPTable.update({ RSVPTable.id eq id }) {
            it[name] = request.name
            it[attending] = request.attending
            it[guestCount] = request.guestCount
            it[musicWishes] = request.musicWishes
            it[dietaryRestrictions] = request.dietaryRestrictions
            it[updatedAt] = Instant.now()
        }
        
        if (count > 0) {
            RSVPResponse(
                id = id.toString(),
                message = "Rückmeldung erfolgreich aktualisiert",
                status = "success",
                submittedAt = request.submittedAt
            )
        } else null
    }
    
    fun deleteRSVP(id: UUID): Boolean = transaction(database) {
        RSVPTable.deleteWhere { RSVPTable.id eq id } > 0
    }
    
    private fun toRSVPDetail(row: ResultRow) = RSVPDetail(
        id = row[RSVPTable.id].toString(),
        name = row[RSVPTable.name],
        attending = row[RSVPTable.attending],
        guestCount = row[RSVPTable.guestCount],
        musicWishes = row[RSVPTable.musicWishes],
        dietaryRestrictions = row[RSVPTable.dietaryRestrictions],
        submittedAt = row[RSVPTable.submittedAt].toString(),
        createdAt = row[RSVPTable.createdAt].toString(),
        updatedAt = row[RSVPTable.updatedAt].toString()
    )
}
```

### 4. Routing

```kotlin
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.UUID

fun Application.configureRouting(service: RSVPService) {
    routing {
        route("/v1/wedding-rsvp") {
            
            post {
                try {
                    val request = call.receive<RSVPRequest>()
                    val response = service.createRSVP(request)
                    call.respond(HttpStatusCode.Created, response)
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(
                            error = "Validation Error",
                            message = e.message ?: "Ungültige Anfrage",
                            timestamp = java.time.Instant.now().toString()
                        )
                    )
                }
            }
            
            get {
                val attending = call.request.queryParameters["attending"]
                val rsvps = service.getAllRSVPs(attending)
                call.respond(HttpStatusCode.OK, rsvps)
            }
            
            get("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    ?: return@get call.respond(HttpStatusCode.BadRequest, "Ungültige ID")
                
                val rsvp = service.getRSVPById(id)
                if (rsvp != null) {
                    call.respond(HttpStatusCode.OK, rsvp)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Rückmeldung nicht gefunden")
                }
            }
            
            put("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    ?: return@put call.respond(HttpStatusCode.BadRequest, "Ungültige ID")
                
                val request = call.receive<RSVPRequest>()
                val response = service.updateRSVP(id, request)
                
                if (response != null) {
                    call.respond(HttpStatusCode.OK, response)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Rückmeldung nicht gefunden")
                }
            }
            
            delete("/{id}") {
                val id = call.parameters["id"]?.let { UUID.fromString(it) }
                    ?: return@delete call.respond(HttpStatusCode.BadRequest, "Ungültige ID")
                
                if (service.deleteRSVP(id)) {
                    call.respond(HttpStatusCode.NoContent)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Rückmeldung nicht gefunden")
                }
            }
        }
    }
}
```

### 5. Application Setup

```kotlin
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        // Database Setup
        val database = Database.connect(
            url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
            driver = "org.h2.Driver"
        )
        
        transaction(database) {
            SchemaUtils.create(RSVPTable)
        }
        
        val service = RSVPService(database)
        
        // Plugins
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
            })
        }
        
        install(CORS) {
            anyHost() // In Produktion spezifische Hosts angeben!
            allowMethod(io.ktor.http.HttpMethod.Options)
            allowMethod(io.ktor.http.HttpMethod.Get)
            allowMethod(io.ktor.http.HttpMethod.Post)
            allowMethod(io.ktor.http.HttpMethod.Put)
            allowMethod(io.ktor.http.HttpMethod.Delete)
            allowHeader(io.ktor.http.HttpHeaders.ContentType)
        }
        
        install(StatusPages) {
            exception<Throwable> { call, cause ->
                call.respond(
                    io.ktor.http.HttpStatusCode.InternalServerError,
                    ErrorResponse(
                        error = "Internal Server Error",
                        message = cause.message ?: "Ein Fehler ist aufgetreten",
                        timestamp = java.time.Instant.now().toString()
                    )
                )
            }
        }
        
        // Routes
        configureRouting(service)
    }.start(wait = true)
}
```

---

## 🧪 Testing

### cURL Beispiele

```bash
# Neue Rückmeldung erstellen
curl -X POST http://localhost:8080/v1/wedding-rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Mustermann",
    "attending": "yes",
    "guestCount": "2",
    "musicWishes": "Helene Fischer",
    "dietaryRestrictions": "Vegetarisch",
    "submittedAt": "2026-01-15T14:30:00Z"
  }'

# Alle Rückmeldungen abrufen
curl http://localhost:8080/v1/wedding-rsvp

# Nach Zusage filtern
curl http://localhost:8080/v1/wedding-rsvp?attending=yes

# Einzelne Rückmeldung abrufen
curl http://localhost:8080/v1/wedding-rsvp/{uuid}
```

---

## 📚 Zusätzliche Ressourcen

- [Spring Boot Dokumentation](https://spring.io/projects/spring-boot)
- [Ktor Dokumentation](https://ktor.io/docs/)
- [OpenAPI Generator](https://openapi-generator.tech/) - Generiert Code aus der API-Spec
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interaktive API-Dokumentation

## 🔐 Produktions-Hinweise

1. **Datenbank**: H2 durch PostgreSQL/MySQL ersetzen
2. **CORS**: Spezifische Origins statt `*` konfigurieren
3. **Authentication**: JWT/OAuth2 für Admin-Endpoints implementieren
4. **Validation**: Erweiterte Input-Validierung hinzufügen
5. **Logging**: Strukturiertes Logging mit korrelation IDs
6. **Rate Limiting**: Schutz vor Spam/Missbrauch
7. **HTTPS**: TLS-Zertifikate konfigurieren
8. **Monitoring**: Health Checks und Metriken (Prometheus, Grafana)

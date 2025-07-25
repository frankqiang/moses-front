# 后端开发专业知识

## 知识库标识
- **知识ID**: backend-development-specifics
- **适用角色**: backend-developer
- **知识类型**: 技术专业知识
- **应用场景**: 后端开发、系统设计、技术决策

## 项目特定约束

### 技术栈约束
- **开发语言**: Java 8+ (推荐Java 11)
- **框架**: Spring Boot 2.7.x + Spring Security
- **数据库**: MySQL 8.0 + MyBatis Plus
- **缓存**: Redis 6.x
- **消息队列**: RabbitMQ 3.x
- **构建工具**: Maven 3.6+
- **容器化**: Docker + Docker Compose

### 项目结构约束
```
src/main/java/
├── com.company.admin/
│   ├── config/          # 配置类
│   ├── controller/      # 控制器层
│   ├── service/         # 服务层
│   │   └── impl/        # 服务实现
│   ├── mapper/          # 数据访问层
│   ├── entity/          # 实体类
│   ├── dto/             # 数据传输对象
│   ├── vo/              # 视图对象
│   ├── common/          # 公共组件
│   │   ├── exception/   # 异常处理
│   │   ├── utils/       # 工具类
│   │   └── constants/   # 常量定义
│   └── AdminApplication.java
```

### 代码规范约束
- **命名规范**:
  - 类名: PascalCase (如: UserService)
  - 方法名: camelCase (如: getUserById)
  - 常量名: UPPER_SNAKE_CASE (如: MAX_RETRY_COUNT)
  - 包名: 全小写 (如: com.company.admin.service)

## Spring Boot开发特性

### 项目配置结构
```yaml
# application.yml
spring:
  profiles:
    active: dev
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/admin_db?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: 0
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

### 统一响应格式
```java
/**
 * 统一API响应格式
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "操作成功", data, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> error(Integer code, String message) {
        return new ApiResponse<>(code, message, null, System.currentTimeMillis());
    }
}
```

### 异常处理机制
```java
/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ApiResponse.error(e.getCode(), e.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        log.warn("参数验证异常: {}", message);
        return ApiResponse.error(400, message);
    }
    
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ApiResponse.error(500, "系统内部错误");
    }
}
```

## 数据库设计规范

### 表结构设计
```sql
-- 基础表结构模板
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `status` tinyint DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `deleted` tinyint DEFAULT '0' COMMENT '删除标记(0:未删除,1:已删除)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';
```

### MyBatis Plus配置
```java
/**
 * MyBatis Plus配置
 */
@Configuration
public class MybatisPlusConfig {
    
    /**
     * 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
    
    /**
     * 自动填充配置
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
                this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
            }
            
            @Override
            public void updateFill(MetaObject metaObject) {
                this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
            }
        };
    }
}
```

## 权限认证系统

### JWT认证配置
```java
/**
 * JWT工具类
 */
@Component
@Slf4j
public class JwtUtils {
    
    @Value("${jwt.secret:mySecret}")
    private String secret;
    
    @Value("${jwt.expiration:86400}")
    private Long expiration;
    
    /**
     * 生成JWT Token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", userDetails.getUsername());
        return createToken(claims, userDetails.getUsername());
    }
    
    /**
     * 验证Token
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }
}
```

### 权限控制注解
```java
/**
 * 权限控制注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermissions {
    String[] value() default {};
    Logical logical() default Logical.AND;
}

/**
 * 权限检查切面
 */
@Aspect
@Component
@Slf4j
public class PermissionAspect {
    
    @Around("@annotation(requiresPermissions)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequiresPermissions requiresPermissions) throws Throwable {
        // 获取当前用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("用户未登录");
        }
        
        // 检查权限
        String[] permissions = requiresPermissions.value();
        if (permissions.length > 0) {
            boolean hasPermission = checkUserPermissions(authentication, permissions, requiresPermissions.logical());
            if (!hasPermission) {
                throw new ForbiddenException("权限不足");
            }
        }
        
        return joinPoint.proceed();
    }
}
```

## 缓存策略

### Redis缓存配置
```java
/**
 * Redis缓存配置
 */
@Configuration
@EnableCaching
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // 设置序列化器
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(LazyLoadingEnabled.LAZY_LOADING_ENABLED, ObjectMapper.DefaultTyping.NON_FINAL);
        serializer.setObjectMapper(mapper);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}
```

### 缓存使用示例
```java
/**
 * 用户服务实现
 */
@Service
@Slf4j
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    @Cacheable(value = "user", key = "#id")
    public User getUserById(Long id) {
        log.info("从数据库查询用户: {}", id);
        return userMapper.selectById(id);
    }
    
    @Override
    @CacheEvict(value = "user", key = "#user.id")
    public void updateUser(User user) {
        userMapper.updateById(user);
        log.info("更新用户并清除缓存: {}", user.getId());
    }
    
    @Override
    @CacheEvict(value = "user", allEntries = true)
    public void clearAllUserCache() {
        log.info("清除所有用户缓存");
    }
}
```

## 消息队列集成

### RabbitMQ配置
```java
/**
 * RabbitMQ配置
 */
@Configuration
@EnableRabbit
public class RabbitConfig {
    
    public static final String USER_QUEUE = "user.queue";
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String USER_ROUTING_KEY = "user.create";
    
    @Bean
    public Queue userQueue() {
        return QueueBuilder.durable(USER_QUEUE).build();
    }
    
    @Bean
    public DirectExchange userExchange() {
        return new DirectExchange(USER_EXCHANGE);
    }
    
    @Bean
    public Binding userBinding() {
        return BindingBuilder.bind(userQueue()).to(userExchange()).with(USER_ROUTING_KEY);
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        return template;
    }
}
```

### 消息生产者和消费者
```java
/**
 * 消息生产者
 */
@Component
@Slf4j
public class UserMessageProducer {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void sendUserCreateMessage(User user) {
        try {
            rabbitTemplate.convertAndSend(RabbitConfig.USER_EXCHANGE, RabbitConfig.USER_ROUTING_KEY, user);
            log.info("发送用户创建消息: {}", user.getId());
        } catch (Exception e) {
            log.error("发送消息失败", e);
        }
    }
}

/**
 * 消息消费者
 */
@Component
@Slf4j
public class UserMessageConsumer {
    
    @RabbitListener(queues = RabbitConfig.USER_QUEUE)
    public void handleUserCreateMessage(User user) {
        try {
            log.info("处理用户创建消息: {}", user.getId());
            // 处理业务逻辑
            processUserCreation(user);
        } catch (Exception e) {
            log.error("处理消息失败", e);
            throw new AmqpRejectAndDontRequeueException("消息处理失败", e);
        }
    }
}
```

## 性能优化策略

### 数据库优化
```java
/**
 * 数据库查询优化示例
 */
@Service
public class OptimizedUserService {
    
    /**
     * 批量查询优化
     */
    public List<User> getUsersByIds(List<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return Collections.emptyList();
        }
        
        // 使用IN查询替代多次单独查询
        return userMapper.selectBatchIds(ids);
    }
    
    /**
     * 分页查询优化
     */
    public IPage<User> getUserPage(UserQueryDTO queryDTO) {
        Page<User> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        
        // 使用QueryWrapper构建动态查询条件
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(queryDTO.getUsername()), "username", queryDTO.getUsername())
               .eq(queryDTO.getStatus() != null, "status", queryDTO.getStatus())
               .ge(queryDTO.getStartTime() != null, "create_time", queryDTO.getStartTime())
               .le(queryDTO.getEndTime() != null, "create_time", queryDTO.getEndTime())
               .orderByDesc("create_time");
        
        return userMapper.selectPage(page, wrapper);
    }
}
```

### 异步处理
```java
/**
 * 异步任务配置
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean("taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("async-task-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        return executor;
    }
}

/**
 * 异步服务示例
 */
@Service
@Slf4j
public class AsyncUserService {
    
    @Async("taskExecutor")
    public CompletableFuture<Void> sendWelcomeEmail(User user) {
        try {
            // 模拟发送邮件
            Thread.sleep(2000);
            log.info("发送欢迎邮件给用户: {}", user.getEmail());
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("发送邮件失败", e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
```

## 监控和日志

### 日志配置
```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="dev">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>
    
    <springProfile name="prod">
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/admin.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>logs/admin.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
                <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                    <maxFileSize>100MB</maxFileSize>
                </timeBasedFileNamingAndTriggeringPolicy>
                <maxHistory>30</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>
</configuration>
```

### 健康检查
```java
/**
 * 自定义健康检查
 */
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public Health health() {
        try {
            // 检查Redis连接
            redisTemplate.opsForValue().get("health_check");
            return Health.up()
                    .withDetail("redis", "连接正常")
                    .withDetail("timestamp", System.currentTimeMillis())
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("redis", "连接异常")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
```

## 部署配置

### Docker配置
```dockerfile
# Dockerfile
FROM openjdk:11-jre-slim

VOLUME /tmp

COPY target/admin-backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  admin-backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
    depends_on:
      - mysql
      - redis
      - rabbitmq
    networks:
      - admin-network

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=admin_db
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - admin-network

  redis:
    image: redis:6-alpine
    networks:
      - admin-network

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    ports:
      - "15672:15672"
    networks:
      - admin-network

volumes:
  mysql_data:

networks:
  admin-network:
    driver: bridge
```

---

*此知识库为后端开发工程师提供项目特定的技术约束和专业知识指导*
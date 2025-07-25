# 后端开发专业知识

## Node.js核心技术

### 1. Node.js基础架构

#### 事件循环机制
```javascript
// 事件循环阶段示例
console.log('1: 同步代码')

setImmediate(() => {
  console.log('2: setImmediate')
})

process.nextTick(() => {
  console.log('3: process.nextTick')
})

setTimeout(() => {
  console.log('4: setTimeout')
}, 0)

Promise.resolve().then(() => {
  console.log('5: Promise.resolve')
})

console.log('6: 同步代码结束')

// 输出顺序: 1 -> 6 -> 3 -> 5 -> 4 -> 2
```

#### 流(Streams)处理
```javascript
const fs = require('fs')
const { Transform } = require('stream')

// 创建转换流
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

// 流式文件处理
fs.createReadStream('input.txt')
  .pipe(upperCaseTransform)
  .pipe(fs.createWriteStream('output.txt'))
  .on('finish', () => {
    console.log('文件处理完成')
  })

// 处理大文件的内存友好方式
const processLargeFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath, { highWaterMark: 16 * 1024 })
    let lineCount = 0
    let buffer = ''
    
    readStream.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留不完整的行
      
      lineCount += lines.length
    })
    
    readStream.on('end', () => {
      if (buffer.length > 0) lineCount++ // 处理最后一行
      resolve(lineCount)
    })
    
    readStream.on('error', reject)
  })
}
```

### 2. Express.js框架深度应用

#### 高级中间件模式
```javascript
const express = require('express')
const app = express()

// 错误处理中间件
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 请求限流中间件
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
  })
  
  next()
}

// 应用中间件
app.use(requestLogger)
app.use('/api/', limiter)

// 路由处理
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const user = await User.findByPk(id)
  
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: '用户不存在'
    })
  }
  
  res.json({
    code: 200,
    data: user
  })
}))

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('Error:', error)
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: error.errors
    })
  }
  
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  })
})
```

#### RESTful API设计模式
```javascript
// controllers/baseController.js
class BaseController {
  constructor(service) {
    this.service = service
  }
  
  // 通用CRUD操作
  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query
    const result = await this.service.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      filters
    })
    
    res.json({
      code: 200,
      data: result.data,
      pagination: result.pagination
    })
  })
  
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const item = await this.service.findById(id)
    
    if (!item) {
      return res.status(404).json({
        code: 404,
        message: '资源不存在'
      })
    }
    
    res.json({
      code: 200,
      data: item
    })
  })
  
  create = asyncHandler(async (req, res) => {
    const item = await this.service.create(req.body)
    
    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: item
    })
  })
  
  update = asyncHandler(async (req, res) => {
    const { id } = req.params
    const item = await this.service.update(id, req.body)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: item
    })
  })
  
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params
    await this.service.delete(id)
    
    res.status(204).send()
  })
}

module.exports = BaseController
```

### 3. 数据库技术

#### Sequelize ORM高级用法
```javascript
// models/associations.js
const User = require('./User')
const Post = require('./Post')
const Comment = require('./Comment')
const Tag = require('./Tag')
const PostTag = require('./PostTag')

// 定义关联关系
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' })
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' })

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' })
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' })

// 多对多关系
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: 'postId',
  otherKey: 'tagId',
  as: 'tags'
})
Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: 'tagId',
  otherKey: 'postId',
  as: 'posts'
})

// 复杂查询示例
const getPostsWithDetails = async (options = {}) => {
  const { page = 1, limit = 10, authorId, tagIds } = options
  
  const whereClause = {}
  if (authorId) whereClause.authorId = authorId
  
  const includeClause = [
    {
      model: User,
      as: 'author',
      attributes: ['id', 'username', 'avatar']
    },
    {
      model: Comment,
      as: 'comments',
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username']
      }],
      limit: 5,
      order: [['createdAt', 'DESC']]
    },
    {
      model: Tag,
      as: 'tags',
      attributes: ['id', 'name', 'color'],
      through: { attributes: [] } // 排除中间表字段
    }
  ]
  
  // 标签过滤
  if (tagIds && tagIds.length > 0) {
    includeClause[2].where = {
      id: { [Op.in]: tagIds }
    }
  }
  
  const { count, rows } = await Post.findAndCountAll({
    where: whereClause,
    include: includeClause,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
    distinct: true // 避免JOIN导致的重复计数
  })
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }
}
```

#### 数据库事务处理
```javascript
const { sequelize } = require('../config/database')

// 手动事务管理
const transferMoney = async (fromUserId, toUserId, amount) => {
  const transaction = await sequelize.transaction()
  
  try {
    // 检查余额
    const fromUser = await User.findByPk(fromUserId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    })
    
    if (fromUser.balance < amount) {
      throw new Error('余额不足')
    }
    
    // 扣除发送方余额
    await fromUser.update(
      { balance: fromUser.balance - amount },
      { transaction }
    )
    
    // 增加接收方余额
    const toUser = await User.findByPk(toUserId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    })
    
    await toUser.update(
      { balance: toUser.balance + amount },
      { transaction }
    )
    
    // 记录转账记录
    await Transaction.create({
      fromUserId,
      toUserId,
      amount,
      type: 'transfer',
      status: 'completed'
    }, { transaction })
    
    await transaction.commit()
    return { success: true, message: '转账成功' }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

// 自动事务管理
const createUserWithProfile = async (userData, profileData) => {
  return await sequelize.transaction(async (t) => {
    const user = await User.create(userData, { transaction: t })
    
    const profile = await Profile.create({
      ...profileData,
      userId: user.id
    }, { transaction: t })
    
    return { user, profile }
  })
}
```

### 4. 缓存策略

#### Redis缓存模式
```javascript
const redis = require('redis')
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

// 缓存装饰器
const cache = (ttl = 300) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value
    
    descriptor.value = async function(...args) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cached = await client.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
      
      // 执行原方法
      const result = await method.apply(this, args)
      
      // 缓存结果
      await client.setex(cacheKey, ttl, JSON.stringify(result))
      
      return result
    }
  }
}

// 使用缓存装饰器
class UserService {
  @cache(600) // 缓存10分钟
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      include: ['profile', 'posts']
    })
    return user
  }
  
  // 缓存失效模式
  async updateUser(userId, data) {
    const user = await User.update(data, {
      where: { id: userId },
      returning: true
    })
    
    // 清除相关缓存
    await this.clearUserCache(userId)
    
    return user
  }
  
  async clearUserCache(userId) {
    const pattern = `UserService:getUserProfile:*${userId}*`
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(keys)
    }
  }
}

// 分布式锁实现
class DistributedLock {
  constructor(redis, key, ttl = 10000) {
    this.redis = redis
    this.key = `lock:${key}`
    this.ttl = ttl
    this.value = `${Date.now()}-${Math.random()}`
  }
  
  async acquire() {
    const result = await this.redis.set(
      this.key,
      this.value,
      'PX',
      this.ttl,
      'NX'
    )
    return result === 'OK'
  }
  
  async release() {
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `
    return await this.redis.eval(script, 1, this.key, this.value)
  }
}

// 使用分布式锁
const processUniqueTask = async (taskId) => {
  const lock = new DistributedLock(client, `task:${taskId}`)
  
  if (await lock.acquire()) {
    try {
      // 执行任务逻辑
      console.log(`处理任务 ${taskId}`)
      await new Promise(resolve => setTimeout(resolve, 5000))
    } finally {
      await lock.release()
    }
  } else {
    console.log(`任务 ${taskId} 正在被其他进程处理`)
  }
}
```

### 5. 认证与授权

#### JWT认证实现
```javascript
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

class AuthService {
  // 用户注册
  async register(userData) {
    const { username, email, password } = userData
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    })
    
    if (existingUser) {
      throw new Error('用户名或邮箱已存在')
    }
    
    // 密码加密
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      emailVerificationToken: crypto.randomBytes(32).toString('hex')
    })
    
    // 发送验证邮件
    await this.sendVerificationEmail(user)
    
    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
  
  // 用户登录
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: ['roles']
    })
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    if (!user.emailVerified) {
      throw new Error('请先验证邮箱')
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('密码错误')
    }
    
    // 生成JWT令牌
    const payload = {
      userId: user.id,
      username: user.username,
      roles: user.roles.map(role => role.name)
    }
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    })
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
    
    // 保存刷新令牌
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    }
  }
  
  // 刷新令牌
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      
      const tokenRecord = await RefreshToken.findOne({
        where: {
          token: refreshToken,
          userId: decoded.userId,
          expiresAt: { [Op.gt]: new Date() }
        }
      })
      
      if (!tokenRecord) {
        throw new Error('刷新令牌无效')
      }
      
      const user = await User.findByPk(decoded.userId, {
        include: ['roles']
      })
      
      const payload = {
        userId: user.id,
        username: user.username,
        roles: user.roles.map(role => role.name)
      }
      
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
      })
      
      return { accessToken: newAccessToken }
    } catch (error) {
      throw new Error('刷新令牌无效')
    }
  }
}
```

#### RBAC权限控制
```javascript
// models/Role.js
const Role = sequelize.define('Role', {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  }
})

// models/Permission.js
const Permission = sequelize.define('Permission', {
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  conditions: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
})

// 权限检查服务
class PermissionService {
  // 检查用户权限
  async checkPermission(userId, resource, action, context = {}) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        include: [Permission]
      }]
    })
    
    if (!user) return false
    
    // 检查用户角色权限
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (permission.resource === resource && permission.action === action) {
          // 检查条件
          if (this.evaluateConditions(permission.conditions, context)) {
            return true
          }
        }
      }
    }
    
    return false
  }
  
  // 评估权限条件
  evaluateConditions(conditions, context) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true
    }
    
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false
      }
    }
    
    return true
  }
  
  // 获取用户权限列表
  async getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        include: [Permission]
      }]
    })
    
    const permissions = new Set()
    
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(`${permission.resource}:${permission.action}`)
      })
    })
    
    return Array.from(permissions)
  }
}
```

### 6. 性能优化技术

#### 数据库查询优化
```javascript
// 查询优化示例
class OptimizedUserService {
  // 使用索引优化查询
  async findUsersByStatus(status, page = 1, limit = 10) {
    // 确保status字段有索引
    return await User.findAndCountAll({
      where: { status },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'username', 'email', 'status'], // 只选择需要的字段
    })
  }
  
  // 批量查询优化
  async getUsersWithPosts(userIds) {
    // 避免N+1查询问题
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      include: [{
        model: Post,
        as: 'posts',
        limit: 5,
        order: [['createdAt', 'DESC']]
      }]
    })
    
    return users
  }
  
  // 使用原生SQL进行复杂查询
  async getTopActiveUsers(limit = 10) {
    const [results] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        COUNT(p.id) as post_count,
        COUNT(c.id) as comment_count,
        (COUNT(p.id) * 2 + COUNT(c.id)) as activity_score
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      LEFT JOIN comments c ON u.id = c.author_id
      WHERE u.status = 'active'
      GROUP BY u.id, u.username
      ORDER BY activity_score DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: QueryTypes.SELECT
    })
    
    return results
  }
}
```

#### 内存优化和垃圾回收
```javascript
// 内存监控
const monitorMemory = () => {
  const used = process.memoryUsage()
  
  console.log('内存使用情况:')
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
  }
  
  // 检查内存泄漏
  if (used.heapUsed > 500 * 1024 * 1024) { // 500MB
    console.warn('内存使用过高，可能存在内存泄漏')
  }
}

// 定期监控
setInterval(monitorMemory, 60000) // 每分钟检查一次

// 流式处理大数据
const processLargeDataset = async (dataStream) => {
  return new Promise((resolve, reject) => {
    let processedCount = 0
    const batchSize = 1000
    let batch = []
    
    dataStream.on('data', async (record) => {
      batch.push(record)
      
      if (batch.length >= batchSize) {
        // 暂停流
        dataStream.pause()
        
        try {
          await processBatch(batch)
          processedCount += batch.length
          batch = []
          
          // 恢复流
          dataStream.resume()
        } catch (error) {
          reject(error)
        }
      }
    })
    
    dataStream.on('end', async () => {
      if (batch.length > 0) {
        await processBatch(batch)
        processedCount += batch.length
      }
      resolve(processedCount)
    })
    
    dataStream.on('error', reject)
  })
}

const processBatch = async (batch) => {
  // 批量处理数据
  await SomeModel.bulkCreate(batch, {
    updateOnDuplicate: ['updatedAt']
  })
  
  // 强制垃圾回收（仅在开发环境）
  if (process.env.NODE_ENV === 'development' && global.gc) {
    global.gc()
  }
}
```

### 7. 监控和日志

#### 结构化日志
```javascript
const winston = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')

// 创建日志器
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-server',
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// 生产环境添加Elasticsearch
if (process.env.NODE_ENV === 'production') {
  logger.add(new ElasticsearchTransport({
    level: 'info',
    clientOpts: {
      node: process.env.ELASTICSEARCH_URL
    },
    index: 'api-logs'
  }))
}

// 请求追踪中间件
const requestTracker = (req, res, next) => {
  const requestId = require('uuid').v4()
  req.requestId = requestId
  
  // 添加到响应头
  res.setHeader('X-Request-ID', requestId)
  
  // 记录请求开始
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })
  
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    })
  })
  
  next()
}

module.exports = { logger, requestTracker }
```

#### 应用性能监控(APM)
```javascript
// 性能指标收集
const prometheus = require('prom-client')

// 创建指标
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP请求持续时间',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'HTTP请求总数',
  labelNames: ['method', 'route', 'status_code']
})

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: '当前活跃连接数'
})

// 监控中间件
const metricsMiddleware = (req, res, next) => {
  const start = Date.now()
  
  activeConnections.inc()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route = req.route ? req.route.path : req.path
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration)
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc()
    
    activeConnections.dec()
  })
  
  next()
}

// 健康检查端点
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType)
  res.end(prometheus.register.metrics())
})

module.exports = { metricsMiddleware }
```
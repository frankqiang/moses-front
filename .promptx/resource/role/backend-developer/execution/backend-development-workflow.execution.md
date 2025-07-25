# 后端开发工作流程

## 项目初始化流程

### 环境准备
```bash
# 1. 检查Node.js版本
node --version  # 推荐 >= 18.x LTS
npm --version   # 或使用 yarn/pnpm

# 2. 初始化项目
npm init -y
# 或使用脚手架
npx create-express-app my-api
npx nest new my-api

# 3. 安装核心依赖
npm install express cors helmet morgan
npm install -D nodemon eslint prettier

# 4. 启动开发服务器
npm run dev
```

### 项目结构设置
```
src/
├── controllers/     # 控制器层
├── services/        # 业务逻辑层
├── models/          # 数据模型层
├── middleware/      # 中间件
├── routes/          # 路由定义
├── utils/           # 工具函数
├── config/          # 配置文件
├── validators/      # 数据验证
└── tests/           # 测试文件
```

## API开发流程

### 1. 需求分析阶段
- [ ] 理解业务需求和数据流
- [ ] 设计API接口规范
- [ ] 确定数据库表结构
- [ ] 评估性能和安全要求

### 2. 接口设计阶段
```javascript
// API设计示例 - OpenAPI/Swagger规范
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *     responses:
 *       200:
 *         description: 成功返回用户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/users', userController.getUsers)
```

### 3. 数据模型开发
```javascript
// 使用Sequelize ORM示例
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true, // 软删除
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10)
    }
  }
})

module.exports = User
```

### 4. 控制器开发
```javascript
// controllers/userController.js
const userService = require('../services/userService')
const { validationResult } = require('express-validator')
const logger = require('../utils/logger')

class UserController {
  /**
   * 获取用户列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   * @param {Function} next - 下一个中间件
   */
  async getUsers(req, res, next) {
    try {
      // 参数验证
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        })
      }

      const { page = 1, limit = 10, search } = req.query
      
      // 调用服务层
      const result = await userService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      })

      // 记录日志
      logger.info('用户列表查询成功', {
        userId: req.user?.id,
        params: { page, limit, search },
        resultCount: result.data.length
      })

      res.json({
        code: 200,
        message: '获取成功',
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      logger.error('获取用户列表失败', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      })
      next(error)
    }
  }

  async createUser(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        })
      }

      const userData = req.body
      const user = await userService.createUser(userData)

      logger.info('用户创建成功', {
        userId: req.user?.id,
        newUserId: user.id,
        username: user.username
      })

      res.status(201).json({
        code: 201,
        message: '用户创建成功',
        data: user
      })
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          code: 409,
          message: '用户名或邮箱已存在'
        })
      }
      next(error)
    }
  }
}

module.exports = new UserController()
```

### 5. 服务层开发
```javascript
// services/userService.js
const User = require('../models/User')
const { Op } = require('sequelize')
const redis = require('../config/redis')

class UserService {
  /**
   * 获取用户列表
   * @param {Object} options - 查询选项
   * @returns {Object} 用户列表和分页信息
   */
  async getUsers(options) {
    const { page, limit, search } = options
    const offset = (page - 1) * limit

    // 构建查询条件
    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    }

    // 缓存键
    const cacheKey = `users:list:${JSON.stringify({ page, limit, search })}`
    
    // 尝试从缓存获取
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // 数据库查询
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] } // 排除敏感字段
    })

    const result = {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    }

    // 缓存结果（5分钟）
    await redis.setex(cacheKey, 300, JSON.stringify(result))

    return result
  }

  async createUser(userData) {
    // 数据预处理
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

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    })

    // 清除相关缓存
    await this.clearUserListCache()

    // 返回用户信息（排除密码）
    const { password: _, ...userWithoutPassword } = user.toJSON()
    return userWithoutPassword
  }

  async clearUserListCache() {
    const keys = await redis.keys('users:list:*')
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }
}

module.exports = new UserService()
```

## 中间件开发

### 认证中间件
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const logger = require('../utils/logger')

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '访问令牌缺失'
      })
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    })

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用'
      })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error('认证失败', {
      error: error.message,
      token: req.header('Authorization')
    })
    
    res.status(401).json({
      code: 401,
      message: '令牌无效或已过期'
    })
  }
}

module.exports = authMiddleware
```

### 权限控制中间件
```javascript
// middleware/permission.js
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user
      
      if (!user) {
        return res.status(401).json({
          code: 401,
          message: '用户未认证'
        })
      }

      // 检查用户权限
      const hasPermission = await user.hasPermission(requiredPermission)
      
      if (!hasPermission) {
        logger.warn('权限不足', {
          userId: user.id,
          requiredPermission,
          userPermissions: user.permissions
        })
        
        return res.status(403).json({
          code: 403,
          message: '权限不足'
        })
      }

      next()
    } catch (error) {
      logger.error('权限检查失败', {
        error: error.message,
        userId: req.user?.id
      })
      
      res.status(500).json({
        code: 500,
        message: '权限检查失败'
      })
    }
  }
}

module.exports = checkPermission
```

## 测试开发流程

### 单元测试
```javascript
// tests/services/userService.test.js
const UserService = require('../../src/services/userService')
const User = require('../../src/models/User')
const redis = require('../../src/config/redis')

// Mock依赖
jest.mock('../../src/models/User')
jest.mock('../../src/config/redis')

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('应该返回用户列表和分页信息', async () => {
      // 准备测试数据
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ]
      
      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockUsers
      })
      
      redis.get.mockResolvedValue(null)
      redis.setex.mockResolvedValue('OK')

      // 执行测试
      const result = await UserService.getUsers({ page: 1, limit: 10 })

      // 验证结果
      expect(result.data).toEqual(mockUsers)
      expect(result.pagination.total).toBe(2)
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      })
    })

    it('应该从缓存返回数据', async () => {
      const cachedData = JSON.stringify({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      })
      
      redis.get.mockResolvedValue(cachedData)

      const result = await UserService.getUsers({ page: 1, limit: 10 })

      expect(result.data).toEqual([])
      expect(User.findAndCountAll).not.toHaveBeenCalled()
    })
  })
})
```

### 集成测试
```javascript
// tests/integration/users.test.js
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')

describe('Users API', () => {
  let authToken
  
  beforeAll(async () => {
    // 创建测试用户并获取认证令牌
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = loginResponse.body.data.token
  })

  afterAll(async () => {
    // 清理测试数据
    await User.destroy({ where: {} })
  })

  describe('GET /api/users', () => {
    it('应该返回用户列表', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.code).toBe(200)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
    })

    it('应该支持搜索功能', async () => {
      const response = await request(app)
        .get('/api/users?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.code).toBe(200)
    })
  })
})
```

## 部署和监控

### Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 切换到非root用户
USER nodejs

EXPOSE 3000

CMD ["node", "src/app.js"]
```

### 健康检查
```javascript
// routes/health.js
const express = require('express')
const router = express.Router()
const sequelize = require('../config/database')
const redis = require('../config/redis')

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  }

  try {
    // 检查数据库连接
    await sequelize.authenticate()
    health.checks.database = 'ok'
  } catch (error) {
    health.checks.database = 'error'
    health.status = 'error'
  }

  try {
    // 检查Redis连接
    await redis.ping()
    health.checks.redis = 'ok'
  } catch (error) {
    health.checks.redis = 'error'
    health.status = 'error'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})

module.exports = router
```
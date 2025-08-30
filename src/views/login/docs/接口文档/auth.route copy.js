const express = require('express');
const validate = require('../../../../middlewares/validate');
const { authValidation } = require('../../../../validations');
const { authController } = require('../../../../controllers');
const auth = require('../../../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.get('/user', auth(), authController.getUserInfo);

module.exports = router;

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: 获取用户信息
 *     description: 获取当前登录用户的详细信息。该接口需要用户已登录并提供有效的访问令牌。
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: 获取用户信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 请求是否成功
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: 用户信息
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 用户ID
 *                     username:
 *                       type: string
 *                       description: 用户名
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: 用户邮箱
 *                     name:
 *                       type: string
 *                       description: 用户姓名
 *                     role:
 *                       type: string
 *                       description: 用户角色
 *                     isEmailVerified:
 *                       type: boolean
 *                       description: 邮箱是否已验证
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *                   example: 获取用户信息成功
 *                 timestamp:
 *                   type: string
 *                   description: 响应时间戳
 *                   example: 2024-01-01 10:00:00
 *       "401":
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: 未授权访问，请先登录
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 注册新用户账户，创建用户信息并返回认证令牌
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: 真实姓名
 *                 example: "张三"
 *               username:
 *                 type: string
 *                 description: 用户名，3-50字符，支持字母、数字、下划线
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址，必须唯一
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: 密码，至少包含一个数字和一个字母
 *                 example: "password123"
 *           example:
 *             name: "张三"
 *             username: "admin"
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       "201":
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *             example:
 *               user:
 *                 id: "user-123"
 *                 username: "admin"
 *                 name: "张三"
 *                 email: "user@example.com"
 *                 role: "user"
 *                 isEmailVerified: false
 *                 createdAt: "2024-01-20T10:30:00.000Z"
 *                 updatedAt: "2024-01-20T10:30:00.000Z"
 *               tokens:
 *                 access:
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   expires: "2024-01-20T11:00:00.000Z"
 *                 refresh:
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   expires: "2024-02-20T10:30:00.000Z"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 用户身份认证，验证用户名/邮箱和密码，返回访问令牌。该接口用于用户登录系统，验证用户身份并获取访问令牌，用于后续 API 调用的身份认证。
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名，3-50字符，与邮箱二选一
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱，与用户名二选一
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码，必填，6-20字符
 *                 minLength: 6
 *                 maxLength: 20
 *                 example: "password123"
 *               rememberMe:
 *                 type: boolean
 *                 description: 是否记住登录状态，可选，默认 false
 *                 default: false
 *                 example: false
 *           example:
 *             username: "admin"
 *             password: "password123"
 *             rememberMe: false
 *     responses:
 *       "200":
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: 访问令牌，用于后续 API 调用认证
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           description: 刷新令牌，用于令牌续期
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: integer
 *                           description: 令牌过期时间（秒）
 *                           example: 1800
 *                     message:
 *                       type: string
 *                       example: "登录成功"
 *             example:
 *               success: true
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn: 1800
 *               message: "登录成功"
 *               meta:
 *                 timestamp: "2024-01-20T10:30:00.000Z"
 *                 requestId: "req-123456"
 *                 version: "v1"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "423":
 *         $ref: '#/components/responses/Locked'
 *       "429":
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 用户登出
 *     description: 用户登出，清除服务端会话信息。该接口用于用户退出登录，清除服务端的会话状态和令牌信息，确保安全退出。
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       "200":
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       example: {}
 *                     message:
 *                       type: string
 *                       example: "登出成功"
 *             example:
 *               success: true
 *               data: {}
 *               message: "登出成功"
 *               meta:
 *                 timestamp: "2024-01-20T10:30:00.000Z"
 *                 requestId: "req-123456"
 *                 version: "v1"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       "200":
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *             example:
 *               access:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expires: "2024-01-20T11:00:00.000Z"
 *               refresh:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expires: "2024-02-20T10:30:00.000Z"
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: 忘记密码
 *     description: 发送重置密码邮件到用户邮箱
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱地址
 *                 example: "user@example.com"
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       "204":
 *         description: 邮件发送成功
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     description: 使用重置密码令牌重置用户密码
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 重置密码令牌
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: 新密码，至少包含一个数字和一个字母
 *                 example: "newPassword123"
 *           example:
 *             password: "newPassword123"
 *     responses:
 *       "204":
 *         description: 密码重置成功
 *       "401":
 *         description: 密码重置失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "AUTH_002"
 *                 message: "密码重置失败"
 *               meta:
 *                 timestamp: "2024-01-20T10:30:00.000Z"
 *                 requestId: "req-123456"
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: 发送验证邮件
 *     description: 向用户邮箱发送邮箱验证邮件
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: 验证邮件发送成功
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: 验证邮箱
 *     description: 使用验证令牌验证用户邮箱
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 邮箱验证令牌
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       "204":
 *         description: 邮箱验证成功
 *       "401":
 *         description: 邮箱验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "AUTH_002"
 *                 message: "邮箱验证失败"
 *               meta:
 *                 timestamp: "2024-01-20T10:30:00.000Z"
 *                 requestId: "req-123456"
 */

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: 获取用户信息
 *     description: 获取当前登录用户的详细信息。该接口需要用户已登录并提供有效的访问令牌。
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: 获取用户信息成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: 用户ID
 *                           example: "user-123"
 *                         username:
 *                           type: string
 *                           description: 用户名
 *                           example: "admin"
 *                         name:
 *                           type: string
 *                           description: 用户姓名
 *                           example: "张三"
 *                         email:
 *                           type: string
 *                           format: email
 *                           description: 用户邮箱
 *                           example: "user@example.com"
 *                         avatar:
 *                           type: string
 *                           description: 用户头像URL
 *                           example: ""
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 用户角色列表
 *                           example: ["user"]
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 用户权限列表
 *                           example: []
 *                     message:
 *                       type: string
 *                       example: "获取用户信息成功"
 *             example:
 *               success: true
 *               data:
 *                 id: "user-123"
 *                 username: "admin"
 *                 name: "张三"
 *                 email: "user@example.com"
 *                 avatar: ""
 *                 roles: ["user"]
 *                 permissions: []
 *               message: "获取用户信息成功"
 *               meta:
 *                 timestamp: "2024-01-20T10:30:00.000Z"
 *                 requestId: "req-123456"
 *                 version: "v1"
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

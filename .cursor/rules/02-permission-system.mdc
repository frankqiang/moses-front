---
description: 
globs: **/permission.js,src/permission.js,src/store/modules/user.js,src/router/*.js,src/utils/auth.js
alwaysApply: false
---
# 权限控制系统

## 权限控制概述
该项目实现了一个基于路由的权限控制系统，根据用户角色动态加载路由。主要通过Token和用户角色来控制用户可访问的页面。

## 关键文件
- [src/permission.js](mdc:src/permission.js) - 全局路由守卫，控制页面访问权限
- [src/store/modules/user.js](mdc:src/store/modules/user.js) - 用户登录、获取信息和权限状态管理
- [src/store/modules/permission.js](mdc:src/store/modules/permission.js) - 权限路由生成

## 核心流程
1. 用户登录成功后，获取Token并存储
2. 路由跳转时，权限守卫检查Token
3. 有Token时，获取用户信息和角色
4. 根据用户角色，动态添加可访问路由
5. 无Token访问受限页面时，重定向到登录页

## 白名单
某些路由（如登录页）可以无需登录就能访问，它们被加入白名单（`whiteList`）：
```js
const whiteList = ['/login'] // 不重定向白名单
```

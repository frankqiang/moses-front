const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  rememberMe: state => state.user.rememberMe,
  userInfo: state => state.user.userInfo,
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  routesGenerated: state => state.permission.routesGenerated,
  lastRoles: state => state.permission.lastRoles
}
export default getters

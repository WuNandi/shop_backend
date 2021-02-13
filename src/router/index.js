import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Roles from '../components/power/Roles.vue'
import Rights from '../components/power/Rights.vue'
import Goods from '../components/Goods.vue'
import Params from '../components/goods/Params.vue'
import Cate from '../components/goods/Cate.vue'
import Orders from '../components/Orders.vue'
import Reports from '../components/Reports.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    // home目录
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        // 欢迎界面
        path: '/welcome',
        component: Welcome
      },
      {
        // 用户列表
        path: '/users',
        component: Users
      },
      {
        // 角色列表
        path: '/roles',
        component: Roles
      },
      {
        // 权限列表
        path: '/rights',
        component: Rights
      },
      {
        // 商品列表
        path: '/goods',
        component: Goods
      },
      {
        // 分类参数
        path: '/params',
        component: Params
      },
      {
        // 商品分类
        path: '/categories',
        component: Cate
      },
      {
        // 订单列表
        path: '/orders',
        component: Orders
      },
      {
        // 数据报表
        path: '/reports',
        component: Reports
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // 访问的是登录页面
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/users/Users.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/users/Users.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles.vue')

// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "params_cate" */ '../components/goods/Params.vue')
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "params_cate" */ '../components/goods/Cate.vue')

// import GoodsList from '../components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "goodsList_add" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "goodsList_add" */ '../components/goods/Add.vue')

// import Orders from '../components/order/Orders.vue'
const Orders = () => import(/* webpackChunkName: "orders_report" */ '../components/order/Orders.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "orders_report" */ '../components/report/Report.vue')

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
        component: GoodsList
      },
      {
        // 添加商品页
        path: '/goods/add',
        component: Add
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
        component: Report
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

<template>
  <!-- 用的是element container布局 -->
  <!-- home页面 -->
  <el-container class="home-container">
    <!-- home 头部 -->
    <el-header>
      <div>
        <img src="../assets/images/heima.png" alt="" />
        <span>品优购后台管理系统</span>
      </div>
      <el-button type="info" @click="signOut">退出</el-button></el-header
    >
    <!-- home 内容区 -->
    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠开关 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#373d41"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级子菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 二级子菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主内容区 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 菜单列表
      menuList: [],
      // 字体图标对象
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 菜单是否折叠
      isCollapse: false,
      // 当前活动菜单
      activePath: ''
    }
  },
  // 钩子函数 组件被创建时获取菜单列表
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    signOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 从后台获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    // 折叠开关
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存用户菜单活动状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  // flex布局需要好好补习一下
  display: flex;
  justify-content: space-between;
  // button 上下居中就变小了？
  align-items: center;
  padding-left: 0;
  background-color: #373d41;
  font-size: 20px;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>

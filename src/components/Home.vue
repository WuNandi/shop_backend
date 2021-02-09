<template>
  <!-- 用的是element container布局 -->
  <!-- home页面 -->
  <el-container class="home-container">
    <!-- home 头部 -->
  <el-header>
    <div>
      <img src="../assets/images/heima.png" alt="">
      <span>品优购后台管理系统</span>
    </div>
    <el-button type='info' @click="signOut">退出</el-button></el-header>
  <!-- home 内容区 -->
  <el-container>
    <!-- 内容左侧栏 -->
    <el-aside width="200px">Aside</el-aside>
    <!-- 主内容区 -->
    <el-main>Main</el-main>
  </el-container>
</el-container>
</template>
<script>
export default {
  methods: {
    signOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
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
}
.el-main {
  background-color: #EAEDF1;
}
</style>

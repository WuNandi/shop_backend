<template>
  <div>
    <h3>欢迎界面</h3>
    <p>{{userList}}</p>
    <el-checkbox border v-for="(item, idx) in userList" :key="idx" checked>{{item}}</el-checkbox>
  </div>
</template>
<script>
export default {
  data() {
    return {
      userList: ['zs', 'ls', 'ceshi', 'aaaa']
    }
  }
}
</script>
<style lang="less" scoped>
</style>

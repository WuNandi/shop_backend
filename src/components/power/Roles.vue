<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 角色列表区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table
            :data="roleList"
            style="width: 100%"
            border stripe >
            <!-- 展开权限列表 -->
            <el-table-column
              type="expand">
              <template slot-scope="scope">
                <el-row :class="['bdbottom', idx1 === 0 ? 'bdtop': '', 'vcenter']" v-for="(item1, idx1) in scope.row.children" :key="item1.id" >
                  <!-- 一级权限标签 -->
                  <el-col :span="5">
                    <el-tag type="primary" closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 二级和三级权限标签 -->
                  <el-col :span="19">
                    <el-row :class="[idx2 === 0 ? '': 'bdtop', 'vcenter']" v-for="(item2, idx2) in item1.children" :key="item2.id">
                      <!-- 二级菜单权限 -->
                      <el-col :span="6">
                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 三级菜单权限 -->
                      <el-col :span="18">
                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
              </el-table-column>
            <el-table-column
              type="index"
              label="#">
            </el-table-column>
            <el-table-column
              prop="roleName"
              label="角色名称">
            </el-table-column>
            <el-table-column
              prop="roleDesc"
              label="角色描述">
            </el-table-column>
            <el-table-column
              prop="level"
              label="操作"
              width="284">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button><el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
              </template>
            </el-table-column>
          </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
  title="提示"
  :visible.sync="setRightDialogVisible"
  width="50%"
  @close="setRightsDialogClosed">
  <!-- 权限树形结构 -->
  <el-tree :data="rightsList" :props="rightsTreeProps" show-checkbox node-key="id"
  default-expand-all :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 角色列表数据
      roleList: [],
      // 所有权限列表
      rightsList: [],
      // 设置权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 树形控件属性
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '',
      // 默认选中的权限节点
      defaultKeys: [],
      // 分配角色用户信息
      userInfo: {}
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表数据
    async getRoleList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('请求角色列表失败')
      }
      this.$message.success('请求成功')
      this.roleList = res.data
    },
    // 根据id删除指定权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // 向服务器发起删除权限请求
      const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 防止页面刷新 直接更新权限值即可？
      role.children = res.data
      // 刷新角色权限列表
      // this.getRoleList()
    },
    // 展示设置权限对话框
    async showSetRightDialog (role) {
      // 存储roleId
      this.roleId = role.id
      // 获取所有权限列表
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 保存权限列表数据到 data 中
      this.rightsList = res.data
      // 获取三级节点id
      this.getLeafKeys(role, this.defaultKeys)
      // 显示设置权限对话框
      this.setRightDialogVisible = true
    },
    // 递归获取三级节点id, 保存至 defaultKeys 中
    getLeafKeys (node, arr) {
      // 没有children属性就代表是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 清空 defaultKeys
    setRightsDialogClosed () {
      this.defaultKeys = []
    },
    // 分配权限
    async allotRights () {
      // 获取半选中节点和选中节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.rightsList = res.data
      // 关闭分配权限对话框
      this.setRightDialogVisible = false
      // 刷新列表
      this.getRoleList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>

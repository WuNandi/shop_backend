<template>
  <div>
<!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户区域 -->
        <el-col :span="4"><el-button type="primary" @click="addDialogVisible = true">添加用户</el-button></el-col>
      </el-row>
      <!-- 用户列表数据 -->
      <el-table
      :data="userList"
      style="width: 100%"
      border
      stripe
      >
      <el-table-column type="index" label="#"></el-table-column>
      <!-- 姓名 -->
      <el-table-column
        prop="username"
        label="姓名"
        >
      </el-table-column>
      <!-- 邮箱 -->
      <el-table-column
        prop="email"
        label="邮箱"
        >
      </el-table-column>
      <!-- 电话 -->
      <el-table-column
        prop="mobile"
        label="电话"
        >
      </el-table-column>
      <!-- 角色 -->
      <el-table-column
        prop="role_name"
        label="角色"
        >
      </el-table-column>
      <!-- 状态 -->
      <el-table-column
        label="状态"
        >
        <!-- 状态开关 -->
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChange(scope.row)"
            >
          </el-switch>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column
        prop=""
        label="操作"
        width="173"
        >
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 设置按钮提示框 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <!-- 设置按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页栏 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户对话框表单 -->
    <el-dialog
    title="提示"
    :visible.sync="addDialogVisible"
    width="50%"
    @closed="addDialogClosed"
    >
    <!-- 添加用户表单 -->
    <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
      <!-- 姓名 -->
      <el-form-item label="姓名" prop="username">
      <el-input v-model="addUserForm.username"></el-input>
      </el-form-item>
      <!-- 密码 -->
      <el-form-item label="密码" prop="password">
      <el-input v-model="addUserForm.password"></el-input>
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
      <el-input v-model="addUserForm.email"></el-input>
      </el-form-item>
      <!-- 手机 -->
      <el-form-item label="手机" prop="mobile">
      <el-input v-model="addUserForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="editDialogClosed"
    >
      <!-- 修改用户表单 -->
    <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="70px">
      <!-- 姓名 -->
      <el-form-item label="姓名" prop="username">
      <el-input v-model="editUserForm.username" disabled></el-input>
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
      <el-input v-model="editUserForm.email"></el-input>
      </el-form-item>
      <!-- 手机 -->
      <el-form-item label="手机" prop="mobile">
      <el-input v-model="editUserForm.mobile"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClosed">
  <p>当前用户：{{ userInfo.username }}</p>
  <p>当前角色：{{ userInfo.role_name }}</p>
  <p>分配新角色：
    <el-select v-model="selectedRoleId" placeholder="请选择">
    <el-option
      v-for="item in roleList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
  </p>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 自定义校验规则
    // 验证邮箱
    var checkEmail = (rule, value, callback) => {
      var regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 验证手机号
    var checkMobile = (rule, value, callback) => {
      var regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法手机号'))
    }
    return {
      // 请求用户列表参数
      queryInfo: {
        // 搜索内容
        query: '',
        // 页数
        pagenum: 1,
        // 单页最多数据
        pagesize: 2
      },
      // 用户列表
      userList: [],
      // 角色列表
      roleList: [],
      // 用户总数
      total: 0,
      // 添加用户对话框显示
      addDialogVisible: false,
      // 修改用户对话框显示
      editDialogVisible: false,
      // 删除用户对话框显示
      deleteDialogVisible: false,
      // 分配角色对话框显示
      setRoleDialogVisible: false,
      // 当前将要分配角色的用户信息
      userInfo: {},
      // 已选中的roleId
      selectedRoleId: '',
      // 添加用户表单数据
      addUserForm: {
        // 姓名
        username: '',
        // 密码
        password: '',
        // 邮箱
        email: '',
        // 手机
        mobile: ''
      },
      editUserForm: {},
      // 添加用户表单验证规则
      addUserFormRules: {
        // 姓名验证
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 密码验证
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 邮箱验证
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail }
        ],
        // 手机验证
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile }
        ]
      },
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据
    async getUserList () {
      // 请求参数附带请求页数与第几页
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表信息失败')
      // 用户列表信息
      this.userList = res.data.users
      console.log(this.userList)
      // 用户总数
      this.total = res.data.total
    },
    // 每页显示页数改变
    handleSizeChange (pagesize) {
      console.log(pagesize)
      this.queryInfo.pagesize = pagesize
      // 重新发起请求渲染
      this.getUserList()
    },
    // 当前页
    handleCurrentChange (pagenum) {
      console.log(pagenum)
      this.queryInfo.pagenum = pagenum
      // 重新发起请求渲染
      this.getUserList()
    },
    // 监听开关，修改用户状态
    async userStateChange (userInfo) {
      // 发起一个修改状态的请求
      const { data: res } = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 这句代码的意义？
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('状态修改失败')
      }
      this.$message.success('状态修改成功')
    },
    // 添加用户对话框关闭重置表单域
    addDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 修改用户对话框关闭重置表单域
    editDialogClosed () {
      this.$refs.editUserFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      // 表单预验证
      this.$refs.addUserFormRef.validate(async valid => {
        // 验证未通过，默不作声
        if (!valid) return
        // 验证通过，发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加新用户失败')
        }
        this.$message.success('添加新用户成功')
        // 新用户添加完成，关闭对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 点击确定按钮，确定修改用户信息
    editUser () {
      // 修改用户信息预验证
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) {
          return ''
        }
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put('/users/' + this.editUserForm.id, { email: this.editUserForm.email, mobile: this.editUserForm.mobile })
        if (res.meta.status !== 200) {
          this.$message.error('修改用户信息失败')
        }
        // 关闭修改用户信息对话框
        this.editDialogVisible = false
        // 刷新列表
        this.getUserList()
        // 提示修改信息成功
        this.$message.success('修改用户信息成功')
      })
    },
    // 点击删除按钮，删除单个用户信息
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      // 单击确认 confirmResule => 字符串'confirm'
      // 单击取消 confirmResule => 字符串'cancle'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发起确认删除请求
      const { data: res } = await this.$http.delete('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户信息失败')
      }
      // 刷新用户信息列表 -- 删除
      this.getUserList()
      // 提示删除成功
      this.$message.success('成功删除用户信息')
    },
    // 修改信息对话框显示与隐藏
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      // 根据id获取用户信息
      this.editUserForm = res.data
      // 修改用户信息对话框显示
      this.editDialogVisible = true
    },
    // 显示分配角色对话框
    async setRole (userInfo) {
      // 保存当前分配角色的用户信息
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('/roles/')
      if (res.meta.status !== 200) {
        return this.$message.eror('请求角色列表失败')
      }
      this.roleList = res.data
      // 显示对话框
      this.setRoleDialogVisible = true
    },
    // 保存并更新角色信息
    async saveRoleInfo () {
      // 用户是否选取角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更改角色失败')
      }
      // 保存新更改信息
      this.roleList = res.data
      // 更新角色列表
      this.getUserList()
      // 关闭分配角色对话框
      this.setRoleDialogVisible = false
      // 更改角色信息成功
      return this.$message.success('更改角色信息成功')
    },
    // 分配角色对话框关闭，重置userInfo，不然信息会遗留
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="less" scoped>
</style>

<template>
  <div>
<!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品区域 -->
        <el-col :span="4"><el-button type="primary" @click="goAddPage">添加商品</el-button></el-col>
      </el-row>
      <!-- 商品列表数据 -->
      <el-table
      :data="goodList"
      style="width: 100%"
      border
      stripe
      >
      <el-table-column type="index" label="#"></el-table-column>
      <!-- 商品 -->
      <el-table-column
        prop="goods_name"
        label="商品名称"
        >
      </el-table-column>
      <!-- 商品价格 -->
      <el-table-column
        prop="goods_price"
        label="商品价格(元)"
        width="95"
        >
      </el-table-column>
      <!-- 电话 -->
      <el-table-column
        prop="goods_weight"
        label="商品重量"
        width="70"
        >
      </el-table-column>
      <!-- 角色 -->
      <el-table-column
        prop="add_time"
        label="创建时间"
        width="140"
        >
        <template slot-scope="scope">
          {{scope.row.add_time | dateFormat}}
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column
        prop=""
        label="操作"
        width="119"
        >
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodById(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页栏 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background>
    </el-pagination>
    </el-card>
    <!-- 修改商品对话框 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="editDialogClosed"
    >
      <!-- 修改商品表单 -->
    <el-form :model="editGoodForm" :rules="editGoodFormRules" ref="editGoodFormRef" label-width="70px">
      <!-- 商品 -->
      <el-form-item label="商品" prop="goods_name">
      <el-input v-model="editGoodForm.goods_name" disabled></el-input>
      </el-form-item>
      <!-- 商品单价 -->
      <el-form-item label="单价" prop="goods_price">
      <el-input v-model="editGoodForm.goods_price"></el-input>
      </el-form-item>
      <!-- 商品数量 -->
      <el-form-item label="数量" prop="goods_number">
      <el-input v-model="editGoodForm.goods_number"></el-input>
      </el-form-item>
      <!-- 商品重量 -->
      <el-form-item label="重量" prop="goods_weight">
      <el-input v-model="addGoodForm.goods_weight"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGood">确 定</el-button>
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
      // 请求商品列表参数
      queryInfo: {
        // 搜索内容
        query: '',
        // 页数
        pagenum: 1,
        // 单页最多数据
        pagesize: 10
      },
      // 商品列表
      goodList: [],
      // 角色列表
      roleList: [],
      // 商品总数
      total: 0,
      // 添加商品对话框显示
      addDialogVisible: false,
      // 修改商品对话框显示
      editDialogVisible: false,
      // 删除商品对话框显示
      deleteDialogVisible: false,
      // 分配角色对话框显示
      setRoleDialogVisible: false,
      // 当前将要分配角色的商品信息
      goodInfo: {},
      // 已选中的roleId
      selectedRoleId: '',
      // 添加商品表单数据
      addGoodForm: {
        // 商品
        goods_name: '',
        // 单价
        goods_price: '',
        // 商品重量
        goods_weight: '',
        // 商品数量
        goods_number: ''
      },
      editGoodForm: {},
      // 添加商品表单验证规则
      addGoodFormRules: {
        // 商品名称验证
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 商品单价验证
        goods_price: [
          { required: true, message: '请输入商品单价', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 商品数量验证
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkMobile }
        ],
        // 商品重量验证
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkEmail }
        ]
      },
      editGoodFormRules: {
        // 商品名称验证
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
          { validator: checkMobile }
        ],
        // 商品单价验证
        goods_price: [
          { required: true, message: '请输入商品单价', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          { validator: checkMobile }
        ],
        // 商品数量验证
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkMobile }
        ],
        // 商品重量验证
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkEmail }
        ]
      }
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    // 获取商品列表数据
    async getGoodList () {
      // 请求参数附带请求页数与第几页
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表信息失败')
      // 商品列表信息
      this.goodList = res.data.goods
      console.log(this.goodList)
      // 商品总数
      this.total = res.data.total
    },
    // 每页显示页数改变
    handleSizeChange (pagesize) {
      console.log(pagesize)
      this.queryInfo.pagesize = pagesize
      // 重新发起请求渲染
      this.getGoodList()
    },
    // 当前页
    handleCurrentChange (pagenum) {
      console.log(pagenum)
      this.queryInfo.pagenum = pagenum
      // 重新发起请求渲染
      this.getGoodList()
    },
    // 添加商品对话框关闭重置表单域
    addDialogClosed () {
      this.$refs.addGoodFormRef.resetFields()
    },
    // 修改商品对话框关闭重置表单域
    editDialogClosed () {
      this.$refs.editGoodFormRef.resetFields()
    },
    // 点击按钮，添加新商品
    addGood () {
      // 表单预验证
      this.$refs.addGoodFormRef.validate(async valid => {
        // 验证未通过，默不作声
        if (!valid) return
        // 验证通过，发起添加商品请求
        const { data: res } = await this.$http.post('goods', this.addGoodForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加新商品失败')
        }
        this.$message.success('添加新商品成功')
        // 新商品添加完成，关闭对话框
        this.addDialogVisible = false
        // 重新获取商品列表
        this.getGoodList()
      })
    },
    // 点击确定按钮，确定修改商品信息
    editGood () {
      // 修改商品信息预验证
      this.$refs.editGoodFormRef.validate(async valid => {
        if (!valid) {
          return ''
        }
        // 发起修改商品信息的请求
        const { data: res } = await this.$http.put('/goods/' + this.editGoodForm.goods_id, { goods_name: this.editGoodForm.goods_name, goods_price: this.editGoodForm.goods_price, goods_number: 100, goods_weight: 100 })
        if (res.meta.status !== 200) {
          this.$message.error('修改商品信息失败')
        }
        // 关闭修改商品信息对话框
        this.editDialogVisible = false
        // 刷新列表
        this.getGoodList()
        // 提示修改信息成功
        this.$message.success('修改商品信息成功')
      })
    },
    // 点击删除按钮，删除单个商品信息
    async removeGoodById (id) {
      const confirmResult = await this.$confirm('此操作将永久该商品, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('/goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品信息失败')
      }
      // 刷新商品信息列表 -- 删除
      this.getGoodList()
      // 提示删除成功
      this.$message.success('成功删除商品信息')
    },
    // 修改信息对话框显示与隐藏
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败')
      }
      // 根据id获取商品信息
      this.editGoodForm = res.data
      // 修改商品信息对话框显示
      this.editDialogVisible = true
    },
    // 显示分配角色对话框
    async setRole (goodInfo) {
      // 保存当前分配角色的商品信息
      this.goodInfo = goodInfo
      const { data: res } = await this.$http.get('/roles/')
      if (res.meta.status !== 200) {
        return this.$message.eror('请求角色列表失败')
      }
      this.roleList = res.data
      // 显示对话框
      this.setRoleDialogVisible = true
    },
    // 跳转商品添加页面
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
</style>

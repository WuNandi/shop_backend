<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加区域 -->
      <el-row>
        <!-- 添加分类区域 -->
        <el-col><el-button type="primary" @click="showAddDialog">添加分类</el-button></el-col>
      </el-row>
      <!-- 商品分类列表数据 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" show-index index-text="#" :expand-type="false" :selection-type="false" border :show-row-hover="false">
        <!-- 是否有效图标列 -->
        <template slot="isValid" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="operation">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
    <!-- 分页栏 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"
  @close="addCateDialogClosed">
  <!-- 添加分类表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
    <!-- 分类名称栏 -->
  <el-form-item label="分类名称" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <!-- 父级分类栏 -->
  <el-form-item label="父级分类" prop="parent">
    <!-- 父级级联菜单 -->
    <!-- options指定数据源 -->
    <!-- props指定配置对象 -->
    <el-cascader
    v-model="selectedKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="parentCateChanged" clearable></el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 添加分类对话框显示属性
      addCateDialogVisible: false,
      // 父级分类列表数据
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的分类id
      selectedKeys: [],
      // 分类表单数据
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认添加1级分类
        cat_level: 0
      },
      // 分类表单验证规则
      addCateFormRules: {
        // 分类名称校验规则
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 请求分类的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isValid'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }]
    }
  },
  created() {
    // 组件被创建时获取分类列表
    this.getCateList()
  },
  methods: {
    // 获取分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('分类列表数据获取失败')
      }
      this.$message.success('分类列表数据获取成功')
      // 保存请求的分类数据
      this.cateList = res.data.result
      // 保存总数据条数
      this.total = res.data.total
      console.log(this.cateList)
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddDialog () {
      // 获取父级列表数据
      this.getParentCateList()
      // 显示分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCateList () {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表数据失败')
      }
      console.log(res.data)
      // 需要修复！！！下拉菜单有30项就会很长，如何解决？
      // 需要修复！！！选中无法关闭下拉菜单
      // 需要修复！！！菜单前面的点点不友好
      this.parentCateList = res.data.slice(0, 5)
    },
    // 父级菜单发生改变时触发
    parentCateChanged () {
      // 有选中父级
      if (this.selectedKeys.length > 0) {
        // 父id等于选中的最后一项id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 分类level
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 没有选中父级则默认为pid：0 level：0
        this.addCateForm.pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.selectedKeys)
    },
    // 添加分类对话框关闭，重置验证规则
    addCateDialogClosed () {
      // 清空分类名称
      this.$refs.addCateFormRef.resetFields()
      // 清空父类级联菜单
      this.selectedKeys = []
      this.addCateForm.pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击确认按钮添加分类
    addCate () {
      // 分类表单预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return null
        }
        const { data: res } = await this.$http.post('/categories/', this.addCateForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        // 获取分类列表数据
        this.getCateList()
        // 关闭添加分类对话框
        this.addCateDialogVisible = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>

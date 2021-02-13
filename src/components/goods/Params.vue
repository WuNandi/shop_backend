<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert type="warning" title="注意：只允许为第三级分类设置相关参数！" show-icon :closable='false'></el-alert>
      <!-- 选择商品分类区域 -->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品分类级联选择框 -->
        <el-cascader
          v-model="selectedCateKeys"
          :options="cateList"
          :props="cateProps"
          @change="cateChanged">
        </el-cascader>
      </el-col>
    </el-row>
    <!-- 参数Tabs区域 -->
    <el-tabs v-model="activeName" @tab-click="handleTabsClick">
      <!-- 添加动态参数面板 -->
      <el-tab-pane label="动态参数" name="many">
        <!-- 动态参数按钮 -->
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
            <el-tag v-for="(item, idx) in scope.row.attr_vals" :key="item.attr_id" closable @close="handleClose(idx, scope.row)">{{ item }}</el-tag>
            <!-- 点击新增Tag -->
            <el-input class="input-new-tag"
            v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
          </template>
        </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 添加静态属性面板 -->
      <el-tab-pane label="静态属性" name="only">
        <!-- 静态属性按钮 -->
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
        <!-- 静态属性表格 -->
        <el-table :data="onlyTableData" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
            <el-tag v-for="(item, idx) in scope.row.attr_vals" :key="item.attr_id" closable @close="handleClose(idx, scope.row)">{{ item }}</el-tag>
            <!-- 点击新增Tag -->
            <el-input class="input-new-tag"
            v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="attr_name" label="属性名称"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
          </template>
        </el-table-column>
        </el-table>
        </el-tab-pane>
    </el-tabs>
    <!-- 添加参数/属性对话框 -->
    <el-dialog
  :title="'添加' + titleText"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
  <!-- 添加参数/属性表格 -->
  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="addForm.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
</el-dialog>
<!-- 编辑参数/属性对话框 -->
    <el-dialog
  :title="'修改' + titleText"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed">
  <!-- 编辑参数/属性表格 -->
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
  <el-form-item :label="titleText" prop="attr_name">
    <el-input v-model="editForm.attr_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
</el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有分类列表数据
      cateList: [],
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 所选中的分类
      selectedCateKeys: [],
      // 分类级联配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 当前激活Tabs name
      activeName: 'many',
      // 添加属性/参数对话框显示与隐藏
      addDialogVisible: false,
      // 添加参数/属性表格数据
      addForm: {
        attr_name: ''
      },
      // 添加参数/属性表格数据验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名', trigger: 'blur' }
        ]
      },
      // 编辑参数对话框
      editDialogVisible: false,
      // 编辑参数/属性表格数据
      editForm: {
        attr_name: ''
      },
      // 编辑参数/属性表格数据验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 在组件被创建时,获取参数数据列表
    this.getCateList()
  },
  methods: {
    // 获取所有分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('请求分类列表失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
      this.$message.success('获取分类列表')
    },
    // 监听参数级联列表改变事件,
    cateChanged () {
      this.getParamsData()
    },
    // 处理Tabs单击事件
    handleTabsClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 根据分类id获取参数数据
    async getParamsData () {
      // 只能选中三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据当前所选分类的id,和当前所处的面板,获取对应的参数
      const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('请求分类参数失败')
      }
      // 将空格分开的字符串转为数组
      res.data.forEach(item => {
        // 将可选项分割成数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每个参数添加inputVisible和inputValue属性
        // 文本输入框显示与隐藏
        item.inputVisible = false
        // 文本输入框的值
        item.inputValue = ''
      })
      // 判断请求的数据是否为动态
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加参数对话框关闭事件,一关闭就重置表单域
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数/属性
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`/categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          }
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 显示编辑参数对话框
    async showEditDialog (attrId) {
      // 获取当前参数信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      console.log(res.data)
      this.editDialogVisible = true
    },
    // 监听编辑参数对话框关闭事件,一关闭就重置表单域
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数/属性
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        }
      })
    },
    // 根据删除参数
    async removeParams (attrId) {
      const confirmResult = await this.$confirm('此操作将该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除属性')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除属性失败')
      }
      this.getParamsData()
      this.$message.success('删除属性成功')
    },
    // 失去焦点和按下了 Enter 都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return this.$message.info('取消修改参数项')
      }
      // 如何输入内容符合要求,TODO:
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      // !!!发起编辑参数请求 保存数据
      this.saveAttrVals(row)
    },
    // 发起编辑参数请求 保存数据
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑参数失败')
      }
      this.$message.success('编辑参数成功')
      this.getParamsData()
    },
    // 点击关闭标签,删除对应参数
    handleClose (idx, row) {
      row.attr_vals.splice(idx, 1)
      this.saveAttrVals(row)
    },
    // 点击按钮,显示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 点击自动获得输入焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    // 添加属性和添加参数按钮的禁用与启用
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类Id
    cateId () {
      // 选中分类数组长度为3才返回正确id
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },
    // 计算当前添加按钮文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>

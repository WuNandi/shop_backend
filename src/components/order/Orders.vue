<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加订单区域 -->
        <el-col :span="4"><el-button type="primary" @click="addDialogVisible = true">添加订单</el-button></el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table
      :data="orderList"
      style="width: 100%"
      border
      stripe
      >
      <el-table-column type="index" label="#"></el-table-column>
      <!-- 订单编号 -->
      <el-table-column
        prop="order_number"
        label="订单编号"
        >
      </el-table-column>
      <!-- 订单价格 -->
      <el-table-column
        prop="order_price"
        label="订单价格"
        width="75"
        >
      </el-table-column>
      <!-- 是否付款 -->
      <el-table-column
        prop="pay_status"
        label="是否付款"
        width="80"
        >
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
        <el-tag type="success" v-else>已付款</el-tag>
        </template>
      </el-table-column>
      <!-- 是否发货 -->
      <el-table-column
        prop="is_send"
        label="是否发货"
        width="70"
        >
      </el-table-column>
      <!-- 下单时间 -->
      <el-table-column
        prop="create_time"
        label="下单时间"
        width="140"
        >
        <template slot-scope="scope">
          {{scope.row.create_time | dateFormat}}
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column
        prop=""
        label="操作"
        width="119"
        >
        <template>
          <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog"></el-button>
            <!-- 物流按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox">
            </el-button>
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
    <!-- 修改订单对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @closed="addressDialogClosed"
    >
      <!-- 修改订单表单 -->
    <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
      <!-- 省市区/县 -->
      <el-form-item label="省市区/县" prop="address1">
      <el-cascader
    v-model="addressForm.address1"
    :options="cityData"
    :props="address1Props"
    @change="handleChange"></el-cascader>
      </el-form-item>
      <!-- 详细地址 -->
      <el-form-item label="详细地址" prop="address2">
      <el-input v-model="addressForm.address2"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrder">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="progressDialogVisible"
      width="50%">
      <!-- 物流时间线 -->
      <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata.js'
import progressInfo from './progressInfo.js'
export default {
  data () {
    return {
      // 请求订单列表参数
      queryInfo: {
        // 搜索内容
        query: '',
        // 页数
        pagenum: 1,
        // 单页最多数据
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 订单总数
      total: 0,
      // 添加订单对话框显示
      addDialogVisible: false,
      // 修改订单对话框显示
      addressDialogVisible: false,
      // 删除订单对话框显示
      deleteDialogVisible: false,
      // 已选中的roleId
      selectedAddressId: '',
      // 添加订单表单数据
      addOrderForm: {
        // 姓名
        order_name: '',
        // 密码
        order_price: ''
      },
      // 编辑地址表单数据
      addressForm: {
        address1: [],
        address2: ''
      },
      address1Props: {
        expandTrigger: 'hover'
      },
      // 添加订单表单验证规则
      addressFormRules: {
        // 邮箱验证
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        // 手机验证
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 省市区/县数据
      cityData,
      // 物流对话框显示与隐藏
      progressDialogVisible: false,
      // 物流信息
      progressInfo
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      // 请求参数附带请求页数与第几页
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表信息失败')
      // 订单列表信息
      this.orderList = res.data.goods
      console.log(this.orderList)
      // 订单总数
      this.total = res.data.total
    },
    // 当省市区/县值改变时触发
    handleChange () {
      if (this.selectedAddressId.length !== 3) {
        this.selectedAddressId = []
      }
    },
    // 每页显示页数改变
    handleSizeChange (pagesize) {
      console.log(pagesize)
      this.queryInfo.pagesize = pagesize
      // 重新发起请求渲染
      this.getOrderList()
    },
    // 当前页
    handleCurrentChange (pagenum) {
      console.log(pagenum)
      this.queryInfo.pagenum = pagenum
      // 重新发起请求渲染
      this.getOrderList()
    },
    // 监听开关，修改订单状态
    async orderStateChange (orderInfo) {
      // 发起一个修改状态的请求
      const { data: res } = await this.$http.put(`/orders/${orderInfo.id}/state/${orderInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 这句代码的意义？
        orderInfo.mg_state = !orderInfo.mg_state
        return this.$message.error('状态修改失败')
      }
      this.$message.success('状态修改成功')
    },
    // 添加订单对话框关闭重置表单域
    addDialogClosed () {
      this.$refs.addOrderFormRef.resetFields()
    },
    // 修改订单对话框关闭重置表单域
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 点击按钮，编辑新订单
    editOrder () {
      // 表单预验证
      this.$refs.addressFormRef.validate(async valid => {
        // 验证未通过，默不作声
        if (!valid) return
        // 验证通过，发起添加订单请求
        const { data: res } = await this.$http.post('orders', this.addressFormRef)
        if (res.meta.status !== 200) {
          this.$message.error('添加新订单失败')
        }
        this.$message.success('添加新订单成功')
        // 新订单添加完成，关闭对话框
        this.addressDialogVisible = false
        // 重新获取订单列表
        this.getOrderList()
      })
    },
    // 修改信息对话框显示与隐藏
    showEditDialog () {
      // 修改订单信息对话框显示
      this.addressDialogVisible = true
    },
    // 显示物流信息
    async showProgressBox () {
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败')
      // }
      // this.progressInfo = res.data
      // console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>

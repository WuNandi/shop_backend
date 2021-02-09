<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/images/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 登录表单数据绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮 重置表单域
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    // 表单预验证
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid, obj)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        // 验证请求结果
        if (res.meta.status !== 200) {
          this.$message.error('登录失败')
        } else {
          this.$message.success('登录成功')
          // 保存登录token
          window.sessionStorage.setItem('token', res.data.token)
          // 跳转登录界面
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped="true">
@pureWhite: #fff;
@lessWhite: #ddd;
.login_container {
  width: 100%;
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: @pureWhite;
  border-radius: 3px;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 130px;
    padding: 10px;
    border: 1px solid @lessWhite;
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: 0 0 10px @lessWhite;
    background-color: @pureWhite;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: @lessWhite;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>

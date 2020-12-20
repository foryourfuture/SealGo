// 受理区
<template>
  <div id="acceptance-view">
    <div class="view-title">
       受理区 -  {{ 1 }} <i class="el-icon-caret-bottom" @click="toggleHandleBar" :class="{'active': handleBarActive}"></i>-<i class="el-icon-document" @click="goConfigPage"></i>
    </div>
    <transition name="el-zoom-in-top">
      <el-row v-show="handleBarActive">
        <el-col :span="20" :offset="2">
          <el-row class="handle-bar" :gutter="16">
            <el-col :span="12">
              <el-select
                v-model="choosedPicBed"
                multiple
                collapse-tags
                size="mini"
                style="width: 100%"
                placeholder="请选择显示的图床">
                <el-option
                  v-for="item in picBed"
                  :key="item.type"
                  :label="item.name"
                  :value="item.type">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-select
                v-model="pasteStyle"
                size="mini"
                style="width: 100%"
                @change="handlePasteStyleChange"
                placeholder="请选择粘贴的格式">
                <el-option
                  v-for="(value, key) in pasteStyleMap"
                  :key="key"
                  :label="key"
                  :value="value">
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row class="handle-bar" :gutter="16">
            <el-col :span="12">
              <el-input
                placeholder="搜索"
                size="mini"
                v-model="searchText">
                <i slot="suffix" class="el-input__icon el-icon-close" v-if="searchText" @click="cleanSearch" style="cursor: pointer"></i>
              </el-input>
            </el-col>
            <el-col :span="6">
              <div class="item-base copy round" :class="{ active: isMultiple(choosedList)}" @click="multiCopy">
                <i class="el-icon-document"></i> 批量复制
              </div>
            </el-col>
            <el-col :span="6">
              <div class="item-base delete round" :class="{ active: isMultiple(choosedList)}" @click="multiRemove">
                <i class="el-icon-delete"></i> 批量删除
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </transition>
    <el-row class="acceptance-list" :class="{ small: handleBarActive }">
      <el-col :span="15" :offset="6">
        <el-row>
        <el-form
          label-width="120px"
          label-position="right"
          size="small"
        >
          
        </el-form>
        </el-row>
      </el-col>
    </el-row>
    <el-dialog
      title="修改上传快捷键"
      :visible.sync="keyBindingVisible"
      :modal-append-to-body="false"
    >
      <el-form
        label-width="80px"
      >
        <el-form-item
          label="快捷上传"
        >
          <el-input 
            class="align-center"
            @keydown.native.prevent="keyDetect('upload', $event)"
            v-model="shortKey.upload"
            :autofocus="true"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancelKeyBinding" round>取消</el-button>
        <el-button type="primary" @click="confirmKeyBinding" round>确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="自定义链接格式"
      :visible.sync="customLinkVisible"
      :modal-append-to-body="false"
    >
      <el-form
        label-position="top"
        :model="customLink"
        ref="customLink"
        :rules="rules"
        size="small"
      >
        <el-form-item
          prop="value"
        >
          <div class="custom-title">
            用占位符 <b>$url</b> 来表示url的位置
          </div>
          <div class="custom-title">
            用占位符 <b>$fileName</b> 来表示文件名的位置
          </div>
          <el-input 
            class="align-center"
            v-model="customLink.value"
            :autofocus="true"
          ></el-input>
        </el-form-item>
      </el-form>
      <div>
        如[$fileName]($url)
      </div>
      <span slot="footer">
        <el-button @click="cancelCustomLink" round>取消</el-button>
        <el-button type="primary" @click="confirmCustomLink" round>确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="设置代理"
      :visible.sync="proxyVisible"
      :modal-append-to-body="false"
    >
      <el-form
        label-position="right"
        :model="customLink"
        ref="customLink"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="代理地址"
        >
          <el-input 
            v-model="proxy"
            :autofocus="true"
            placeholder="例如：http://127.0.0.1:1080"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancelProxy" round>取消</el-button>
        <el-button type="primary" @click="confirmProxy" round>确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="检查更新"
      :visible.sync="checkUpdateVisible"
      :modal-append-to-body="false"
    >
      <div>
        当前版本：{{ version }}
      </div>
      <div>
        最新版本：{{ latestVersion ? latestVersion : '正在获取中...' }}
      </div>
      <div v-if="needUpdate">
        Seal更新啦，请点击确定打开下载页面
      </div>
      <span slot="footer">
        <el-button @click="cancelCheckVersion" round>取消</el-button>
        <el-button type="primary" @click="confirmCheckVersion" round>确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="设置日志文件"
      :visible.sync="logFileVisible"
      :modal-append-to-body="false"
    >
      <el-form
        label-position="right"
        label-width="100px"
      >
        <el-form-item
          label="日志文件"
        >
          <el-button type="primary" round size="mini" @click="openFile('sealgo.log')">点击打开</el-button>
        </el-form-item>
        <el-form-item
          label="日志记录等级"
        >
          <el-select
            v-model="form.logLevel"
            multiple
            collapse-tags
          >
            <el-option
              v-for="(value, key) of logLevel"
              :key="key"
              :label="value"
              :value="key"
              :disabled="handleLevelDisabled(key)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cancelLogLevelSetting" round>取消</el-button>
        <el-button type="primary" @click="confirmLogLevelSetting" round>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import keyDetect from 'utils/key-binding'
import pkg from 'root/package.json'
import path from 'path'
const release = 'https://api.github.com/repos/foryourfuture/SealGo/releases/latest'
const downloadUrl = 'https://github.com/foryourfuture/SealGo/releases/latest'
export default {
  name: 'sealgo-setting',
  computed: {
    needUpdate () {
      if (this.latestVersion) {
        return this.compareVersion2Update(this.version, this.latestVersion)
      } else {
        return false
      }
    }
  },
  data () {
    const customLinkRule = (rule, value, callback) => {
      if (!/\$url/.test(value)) {
        return callback(new Error('必须含有$url'))
      } else {
        return callback()
      }
    }
    let logLevel = this.$db.read().get('settings.logLevel').value()
    if (!Array.isArray(logLevel)) {
      if (logLevel && logLevel.length > 0) {
        logLevel = [logLevel]
      } else {
        logLevel = ['all']
      }
    }
    return {
      form: {
        updateHelper: this.$db.read().get('settings.showUpdateTip').value(),
        showPicBedList: [],
        autoStart: this.$db.read().get('settings.autoStart').value() || false,
        rename: this.$db.read().get('settings.rename').value() || false,
        autoRename: this.$db.read().get('settings.autoRename').value() || false,
        uploadNotification: this.$db.read().get('settings.uploadNotification').value() || false,
        miniWindowOntop: this.$db.read().get('settings.miniWindowOntop').value() || false,
        logLevel
      },
      picBed: [],
      logFileVisible: false,
      keyBindingVisible: false,
      customLinkVisible: false,
      checkUpdateVisible: false,
      proxyVisible: false,
      customLink: {
        value: this.$db.read().get('settings.customLink').value() || '$url'
      },
      shortKey: {
        upload: this.$db.read().get('settings.shortKey.upload').value()
      },
      proxy: this.$db.read().get('picBed.proxy').value() || undefined,
      rules: {
        value: [
          { validator: customLinkRule, trigger: 'blur' }
        ]
      },
      logLevel: {
        all: '全部-All',
        success: '成功-Success',
        error: '错误-Error',
        info: '普通-Info',
        warn: '提醒-Warn',
        none: '不记录日志-None'
      },
      version: pkg.version,
      latestVersion: '',
      os: '',
      choosedList: {},
      choosedPicBed: [],
      searchText: '',
      handleBarActive: false,
      pasteStyle: '',
      pasteStyleMap: {
        Markdown: 'markdown',
        HTML: 'HTML',
        URL: 'URL',
        UBB: 'UBB',
        Custom: 'Custom'
      }
    }
  },
  created () {
    this.os = process.platform
    this.$electron.ipcRenderer.send('getPicBeds')
    this.$electron.ipcRenderer.on('getPicBeds', this.getPicBeds)
  },
  methods: {
    getPicBeds (event, picBeds) {
      this.picBed = picBeds
      this.form.showPicBedList = this.picBed.map(item => {
        if (item.visible) {
          return item.name
        }
      })
    },
    toggleHandleBar () {
      this.handleBarActive = !this.handleBarActive
    },
    openFile (file) {
      const { app, shell } = this.$electron.remote
      const STORE_PATH = app.getPath('userData')
      const FILE = path.join(STORE_PATH, `/${file}`)
      shell.openItem(FILE)
    },
    openLogSetting () {
      this.logFileVisible = true
    },
    keyDetect (type, event) {
      this.shortKey[type] = keyDetect(event).join('+')
    },
    cancelKeyBinding () {
      this.keyBindingVisible = false
      this.shortKey = this.$db.read().get('settings.shortKey').value()
    },
    confirmKeyBinding () {
      const oldKey = this.$db.read().get('settings.shortKey').value()
      this.$db.read().set('settings.shortKey', this.shortKey).write()
      this.keyBindingVisible = false
      this.$electron.ipcRenderer.send('updateShortKey', oldKey)
    },
    cancelCustomLink () {
      this.customLinkVisible = false
      this.customLink.value = this.$db.read().get('settings.customLink').value() || '$url'
    },
    confirmCustomLink () {
      this.$refs.customLink.validate((valid) => {
        if (valid) {
          this.$db.read().set('settings.customLink', this.customLink.value).write()
          this.customLinkVisible = false
          this.$electron.ipcRenderer.send('updateCustomLink')
        } else {
          return false
        }
      })
    },
    cancelProxy () {
      this.proxyVisible = false
      this.proxy = this.$db.read().get('picBed.proxy').value() || undefined
    },
    confirmProxy () {
      this.proxyVisible = false
      this.$db.read().set('picBed.proxy', this.proxy).write()
      const successNotification = new window.Notification('设置代理', {
        body: '设置成功'
      })
      successNotification.onclick = () => {
        return true
      }
    },
    updateHelperChange (val) {
      this.$db.read().set('settings.showUpdateTip', val).write()
    },
    handleShowPicBedListChange (val) {
      const list = this.picBed.map(item => {
        if (!val.includes(item.name)) {
          item.visible = false
        } else {
          item.visible = true
        }
        return item
      })
      this.$db.read().set('picBed.list', list).write()
      this.$electron.ipcRenderer.send('getPicBeds')
    },
    handleAutoStartChange (val) {
      this.$db.read().set('settings.autoStart', val).write()
      this.$electron.ipcRenderer.send('autoStart', val)
    },
    handleRename (val) {
      this.$db.read().set('settings.rename', val).write()
    },
    handleAutoRename (val) {
      this.$db.read().set('settings.autoRename', val).write()
    },
    compareVersion2Update (current, latest) {
      const currentVersion = current.split('.').map(item => parseInt(item))
      const latestVersion = latest.split('.').map(item => parseInt(item))

      for (let i = 0; i < 3; i++) {
        if (currentVersion[i] < latestVersion[i]) {
          return true
        }
        if (currentVersion[i] > latestVersion[i]) {
          return false
        }
      }
      return false
    },
    checkUpdate () {
      this.checkUpdateVisible = true
      this.$http.get(release)
        .then(res => {
          this.latestVersion = res.data.name
        }).catch(err => {
          console.log(err)
        })
    },
    confirmCheckVersion () {
      if (this.needUpdate) {
        this.$electron.remote.shell.openExternal(downloadUrl)
      }
      this.checkUpdateVisible = false
    },
    cancelCheckVersion () {
      this.checkUpdateVisible = false
    },
    handleUploadNotification (val) {
      this.$db.read().set('settings.uploadNotification', val).write()
    },
    handleMiniWindowOntop (val) {
      this.$db.read().set('settings.miniWindowOntop', val).write()
      this.$message('需要重启生效')
    },
    confirmLogLevelSetting () {
      if (this.form.logLevel.length === 0) {
        return this.$message.error('请选择日志记录等级')
      }
      this.$db.read().set('settings.logLevel', this.form.logLevel).write()
      const successNotification = new window.Notification('设置日志', {
        body: '设置成功'
      })
      successNotification.onclick = () => {
        return true
      }
      this.logFileVisible = false
    },
    cancelLogLevelSetting () {
      this.logFileVisible = false
      let logLevel = this.$db.read().get('settings.logLevel').value()
      if (!Array.isArray(logLevel)) {
        if (logLevel && logLevel.length > 0) {
          logLevel = [logLevel]
        } else {
          logLevel = ['all']
        }
      }
      this.form.logLevel = logLevel
    },
    handleLevelDisabled (val) {
      let currentLevel = val
      let flagLevel
      let result = this.form.logLevel.some(item => {
        if (item === 'all' || item === 'none') {
          flagLevel = item
        }
        return (item === 'all' || item === 'none')
      })
      if (result) {
        if (currentLevel !== flagLevel) {
          return true
        }
      } else if (this.form.logLevel.length > 0) {
        if (val === 'all' || val === 'none') {
          return true
        }
      }
      return false
    },
    goConfigPage () {
      this.$electron.remote.shell.openExternal('https://sealgo.github.io/SealGo-Doc/zh/guide/config.html#sealgo设置')
    }
  },
  beforeDestroy () {
    this.$electron.ipcRenderer.removeListener('getPicBeds', this.getPicBeds)
  },
  isMultiple (obj) {
    return Object.values(obj).some(item => item)
  },
  handlePasteStyleChange (val) {
    this.$db.read().set('settings.pasteStyle', val).write()
    this.pasteStyle = val
  }
}
</script>
<style lang='stylus'>
.el-message
  left 60%
.view-title
  .el-icon-document
    cursor pointer
    transition color .2s ease-in-out
    &:hover
      color #49B1F5
#acceptance-view
  .sub-title
    font-size 14px
  .acceptance-list
    height 460px
    box-sizing border-box
    overflow-y auto
    overflow-x hidden
  .acceptance-list
    .el-form
      label  
        line-height 32px
        padding-bottom 0
        color #eee
      .el-button-group
        width 100%
        .el-button
          width 50%
      .el-input__inner
        border-radius 19px
      .el-radio-group
        margin-left 25px
      .el-switch__label
        color #eee
        &.is-active
          color #409EFF
      .el-icon-question
        font-size 20px
        float right
        margin-top 9px
        color #eee
        cursor pointer
        transition .2s color ease-in-out
        &:hover
          color #409EFF
      .el-checkbox-group
        label
          margin-right 30px
          width 100px
      .el-checkbox+.el-checkbox
        margin-right 30px
        margin-left 0
      .confirm-button
        width 100%
</style>

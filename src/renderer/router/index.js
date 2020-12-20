import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tray-page',
      component: require('@/pages/TrayPage').default
    },
    {
      path: '/rename-page',
      name: 'rename-page',
      component: require('@/pages/RenamePage').default
    },
    {
      path: '/mini-page',
      name: 'mini-page',
      component: require('@/pages/MiniPage').default
    },
    {
      path: '/setting',
      name: 'setting-page',
      component: require('@/layouts/SettingPage').default,
      children: [
        {
          path: 'upload',
          component: require('@/pages/Upload').default,
          name: 'upload'
        },
        {
          path: 'weibo',
          component: require('@/pages/picbeds/Weibo').default,
          name: 'weibo'
        },
        {
          path: 'qiniu',
          component: require('@/pages/picbeds/Qiniu').default,
          name: 'qiniu'
        },
        {
          path: 'tcyun',
          component: require('@/pages/picbeds/TcYun').default,
          name: 'tcyun'
        },
        {
          path: 'upyun',
          component: require('@/pages/picbeds/UpYun').default,
          name: 'upyun'
        },
        {
          path: 'github',
          component: require('@/pages/picbeds/GitHub').default,
          name: 'github'
        },
        {
          path: 'smms',
          component: require('@/pages/picbeds/SMMS').default,
          name: 'smms'
        },
        {
          path: 'aliyun',
          component: require('@/pages/picbeds/AliYun').default,
          name: 'aliyun'
        },
        {
          path: 'imgur',
          component: require('@/pages/picbeds/Imgur').default,
          name: 'imgur'
        },
        {
          path: 'others/:type',
          component: require('@/pages/picbeds/Others').default,
          name: 'others'
        },
        {
          path: 'gallery',
          component: require('@/pages/Gallery').default,
          name: 'gallery',
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'setting',
          component: require('@/pages/SealGoSetting').default,
          name: 'setting'
        },
        {
          path: 'plugin',
          component: require('@/pages/Plugin').default,
          name: 'plugin'
        },
        {
          path: 'acceptance',
          name: 'acceptance',
          component: require('@/pages/Acceptance').default
        },
        {
          path: 'undertake',
          name: 'undertake',
          component: require('@/pages/Undertake').default
        },
        {
          path: 'make',
          name: 'make',
          component: require('@/pages/Make').default
        },
        {
          path: 'deliver',
          name: 'deliver',
          component: require('@/pages/Deliver').default
        },
        {
          path: 'query',
          name: 'query',
          component: require('@/pages/Query').default
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: require('@/pages/Statistics').default
        },
        {
          path: 'record',
          name: 'record',
          component: require('@/pages/Record').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import path from 'path'
import GuiApi from './guiApi'
import { dialog, shell } from 'electron'

// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const SealGo = requireFunc('sealgo')
const PluginHandler = requireFunc('sealgo/dist/lib/PluginHandler').default

// get uploader or transformer config
const getConfig = (name, type, ctx) => {
  let config = []
  if (name === '') {
    return config
  } else {
    const handler = ctx.helper[type].get(name)
    if (handler) {
      if (handler.config) {
        config = handler.config(ctx)
      }
    }
    return config
  }
}

const handleConfigWithFunction = config => {
  for (let i in config) {
    if (typeof config[i].default === 'function') {
      config[i].default = config[i].default()
    }
    if (typeof config[i].choices === 'function') {
      config[i].choices = config[i].choices()
    }
  }
  return config
}

const handleGetPluginList = (ipcMain, STORE_PATH, CONFIG_PATH) => {
  ipcMain.on('getPluginList', event => {
    const sealgo = new SealGo(CONFIG_PATH)
    const pluginList = sealgo.pluginLoader.getList()
    const list = []
    for (let i in pluginList) {
      const plugin = sealgo.pluginLoader.getPlugin(pluginList[i])
      const pluginPath = path.join(STORE_PATH, `/node_modules/${pluginList[i]}`)
      const pluginPKG = requireFunc(path.join(pluginPath, 'package.json'))
      const uploaderName = plugin.uploader || ''
      const transformerName = plugin.transformer || ''
      let menu = []
      if (plugin.guiMenu) {
        menu = plugin.guiMenu(sealgo)
      }
      let gui = false
      if (pluginPKG.keywords && pluginPKG.keywords.length > 0) {
        if (pluginPKG.keywords.includes('sealgo-gui-plugin')) {
          gui = true
        }
      }
      const obj = {
        name: pluginList[i].replace(/sealgo-plugin-/, ''),
        author: pluginPKG.author.name || pluginPKG.author,
        description: pluginPKG.description,
        logo: 'file://' + path.join(pluginPath, 'logo.png').split(path.sep).join('/'),
        version: pluginPKG.version,
        gui,
        config: {
          plugin: {
            name: pluginList[i].replace(/sealgo-plugin-/, ''),
            config: plugin.config ? handleConfigWithFunction(plugin.config(sealgo)) : []
          },
          uploader: {
            name: uploaderName,
            config: handleConfigWithFunction(getConfig(uploaderName, 'uploader', sealgo))
          },
          transformer: {
            name: transformerName,
            config: handleConfigWithFunction(getConfig(uploaderName, 'transformer', sealgo))
          }
        },
        enabled: sealgo.getConfig(`sealgoPlugins.${pluginList[i]}`),
        homepage: pluginPKG.homepage ? pluginPKG.homepage : '',
        guiMenu: menu,
        ing: false
      }
      list.push(obj)
    }
    event.sender.send('pluginList', list)
    sealgo.cmd.program.removeAllListeners()
  })
}

const handlePluginInstall = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('installPlugin', async (event, msg) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const pluginHandler = new PluginHandler(sealgo)
    sealgo.on('installSuccess', notice => {
      event.sender.send('installSuccess', notice.body[0].replace(/sealgo-plugin-/, ''))
    })
    sealgo.on('failed', () => {
      handleNPMError()
    })
    await pluginHandler.uninstall([msg])
    pluginHandler.install([msg])
    sealgo.cmd.program.removeAllListeners()
  })
}

const handlePluginUninstall = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('uninstallPlugin', async (event, msg) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const pluginHandler = new PluginHandler(sealgo)
    sealgo.on('uninstallSuccess', notice => {
      event.sender.send('uninstallSuccess', notice.body[0].replace(/sealgo-plugin-/, ''))
    })
    sealgo.on('failed', () => {
      handleNPMError()
    })
    await pluginHandler.uninstall([msg])
    sealgo.cmd.program.removeAllListeners()
  })
}

const handlePluginUpdate = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('updatePlugin', async (event, msg) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const pluginHandler = new PluginHandler(sealgo)
    sealgo.on('updateSuccess', notice => {
      event.sender.send('updateSuccess', notice.body[0].replace(/sealgo-plugin-/, ''))
    })
    sealgo.on('failed', () => {
      handleNPMError()
    })
    await pluginHandler.update([msg])
    sealgo.cmd.program.removeAllListeners()
  })
}

const handleNPMError = () => {
  dialog.showMessageBox({
    title: '发生错误',
    message: '请安装Node.js并重启SealGo再继续操作',
    buttons: ['Yes']
  }, (res) => {
    if (res === 0) {
      shell.openExternal('https://nodejs.org/')
    }
  })
}

const handleGetPicBedConfig = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('getPicBedConfig', (event, type) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const name = sealgo.helper.uploader.get(type).name || type
    if (sealgo.helper.uploader.get(type).config) {
      const config = handleConfigWithFunction(sealgo.helper.uploader.get(type).config(sealgo))
      event.sender.send('getPicBedConfig', config, name)
    } else {
      event.sender.send('getPicBedConfig', [], name)
    }
    sealgo.cmd.program.removeAllListeners()
  })
}

const handlePluginActions = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('pluginActions', (event, name, label) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const plugin = sealgo.pluginLoader.getPlugin(`sealgo-plugin-${name}`)
    const guiApi = new GuiApi(ipcMain, event.sender, sealgo)
    if (plugin.guiMenu && plugin.guiMenu(sealgo).length > 0) {
      const menu = plugin.guiMenu(sealgo)
      menu.forEach(item => {
        if (item.label === label) {
          item.handle(sealgo, guiApi)
        }
      })
    }
  })
}

const handleRemoveFiles = (ipcMain, CONFIG_PATH) => {
  ipcMain.on('removeFiles', (event, files) => {
    const sealgo = new SealGo(CONFIG_PATH)
    const guiApi = new GuiApi(ipcMain, event.sender, sealgo)
    setTimeout(() => {
      sealgo.emit('remove', files, guiApi)
    }, 500)
  })
}

export default (app, ipcMain) => {
  const STORE_PATH = app.getPath('userData')
  const CONFIG_PATH = path.join(STORE_PATH, '/data.json')
  handleGetPluginList(ipcMain, STORE_PATH, CONFIG_PATH)
  handlePluginInstall(ipcMain, CONFIG_PATH)
  handlePluginUninstall(ipcMain, CONFIG_PATH)
  handlePluginUpdate(ipcMain, CONFIG_PATH)
  handleGetPicBedConfig(ipcMain, CONFIG_PATH)
  handlePluginActions(ipcMain, CONFIG_PATH)
  handleRemoveFiles(ipcMain, CONFIG_PATH)
}

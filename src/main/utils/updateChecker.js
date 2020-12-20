import { dialog, shell } from 'electron'
import db from '../../datastore'
import axios from 'axios'
import pkg from '../../../package.json'
const version = pkg.version
const release = 'https://api.github.com/repos/foryourfuture/SealGo/releases/latest'
const downloadUrl = 'https://github.com/foryourfuture/SealGo/releases/latest'

const checkVersion = async () => {
  let showTip = db.read().get('settings.showUpdateTip').value()
  if (showTip === undefined) {
    db.read().set('settings.showUpdateTip', true).write()
    showTip = true
  }
  if (showTip) {
    const res = await axios.get(release)
    if (res.status === 200) {
      const latest = res.data.name
      const result = compareVersion2Update(version, latest)
      if (result) {
        dialog.showMessageBox({
          type: 'info',
          title: '发现新版本',
          buttons: ['Yes', 'No'],
          message: `发现新版本${latest}，更新了很多功能，是否去下载最新的版本？`,
          checkboxLabel: '以后不再提醒',
          checkboxChecked: false
        }, (res, checkboxChecked) => {
          if (res === 0) { // if selected yes
            shell.openExternal(downloadUrl)
          }
          db.read().set('settings.showUpdateTip', !checkboxChecked).write()
        })
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

// if true -> update else return false
const compareVersion2Update = (current, latest) => {
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
}

export default checkVersion

import path from 'path'
import db from '../../datastore'
// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require

const getPicBeds = (app) => {
  const SealGo = requireFunc('sealgo')
  const STORE_PATH = app.getPath('userData')
  console.log('==', STORE_PATH)
  const CONFIG_PATH = path.join(STORE_PATH, '/data.json')
  const sealgo = new SealGo(CONFIG_PATH)
  const picBedTypes = sealgo.helper.uploader.getIdList()
  const picBedFromDB = db.read().get('picBed.list').value() || []
  const picBeds = picBedTypes.map(item => {
    const visible = picBedFromDB.find(i => i.type === item) // object or undefined
    return {
      type: item,
      name: sealgo.helper.uploader.get(item).name || item,
      visible: visible ? visible.visible : true
    }
  })
  sealgo.cmd.program.removeAllListeners()
  return picBeds
}

export {
  getPicBeds
}

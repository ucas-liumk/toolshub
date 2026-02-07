const { rcedit } = require('rcedit')
const path = require('path')

exports.default = async function (context) {
  if (context.electronPlatformName !== 'win32') return
  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productName}.exe`)
  const iconPath = path.resolve('resources/icon.ico')
  console.log(`  • patching icon: ${exePath}`)
  await rcedit(exePath, { icon: iconPath })
}

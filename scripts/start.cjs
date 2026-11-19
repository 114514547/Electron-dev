const {spawn} = require('node:child_process');
const path = require('node:path');
const env = {...process.env};
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(require('electron'), [path.resolve(__dirname, '..'), ...process.argv.slice(2)], {stdio:'inherit', env});
child.on('error', error => {console.error('Electron startup failed:', error.message);process.exitCode=1;});
child.on('exit', code => {
  if (code) {
    console.error('Electron exited with code:',code,'(0x'+(code>>>0).toString(16)+')');
    if ((code>>>0)===0x80000003) console.error('Startup stopped before the application loaded. Check the Electron runtime Windows integrity label; do not disable the Chromium sandbox. See README.');
  }
  process.exitCode=code ? 1 : 0;
});

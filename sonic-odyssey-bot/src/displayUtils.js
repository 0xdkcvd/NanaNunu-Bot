const colors = require('colors');

function displayHeader() {
  process.stdout.write('\x1Bc');


  console.log();
  console.log('                                                                                   ');
  console.log('                                                                                   ');
  console.log('### ###                       ### ###                                               '.white);
  console.log(' ### #                         ### #                                                '.white);
  console.log(' ### #   ###   #####    ###    ### #  ### ##  #####   ### ##     ## ## ## ## ##### '.white);
  console.log(' # ###  ## ##   ## ##  ## ##   # ###   ## ##   ## ##   ## ##      ###  ## ##   ##  '.white);
  console.log(' # ###   ####   ## ##   ####   # ###   ## ##   ## ##   ## ##       #    ###   ###  '.white);
  console.log(' #  ##  ## ##   ## ##  ## ##   #  ##   ## ##   ## ##   ## ##  ##  ###   ###   ##   '.white);
  console.log('### ##   ##### ### ###  ##### ### ##    ##### ### ###   ##### ## ## ##   #   ##### '.white);
  console.log('                                                                       ###         '.white);
  console.log('                                                                       ##          '.white);
  console.log();

  console.log('      https://nananunu.xyz/                           '.white);
  console.log();
}

module.exports = {
  displayHeader,
};

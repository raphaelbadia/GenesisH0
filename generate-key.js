'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');

const keys = ['main', 'mainalert', 'testnetalert', 'mainspork', 'testnetspork'];

var output = '';

keys.forEach(keyName => {
  spawnSync('openssl',
    ['ecparam', '-genkey', '-name', 'secp256r1', '-out', `${keyName}.pem`]
  );

  let cmd = spawnSync('openssl',
    ['ec', '-in', `${keyName}.pem`, '-noout', '-text']
  )
  let stdout = cmd.stdout.toString().split('\n').join('')
  let privIndex = stdout.indexOf('priv:')
  let pubIndex = stdout.indexOf('pub:')
  let endIndex = stdout.indexOf('ASN1')

  let privateKey = formatKey(stdout.substring(privIndex + 5, pubIndex))
  let publicKey = formatKey(stdout.substring(pubIndex + 4, endIndex))

  output += `----${keyName} keys----\npublic: ${publicKey}\nprivate: ${privateKey}\n\n`;

  spawnSync('rm', [`${keyName}.pem`])
});

console.log(output);
fs.writeFile('./network-keys.txt', output, err => {
  if (err)
    console.error('error: ', err);
})

function formatKey(rawKey) {
  return rawKey.split(' ').join('').split(':').join('')
}

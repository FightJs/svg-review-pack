import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveConfig } from '../src/config.js';
test('defaults and explicit limits create the complete configuration',()=>{
 assert.deepEqual(effectiveConfig('{}'),{path:'input.svg',plugins:['preset-default'],floatPrecision:3,multipass:false,js2svg:{eol:'lf',pretty:false}});
 assert.equal(effectiveConfig('{"floatPrecision":6,"multipass":true}').floatPrecision,6);
});
test('rejects malformed, unknown, and invalid options',()=>{
 for(const text of ['[]','null','1','{"plugins":[]}','{"floatPrecision":-1}','{"floatPrecision":7}','{"floatPrecision":1.2}','{"multipass":"true"}','{']) assert.throws(()=>effectiveConfig(text));
});

async page => {
 const check=(condition,message)=>{if(!condition)throw Error(message)};
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4179/');
 await page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 const desktop=await page.evaluate(()=>{let input=document.querySelector('#input-panel').getBoundingClientRect(),result=document.querySelector('#result').getBoundingClientRect();return {input:input.toJSON(),result:result.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}});
 check(desktop.result.left>=desktop.input.right && !desktop.overflow,'desktop work areas should be side by side without horizontal overflow');
 await page.setViewportSize({width:375,height:812});
 const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,button:document.querySelector('#run').getBoundingClientRect().toJSON()}));
 check(!mobile.overflow && mobile.button.width>=44 && mobile.button.height>=44,'mobile layout or target size');
 return {desktop,mobile};
}

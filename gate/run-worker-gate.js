async page => {
 await page.goto('http://127.0.0.1:4179/');
 await page.waitForFunction(()=>document.body.textContent.trim().startsWith('['),{timeout:30000});
 const results=await page.evaluate(()=>JSON.parse(document.body.textContent));
 if(results.length!==12||results.some(x=>!x.equal))throw new Error(JSON.stringify(results));
 return results.map(({name,equal})=>({name,equal}));
}

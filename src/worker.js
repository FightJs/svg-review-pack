import { optimize } from 'svgo/browser';
self.onmessage=event=>{try {self.postMessage({data:optimize(event.data.input,event.data.config).data});}catch(error){self.postMessage({error:error.message});}};

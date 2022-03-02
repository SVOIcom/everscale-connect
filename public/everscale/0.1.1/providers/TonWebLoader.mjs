async function loadTonWeb(){
    let _fetch = window.fetch;
    window.fetch = (...args)=>{
        if(args[0] === '/tonclient.wasm'){
            console.log('TonWebModule: wasm fall calling detected');
            args[0] = 'https://everscale-connect.svoi.dev/tonclient.wasm';
        }
        return _fetch(...args)
    }

    try{
        await import("https://tonconnect.svoi.dev/ton/main.js");
    }catch (e) {
        console.log(e);
    }
    window.fetch = _fetch;
}

export default loadTonWeb;
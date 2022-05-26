import Web3Modal from "web3modal"
import {TippingLogic} from "./common/TippingLogic";

document.addEventListener('DOMContentLoaded',async ()=> {
    //
    // const web3Modal = new Web3Modal({
    //     network: 'mainnet',
    //     cacheProvider: false, // optional
    //     providerOptions: TippingLogic.providerOptions, // required
    //     disableInjectedProvider: false,
    // });
    // await web3Modal.clearCachedProvider();
    // let provider = await web3Modal.connect();
    // console.log({provider})
    // const web3 = new Web3(provider);
    // let accounts = await web3.eth.getAccounts();
    // let account = accounts[0];
    // console.log(account)
    //
    await TippingLogic.prepareTip()
    TippingLogic.sendTip('0xb794f5ea0ba39494ce839613fffba74279579268', 1, "MATIC")
});

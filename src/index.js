import Web3Modal from "web3modal"
import {TippingLogic} from "./common/TippingLogic";
import {TippingMain} from "./common/tippingMain";
import {create} from "fast-creator";
import css from "!!css-loader!sass-loader!./common/tippingStyle.scss";
import {TippingWaitingConfirmation} from "./common/tippingWaitingConfirmation";
import {TippingSuccess} from "./common/tippingSuccess";

document.addEventListener('DOMContentLoaded', async () => {
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
    let div = document.createElement('div')
    document.body.append(div);
    div.attachShadow({mode: 'open'})
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.tipping-popup')
    div.shadowRoot.append(popup);
    let params = new URL(document.location).searchParams;
    popup.append((new TippingWaitingConfirmation(params.get('identifier'))).html)
    popup.classList.add('tipping-popup');
    await TippingLogic.prepareTip()
    let success = await TippingLogic.sendTip(params.get('recipent'), +params.get('tippingValue'), params.get('network'), params.get('token'), params.get('message'))
    popup.firstElementChild.remove();
    if (success) {
        popup.append((new TippingSuccess(params.get('identifier'))).html)
    }
});
//http://localhost:8080/?recipent=0xb794f5ea0ba39494ce839613fffba74279579268&tippingValue=1&network=MATIC&token=ETH&message=test&identifier=@name
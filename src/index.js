import Web3Modal from "web3modal"
import {TippingLogic} from "./common/TippingLogic";
import {TippingMain} from "./common/tippingMain";
import {create} from "fast-creator";
import css from "!!css-loader!sass-loader!./common/tippingStyle.scss";
import {TippingWaitingConfirmation} from "./common/tippingWaitingConfirmation";
import {TippingSuccess} from "./common/tippingSuccess";

document.addEventListener('DOMContentLoaded', async () => {
    //
    const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: false, // optional
        providerOptions: TippingLogic.providerOptions, // required
        disableInjectedProvider: true,
    });
    await web3Modal.clearCachedProvider();
    let provider = await web3Modal.connect();
    console.log({provider})
    let params = new URL(document.location).searchParams;
    let div = document.createElement('div')
    document.body.append(div);
    div.attachShadow({mode: 'open'})
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.tipping-popup')
    div.shadowRoot.append(popup);
    popup.append((new TippingWaitingConfirmation(params.get('identifier'), +params.get('tippingValue'), params.get('token'))).html)
    popup.classList.add('tipping-popup');

    await TippingLogic.prepareTip(provider, params.get('network'))
    let {
        integer: amountInteger,
        normal: amountNormal
    } = await TippingLogic.calculateAmount(params.get('token'), +params.get('tippingValue'))

    popup.querySelector('.amountCoin').textContent = amountNormal;
    let success = await TippingLogic.sendTip(params.get('recipent'), amountInteger, params.get('network'), params.get('token'), params.get('message') ?? "")

    popup.firstElementChild.remove();
    if (success === true) {
        popup.append((new TippingSuccess(params.get('identifier'))).html)
    }
});
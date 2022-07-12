import Web3Modal from "web3modal"
import {TippingLogic} from "@idriss-crypto/tipping-core/tippingLogic";
import {TippingMain} from "@idriss-crypto/tipping-core/tippingMain";
import {create} from "fast-creator";
import css from "@idriss-crypto/tipping-core/tippingStyle";
import {TippingWaitingConfirmation} from "@idriss-crypto/tipping-core/tippingWaitingConfirmation";
import {TippingSuccess} from "@idriss-crypto/tipping-core/tippingSuccess";
import {TippingWaitingApproval} from "@idriss-crypto/tipping-core/tippingWaitingApproval";
import {TippingError} from "@idriss-crypto/tipping-core/tippingError";

document.addEventListener('DOMContentLoaded', async () => {
    //

    const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: false, // optional
        providerOptions: TippingLogic.providerOptions, // required
        disableInjectedProvider: true,
    });
    await web3Modal.clearCachedProvider();
    let provider
    try {
        provider = await web3Modal.connect();
        console.log({provider})
    } catch (ex) {
        provider = window.ethereum?.providers[0]
        if (!provider) {
            window.open('https://metamask.io/download/')
        }
    }

    let params = new URL(document.location).searchParams;
    let div = document.createElement('div')
    document.querySelector('.container').append(div);
    div.attachShadow({mode: 'open'})
    div.shadowRoot.addEventListener('close', () => document.location = 'https://idriss.xyz/')
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.tipping-popup')
    div.shadowRoot.append(popup);
    popup.classList.add('tipping-popup');
    try {
        popup.append(new TippingWaitingApproval(params.get('token')).html);

        await TippingLogic.prepareTip(provider, params.get('network'))
        popup.firstElementChild.remove();
        popup.append((new TippingWaitingConfirmation(params.get('identifier'), +params.get('tippingValue'), params.get('token'))).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await TippingLogic.calculateAmount(params.get('token'), +params.get('tippingValue'))

        popup.querySelector('.amountCoin').textContent = amountNormal;
        let success = await TippingLogic.sendTip(params.get('recipient'), amountInteger, params.get('network'), params.get('token'), params.get('message') ?? "")

        popup.firstElementChild.remove();
        if (success) {
            let explorerLink;
            if (params.get('network') == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionHash}`
            else if (params.get('network') == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionHash}`
            else if (params.get('network') == 'Polygon')
                explorerLink = `https://polygonscan.com/tx/${success.transactionHash}`
            popup.append((new TippingSuccess(params.get('identifier'), explorerLink)).html)
        } else {
            popup.append((new TippingError()).html)
            console.log({success})
        }
    } catch (e) {
        popup.firstElementChild?.remove();
        popup.append((new TippingError()).html)
        console.error(e)
    }
});
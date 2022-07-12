import Web3Modal from "web3modal"
import {TippingLogic} from "@idriss-crypto/tipping-core/tippingLogic";
import {TippingMain} from "@idriss-crypto/tipping-core/tippingMain";
import {create} from "fast-creator";
import css from "@idriss-crypto/tipping-core/tippingStyle";
import {TippingWaitingConfirmation} from "@idriss-crypto/tipping-core/tippingWaitingConfirmation";
import {TippingSuccess} from "@idriss-crypto/tipping-core/tippingSuccess";
import {TippingWaitingApproval} from "@idriss-crypto/tipping-core/tippingWaitingApproval";
import {TippingError} from "@idriss-crypto/tipping-core/tippingError";

async function getProvider() {
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
        console.error(ex)
    }
    if (!provider) {
        provider = window.ethereum?.providers[0]
    }
    if (!provider) {
        window.open('https://metamask.io/download/')
    }
    return provider;
}

document.addEventListener('DOMContentLoaded', async () => {

    let params = new URL(document.location).searchParams;
    let token = params.get('token');
    let tippingValue = +params.get('tippingValue');
    let network = params.get('network');

    let div = document.createElement('div')
    document.querySelector('.container').append(div);
    div.attachShadow({mode: 'open'})
    div.shadowRoot.addEventListener('close', () => document.location = 'https://idriss.xyz/')
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.tipping-popup')
    div.shadowRoot.append(popup);
    popup.classList.add('tipping-popup');
    try {
        if (!token || !tippingValue || !network) {
            popup.append(new TippingMain(token).html);
            await new Promise(res => {
                popup.addEventListener('sendMoney', e => {
                    console.log(e);
                    network = e.network;
                    token = e.token;
                    tippingValue = +e.amount;
                    res()
                })
            });
        }
        let provider = await getProvider();
        popup.firstElementChild?.remove();
        popup.append(new TippingWaitingApproval(token).html);

        await TippingLogic.prepareTip(provider, network)
        popup.firstElementChild.remove();
        popup.append((new TippingWaitingConfirmation(params.get('identifier'), tippingValue, token)).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await TippingLogic.calculateAmount(token, tippingValue)

        popup.querySelector('.amountCoin').textContent = amountNormal;
        let success = await TippingLogic.sendTip(params.get('recipient'), amountInteger, network, token, params.get('message') ?? "")

        popup.firstElementChild.remove();
        if (success) {
            let explorerLink;
            if (network == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionHash}`
            else if (network == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionHash}`
            else if (network == 'Polygon')
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
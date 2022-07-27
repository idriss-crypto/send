import {create} from "fast-creator";
import css from "@idriss-crypto/tipping-core/tippingStyle";
import {
    TippingSuccess,
    TippingWaitingConfirmation,
    TippingWaitingApproval,
    TippingError,
    TippingMain,
    TippingAddress
} from "@idriss-crypto/tipping-core/subpages";

document.addEventListener('DOMContentLoaded', async () => {
    const tippingLogicPromise = await import ("@idriss-crypto/tipping-core/tippingLogic")
    const getProviderPromise = import("@idriss-crypto/tipping-core/getWeb3Provider")


    let params = new URL(document.location).searchParams;
    let identifier = params.get('identifier');
    let recipient = params.get('recipient');
    let token = params.get('token');
    let tippingValue = +params.get('tippingValue');
    let network = params.get('network');

    let div = document.createElement('div')
    document.querySelector('.container').append(div);
    div.attachShadow({mode: 'open'})
    div.shadowRoot.addEventListener('close', () => {
        if (params.get('back') == 'close')
            window.close()
        else if (params.get('back'))
            return document.location = params.get('back');
        else
            return document.location = 'https://idriss.xyz/';
    })
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.tipping-popup')
    div.shadowRoot.append(popup);
    popup.classList.add('tipping-popup');
    try {
        console.log('aaaa')
        if (!identifier || !recipient) {
            popup.append(new TippingAddress().html);
            await new Promise(res => {
                popup.addEventListener('next', e => {
                    console.log(e);
                    identifier = e.identifier;
                    recipient = e.recipient;
                    res()
                })
            });
        }
        if (!token || !tippingValue || !network) {
            popup.firstElementChild?.remove();
            popup.append(new TippingMain(identifier).html);
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
        const {getProvider} = await getProviderPromise;
        let provider = await getProvider();
        popup.firstElementChild?.remove();
        popup.append(new TippingWaitingApproval(token).html);
        const {TippingLogic} = await tippingLogicPromise
        await TippingLogic.prepareTip(provider, network)
        popup.firstElementChild.remove();
        popup.append((new TippingWaitingConfirmation(identifier, tippingValue, token)).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await TippingLogic.calculateAmount(token, tippingValue)

        popup.querySelector('.amountCoin').textContent = amountNormal;
        let success = await TippingLogic.sendTip(recipient, amountInteger, network, token, params.get('message') ?? "")

        popup.firstElementChild.remove();
        if (success) {
            let explorerLink;
            if (network == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionHash}`
            else if (network == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionHash}`
            else if (network == 'Polygon')
                explorerLink = `https://polygonscan.com/tx/${success.transactionHash}`
            popup.append((new TippingSuccess(identifier, explorerLink)).html)
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
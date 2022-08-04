import {create} from "fast-creator";
import css from "@idriss-crypto/send-to-anyone-core/sendToAnyoneStyle.mjs";
import {
    SendToAnyoneSuccess,
    SendToAnyoneWaitingConfirmation,
    SendToAnyoneWaitingApproval,
    SendToAnyoneError,
    SendToAnyoneMain,
    SendToAnyoneAddress
} from "@idriss-crypto/send-to-anyone-core/subpages.mjs";

document.addEventListener('DOMContentLoaded', async () => {
    const sendToAnyoneLogicPromise = await import ("@idriss-crypto/send-to-anyone-core/sendToAnyoneLogic.mjs")
    const getProviderPromise = import("@idriss-crypto/send-to-anyone-core/getWeb3Provider.mjs")


    let params = new URL(document.location).searchParams;
    let identifier = params.get('identifier');
    let recipient = params.get('recipient');
    let token = params.get('token');
    let sendToAnyoneValue = +params.get('sendToAnyoneValue');
    let network = params.get('network');
    let message = params.get('message')||'';

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
    let popup = create('section.sendToAnyone-popup')
    div.shadowRoot.append(popup);
    popup.classList.add('sendToAnyone-popup');
    try {
        if (!identifier || !recipient) {
            popup.append(new SendToAnyoneAddress().html);
            await new Promise(res => {
                popup.addEventListener('next', e => {
                    console.log(e);
                    identifier = e.identifier;
                    recipient = e.recipient;
                    res()
                })
            });
        }
        if (!token || !sendToAnyoneValue || !network) {
            popup.firstElementChild?.remove();
            popup.append(new SendToAnyoneMain(identifier).html);
            await new Promise(res => {
                popup.addEventListener('sendMoney', e => {
                    console.log(e);
                    network = e.network;
                    token = e.token;
                    sendToAnyoneValue = +e.amount;
                    message = e.message;
                    res()
                })
            });
        }
        const {getProvider} = await getProviderPromise;
        let provider = await getProvider();
        popup.firstElementChild?.remove();
        popup.append(new SendToAnyoneWaitingApproval(token).html);
        const {SendToAnyoneLogic} = await sendToAnyoneLogicPromise
        await SendToAnyoneLogic.prepareSendToAnyone(provider, network)
        popup.firstElementChild.remove();
        popup.append((new SendToAnyoneWaitingConfirmation(identifier, sendToAnyoneValue, token)).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue)

        popup.querySelector('.amountCoin').textContent = amountNormal;
        let success = await SendToAnyoneLogic.sendSendToAnyone(recipient, amountInteger, network, token, message)

        popup.firstElementChild.remove();
        if (success) {
            let explorerLink;
            if (network == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionHash}`
            else if (network == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionHash}`
            else if (network == 'Polygon')
                explorerLink = `https://polygonscan.com/tx/${success.transactionHash}`
            popup.append((new SendToAnyoneSuccess(identifier, explorerLink)).html)
        } else {
            popup.append((new SendToAnyoneError()).html)
            console.log({success})
        }
    } catch (e) {
        popup.firstElementChild?.remove();
        popup.append((new SendToAnyoneError()).html)
        console.error(e)
    }
});
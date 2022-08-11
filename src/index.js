import {create} from "fast-creator";
import css from "@idriss-crypto/send-to-anyone-core/sendToAnyoneStyle";
import {
    SendToAnyoneSuccess,
    SendToAnyoneWaitingConfirmation,
    SendToAnyoneWaitingApproval,
    SendToAnyoneError,
    SendToAnyoneMain,
    SendToAnyoneAddress
} from "@idriss-crypto/send-to-anyone-core/subpages";
let addressNFTs
document.addEventListener('DOMContentLoaded', async () => {
    const sendToAnyoneLogicPromise = await import ("@idriss-crypto/send-to-anyone-core/sendToAnyoneLogic")
    const getProviderPromise = import("@idriss-crypto/send-to-anyone-core/getWeb3Provider")
    const sendToAnyoneUtilsPromise = import("@idriss-crypto/send-to-anyone-core/sendToAnyoneUtils")

    let params = new URL(document.location).searchParams;
    let identifier = params.get('identifier');
    let recipient = params.get('recipient');
    let token = params.get('token');
    let sendToAnyoneValue = +params.get('sendToAnyoneValue');
    let network = params.get('network');
    let message = params.get('message')||'';
    let isIDrissRegistered;
    let assetType;
    let assetAmount;
    let assetAddress;
    let assetId;

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
        //TODO: wrap this into additional subpage with connect button
        const {getProvider} = await getProviderPromise;
        const {getNFTsForAddress} = await sendToAnyoneUtilsPromise;
        let provider = await getProvider();
        const {SendToAnyoneLogic} = await sendToAnyoneLogicPromise
        await SendToAnyoneLogic.prepareSendToAnyone(provider, network ?? 'Polygon', ALCHEMY_API_KEY)
        console.log(SendToAnyoneLogic.web3)
        const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
        let selectedAccount = accounts[0];
        addressNFTs = getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY)
        //TODO: end ^^^^^

        if (!identifier || !recipient) {
            popup.append(new SendToAnyoneAddress().html);
            await new Promise(res => {
                popup.addEventListener('next', e => {
                    console.log(e);
                    identifier = e.identifier;
                    recipient = e.recipient;
                    isIDrissRegistered = e.isIDrissRegistered;
                    res()
                })
            });
        }
        if (!token || !sendToAnyoneValue || !network) {
            popup.firstElementChild?.remove();
            // ToDo: Filter for exsting v.title
            const nfts = (await addressNFTs).ownedNfts.map((v, i, a) => {
                return {
                    name: v.title,
                    address: v.contract.address,
                    id: v.tokenId,
                    image: v.media[0].gateway,
                }
            })
            console.log(addressNFTs)
            console.log(nfts)

            popup.append(new SendToAnyoneMain(identifier, isIDrissRegistered, nfts).html);
            await new Promise(res => {
                popup.addEventListener('sendMoney', e => {
                    console.log(e);
                    network = e.network;
                    token = e.token;
                    sendToAnyoneValue = +e.amount;
                    message = e.message;
                    assetType = e.assetType;
                    assetAmount = e.assetAmount;
                    assetAddress = e.assetAddress;
                    assetId = e.assetId;
                    res()
                })
            });
        }
        popup.firstElementChild?.remove();
        popup.append(new SendToAnyoneWaitingApproval(token).html);
        popup.firstElementChild.remove();
        popup.append((new SendToAnyoneWaitingConfirmation(identifier, sendToAnyoneValue, token, assetAmount, assetId, assetType)).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue)

        popup.querySelector('.amountCoin').textContent = amountNormal;
        //TODO: check price calculation + if it adds $fee properly
        let success = await SendToAnyoneLogic.sendToAnyone(identifier, `${amountInteger}`, network, token, message,
            assetType, assetAmount, assetAddress, assetId)
        console.log(success)

        popup.firstElementChild.remove();
        if (success) {
            let explorerLink;
            if (network == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionReceipt.transactionHash}`
            else if (network == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionReceipt.transactionHash}`
            else if (network == 'Polygon')
                explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + `/tx/${success.transactionReceipt.transactionHash}`
            console.log(explorerLink)
            popup.append((new SendToAnyoneSuccess(identifier, explorerLink, success.claimPassword, isIDrissRegistered,
                            assetAmount, assetId, assetType, assetAddress)).html)
        } else {
            popup.append((new SendToAnyoneError({name: 'Reverted', message: 'Transaction was not successful'})).html)
            console.log({success})
        }
    } catch (e) {
        popup.firstElementChild?.remove();
        popup.append((new SendToAnyoneError(e)).html)
        console.error(e)
    }
});
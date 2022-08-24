import {create} from "fast-creator";
import css from "@idriss-crypto/send-to-anyone-core/sendToAnyoneStyle";
import {
    SendToAnyoneSuccess,
    SendToAnyoneWaitingConfirmation,
    SendToAnyoneWaitingApproval,
    SendToAnyoneError,
    SendToAnyoneMain,
    SendToAnyoneConnect,
    SendToAnyoneAddress
} from "@idriss-crypto/send-to-anyone-core/subpages";

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
    let selectedNFT;
    let nftName;

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
    div.shadowRoot.addEventListener('closeError', () => {
        return document.location = 'https://idriss.xyz/sendToAnyone';
    })
    div.shadowRoot.addEventListener('discordSendError', () => {
        const url =  'https://discord.gg/VMcJ9uF6u8';
        window.open(url, '_blank');
    })
    div.shadowRoot.append(create('style', {text: css}));
    let popup = create('section.sendToAnyone-popup')
    div.shadowRoot.append(popup);
    popup.classList.add('sendToAnyone-popup');
    try {
        const {getProvider} = await getProviderPromise;
        const {getNFTsForAddress} = await sendToAnyoneUtilsPromise;
        const {SendToAnyoneLogic} = await sendToAnyoneLogicPromise;

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
            popup.append(new SendToAnyoneConnect(identifier, isIDrissRegistered).html);
            let addressNFTs;
            await new Promise(res => {
                popup.addEventListener('connectWallet', async e => {
                    console.log(e)
                    let provider = await getProvider();
                    await SendToAnyoneLogic.prepareSendToAnyone(provider, network ?? 'Polygon', ALCHEMY_API_KEY)
                    console.log(SendToAnyoneLogic.web3)
                    const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
                    let selectedAccount = accounts[0];
                    if (e.method == "connect") {
                        addressNFTs = await getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY)
                        // filter erc721 and existing titles
                        console.log(SendToAnyoneLogic.web3)
                        const nfts = (await addressNFTs).ownedNfts.filter((v, i, a) => v.title != "").filter((v, i, a) => v.tokenType == "ERC721").map((v, i, a) => {
                            return {
                                name: v.title,
                                address: v.contract.address,
                                id: v.tokenId,
                                image: v.media[0].gateway,
                            }
                        })
                        console.log(addressNFTs)
                        console.log(nfts)

                        popup.firstElementChild?.remove();

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
                                selectedNFT = nfts.filter(nft => nft.address == assetAddress).filter(nft => nft.id == assetId)
                                nftName = (selectedNFT[0] != undefined) ? selectedNFT[0].name : "";
                                res()
                            })
                        });
                    } else {
                        network = e.network;
                        token = e.token;
                        sendToAnyoneValue = +e.amount;
                        message = e.message;
                        assetType = e.assetType;
                        assetAmount = e.assetAmount;
                        assetAddress = e.assetAddress;
                        assetId = e.assetId;
                        nftName = "";
                        res()
                    }
                    res()
                })
            });
        }
        // ToDo: approval screen will never be rendered completely as it is overwritten by the waitingConfirmation screen
        popup.firstElementChild?.remove();
        popup.append(new SendToAnyoneWaitingApproval(token).html);
        popup.firstElementChild.remove();
        popup.append((new SendToAnyoneWaitingConfirmation(identifier, sendToAnyoneValue, token, assetAmount, assetId, assetType, nftName)).html)
        let {
            integer: amountInteger,
            normal: amountNormal
        } = await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue)

        popup.querySelector('.amountCoin').textContent = amountNormal;
        //TODO: check price calculation + if it adds $fee properly
        console.log(identifier, `${amountInteger}`, network, token, message,
            assetType, assetAmount, assetAddress, assetId)
        let success = await SendToAnyoneLogic.sendToAnyone(identifier, `${amountInteger}`, network, token, message,
            assetType, assetAmount, assetAddress, assetId)
        console.log(success)
        popup.firstElementChild.remove();
        let blockNumber;
        let txnHash;
        if (success) {
            blockNumber = success.transactionReceipt.blockNumber;
            txnHash = success.transactionReceipt.transactionHash;
            let explorerLink;
            if (network == 'ETH')
                explorerLink = `https://etherscan.io/tx/${success.transactionReceipt.transactionHash}`
            else if (network == 'BSC')
                explorerLink = `https://bscscan.com/tx/${success.transactionReceipt.transactionHash}`
            else if (network == 'Polygon')
                explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + `/tx/${success.transactionReceipt.transactionHash}`
            console.log(explorerLink)
            // add success.transactionReceipt.blockNumber to url so we don't have to query
            popup.append((new SendToAnyoneSuccess(identifier, explorerLink, success.claimPassword, isIDrissRegistered,
                            assetAmount, assetId, assetType, assetAddress, token, blockNumber, txnHash)).html)
        } else {
            popup.append((new SendToAnyoneError({name: 'Reverted', message: 'Transaction was not successful'})).html)
            console.log({success})
        }
    } catch (e) {
        // ToDo: catch different error types here
        // Errors will be reported on Discord
        popup.firstElementChild?.remove();
        popup.append((new SendToAnyoneError(e)).html)
        console.error(e)
    }
});
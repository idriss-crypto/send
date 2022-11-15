import {
    create
} from "fast-creator";
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

console.log("test1");

document.addEventListener('DOMContentLoaded', async() => {
    const sendToAnyoneLogicPromise = await
    import ("@idriss-crypto/send-to-anyone-core/sendToAnyoneLogic")
    const getProviderPromise =
        import ("@idriss-crypto/send-to-anyone-core/getWeb3Provider")
    const sendToAnyoneUtilsPromise =
        import ("@idriss-crypto/send-to-anyone-core/sendToAnyoneUtils")



    let params = new URL(document.location).searchParams;
    let identifier = params.get('identifier');
    let recipient = params.get('recipient');
    let token = params.get('token');
    let sendToAnyoneValue = +params.get('sendToAnyoneValue');
    let network = params.get('network');
    let message = params.get('message') || '';
    let isIDrissRegistered;
    let assetType;
    let assetAmount;
    let assetAddress;
    let assetId;
    let selectedNFT;
    let nftName;

    let div = document.createElement('div')
    document.querySelector('.container').append(div);
    div.attachShadow({
        mode: 'open'
    })
    div.shadowRoot.addEventListener('close', () => {
        if (params.get('back') == 'close')
            window.close()
        else if (params.get('back'))
            return document.location = params.get('back');
        else
            return document.location = '/send';
    })
    div.shadowRoot.addEventListener('closeError', () => {
        return document.location = '/send';
    })
    div.shadowRoot.addEventListener('discordSendError', () => {
        const url = 'https://discord.gg/VMcJ9uF6u8';
        window.open(url, '_blank');
    })
    div.shadowRoot.append(create('style', {
        text: css
    }));

    let popupToken = create('section.sendToAnyone-popup')
    popupToken.id = "popupToken"
    div.shadowRoot.append(popupToken);
    popupToken.classList.add('sendToAnyone-popup');
    let popupNFT = create('section.sendToAnyone-popup')
    popupNFT.id = "popupNFT"
    popupNFT.style.display='none';
    div.shadowRoot.append(popupNFT);
    popupNFT.classList.add('sendToAnyone-popup');


    document.querySelector('#triggerSuccessButton').addEventListener('click', () => {
        popupToken.firstElementChild.remove();
        popupToken.append((new SendToAnyoneSuccess("@test", "https://www.idriss.xyz", "abc", false, 1, 1, 1, "0x", "Matic", 1, "0x")).html);
    });

    document.querySelector('#triggerErrorButton').addEventListener('click', () => {
        popupToken.firstElementChild.remove();
        popupToken.append((new SendToAnyoneError({
            name: 'Reverted',
            message: 'Transaction was not successful'
        })).html)
    });


    try {
        const {
            getProvider
        } = await getProviderPromise;
        const {
            getNFTsForAddress
        } = await sendToAnyoneUtilsPromise;
        const {
            SendToAnyoneLogic
        } = await sendToAnyoneLogicPromise;

        let popups = { 'selected': popupToken, 'deselected': popupNFT }

        console.log(popups)

        async function showInputWidget() {
            popups.selected.firstElementChild?.remove();
            popups.selected.append(new SendToAnyoneAddress().html);
            return await new Promise(res => {
                popups.selected.addEventListener('next', e => {
                    console.log(e);
                    identifier = e.identifier;
                    recipient = e.recipient;
                    isIDrissRegistered = e.isIDrissRegistered;
                    res()
                })
            });
        }

        async function handleNFTclick() {
            console.log("NFT button clicked")
            popups.selected = popupNFT
            popupToken.style.display='none';
            popupNFT.style.display='block';
            await showInputWidget();
            // connect wallet when needed
            let provider = await getProvider();
            await SendToAnyoneLogic.prepareSendToAnyone(provider, network ?? 'Polygon', ALCHEMY_API_KEY);
            console.log(SendToAnyoneLogic.web3)
            const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
            let selectedAccount = accounts[0];
            let addressNFTs = await getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY)

            const nfts = (await addressNFTs).ownedNfts.filter((v, i, a) => v.title != "").filter((v, i, a) => v.tokenType == "ERC721").map((v, i, a) => {
                return {
                    name: v.title,
                    address: v.contract.address,
                    id: v.tokenId,
                    image: v.media[0].gateway,
                }
            });
            console.log(nfts)

            popupNFT.firstElementChild?.remove();

            popupNFT.append(new SendToAnyoneMain(identifier, isIDrissRegistered, nfts, true, null, true).html);
            popupNFT.addEventListener('sendMoney', e => {
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
                            });
        }
        async function handleTokenClick() {
            console.log("Token button clicked")
            popupNFT.style.display='none';
            popupToken.style.display='block';
            popups.selected = popupToken;
            await showInputWidget();
            popupToken.firstElementChild?.remove();
            let nfts=[]
            popupToken.append(new SendToAnyoneMain(identifier, isIDrissRegistered, nfts).html);
            // probably not await, as code stops
            popupToken.addEventListener('sendMoney', e => {
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
                                // make call to display all the other popus below
                            });
        }


        // handle nft button click
        let nftButton = document.querySelector('#nftSelectButton');
        nftButton.addEventListener('click', async e => {
            return await handleNFTclick();
        })

        // handle token button click
        let tokenButton = document.querySelector('#tokenSelectButton');
        tokenButton.addEventListener('click', async e => {
            return await handleTokenClick();
        })

        await tokenButton.click()

        async function handleRest() {

            // ToDo: approval screen will never be rendered completely as it is overwritten by the waitingConfirmation screen
            popups.selected.firstElementChild?.remove();
            popups.selected.append(new SendToAnyoneWaitingApproval(token).html);
            popups.selected.firstElementChild.remove();
            popups.selected.append((new SendToAnyoneWaitingConfirmation(identifier, sendToAnyoneValue, token, assetAmount, assetId, assetType, nftName)).html)
            let {
                integer: amountInteger,
                normal: amountNormal
            } = await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue)


            popups.selected.querySelector('.amountCoin').textContent = amountNormal;
            //TODO: check price calculation + if it adds $fee properly
            console.log(identifier, `${amountInteger}`, network, token, message,
                assetType, assetAmount, assetAddress, assetId)
            let success = await SendToAnyoneLogic.sendToAnyone(identifier, `${amountInteger}`, network, token, message,
                assetType, assetAmount, assetAddress, assetId)
            console.log(success)
            popups.selected.firstElementChild.remove();
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
                popups.selected.append((new SendToAnyoneSuccess(identifier, explorerLink, success.claimPassword, isIDrissRegistered,
                    assetAmount, assetId, assetType, assetAddress, token, blockNumber, txnHash)).html)
            } else {
                popups.selected.append((new SendToAnyoneError({
                    name: 'Reverted',
                    message: 'Transaction was not successful'
                })).html)
                console.log({
                    success
                })
            }
        }
    } catch (e) {
        console.log(e)
        // ToDo: catch different error types here
        // Errors will be reported on Discord
        popups.selected.firstElementChild?.remove();
        popups.selected.append((new SendToAnyoneError(e)).html)
        console.error(e)
    }
});
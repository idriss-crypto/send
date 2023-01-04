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
    SendToAnyoneAddress,
    MultiSendToAnyone,
    MultiSendToAnyoneApproval,
    MultiSendToAnyoneSuccess
} from "@idriss-crypto/send-to-anyone-core/subpages";

// ToDo: event listener to send transaction is set to popup, which piles up multiple listeners as popups are never deleted, just their children


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
    let provider;
    let walletTag;

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

    let popupToken = create('section')
    popupToken.id = "popupToken"
    div.shadowRoot.append(popupToken);
    popupToken.classList.add('sendToAnyone-popup');
    let popupNFT = create('section')
    popupNFT.id = "popupNFT"
    popupNFT.style.display='none';
    div.shadowRoot.append(popupNFT);
    popupNFT.classList.add('sendToAnyone-popup');
    let popupMulti = create('section')
    popupMulti.id = "popupMulti"
    popupMulti.style.display='none';
    div.shadowRoot.append(popupMulti);
    popupMulti.classList.add('multiSendToAnyone-popup');


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

        let popups = { 'selected': popupToken }


        async function connectWallet() {
            provider = await getProvider();
            await SendToAnyoneLogic.prepareSendToAnyone(provider, network ?? 'Polygon', ALCHEMY_API_KEY)
            document.querySelector('#connectWallet').classList.add('hidden');
            document.querySelector('#connectedWallet').classList.remove('hidden');
            let accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
            document.querySelector('#connectedWallet').firstElementChild.value = accounts[0].substring(0, 6).concat("...").concat(accounts[0].substr(-4))
            document.querySelector('#polygon-scan-link').href = POLYGON_BLOCK_EXPLORER_ADDRESS + "/address/" + accounts[0];
        }

        async function disconnectWallet() {
            provider = null;
            document.querySelector('#connectWallet').classList.remove('hidden');
            document.querySelector('#connectedWallet').classList.add('hidden');
        }

        document.querySelector('#connectWallet').addEventListener('click', async () => {
            await connectWallet();
        });

        document.querySelector('#disconnectWallet').addEventListener('click', async () => {
            await disconnectWallet();
        });

        async function showInputWidget(type) {
            popups.selected.append(new SendToAnyoneAddress(type).html);
            return await new Promise((res) => {

                async function nextEventHandler(e) {
                    console.log(e);
                    identifier = e.identifier;
                    recipient = e.recipient;
                    isIDrissRegistered = e.isIDrissRegistered;
                    walletTag = e.walletTag ? e.walletTag : "Public ETH";
                    res()
                }

                popups.selected.firstElementChild.addEventListener('next', nextEventHandler);
            });
        }

        async function handleNFTclick() {

            document.querySelector('#nftSelectButton').className = "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            document.querySelector('#tokenSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            //document.querySelector('#multiSendSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

            popups.selected.firstElementChild?.remove();
            popupToken.style.display='none';
            popupMulti.style.display='none';
            popupNFT.style.display='block';
            popups.selected = popupNFT
            await showInputWidget("nft");
            // connect wallet when needed
            if (!provider) {
                await connectWallet()
            }
            console.log(SendToAnyoneLogic.web3)
            const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
            let selectedAccount = accounts[0];

            let addressNFTsPolygon = await getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY, 'Polygon')
            let addressNFTsEthereum = await getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY, 'Ethereum')

            console.log(addressNFTsPolygon)
            console.log(addressNFTsEthereum)

            function appendNFTs(addressNFTs, network) {
                return addressNFTs.ownedNfts
                    .filter((v, i, a) => v.title != "")
                    .filter((v, i, a) => v.tokenType == "ERC721" || v.tokenType == "ERC1155")
                    .map((v, i, a) => {
                        try {
                            let image = v.media[0].gateway ? v.media[0].gateway : "";
                            if (image.startsWith("ipfs://")) image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
                            return {
                            name: v.title,
                            address: v.contract.address,
                            id: BigInt(v.tokenId).toString(10),
                            type: v.tokenType,
                            image: image,
                            network: network,
                        };
                        } catch { return {name: "dummy name" , address:"0x", id: 0, type: "ERC721", img: "https://ipfs.io/ipfs/", network: "polygon"}
                         }
                    });
            }

            let nfts = appendNFTs(addressNFTsPolygon, "Polygon");
            nfts = nfts.concat(appendNFTs(addressNFTsEthereum, "ETH"));

            console.log(nfts)

            nfts = nfts.filter((v, i, a) => v.address != "0x")

            popupNFT.firstElementChild?.remove();

            popupNFT.append(new SendToAnyoneMain(identifier, isIDrissRegistered, nfts, true, null, true).html);
            popupNFT.firstElementChild?.addEventListener('sendMoney', e => {
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
                                handleRest();
                            });
        }
        async function handleTokenClick() {

            document.querySelector('#tokenSelectButton').className = "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            document.querySelector('#nftSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            //document.querySelector('#multiSendSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

            popups.selected.firstElementChild?.remove();
            popupNFT.style.display='none';
            popupMulti.style.display='none';
            popupToken.style.display='block';
            popups.selected = popupToken;
            await showInputWidget("token");
            popupToken.firstElementChild?.remove();
            let nfts=[]
            popupToken.append(new SendToAnyoneMain(identifier, isIDrissRegistered, nfts).html);
            // probably not await, as code stops
            popupToken.firstElementChild?.addEventListener('sendMoney', e => {
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
                                handleRest();
                            });
        }
        async function handleMultiSendClick() {

            //document.querySelector('#multiSendSelectButton').className = "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            document.querySelector('#nftSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
            document.querySelector('#tokenSelectButton').className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

            popups.selected.firstElementChild?.remove();
            popupNFT.style.display='none';
            popupToken.style.display='none';
            popupMulti.style.display='block';
            popups.selected = popupMulti;

            // connect wallet when needed
            if (!provider) {
                await connectWallet()
            }

            console.log(SendToAnyoneLogic.web3)
            const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
            let selectedAccount = accounts[0];

            let addressNFTsPolygon = await getNFTsForAddress(selectedAccount, ALCHEMY_API_KEY, 'Polygon')

            console.log(addressNFTsPolygon)

            function filterNFTs(addressNFTs, network) {
                return addressNFTs.ownedNfts
                    .filter((v, i, a) => v.title != "")
                    .filter((v, i, a) => v.tokenType == "ERC1155")
                    .map((v, i, a) => {
                        try {
                            let image = v.media[0].gateway ? v.media[0].gateway : "";
                            if (image.startsWith("ipfs://")) image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
                            return {
                                name: v.title,
                                address: v.contract.address,
                                id: BigInt(v.tokenId).toString(10),
                                type: v.tokenType,
                                image: image,
                                network: network,
                            };
                        } catch { return {name: "dummy name" , address:"0x", id: 0, type: "ERC721", img: "https://ipfs.io/ipfs/", network: "polygon"}
                         }
                    });
            }

            let nfts = filterNFTs(addressNFTsPolygon, "Polygon");

            console.log(nfts)

            nfts = nfts.filter((v, i, a) => v.address != "0x")

            popupMulti.append(new MultiSendToAnyone(nfts, selectedAccount).html);

            popupMulti.firstElementChild?.addEventListener('multiSendMoney', e => {
                console.log("Got multiSendEvent: ", e)
                                multiHandleRest(e);
                            });
        }


        // handle nft button click
        let nftButton = document.querySelector('#nftSelectButton');
        nftButton.addEventListener('click', async e => {
            console.log("Clicked NFT")
            return await handleNFTclick();
        })

        // handle token button click
        let tokenButton = document.querySelector('#tokenSelectButton');
        tokenButton.addEventListener('click', async e => {
            console.log("Clicked token")
            return await handleTokenClick();
        })

        let multiSendButton = document.querySelector('#multiSendSelectButton');
        multiSendButton.addEventListener('click', async e => {
            console.log("Clicked multi")
            return await handleMultiSendClick();
        })

        await tokenButton.click()

        async function handleRest() {

            if (!provider) {
                await connectWallet();
            }

            console.log(SendToAnyoneLogic.web3)
            const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();

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
                assetType, assetAmount, assetAddress, assetId, walletTag)
            console.log("Success is: ", success)
            popups.selected.firstElementChild.remove();
            let blockNumber;
            let txnHash;
            if (success) {
                blockNumber = success.blockNumber? success.blockNumber : success.transactionReceipt.blockNumber;
                txnHash = success.transactionHash? success.transactionHash : success.transactionReceipt.transactionHash;
                let explorerLink;
                if (network == 'ETH')
                    explorerLink = `https://etherscan.io/tx/${txnHash}`
                else if (network == 'BSC')
                    explorerLink = `https://bscscan.com/tx/${txnHash}`
                else if (network == 'Polygon')
                    explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + `/tx/${txnHash}`
                console.log(explorerLink)
                    // add success.blockNumber to url so we don't have to query
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

        async function multiHandleRest(e) {
            let recipients = e.multiSendArr;
            console.log(recipients)
            let token = e.token;

            if (!provider) {
                await connectWallet();
            }

            console.log(SendToAnyoneLogic.web3)
            const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();

            let assetName = recipients[0].asset.type

            popups.selected.firstElementChild.remove();
            popups.selected.append((new MultiSendToAnyoneApproval(token)).html)

//            let {
//                integer: amountInteger,
//                normal: amountNormal
//            } = await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue)

            console.log("Sending to: ", recipients)
            let success = await SendToAnyoneLogic.multiSendToAnyone(recipients)
            console.log("Success is: ", success)
            try {
                // should be the claim links to download with download button as csv
                console.log(success.data)
            } catch {
                console.log("no data found")
            }
            popups.selected.firstElementChild.remove();
            let txnHash;
            if (success) {
                txnHash = success.transactionHash;
                let explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + `/tx/${success.transactionHash}`
                console.log(explorerLink)
                //ToDo: check eligibility of params
                popups.selected.append((new MultiSendToAnyoneSuccess(explorerLink, success.claimPassword, isIDrissRegistered,
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
        console.log("Caught error:", e)
        // ToDo: catch different error types here
        // Errors will be reported on Discord
        popups.selected.firstElementChild?.remove();
        popups.selected.append((new SendToAnyoneError(e)).html)
        console.error(e)
    }
});
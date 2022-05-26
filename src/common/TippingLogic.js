import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min.js";
import {CoinbaseWalletProvider} from "@depay/coinbase-wallet-sdk"
import Web3 from "web3/dist/web3.min.js";
let oracleAddress=[];

let abiTippingContract = [{
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "recipientAddress",
        "type": "address"
    }, {"indexed": false, "internalType": "string", "name": "message", "type": "string"}],
    "name": "TipMessage",
    "type": "event"
}, {
    "inputs": [{"internalType": "address", "name": "adminAddress", "type": "address"}],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "admins",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "contractOwner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "adminAddress", "type": "address"}],
    "name": "deleteAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "recipient_", "type": "address"}, {
        "internalType": "string",
        "name": "message_",
        "type": "string"
    }], "name": "sendTo", "outputs": [], "stateMutability": "payable", "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "amount_", "type": "uint256"}, {
        "internalType": "address",
        "name": "tokenContractAddr_",
        "type": "address"
    }, {"internalType": "address", "name": "recipient_", "type": "address"}, {
        "internalType": "string",
        "name": "message_",
        "type": "string"
    }], "name": "sendTokenTo", "outputs": [], "stateMutability": "payable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferContractOwnership",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}, {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "tokenContract", "type": "address"}],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]
let tippingAddressETH = "";
let tippingAddressPolygon = "";
let tippingAddressBSC = "";


export const TippingLogic = {
    provider: null,
    async prepareTip(chain, coin, address, amountUSD) {
        console.log('prepareTip')
        console.log('dddddd')
        if (typeof window.ethereum !== 'undefined') {
            let providers = window.ethereum.providers;
            if (providers) {
                this.provider = providers.find(p => p.isMetaMask);
            } else {
                this.provider = window.ethereum
            }
            try {
                await this.provider.request({method: 'eth_requestAccounts'});
            } catch (error) {
                throw new Error("User Rejected");
            }
        } else {
            throw new Error("No MetaMask Wallet found");
        }
        console.log("MetaMask provider", this.provider);
    },
    tallyOpts: {
        "custom-tally": {
            display: {
                logo: "../static/images/tally.svg",
                name: "Tally",
                description: "Coming Soon"
            },
            package: true,
            connector: async () => {
                if (!TippingLogic.isTallyInstalled()) {
                    window.open("https://tally.cash/community-edition", '_blank'); // <-- LOOK HERE
                    throw new Error("Tally not supported yet.");
                }

                let provider = null;
                if (typeof window.ethereum !== 'undefined') {
                    /*
                    provider = window.ethereum
                    try {
                        await provider.request({ method: 'eth_requestAccounts' });
                    } catch (error) {
                        throw new Error("User Rejected");
                    }
                    */
                    throw new Error("Tally not supported yet.");
                } else {
                    throw new Error("No Tally Wallet found");
                }
                console.log("Tally provider", provider);
                return provider;
            }
        }
    },
    walletConnectOpts: {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    1: 'https://eth-mainnet.alchemyapi.io/v2/NcZapwC9N6OhvtRKvjGhc23st5VmG2hB'
                },
                network: "mainnet",
            }
        }
    },
    metaMaskOpts: {
        "custom-metamask": {
            display: {
                logo: "../static/images/metamask-logo.svg",
                name: "MetaMask",
                description: "Connect to your MetaMask Wallet"
            },
            package: true,
            connector: async () => {
                // if (!TippingLogic.isMetaMaskInstalled()) {
                //     window.open("https://metamask.io/download/", '_blank'); // <-- LOOK HERE
                //     return;
                // }

                let provider = null;
                console.log('dddddd')
                window.ethereum = await getPageVar('ethereum')
                if (typeof window.ethereum !== 'undefined') {
                    let providers = window.ethereum.providers;
                    if (providers) {
                        provider = providers.find(p => p.isMetaMask);
                    } else {
                        provider = window.ethereum
                    }
                    try {
                        await provider.request({method: 'eth_requestAccounts'});
                    } catch (error) {
                        throw new Error("User Rejected");
                    }
                } else {
                    throw new Error("No MetaMask Wallet found");
                }
                console.log("MetaMask provider", provider);
                return provider;
            }
        }
    },
    walletLinkOpts: {
        'custom-walletlink': {
            display: {
                logo: '../static/images/coinbase.svg',
                name: 'Coinbase',
                description: 'Scan with WalletLink to connect',
            },
            options: {
                appName: 'IDriss', // Your app name
                rpc: "https://eth-mainnet.alchemyapi.io/v2/NcZapwC9N6OhvtRKvjGhc23st5VmG2hB",
                chainId: 1
            },
            package: CoinbaseWalletProvider,
            connector: async (_, options) => {
                const {appName, networkUrl, chainId} = options
                const walletLink = new WalletLink({
                    appName
                });
                const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
                await provider.enable();
                return provider;
            },
        }
    },
    get providerOptions() {
        return {
            ...this.walletConnectOpts,
            ...this.walletLinkOpts,
            ...this.metaMaskOpts,
            ...this.tallyOpts
        }
    },
    isMetaMaskInstalled() {
        if (window.ethereum?.isMetaMask) {
            return true
        } else {
            return false
        }
    },
    isTallyInstalled() {
        if (window.ethereum?.isTally) {
            return true
        } else {
            return false
        }
    },
    async sendTip(recipient, tippingValue, network) {
        let contract;
        let priceSt;
        let amount;
        let polygonGas;
        let tokenContractAddr; // get from json
        const web3 = new Web3(this.provider);
        this.web3 = web3;
        // exchange for resolver that you have already initialized
        // resolver = await loadContract(defaultWeb3);

        // make another check if the address selected really belongs to the twitter name selected


        // switch to selected payment option's network
        // exchange if statement for suitable check depending on selected network in dropdown
        if (network === "MATIC") {
            try {
                await this.switchtopolygon();
            } catch (e) {
                if (e != "network1") {
                    //   return e
                }
            }
            debugger;
            contract = await this.loadTippingPolygon(web3);
            let oracle = await this.loadOracle("") // token ticker selected
            // Get value of transaction in wei -> amount
            priceSt = await this.getPrice(oracle);
            amount = await this.getAmount(tippingValue, priceSt, decimals) // tippingValue selected in popup, decimals specified in json for token

        } else if (network === "ETH") {
            try {
                await switchtoeth();
            } catch (e) {
                if (e != "network1") {
                    return e
                }
            }
            contract = await loadTippingETH(web3);
            oracle = await loadOracle("") // token ticker selected
            // Get value of transaction in wei -> amount
            priceSt = await getPrice(orcale);
            amount = await getAmount(tippingValue, priceSt, decimals) // tippingValue selected in popup, decimals specified in json for token

            await fetch('https://gasstation-mainnet.matic.network/v2')
                .then(response => response.json())
                .then(json => polygonGas = String(Math.round(json['standard']['maxFee'] * 1000000000)))

        } else {
            try {
                await switchtobsc();
            } catch (e) {
                console.log("Cought error: ", e)
                if (e != "network1") {
                    return e
                }
            }
            contract = await loadTippingBSC(web3);
            oracle = await loadOracle("") // token ticker selected
            // Get value of transaction in wei -> amount
            priceSt = await getPrice(orcale);
            amount = await getAmount(tippingValue, priceSt, decimals) // tippingValue selected in popup, decimals specified in json for token
        }

        // exchanged for redundant multiple get accounts calls
        const accounts = await web3.eth.getAccounts();
        selectedAccount = accounts[0];

        // owner account
        console.log(selectedAccount)

        if (accounts.length > 0) {
            let payment;

            try {
                // Actual contract call
                // Spinner showing that plugin is waiting for approval or waiting for txn to go through
                document.getElementById('Spinner2').style.display = "";
                document.getElementById('displaySwitch').style.display = "none";
                // network is the network chosen in plugin popup
                if (network === "Polygon" && polygonGas) {
                    // check for approval, then send txn
                    // if native token: do not check for approval, select first payment (sendTo(...))
                    // if ERC20 token: check for approval, if not given call getApproval(tokenContractAddr), followed by the second payment call (sendTokenTo(...))
                    // inputs native token: sendTo(address recipient, string memory message)
                    // inputs ERC20 token: sendTokenTo(uint256 amount, address tokenContractAddr, address recipient, string memory message)
                    // message is "" by default
                    // recipient is the target address (resolved from twitter), message is the optional message (currently hidden functionality for twitter, should be empty
                    // amount is calculated above, polygonGas is calculated above in case people selected the Polygon network
                    // amount is the amount calculated above for token that are not native
                    // tokenContractAddr is the contract address of a token and can be taken from the imported json about token
                    // selectedAccount is defined above and the connected wallet address
                    if (token == "MATIC") {
                        payment = await contract.methods.sendTo(recipient, message).send({
                            from: selectedAccount,
                            value: amount,
                            gasPrice: polygonGas
                        });
                    } else {
                        if (checkApproval(tokenContractAddr, amount, network)) {
                            payment = await contract.methods.sendTokenTo(amount, tokenContractAddr, recipient, message).send({
                                from: selectedAccount,
                                gasPrice: polygonGas
                            });
                        } else {
                            approval = await getApproval(tokenContractAddr, network)
                            payment = await contract.methods.sendTokenTo(amount, tokenContractAddr, recipient, message).send({
                                from: selectedAccount,
                                gasPrice: polygonGas
                            });
                        }
                    }
                } else {
                    // same comments as above apply, this section uses default gas values, suggested by the wallet that is connected
                    if (token == "ETH" || token == "BNB") {
                        payment = await contract.methods.sendTo(recipient, message).send({
                            from: selectedAccount,
                            value: amount
                        });
                    } else {
                        if (checkApproval(tokenContractAddr, amount, network)) {
                            payment = await contract.methods.sendTokenTo(amount, tokenContractAddr, recipient, message).send({from: selectedAccount});
                        } else {
                            approval = await getApproval(tokenContractAddr, network)
                            payment = await contract.methods.sendTokenTo(amount, tokenContractAddr, recipient, message).send({from: selectedAccount});
                        }
                    }
                }
                document.getElementById('Spinner2').style.display = "none";
            } catch (err) {
                document.getElementById('Spinner2').style.display = "none";
                console.log("error", err)
                // Transaction failed or user has denied
                // catch different errors?
                // code 4001 user denied
                console.log("Transaction denied.");
                ret = "transaction-error"
            }
        }
    },
    async switchtopolygon() {
        debugger;
        const web3 = new Web3(this.provider);

        //  rpc method?
        console.log("Checking chain...")
        const chainId = await web3.eth.getChainId();
        console.log(chainId);

        // check if correct chain is connected
        console.log("Connected to chain ", chainId)
        if (chainId != 137) {
            displaySwitch();
            console.log("Switch to Polygon requested")
            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{chainId: '0x89'}],
                });
                document.getElementById("displaySwitch").style.display = "none";
            } catch (switchError) {
                if (switchError.message === "JSON RPC response format is invalid") {
                    throw "network1"
                }
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    try {
                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x89',
                                chainName: 'Matic',
                                rpcUrls: ['https://polygon-rpc.com/'],
                                nativeCurrency: {name: 'MATIC', symbol: 'MATIC', decimals: 18}
                            }],
                        });
                    } catch (addError) {
                        alert("Please add Polygon network to continue.");
                    }
                }
                console.log("Please switch to Polygon network.");
                // disable continue buttons here
                token = "MATIC";
                throw "network"
            }
        }
    },
    // load oracle price data
    async loadOracle(ticker) {
        let abiOracle = [{
            "inputs": [{
                "internalType": "address",
                "name": "_aggregator",
                "type": "address"
            }, {"internalType": "address", "name": "_accessController", "type": "address"}],
            "stateMutability": "nonpayable",
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "internalType": "int256",
                "name": "current",
                "type": "int256"
            }, {"indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256"}, {
                "indexed": false,
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }],
            "name": "AnswerUpdated",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            }, {"indexed": true, "internalType": "address", "name": "startedBy", "type": "address"}, {
                "indexed": false,
                "internalType": "uint256",
                "name": "startedAt",
                "type": "uint256"
            }],
            "name": "NewRound",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            }, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}],
            "name": "OwnershipTransferRequested",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            }, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}],
            "name": "OwnershipTransferred",
            "type": "event"
        }, {
            "inputs": [],
            "name": "acceptOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [],
            "name": "accessController",
            "outputs": [{"internalType": "contract AccessControllerInterface", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "aggregator",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "_aggregator", "type": "address"}],
            "name": "confirmAggregator",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [],
            "name": "decimals",
            "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "description",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "_roundId", "type": "uint256"}],
            "name": "getAnswer",
            "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "uint80", "name": "_roundId", "type": "uint80"}],
            "name": "getRoundData",
            "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
                "internalType": "int256",
                "name": "answer",
                "type": "int256"
            }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "_roundId", "type": "uint256"}],
            "name": "getTimestamp",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "latestAnswer",
            "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "latestRound",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "latestRoundData",
            "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
                "internalType": "int256",
                "name": "answer",
                "type": "int256"
            }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "latestTimestamp",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "owner",
            "outputs": [{"internalType": "address payable", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
            "name": "phaseAggregators",
            "outputs": [{"internalType": "contract AggregatorV2V3Interface", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "phaseId",
            "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "_aggregator", "type": "address"}],
            "name": "proposeAggregator",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [],
            "name": "proposedAggregator",
            "outputs": [{"internalType": "contract AggregatorV2V3Interface", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "uint80", "name": "_roundId", "type": "uint80"}],
            "name": "proposedGetRoundData",
            "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
                "internalType": "int256",
                "name": "answer",
                "type": "int256"
            }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [],
            "name": "proposedLatestRoundData",
            "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
                "internalType": "int256",
                "name": "answer",
                "type": "int256"
            }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "updatedAt",
                "type": "uint256"
            }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "_accessController", "type": "address"}],
            "name": "setController",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "_to", "type": "address"}],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [],
            "name": "version",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }]
        return await new this.web3.eth.Contract(abiOracle, oracleAddress[ticker]); // addresses TBD
    },
    async loadTippingPolygon(web3) {
        return await new this.web3.eth.Contract(abiTippingContract, tippingAddressPolygon);
    },
    // calculate price in USD
    async getPrice(oracleContract) {
        return await oracleContract.methods.latestAnswer().call() / Math.pow(10, oracleContract.methods.decimals().call())
    },
    // calculate price in wei (amount needed to send tip)
    async getAmount(tippingValue, tokenPrice, decimals) {
        return Math.round((tippingValue / tokenPrice)*Math.pow(10, decimals))
    }
}
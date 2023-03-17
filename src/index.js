import { create } from "fast-creator";
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
  MultiSendToAnyoneSuccess,
  RevertPayment,
} from "@idriss-crypto/send-to-anyone-core/subpages";

document.addEventListener("DOMContentLoaded", async () => {
  const sendToAnyoneLogicPromise = await import(
    "@idriss-crypto/send-to-anyone-core/sendToAnyoneLogic"
  );
  const getProviderPromise = import(
    "@idriss-crypto/send-to-anyone-core/getWeb3Provider"
  );
  const sendToAnyoneUtilsPromise = import(
    "@idriss-crypto/send-to-anyone-core/sendToAnyoneUtils"
  );

  let params = new URL(document.location).searchParams;
  console.log({ params });
  let navSelection = new URL(document.location).pathname.split("/")[2];
  let identifier = params.get("identifier");
  let recipient = params.get("recipient");
  let tippingValue = params.get("tippingValue");
  let token = params.get("token");
  let sendToAnyoneValue = +params.get("sendToAnyoneValue");
  let network = params.get("network");
  let message = params.get("message") || "";
  let isIDrissRegistered;
  let assetType;
  let assetAddress;
  let assetId;
  let selectedNFT;
  let nftName;
  let provider;
  let walletTag;
  let nftButton = document.querySelector("#nftSelectButton");
  let tokenButton = document.querySelector("#tokenSelectButton");
  let multiSendButton = document.querySelector("#multiSendSelectButton");
  let revertButton = document.querySelector("#revertSelectButton");
  let selectedTab = "token";
  let dropdownMenu = document.getElementById("dropdownMenu");
  let menuButton = document.getElementById("menuButton");

  let div = document.createElement("div");
  document.querySelector(".container").append(div);
  div.attachShadow({
    mode: "open",
  });
  div.shadowRoot.addEventListener("close", () => {
    console.log("Close triggered");
    if (params.get("back") == "close") window.close();
    else if (params.get("back"))
      return (document.location = params.get("back"));
    else if (selectedTab == "multi") multiSendButton.click();
    if (selectedTab == "nft") nftButton.click();
    if (selectedTab == "token") tokenButton.click();
    if (selectedTab == "revert") revertButton.click();
  });

  div.shadowRoot.addEventListener("discordSendError", () => {
    // ToDo: change url and add tooltip "Copied"
    const url = "https://discord.gg/VMcJ9uF6u8";
    window.open(url, "_blank");
  });
  div.shadowRoot.append(
    create("style", {
      text: css,
    })
  );

  let popupToken = create("section");
  popupToken.id = "popupToken";
  div.shadowRoot.append(popupToken);
  popupToken.classList.add("sendToAnyone-popup");
  let popupNFT = create("section");
  popupNFT.id = "popupNFT";
  popupNFT.style.display = "none";
  div.shadowRoot.append(popupNFT);
  popupNFT.classList.add("sendToAnyone-popup");
  let popupMulti = create("section");
  popupMulti.id = "popupMulti";
  popupMulti.style.display = "none";
  div.shadowRoot.append(popupMulti);
  popupMulti.classList.add("multiSendToAnyone-popup");
  //ToDo: change class names
  let popupRevert = create("section");
  popupRevert.id = "popupRevert";
  popupRevert.style.display = "none";
  div.shadowRoot.append(popupRevert);
  popupRevert.classList.add("sendToAnyone-popup");

  document
    .querySelector("#triggerSuccessButton")
    .addEventListener("click", () => {
      popupToken.firstElementChild.remove();
      popupToken.append(
        new SendToAnyoneSuccess(
          "@test",
          "https://www.idriss.xyz",
          "abc",
          false,
          1,
          1,
          "0x",
          "Matic",
          1,
          "0x"
        ).html
      );
    });

  document
    .querySelector("#triggerErrorButton")
    .addEventListener("click", () => {
      popupToken.firstElementChild.remove();
      popupToken.append(
        new SendToAnyoneError({
          name: "Reverted",
          message: "Transaction was not successful",
        }).html
      );
    });

  menuButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  try {
    const { getProvider } = await getProviderPromise;
    const { getNFTsForAddress } = await sendToAnyoneUtilsPromise;
    const { SendToAnyoneLogic } = await sendToAnyoneLogicPromise;

    let popups = { selected: popupToken };

    async function connectWallet() {
      provider = await getProvider();
      await SendToAnyoneLogic.prepareSendToAnyone(
        provider,
        network ?? "Polygon",
        ALCHEMY_API_KEY
      );
      document.querySelector("#connectWallet").classList.add("hidden");
      document.querySelector("#connectedWallet").classList.remove("hidden");
      let accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
      let reverse = await SendToAnyoneLogic.idriss.reverseResolve(accounts[0]);
      let loginDisplay = reverse
        ? reverse
        : accounts[0]
            .substring(0, 6)
            .concat("...")
            .concat(accounts[0].substr(-4));
      document.querySelector("#connectedWallet").firstElementChild.value =
        loginDisplay;
      document.querySelector("#polygon-scan-link").href =
        POLYGON_BLOCK_EXPLORER_ADDRESS + "/address/" + accounts[0];
    }

    async function disconnectWallet() {
      provider = null;
      document.querySelector("#connectWallet").classList.remove("hidden");
      document.querySelector("#connectedWallet").classList.add("hidden");
    }

    document
      .querySelector("#connectWallet")
      .addEventListener("click", async () => {
        await connectWallet();
      });

    document
      .querySelector("#disconnectWallet")
      .addEventListener("click", async () => {
        await disconnectWallet();
      });

    document
      .querySelector("#dropdownTokenButton")
      .addEventListener("click", async () => {
        dropdownMenu.classList.toggle("hidden");
        tokenButton.click();
      });

    document
      .querySelector("#dropdownNFTButton")
      .addEventListener("click", async () => {
        dropdownMenu.classList.toggle("hidden");
        nftButton.click();
      });

    document
      .querySelector("#dropdownMultiButton")
      .addEventListener("click", async () => {
        dropdownMenu.classList.toggle("hidden");
        multiSendButton.click();
      });

    document
      .querySelector("#dropdownRevertButton")
      .addEventListener("click", async () => {
        dropdownMenu.classList.toggle("hidden");
        revertButton.click();
      });

    async function handleNFTclick() {
      selectedTab = "nft";

      adjustButtonActions();

      nftButton.className =
        "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      tokenButton.className =
        "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      multiSendButton.className =
        "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      //revertButton.className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

      popups.selected.firstElementChild?.remove();
      popupToken.style.display = "none";
      popupMulti.style.display = "none";
      popupRevert.style.display = "none";
      popupNFT.style.display = "block";
      popups.selected = popupNFT;

      await showInputWidget("nft");

      // connect wallet when needed
      if (!provider) {
        await connectWallet();
      }

      const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
      let selectedAccount = accounts[0];

      let addressNFTsPolygon = await getNFTsForAddress(
        selectedAccount,
        ALCHEMY_API_KEY,
        "Polygon"
      );
      let addressNFTsEthereum = await getNFTsForAddress(
        selectedAccount,
        ALCHEMY_API_KEY,
        "Ethereum"
      );

      function appendNFTs(addressNFTs, network) {
        return addressNFTs.ownedNfts
          .filter((v, i, a) => v.title != "")
          .filter(
            (v, i, a) => v.tokenType == "ERC721" || v.tokenType == "ERC1155"
          )
          .map((v, i, a) => {
            try {
              let image = v.media[0].gateway ? v.media[0].gateway : "";
              if (image.startsWith("ipfs://"))
                image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
              return {
                name: v.title,
                address: v.contract.address,
                id: BigInt(v.tokenId).toString(10),
                type: v.tokenType,
                image: image,
                network: network,
              };
            } catch {
              return {
                name: "dummy name",
                address: "0x",
                id: 0,
                type: "ERC721",
                img: "https://ipfs.io/ipfs/",
                network: "polygon",
              };
            }
          });
      }

      let nfts = appendNFTs(addressNFTsPolygon, "Polygon");
      nfts = nfts.concat(appendNFTs(addressNFTsEthereum, "ETH"));

      nfts = nfts.filter((v, i, a) => v.address != "0x");

      popupNFT.firstElementChild?.remove();

      popupNFT.append(
        new SendToAnyoneMain(
          identifier,
          isIDrissRegistered,
          nfts,
          true,
          null,
          true
        ).html
      );

      popupNFT.firstElementChild?.addEventListener("sendMoney", (e) => {
        console.log(e);
        network = e.network;
        token = e.token;
        sendToAnyoneValue = +e.amount;
        message = e.message;
        assetType = e.assetType;
        assetAddress = e.assetAddress;
        assetId = e.assetId;
        selectedNFT = nfts
          .filter((nft) => nft.address == assetAddress)
          .filter((nft) => nft.id == assetId);
        nftName = selectedNFT[0] != undefined ? selectedNFT[0].name : "";
        handleRest();
      });
    }

    async function handleTokenClick() {
      selectedTab = "token";

      adjustButtonActions();

      tokenButton.className =
        "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      nftButton.className =
        "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      multiSendButton.className =
        "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
      //revertButton.className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

      popups.selected.firstElementChild?.remove();
      popupNFT.style.display = "none";
      popupMulti.style.display = "none";
      popupRevert.style.display = "none";
      popupToken.style.display = "block";
      popups.selected = popupToken;

      let nfts = [];

      console.log("-----");
      console.log(recipient, identifier, tippingValue, network, token);
      const shouldSkipInputWidget =
        !!recipient && !!identifier && !!tippingValue && !!network && !!token;

      if (shouldSkipInputWidget) {
        network = network;
        token = token;
        sendToAnyoneValue = tippingValue;
        assetType = "native";
        // message =
        // assetAddress =
        // assetId =
        // selectedNFT =
        // nftName =
        // showInputWidget("token");
        handleRest();
      } else {
        await showInputWidget("token");
        popupToken.firstElementChild?.remove();
        popupToken.append(
          new SendToAnyoneMain(identifier, isIDrissRegistered, nfts).html
        );
      }

      // probably not await, as code stops
      popupToken.firstElementChild?.addEventListener("sendMoney", (e) => {
        console.log("EVENT", e);
        network = e.network;
        token = e.token;
        sendToAnyoneValue = +e.amount;
        message = e.message;
        assetType = e.assetType;
        assetAddress = e.assetAddress;
        assetId = e.assetId;
        selectedNFT = nfts
          .filter((nft) => nft.address == assetAddress)
          .filter((nft) => nft.id == assetId);
        nftName = selectedNFT[0] != undefined ? selectedNFT[0].name : "";
        handleRest();
      });
    }
    async function handleMultiSendClick() {
      selectedTab = "multi";

      try {
        adjustButtonActions();

        multiSendButton.className =
          "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
        nftButton.className =
          "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
        tokenButton.className =
          "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
        //revertButton.className = "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"

        popups.selected.firstElementChild?.remove();
        popupNFT.style.display = "none";
        popupToken.style.display = "none";
        popupRevert.style.display = "none";
        popupMulti.style.display = "block";

        popups.selected = popupMulti;

        // connect wallet when needed
        if (!provider) {
          await connectWallet();
        }

        console.log(SendToAnyoneLogic.web3);
        const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
        let selectedAccount = accounts[0];

        let addressNFTsPolygon = await getNFTsForAddress(
          selectedAccount,
          ALCHEMY_API_KEY,
          "Polygon"
        );

        console.log(addressNFTsPolygon);

        function filterNFTs(addressNFTs, network) {
          return addressNFTs.ownedNfts
            .filter((v, i, a) => v.title != "")
            .filter((v, i, a) => v.tokenType == "ERC1155")
            .map((v, i, a) => {
              try {
                let image = v.media[0].gateway ? v.media[0].gateway : "";
                if (image.startsWith("ipfs://"))
                  image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
                return {
                  name: v.title,
                  address: v.contract.address,
                  id: BigInt(v.tokenId).toString(10),
                  type: v.tokenType,
                  image: image,
                  network: network,
                  balance: v.balance,
                };
              } catch {
                return {
                  name: "dummy name",
                  address: "0x",
                  id: 0,
                  type: "ERC721",
                  img: "https://ipfs.io/ipfs/",
                  network: "polygon",
                };
              }
            });
        }

        let nfts = filterNFTs(addressNFTsPolygon, "Polygon");

        console.log(nfts);

        nfts = nfts.filter((v, i, a) => v.address != "0x");

        popupMulti.append(new MultiSendToAnyone(nfts, selectedAccount).html);

        popupMulti.firstElementChild?.addEventListener(
          "multiSendMoney",
          (e) => {
            console.log("Got multiSendEvent: ", e);
            multiHandleRest(e);
          }
        );

        adjustButtonActions();
      } catch (e) {
        console.log(e);
        // refresh screen so we are not stuck on error
        adjustButtonActions();
        multiSendButton.click();
      }
    }
    async function handleRevertClick() {
      selectedTab = "revert";
      try {
        adjustButtonActions();

        //revertButton.className = "text-center bg-indigo-50 text-[#5865F2] hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
        nftButton.className =
          "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
        tokenButton.className =
          "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";
        multiSendButton.className =
          "self-center text-gray-500 hover:bg-indigo-50 hover:text-[#5865F2] px-3 py-2 rounded-md text-sm font-medium hover:cursor-pointer";

        popups.selected.firstElementChild?.remove();
        popupNFT.style.display = "none";
        popupToken.style.display = "none";
        popupMulti.style.display = "none";
        popupRevert.style.display = "block";
        popups.selected = popupRevert;

        // connect wallet when needed
        if (!provider) {
          await connectWallet();
        }

        const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();
        let selectedAccount = accounts[0];

        popupRevert.append(new RevertPayment(SendToAnyoneLogic.idriss).html);
        adjustButtonActions();
      } catch (e) {
        console.log("Revert error ", e);
        // refresh screen so we are not stuck on error
        adjustButtonActions();
        revertButton.click();
      }
    }

    function adjustButtonActions(force = "") {
      if (force === "on") {
        nftButton.onclick = function () {
          handleNFTclick();
        };
        tokenButton.onclick = function () {
          handleTokenClick();
        };
        multiSendButton.onclick = function () {
          handleMultiSendClick();
        };
        revertButton.onclick = function () {
          handleRevertClick();
        };
      } else if (force === "off") {
        nftButton.onclick = "";
        tokenButton.onclick = "";
        multiSendButton.onclick = "";
        revertButton.onclick = "";
      } else {
        nftButton.onclick = nftButton.onclick
          ? ""
          : function () {
              handleNFTclick();
            };
        tokenButton.onclick = tokenButton.onclick
          ? ""
          : function () {
              handleTokenClick();
            };
        multiSendButton.onclick = multiSendButton.onclick
          ? ""
          : function () {
              handleMultiSendClick();
            };
        revertButton.onclick = revertButton.onclick
          ? ""
          : function () {
              handleRevertClick();
            };
      }
    }

    function selectOption(option) {
      if (option === "token") tokenButton.click();
      if (option === "nft") nftButton.click();
      if (option === "multi") multiSendButton.click();
      if (option === "revert") revertSelectButton.click();
      dropdownMenu.classList.add("hidden");
    }

    // initialize page
    adjustButtonActions();
    if (navSelection == "nft") await nftButton.click();
    else if (navSelection == "multi") await multiSendButton.click();
    else if (navSelection == "revert") await revertButton.click();
    else await tokenButton.click();
    // disconnect all providers
    disconnectWallet();
    // add param version of tipping-page here and call tokenButton(params)

    async function showInputWidget(type) {
      popups.selected.append(new SendToAnyoneAddress(type).html);
      adjustButtonActions();
      return await new Promise((res) => {
        async function nextEventHandler(e) {
          console.log(e);
          identifier = e.identifier;
          recipient = e.recipient;
          isIDrissRegistered = e.isIDrissRegistered;
          walletTag = e.walletTag ? e.walletTag : "Public ETH";
          res();
        }

        popups.selected.firstElementChild.addEventListener(
          "next",
          nextEventHandler
        );
      });
    }

    async function handleRest() {
      if (!provider) {
        await connectWallet();
      }

      const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();

      let { integer: amountInteger, normal: amountNormal } =
        await SendToAnyoneLogic.calculateAmount(token, sendToAnyoneValue);

      console.log(isIDrissRegistered);
      console.log(
        identifier,
        isIDrissRegistered,
        sendToAnyoneValue,
        token,
        amountNormal,
        assetId,
        assetType,
        nftName
      );
      popups.selected.firstElementChild?.remove();
      popups.selected.append(
        new SendToAnyoneWaitingConfirmation(
          identifier,
          isIDrissRegistered,
          sendToAnyoneValue,
          token,
          amountNormal.toString(),
          assetId,
          assetType,
          nftName
        ).html
      );

      console.log(
        identifier,
        amountInteger.toString(),
        network,
        token,
        message,
        assetType,
        assetAddress,
        assetId
      );
      console.log({
        identifier,
        amountInteger,
        network,
        token,
        assetType,
        assetAddress,
        assetId,
        walletTag,
      });
      let success = await SendToAnyoneLogic.sendToAnyone(
        identifier,
        amountInteger.toString(),
        network,
        token,
        message,
        assetType,
        assetAddress,
        assetId,
        walletTag
      );
      console.log("Success is: ", success);
      popups.selected.firstElementChild.remove();
      let blockNumber;
      let txnHash;
      if (success) {
        blockNumber = success.blockNumber
          ? success.blockNumber
          : success.transactionReceipt.blockNumber;
        txnHash = success.transactionHash
          ? success.transactionHash
          : success.transactionReceipt.transactionHash;
        let explorerLink;
        if (network == "ETH")
          explorerLink = "https://etherscan.io/tx/" + txnHash;
        else if (network == "BSC")
          explorerLink = "https://bscscan.com/tx/" + txnHash;
        else if (network == "Polygon")
          explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + "/tx/" + txnHash;
        console.log(explorerLink);
        // add success.blockNumber to url so we don't have to query
        popups.selected.append(
          new SendToAnyoneSuccess(
            identifier,
            explorerLink,
            success.claimPassword,
            isIDrissRegistered,
            assetId,
            assetType,
            assetAddress,
            token,
            blockNumber,
            txnHash
          ).html
        );
      } else {
        popups.selected.append(
          new SendToAnyoneError({
            name: "Reverted",
            message: "Transaction was not successful",
          }).html
        );
        adjustButtonActions();
      }
    }

    async function multiHandleRest(e) {
      let recipients = e.multiSendArr;
      console.log(recipients);
      let token = e.token;

      if (!provider) {
        await connectWallet();
      }

      console.log(SendToAnyoneLogic.web3);
      const accounts = await SendToAnyoneLogic.web3.eth.getAccounts();

      let assetName = recipients[0].asset.type;

      popups.selected.firstElementChild.remove();
      popups.selected.append(
        new MultiSendToAnyoneApproval(
          token,
          recipients,
          SendToAnyoneLogic.idriss
        ).html
      );

      console.log("Sending to: ", recipients);

      let success = await SendToAnyoneLogic.multiSendToAnyone(recipients);
      console.log("Success is: ", success);
      try {
        // should be the claim links to download with download button as csv
        console.log(success);
      } catch (e) {
        console.log("Error after success ", e);
        console.log("no data found");
        console.log("Caught error:", e);
        // Errors will be reported on Discord
        popups.selected.firstElementChild?.remove();
        popups.selected.append(new SendToAnyoneError(e).html);
        console.error(e);
        return;
      }
      popups.selected.firstElementChild.remove();
      let txnHash;
      if (success) {
        txnHash = success.transactionHash
          ? success.transactionHash
          : success.transactionReceipt.transactionHash;
        let explorerLink = POLYGON_BLOCK_EXPLORER_ADDRESS + `/tx/${txnHash}`;
        console.log(explorerLink);
        //ToDo: check eligibility of params
        popups.selected.append(
          new MultiSendToAnyoneSuccess(explorerLink, token, success.data ?? "")
            .html
        );
      } else {
        popups.selected.append(
          new SendToAnyoneError({
            name: "Reverted",
            message: "Transaction was not successful",
          }).html
        );
        console.log({
          success,
        });
      }
    }
  } catch (e) {
    console.log("Caught error:", e);
    // ToDo: catch different error types here
    // Errors will be reported on Discord
    popups.selected.firstElementChild?.remove();
    popups.selected.append(new SendToAnyoneError(e).html);
    adjustButtonActions();
    console.error(e);
  }
});

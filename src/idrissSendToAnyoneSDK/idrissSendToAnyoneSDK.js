console.log('Idriss sendToAnyone script')

export async function idrissShowSendToAnyonePopup(config, e) {
    e.preventDefault();
    const {idrissShowSendToAnyonePopup} = await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core/index.mjs");
    return idrissShowSendToAnyonePopup(config, e);
}

export async function idrissLoadSendToAnyoneWidget() {
    return (await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core/index.mjs")).IdrissSendToAnyoneWidget;
}

window.idrissShowSendToAnyonePopup = idrissShowSendToAnyonePopup;
window.idrissLoadSendToAnyoneWidget = idrissLoadSendToAnyoneWidget;
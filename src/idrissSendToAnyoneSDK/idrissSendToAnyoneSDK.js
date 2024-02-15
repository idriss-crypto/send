console.log('Idriss sendToAnyone script')

export async function idrissShowSendToAnyonePopup(config, e) {
    e.preventDefault();
    const {idrissShowSendToAnyonePopup} = await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core");
    return idrissShowSendToAnyonePopup(config, e);
}

export async function idrissLoadSendToAnyoneWidget() {
    return (await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core")).IdrissSendToAnyoneWidget;
}

window.idrissShowSendToAnyonePopup = idrissShowSendToAnyonePopup;
window.idrissLoadSendToAnyoneWidget = idrissLoadSendToAnyoneWidget;
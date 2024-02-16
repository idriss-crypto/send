console.log('Idriss sendToAnyone script')

export async function idrissShowSendToAnyonePopup(config, e) {
    e.preventDefault();
    const {idrissShowSendToAnyonePopup} = await import(/* webpackPrefetch: true */"@idriss-crypto/send-core");
    return idrissShowSendToAnyonePopup(config, e);
}

export async function idrissLoadSendToAnyoneWidget() {
    return (await import(/* webpackPrefetch: true */"@idriss-crypto/send-core")).IdrissSendToAnyoneWidget;
}

window.idrissShowSendToAnyonePopup = idrissShowSendToAnyonePopup;
window.idrissLoadSendToAnyoneWidget = idrissLoadSendToAnyoneWidget;
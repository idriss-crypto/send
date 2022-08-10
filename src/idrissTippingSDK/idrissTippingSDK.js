console.log('Idriss tipping script')

export async function idrissShowTippingPopup(config, e) {
    e.preventDefault();
    const {idrissShowSendToAnyonePopup} = await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core");
    return idrissShowSendToAnyonePopup(config, e);
}

export async function idrissLoadTippingWidget() {
    return (await import(/* webpackPrefetch: true */"@idriss-crypto/send-to-anyone-core")).IdrissSendToAnyoneWidget;
}

window.idrissShowTippingPopup = idrissShowTippingPopup;
window.idrissLoadTippingWidget = idrissLoadTippingWidget;
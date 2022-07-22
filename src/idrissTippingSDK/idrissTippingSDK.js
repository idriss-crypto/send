console.log('Idriss tipping script')

export async function idrissShowTippingPopup(config, e) {
    e.preventDefault();
    const {idrissShowTippingPopup} = await import(/* webpackPrefetch: true */"@idriss-crypto/tipping-core");
    return idrissShowTippingPopup(config, e);
}

export async function idrissLoadTippingWidget() {
    return (await import(/* webpackPrefetch: true */"@idriss-crypto/tipping-core")).IdrissTippingWidget;
}

window.idrissShowTippingPopup = idrissShowTippingPopup;
window.idrissLoadTippingWidget = idrissLoadTippingWidget;
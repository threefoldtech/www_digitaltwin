let spawnerurl = window.location.host.split('.');
spawnerurl.shift();
let config = {
    baseUrl: `${window.location.origin}/`,
    spawnerUrl: `https://${spawnerurl.join('.')}/`,
    appBackend: `https://login.staging.jimber.org/`,
    documentServerUrl: `https://documentserver.${spawnerurl.join('.')}`,
    giphyApiKey: `uk3XRSO0vYrPDEQKDPZJ2wGz33qzIxST`,
};
export default config;

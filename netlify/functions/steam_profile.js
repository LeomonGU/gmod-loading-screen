// Serverless Function: / .netlify/functions/steam_profile
exports.handler = async (event) => {
  const steamid = (event.queryStringParameters?.steamid || '').replace(/\D/g, '');
  if (steamid.length !== 17) {
    return { statusCode: 400, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error:'bad_steamid' }) };
  }

  const API_KEY = process.env.STEAM_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error:'no_api_key' }) };
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${steamid}`;
  const r = await fetch(url);
  if (!r.ok) {
    return { statusCode: 502, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error:'steam_api_error', status:r.status }) };
  }
  const data = await r.json();
  const p = data?.response?.players?.[0];
  if (!p) return { statusCode: 404, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ error:'not_found' }) };

  return {
    statusCode: 200,
    headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' },
    body: JSON.stringify({ persona: p.personaname, avatar: p.avatarfull || p.avatarmedium, communityurl: p.profileurl })
  };
};

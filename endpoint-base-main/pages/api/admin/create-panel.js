import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method is allowed' });
  }

  const { gb, username, keyakses } = req.query;

  if (!gb || !username || !keyakses) {
    return res.status(400).json({ error: 'Missing query parameters: gb, username, keyakses' });
  }

  // Optional: Ganti dengan key akses asli atau pakai process.env
  const validKey = "admin123#";
  if (keyakses !== validKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid keyakses' });
  }

  const sizes = {
    '1gb': { ram: '1000', disk: '1000', cpu: '40' },
    '2gb': { ram: '2000', disk: '1000', cpu: '60' },
    '3gb': { ram: '3000', disk: '2000', cpu: '80' },
    '4gb': { ram: '4000', disk: '2000', cpu: '100' },
    '5gb': { ram: '5000', disk: '3000', cpu: '120' },
    '6gb': { ram: '6000', disk: '3000', cpu: '140' },
    '7gb': { ram: '7000', disk: '4000', cpu: '160' },
    '8gb': { ram: '8000', disk: '4000', cpu: '180' },
    '9gb': { ram: '9000', disk: '5000', cpu: '200' },
    '10gb': { ram: '10000', disk: '5000', cpu: '220' },
  };

  const selected = sizes[gb.toLowerCase()];
  if (!selected) {
    return res.status(400).json({ error: 'Invalid gb size' });
  }

  const domain = process.env.PTERO_DOMAIN;
  const apikey = process.env.PTERO_APIKEY;
  const capikey = process.env.PTERO_CAPIKEY;
  const nestid = process.env.PTERO_NEST_ID;
  const egg = process.env.PTERO_EGG_ID;
  const loc = process.env.PTERO_LOCATION;

  const ram = selected.ram;
  const disknya = selected.disk;
  const cpu = selected.cpu;

  const email = `${username}@gmail.com`;
  const name = username.charAt(0).toUpperCase() + username.slice(1) + ' Server';
  const password = username + crypto.randomBytes(3).toString('hex');

  try {
    // Create user
    const userResp = await fetch(`${domain}/api/application/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        username: username.toLowerCase(),
        first_name: name,
        last_name: 'Server',
        language: 'en',
        password,
      }),
    });

    const userData = await userResp.json();
    if (userData.errors) return res.status(500).json({ error: userData.errors[0] });

    const usr_id = userData.attributes.id;

    // Get egg startup command
    const eggResp = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      },
    });
    const eggData = await eggResp.json();
    const startup = eggData.attributes.startup;

    // Create server
    const serverResp = await fetch(`${domain}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: 'Created via GET endpoint',
        user: usr_id,
        egg: parseInt(egg),
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup,
        environment: {
          INST: 'npm',
          USER_UPLOAD: '0',
          AUTO_UPDATE: '0',
          CMD_RUN: 'npm start',
        },
        limits: {
          memory: ram,
          swap: 0,
          disk: disknya,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });

    const serverData = await serverResp.json();
    if (serverData.errors) return res.status(500).json({ error: serverData.errors[0] });

    return res.status(200).json({
      success: true,
      user: {
        username: userData.attributes.username,
        email,
        password,
      },
      server: {
        id: serverData.attributes.id,
        name: serverData.attributes.name,
        ram, disk: disknya, cpu,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

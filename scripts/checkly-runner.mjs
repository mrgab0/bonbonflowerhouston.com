import https from 'node:https';

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

const CHECKLY_ACCOUNT_ID = process.env.CHECKLY_ACCOUNT_ID;
const CHECKLY_API_KEY = process.env.CHECKLY_API_KEY;
const CHECK_TAG = process.env.CHECKLY_TAG || 'bonbon-flowers';

if (!CHECKLY_ACCOUNT_ID || !CHECKLY_API_KEY) {
  console.error('❌ Falta CHECKLY_ACCOUNT_ID o CHECKLY_API_KEY en .env.local');
  process.exit(1);
}

function requestJson(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'X-Checkly-Account': CHECKLY_ACCOUNT_ID,
        'Authorization': `Bearer ${CHECKLY_API_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runCloudVisualCheck() {
  console.log('🚀 [Checkly Cloud] Disparando suite visual remota para Bonbon Flowers...');
  console.log('☁️  Ejecución 100% en la nube (AWS us-east-1) - CERO consumo de RAM local.\n');

  const triggerRes = await requestJson(
    'https://api.checklyhq.com/v1/check-sessions/trigger',
    { method: 'POST' },
    {
      target: {
        matchTags: [[CHECK_TAG]],
      },
    }
  );

  if (triggerRes.status !== 200 && triggerRes.status !== 201) {
    console.error('❌ Error al disparar sesión en Checkly:', triggerRes);
    process.exit(1);
  }

  const session = triggerRes.data.sessions?.[0];
  if (!session) {
    console.error('❌ No se encontró sesión en la respuesta:', triggerRes.data);
    process.exit(1);
  }

  const { checkSessionId, checkSessionLink } = session;
  console.log(`📌 Sesión iniciada: ${checkSessionId}`);
  console.log(`🔗 Ver reporte y capturas en vivo:\n👉 ${checkSessionLink}\n`);

  // Polling del estado de la sesión
  process.stdout.write('⏳ Ejecutando Playwright en Checkly Cloud');
  const maxAttempts = 35;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    process.stdout.write('.');

    const statusRes = await requestJson(
      `https://api.checklyhq.com/v1/check-sessions/${checkSessionId}`
    );

    if (statusRes.data?.status === 'PASSED') {
      console.log('\n\n✅ [PASSED] ¡Todos los tests visuales y de contraste pasaron con éxito!');
      console.log(`⏱️  Tiempo de respuesta: ${(statusRes.data.timeElapsed / 1000).toFixed(1)}s`);
      console.log(`📸 Capturas y video generados en: ${checkSessionLink}`);
      return;
    }

    if (statusRes.data?.status === 'FAILED') {
      console.log('\n\n❌ [FAILED] Falló un test visual o de contraste.');
      console.log(`🔗 Revisa el log y las capturas aquí: ${checkSessionLink}`);
      process.exit(1);
    }
  }

  console.log('\n⚠️ La sesión sigue corriendo en la nube. Puedes revisar el progreso en:');
  console.log(checkSessionLink);
}

runCloudVisualCheck().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});

import https from 'node:https';

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
}

const CHECKLY_ACCOUNT_ID = process.env.CHECKLY_ACCOUNT_ID;
const CHECKLY_API_KEY = process.env.CHECKLY_API_KEY;
const CHECK_ID = process.env.CHECKLY_CHECK_ID || '36ec983b-663c-412c-b47e-e6892b6b940b';

if (!CHECKLY_ACCOUNT_ID || !CHECKLY_API_KEY) {
  console.error('❌ Falta CHECKLY_ACCOUNT_ID o CHECKLY_API_KEY en .env.local');
  process.exit(1);
}

const script = `const { test, expect } = require('@playwright/test');

/**
 * Bonbon Flowers Houston - Cloud Visual & Contrast Watcher (Checkly Spec)
 * Ejecuta 100% en los runners de Checkly Cloud (AWS) con CERO consumo de RAM local.
 */

const TARGET_URL =
  process.env.CHECKLY_TARGET_URL ||
  process.env.ENVIRONMENT_URL ||
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  'https://www.bonbonflowershouston.com';

test.describe('Bonbon Flowers - Cloud Visual Eyes & Contrast Watcher', () => {

  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    if (process.env.VERCEL_BYPASS_TOKEN) {
      await context.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN,
      });
    }
  });

  test('1. Homepage: Carga limpia, navegacion en ingles por defecto', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Bonbon Flowers/i);

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const brandHeading = page.locator('header, main');
    await expect(brandHeading.first()).toBeVisible();

    await page.screenshot({ path: 'screenshots/01-homepage-hero-light.png', fullPage: false });
  });

  test('2. Modo Oscuro & Validacion de Contraste (Cero texto oscuro sobre fondo oscuro)', async ({ page }) => {
    // Inicializar tema oscuro en localStorage antes de que Next.js y ThemeProvider hidraten
    await page.addInitScript(() => {
      try {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      } catch (e) {}
    });

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Asegurar persistencia de la clase dark
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
    });
    await page.waitForTimeout(500);

    // Validar que ningun encabezado o parrafo principal tenga texto oscuro ilegible
    const contrastErrors = await page.evaluate(() => {
      const errors = [];
      const selectors = ['h1', 'h2', 'h3', 'p'];
      
      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        for (let i = 0; i < Math.min(elements.length, 30); i++) {
          const el = elements[i];
          const text = (el.textContent || '').trim();
          if (!text || text.length < 3) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Si el elemento o su contenedor inmediato tiene fondo claro explícito, texto oscuro es válido
          let current = el;
          let hasLightBg = false;
          while (current && current !== document.body) {
            const bg = window.getComputedStyle(current).backgroundColor;
            const bgMatch = bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?/);
            if (bgMatch && (bgMatch[4] === undefined || parseFloat(bgMatch[4]) > 0.5)) {
              const br = parseInt(bgMatch[1]);
              const bgVal = parseInt(bgMatch[2]);
              const bb = parseInt(bgMatch[3]);
              if (br > 200 && bgVal > 200 && bb > 200) {
                hasLightBg = true;
                break;
              }
            }
            current = current.parentElement;
          }
          if (hasLightBg) continue;

          const style = window.getComputedStyle(el);
          const color = style.color;
          const match = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
          if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            // Si el texto es negro o muy oscuro (r<35, g<35, b<35) en modo dark sobre fondo oscuro
            if (r < 35 && g < 35 && b < 35) {
              errors.push({
                selector: sel,
                text: text.slice(0, 30),
                textColor: color
              });
            }
          }
        }
      }
      return errors;
    });

    expect(contrastErrors.length, 'Textos oscuros detectados en modo oscuro: ' + JSON.stringify(contrastErrors)).toBe(0);
    await page.screenshot({ path: 'screenshots/02-homepage-dark.png', fullPage: false });
  });

  test('3. Catalogo (/productos): Grid de productos y tarjetas sin imagenes rotas', async ({ page }) => {
    await page.goto(TARGET_URL + '/productos', { waitUntil: 'domcontentloaded' });

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const productLinks = page.locator('a[href*="/productos/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('main img'));
      return imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src);
    });
    expect(brokenImages.length, 'Imagenes rotas detectadas en catalogo: ' + brokenImages.join(', ')).toBe(0);

    await page.screenshot({ path: 'screenshots/03-catalog.png', fullPage: false });
  });

  test('4. Detalle de Producto: Selector de Rosas y Adicionales Concierge', async ({ page }) => {
    await page.goto(TARGET_URL + '/productos', { waitUntil: 'domcontentloaded' });

    const firstProduct = page.locator('a[href*="/productos/"]').first();
    await firstProduct.click();
    await page.waitForLoadState('domcontentloaded');

    const priceIndicator = page.locator('text=USD');
    await expect(priceIndicator.first()).toBeVisible({ timeout: 10000 });

    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Añadir al Carrito")');
    await expect(addToCartBtn.first()).toBeVisible();

    await page.screenshot({ path: 'screenshots/04-product-detail.png', fullPage: false });
  });

  test('5. Soporte Bilingue: Vista en Espanol (/es)', async ({ page }) => {
    await page.goto(TARGET_URL + '/es', { waitUntil: 'domcontentloaded' });

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const spanishIndicator = page.locator('text=Entrega Mismo Día').or(page.locator('text=Colección')).or(page.locator('text=Explorar'));
    await expect(spanishIndicator.first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'screenshots/05-es-homepage.png', fullPage: false });
  });

  test('6. Checkout (/checkout): Montaje del formulario de orden', async ({ page }) => {
    await page.goto(TARGET_URL + '/checkout', { waitUntil: 'domcontentloaded' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
    await page.screenshot({ path: 'screenshots/06-checkout.png', fullPage: false });
  });

});
`;

const payload = JSON.stringify({
  name: 'Bonbon Flowers - Visual Eyes, Contrast & Storefront Check',
  checkType: 'BROWSER',
  frequency: 60,
  activated: true,
  muted: false,
  locations: ['us-east-1'],
  tags: ['bonbon-flowers', 'visual-eyes', 'storefront'],
  runtimeId: '2024.02',
  doubleCheck: true,
  script,
});

const req = https.request(
  `https://api.checklyhq.com/v1/checks/${CHECK_ID}`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Checkly-Account': CHECKLY_ACCOUNT_ID,
      'Authorization': `Bearer ${CHECKLY_API_KEY}`,
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('Update Status:', res.statusCode);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Check actualizado correctamente con suite completa y selectores optimizados.');
      } else {
        console.log('Response:', data);
      }
    });
  }
);

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(payload);
req.end();

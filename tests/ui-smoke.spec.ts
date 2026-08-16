import { expect, test } from '@playwright/test';

test('la scelta modalità non dipende da HDR esterni', async ({ page }) => {
  const hdrRequests: string[] = [];
  const modelRequests: string[] = [];
  const pageErrors: string[] = [];
  const criticalConsoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('request', (request) => {
    if (/\.hdr(?:$|\?)/i.test(request.url())) {
      hdrRequests.push(request.url());
    }
    if (/\.(?:glb|gltf)(?:$|\?)/i.test(request.url())) {
      modelRequests.push(request.url());
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message);
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? 'errore sconosciuto'}`);
  });
  page.on('console', (message) => {
    const text = message.text();
    if (
      message.type() === 'error'
      && /hydration failed|module factory is not available|venice_sunset|Environment\.js/i.test(text)
    ) {
      criticalConsoleErrors.push(text);
    }
  });

  await page.goto('/gameMode');

  await expect(page.getByRole('heading', { name: 'Seleziona la Modalità' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Multigiocatore' })).toHaveAttribute(
    'href',
    '/chooseTime?mode=multiplayer',
  );
  await expect(page.getByRole('link', { name: 'IA', exact: true })).toHaveAttribute(
    'href',
    '/chooseTime?mode=ai',
  );
  await page.waitForTimeout(1_000);

  expect(hdrRequests).toEqual([]);
  expect(modelRequests).toEqual([]);
  expect({ pageErrors, failedRequests }).toEqual({
    pageErrors: [],
    failedRequests: [],
  });
  expect(criticalConsoleErrors).toEqual([]);
});

test('muovere un pedone mantiene il DOM sincronizzato con React', async ({ page }) => {
  const pageErrors: string[] = [];
  const removeChildErrors: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message);
  });
  page.on('console', (message) => {
    if (
      message.type() === 'error'
      && /removeChild|not a child of this node|NotFoundError/i.test(message.text())
    ) {
      removeChildErrors.push(message.text());
    }
  });

  await page.goto('/chessboard?mode=multiplayer&time=600');

  const fromSquare = page.locator('#e2');
  const toSquare = page.locator('#e4');
  await expect(fromSquare.locator('img')).toHaveAttribute('src', /wp\.png$/);

  await fromSquare.click();
  await expect(toSquare).toHaveClass(/move-quiet/);
  await toSquare.click();

  await expect(fromSquare.locator('img')).toHaveCount(0);
  await expect(toSquare.locator('img')).toHaveAttribute('src', /wp\.png$/);
  await page.waitForTimeout(250);

  expect(pageErrors).toEqual([]);
  expect(removeChildErrors).toEqual([]);
});

test('la visuale passa da 2D a 3D durante la partita senza perdere la posizione', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message);
  });

  await page.goto('/chessboard?mode=multiplayer&time=600');

  await page.locator('#e2').click();
  await page.locator('#e4').click();
  await expect(page.locator('#e4 img')).toHaveAttribute('src', /wp\.png$/);

  const threeDimensionalView = page.getByRole('button', { name: 'Visuale 3D' });
  await threeDimensionalView.click();
  await expect(threeDimensionalView).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Visuale 3D' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Trascina per ruotare · scorri per zoomare')).toBeVisible();

  const twoDimensionalView = page.getByRole('button', { name: 'Visuale 2D' });
  await twoDimensionalView.click();
  await expect(twoDimensionalView).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#e2 img')).toHaveCount(0);
  await expect(page.locator('#e4 img')).toHaveAttribute('src', /wp\.png$/);

  expect(pageErrors).toEqual([]);
});

test('ChooseTime conserva la modalità e avvia anche un tempo personalizzato', async ({ page }) => {
  await page.goto('/chooseTime?mode=ai');

  await expect(page.getByRole('heading', { name: 'Scegli il Tempo', level: 1 })).toBeVisible();
  await expect(page.getByText('IA', { exact: true })).toBeVisible();
  await expect(page.getByText('Consigliato', { exact: true })).toBeVisible();
  const difficultySlider = page.getByLabel('Difficoltà di Stockfish');
  await expect(difficultySlider).toHaveValue('3');
  await difficultySlider.press('End');
  await expect(difficultySlider).toHaveValue('5');
  await expect(page.getByText('Maestro', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '10 min — Tempo per giocatore' })).toHaveAttribute(
    'href',
    '/chessboard?mode=ai&time=600&difficulty=5',
  );

  await page.getByRole('button', { name: 'Tempo Personalizzato' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tempo Personalizzato' });
  await expect(dialog).toBeVisible();

  const startButton = dialog.getByRole('button', { name: 'Inizia la partita' });
  await expect(startButton).toBeDisabled();
  await dialog.getByLabel('Secondi').fill('45');
  await expect(dialog.getByText('45 s', { exact: true })).toBeVisible();
  await expect(startButton).toBeEnabled();

  await startButton.click();
  await page.waitForURL('**/chessboard?mode=ai&time=45&difficulty=5');
  await expect(page.locator('#e2 img')).toHaveAttribute('src', /wp\.png$/);
});

test('la modalità IA usa la route interna e applica una sola risposta valida', async ({ page }) => {
  const pageErrors: string[] = [];
  const directStockfishRequests: string[] = [];
  const apiRequests: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message);
  });
  page.on('request', (request) => {
    if (request.url().includes('stockfish.online')) {
      directStockfishRequests.push(request.url());
    }
  });
  await page.route('**/api/stockfish?**', async (route) => {
    apiRequests.push(route.request().url());
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        source: 'stockfish',
        move: 'e7e5',
        bestmove: 'bestmove e7e5',
        evaluation: 0,
        mate: null,
        continuation: 'e7e5',
      }),
    });
  });

  await page.goto('/chessboard?mode=ai&time=600');
  const fromSquare = page.locator('#e2');
  const toSquare = page.locator('#e4');

  await fromSquare.click();
  await expect(toSquare).toHaveClass(/move-quiet/);
  await toSquare.click();

  await expect(page.getByRole('status')).toContainText('Stockfish sta pensando');
  await expect(page.locator('#e5 img')).toHaveAttribute('src', /bp\.png$/, { timeout: 15_000 });
  await expect(page.locator('#e7 img')).toHaveCount(0);

  expect(apiRequests).toHaveLength(1);
  expect(new URL(apiRequests[0]).searchParams.get('fen')).toContain(' b ');
  expect(new URL(apiRequests[0]).searchParams.get('depth')).toBe('10');
  expect(directStockfishRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('il catalogo challenge carica filtri e puzzle', async ({ page }, testInfo) => {
  await page.route('**/api/challenge', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          fen: 'rnb1k2r/1p1ppp2/p1p2Q2/7p/4nb1p/3PPN2/PPP3PR/RNB1KB2 w Qkq - 2 13',
          number_moves: 1,
          cpu_moves: [],
          created_at: '2026-07-22T00:00:00.000Z',
          title: 'La torre intrappolata',
          description: 'Trova il colpo di donna decisivo.',
          difficulty: 'beginner',
          theme: 'Matto con la donna',
          rating: 700,
          hint: 'Controlla la diagonale che termina in h8.',
          sort_order: 1,
        },
        {
          id: 12,
          fen: 'q2B2kr/3pb2p/1r2p3/Np3Pp1/p1Pp4/3n3P/2R4K/Q4bNR b - - 1 35',
          number_moves: 1,
          cpu_moves: [],
          created_at: '2026-07-22T00:00:00.000Z',
          title: 'Il colpo silenzioso',
          description: 'Trova l’unico matto disponibile.',
          difficulty: 'expert',
          theme: 'Unica mossa',
          rating: 1620,
          hint: 'Controlla la diagonale del re.',
          sort_order: 12,
        },
      ]),
    });
  });

  const catalogResponse = page.waitForResponse(
    (response) => response.url().includes('/api/challenge'),
    { timeout: 60_000 },
  );
  await page.goto('/challenge');
  expect((await catalogResponse).ok()).toBeTruthy();

  await expect(page.getByText('Allenamento tattico')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Avanzate' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'La torre intrappolata' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('progressbar', { name: 'Progresso challenge' })).toHaveAttribute('aria-valuenow', '0');

  await page.getByRole('button', { name: 'Esperte' }).click();
  await expect(page.getByRole('button', { name: 'Esperte' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Il colpo silenzioso' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'La torre intrappolata' })).toBeHidden();
  await page.screenshot({
    path: testInfo.outputPath(`challenge-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test('le statistiche proteggono i dati quando non si è autenticati', async ({ page }, testInfo) => {
  await page.goto('/statistics');

  await expect(page.getByText('Dati aggiornati dalle tue partite')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accedi alle tue statistiche' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', '/login');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Apri menu principale' }).click();
  }
  await expect(page.getByRole('link', { name: 'Tipi di Gioco' })).toHaveAttribute('href', '/gameMode');
  await expect(page.getByText('Classifica')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Apri chat amici' })).toHaveCount(0);
});

test('la pagina Chi siamo è localizzata e non contiene collegamenti interrotti', async ({ page }) => {
  await page.goto('/about');

  await expect(page).toHaveTitle('Chi siamo | BoardVerse');
  await expect(page.getByRole('heading', { name: 'Chi siamo', level: 1 })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'La nostra storia' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: 'Esplora le risorse' })).toHaveAttribute('href', '/challenge');
  await expect(page.locator('a[href="/careers"], a[href="/learn"]')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Il nostro team' }).click();
  await expect(page.getByRole('button', { name: 'Posizioni in arrivo' })).toBeDisabled();
});

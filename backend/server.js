require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

// ─── STORICO MISCELE ─────────────────────────────────────────────────────────

// GET /api/storico?page=1&pageSize=50&search=&dateFrom=&dateTo=&codice=
app.get('/api/storico', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, search = '', dateFrom = '', dateTo = '', codice = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const pool = await getPool();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';

    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      whereClause += ` AND (sma_articolo LIKE @search
                        OR sma_miscela LIKE @search
                        OR sma_componente LIKE @search)`;
    }
    if (dateFrom) {
      request.input('dateFrom', sql.NVarChar, dateFrom);
      whereClause += ' AND sma_giorno >= @dateFrom';
    }
    if (dateTo) {
      request.input('dateTo', sql.NVarChar, dateTo);
      whereClause += ' AND sma_giorno <= @dateTo';
    }
    if (codice) {
      request.input('codice', sql.NVarChar, `%${codice}%`);
      whereClause += ' AND sma_articolo LIKE @codice';
    }

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, parseInt(pageSize));

    const [countResult, dataResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT * FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}
         ORDER BY sma_giorno DESC
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
      ),
    ]);

    res.json({ data: dataResult.recordset, total: Number(countResult.recordset[0].total), page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('Errore /api/storico:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/storico/stats — KPI e aggregazioni per grafici
app.get('/api/storico/stats', async (req, res) => {
  try {
    const { dateFrom = '', dateTo = '' } = req.query;
    const pool = await getPool();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';
    if (dateFrom) {
      request.input('dateFrom', sql.NVarChar, dateFrom);
      whereClause += ' AND sma_giorno >= @dateFrom';
    }
    if (dateTo) {
      request.input('dateTo', sql.NVarChar, dateTo);
      whereClause += ' AND sma_giorno <= @dateTo';
    }

    // Tutte le aggregazioni in parallelo per massima velocità
    const [totalResult, articoliResult, misceleResult, perMeseResult, topArticoliResult, topMisceleResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT COUNT(DISTINCT sma_articolo) AS articoli FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT COUNT(DISTINCT sma_miscela) AS miscele FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT
           SUBSTRING(sma_giorno, 1, 4) + '-' + SUBSTRING(sma_giorno, 5, 2) AS mese,
           COUNT(*) AS conteggio
         FROM view_storico_miscele_applicate WITH (NOLOCK)
         WHERE sma_giorno >= LEFT(REPLACE(CONVERT(VARCHAR(10), DATEADD(MONTH, -12, GETDATE()), 120), '-', ''), 8)
         GROUP BY SUBSTRING(sma_giorno, 1, 4) + '-' + SUBSTRING(sma_giorno, 5, 2)
         ORDER BY mese`
      ),
      request.query(
        `SELECT TOP 10 sma_articolo AS cod_articolo, COUNT(*) AS conteggio
         FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}
         GROUP BY sma_articolo
         ORDER BY conteggio DESC`
      ),
      request.query(
        `SELECT TOP 10 sma_miscela AS cod_miscela, COUNT(*) AS conteggio
         FROM view_storico_miscele_applicate WITH (NOLOCK) ${whereClause}
         GROUP BY sma_miscela
         ORDER BY conteggio DESC`
      ),
    ]);

    res.json({
      kpi: {
        total: Number(totalResult.recordset[0].total),
        articoli: articoliResult.recordset[0].articoli,
        miscele: misceleResult.recordset[0].miscele,
      },
      perMese: perMeseResult.recordset,
      topArticoli: topArticoliResult.recordset,
      topMiscele: topMisceleResult.recordset,
    });
  } catch (err) {
    console.error('Errore /api/storico/stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ARTICOLI PRODOTTO FINITO ─────────────────────────────────────────────────

app.get('/api/articoli', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      whereClause += ` AND (MG66_CODART LIKE @search
                        OR MG53_DESCRFAM LIKE @search
                        OR MG55_DESCRGRUPPO LIKE @search)`;
    }

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, parseInt(pageSize));

    const [countResult, dataResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total FROM view_alyante_ana_articoli_filtri WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT * FROM view_alyante_ana_articoli_filtri WITH (NOLOCK) ${whereClause}
         ORDER BY MG66_CODART
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
      ),
    ]);

    res.json({ data: dataResult.recordset, total: Number(countResult.recordset[0].total), page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('Errore /api/articoli:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── COMPONENTI ───────────────────────────────────────────────────────────────

app.get('/api/componenti', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, search = '', codArticolo = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      whereClause += ` AND (MG66_CODART LIKE @search
                        OR MG87_DESCART LIKE @search
                        OR combo LIKE @search)`;
    }
    if (codArticolo) {
      request.input('codArticolo', sql.NVarChar, codArticolo);
      whereClause += ' AND MG66_CODART = @codArticolo';
    }

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, parseInt(pageSize));

    const [countResult, dataResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total FROM view_alyante_ana_articoli_filtri_componenti WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT * FROM view_alyante_ana_articoli_filtri_componenti WITH (NOLOCK) ${whereClause}
         ORDER BY MG66_CODART
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
      ),
    ]);

    res.json({ data: dataResult.recordset, total: Number(countResult.recordset[0].total), page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('Errore /api/componenti:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ANALISI MISCELE ──────────────────────────────────────────────────────────

// GET /api/analisi-miscele/filtri — valori distinti per i dropdown
app.get('/api/analisi-miscele/filtri', async (req, res) => {
  try {
    const pool = await getPool();

    const [articoli, macchine, varianti] = await Promise.all([
      pool.request().query(
        `SELECT DISTINCT sma_articolo AS cod_articolo
         FROM view_analisi_storico_miscele_materie_prime_piu_usate WITH (NOLOCK)
         WHERE sma_articolo IS NOT NULL
         ORDER BY sma_articolo`
      ),
      pool.request().query(
        `SELECT DISTINCT sma_macchina AS cod_macchina
         FROM view_analisi_storico_miscele_materie_prime_piu_usate WITH (NOLOCK)
         WHERE sma_macchina IS NOT NULL
         ORDER BY sma_macchina`
      ),
      pool.request().query(
        `SELECT DISTINCT Categoria_Articolo AS variante
         FROM view_analisi_storico_miscele_materie_prime_piu_usate WITH (NOLOCK)
         WHERE Categoria_Articolo IS NOT NULL
         ORDER BY Categoria_Articolo`
      ),
    ]);

    // Imposta cache 5 minuti per i filtri (cambiano raramente)
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      articoli: articoli.recordset,
      macchine: macchine.recordset,
      varianti: varianti.recordset,
    });
  } catch (err) {
    console.error('Errore /api/analisi-miscele/filtri:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analisi-miscele — lista miscele filtrate per articolo/macchina/variante
app.get('/api/analisi-miscele', async (req, res) => {
  try {
    const { codArticolo = '', codMacchina = '', variante = '', page = 1, pageSize = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();
    const request = pool.request();

    let whereClause = 'WHERE 1=1';

    if (codArticolo) {
      request.input('codArticolo', sql.NVarChar, codArticolo);
      whereClause += ' AND sma_articolo = @codArticolo';
    }
    if (codMacchina) {
      request.input('codMacchina', sql.NVarChar, codMacchina);
      whereClause += ' AND sma_macchina = @codMacchina';
    }
    if (variante) {
      request.input('variante', sql.NVarChar, variante);
      whereClause += ' AND Categoria_Articolo = @variante';
    }

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, parseInt(pageSize));

    const [countResult, dataResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total FROM view_analisi_storico_miscele_materie_prime_piu_usate WITH (NOLOCK) ${whereClause}`
      ),
      request.query(
        `SELECT *
         FROM view_analisi_storico_miscele_materie_prime_piu_usate WITH (NOLOCK) ${whereClause}
         ORDER BY Volte_Utilizzata DESC
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
      ),
    ]);

    res.json({ data: dataResult.recordset, total: Number(countResult.recordset[0].total), page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (err) {
    console.error('Errore /api/analisi-miscele:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analisi-miscele/dettaglio?miscelaRif=X&page=1&pageSize=50
// Dettaglio storico per la _Miscela_Riferimento selezionata
app.get('/api/analisi-miscele/dettaglio', async (req, res) => {
  try {
    const { miscelaRif = '', page = 1, pageSize = 50 } = req.query;
    if (!miscelaRif) return res.status(400).json({ error: 'miscelaRif obbligatorio' });

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();
    const request = pool.request();

    request.input('miscelaRif', sql.NVarChar, miscelaRif);
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, parseInt(pageSize));

    const [countResult, dataResult] = await Promise.all([
      request.query(
        `SELECT COUNT_BIG(*) AS total
         FROM view_storico_miscele_applicate WITH (NOLOCK)
         WHERE sma_miscela = @miscelaRif`
      ),
      request.query(
        `SELECT *
         FROM view_storico_miscele_applicate WITH (NOLOCK)
         WHERE sma_miscela = @miscelaRif
         ORDER BY sma_giorno DESC
         OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
      ),
    ]);

    res.json({ data: dataResult.recordset, total: Number(countResult.recordset[0].total), page: parseInt(page), pageSize: parseInt(pageSize), miscelaRif });
  } catch (err) {
    console.error('Errore /api/analisi-miscele/dettaglio:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// ─── STORICO RICETTE PER ARTICOLO/VARIANTE ───────────────────────────────────

// GET /api/storico-ricette?page&pageSize&miscela&articolo&variante
app.get('/api/storico-ricette', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, miscela = '', articolo = '', variante = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();
    const req1 = pool.request();
    let where = 'WHERE 1=1';
    if (miscela)  { req1.input('miscela',  sql.NVarChar, miscela);  where += ' AND sma_miscela  = @miscela'; }
    if (articolo) { req1.input('articolo', sql.NVarChar, articolo); where += ' AND sma_articolo = @articolo'; }
    if (variante) { req1.input('variante', sql.NVarChar, variante); where += ' AND sma_variante = @variante'; }

    const [countRes, dataRes] = await Promise.all([
      pool.request()
        .input('miscela2',  sql.NVarChar, miscela  || null)
        .input('articolo2', sql.NVarChar, articolo || null)
        .input('variante2', sql.NVarChar, variante || null)
        .query(`SELECT COUNT_BIG(*) AS tot FROM (
          SELECT sma_miscela, sma_articolo, sma_variante
          FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
          WHERE (@miscela2  IS NULL OR sma_miscela  = @miscela2)
            AND (@articolo2 IS NULL OR sma_articolo = @articolo2)
            AND (@variante2 IS NULL OR sma_variante = @variante2)
          GROUP BY sma_miscela, sma_articolo, sma_variante
        ) t`),
      req1.query(`
        SELECT
          sma_miscela,
          sma_articolo,
          sma_variante,
          COUNT_BIG(DISTINCT sma_giorno + ISNULL(CAST(sma_lancio_opt AS NVARCHAR), '')) AS n_applicazioni,
          MIN(sma_giorno) AS prima_data,
          MAX(sma_giorno) AS ultima_data,
          COUNT_BIG(*) AS n_righe,
          STUFF((
            SELECT DISTINCT ', ' + ISNULL(s2.sma_macchina,'?')
            FROM [dbo].[view_storico_miscele_applicate] s2 WITH (NOLOCK)
            WHERE s2.sma_miscela  = s.sma_miscela
              AND s2.sma_articolo = s.sma_articolo
              AND s2.sma_variante = s.sma_variante
            FOR XML PATH(''), TYPE
          ).value('.','NVARCHAR(MAX)'), 1, 2, '') AS macchine
        FROM [dbo].[view_storico_miscele_applicate] s WITH (NOLOCK)
        ${where}
        GROUP BY sma_miscela, sma_articolo, sma_variante
        ORDER BY MAX(sma_giorno) DESC, sma_articolo, sma_miscela
        OFFSET ${offset} ROWS FETCH NEXT ${parseInt(pageSize)} ROWS ONLY
      `)
    ]);

    res.json({ data: dataRes.recordset, total: Number(countRes.recordset[0].tot) });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// GET /api/storico-ricette/dettaglio?miscela=X&articolo=Y&variante=Z&page=1&pageSize=100
app.get('/api/storico-ricette/dettaglio', async (req, res) => {
  try {
    const { miscela, articolo, variante, page = 1, pageSize = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const pool = await getPool();

    const [countRes, dataRes] = await Promise.all([
      pool.request()
        .input('m', sql.NVarChar, miscela  || '')
        .input('a', sql.NVarChar, articolo || '')
        .input('v', sql.NVarChar, variante || '')
        .query(`SELECT COUNT_BIG(*) AS tot
                FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
                WHERE sma_miscela = @m AND sma_articolo = @a AND sma_variante = @v`),
      pool.request()
        .input('m2', sql.NVarChar, miscela  || '')
        .input('a2', sql.NVarChar, articolo || '')
        .input('v2', sql.NVarChar, variante || '')
        .query(`SELECT
                  sma_giorno, sma_lancio_opt, sma_macchina, sma_estrusore,
                  sma_componente, sma_codice_componente_fornitore,
                  sma_quantita, sma_percentuale, sma_percentuale_estrusore,
                  sma_costo_uni, sma_costo_listino_attivo
                FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
                WHERE sma_miscela = @m2 AND sma_articolo = @a2 AND sma_variante = @v2
                ORDER BY sma_giorno DESC, sma_lancio_opt, sma_estrusore, sma_componente
                OFFSET ${offset} ROWS FETCH NEXT ${parseInt(pageSize)} ROWS ONLY`)
    ]);

    res.json({ data: dataRes.recordset, total: Number(countRes.recordset[0].tot) });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// ─── AUTOCOMPLETE / SUGGERIMENTI ─────────────────────────────────────────────

// GET /api/suggerimenti/storico-varianti?q=
app.get('/api/suggerimenti/storico-varianti', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT DISTINCT TOP 15 sma_variante AS val
              FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
              WHERE sma_variante LIKE @q AND sma_variante IS NOT NULL AND sma_variante <> ''
              ORDER BY sma_variante`);
    res.json(r.recordset.map(x => x.val));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/suggerimenti/storico-articoli?q=
app.get('/api/suggerimenti/storico-articoli', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT DISTINCT TOP 15 sma_articolo AS val
              FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
              WHERE sma_articolo LIKE @q
              ORDER BY sma_articolo`);
    res.json(r.recordset.map(x => x.val));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/suggerimenti/storico-miscele?q=
app.get('/api/suggerimenti/storico-miscele', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT DISTINCT TOP 15 sma_miscela AS val
              FROM [dbo].[view_storico_miscele_applicate] WITH (NOLOCK)
              WHERE sma_miscela LIKE @q
              ORDER BY sma_miscela`);
    res.json(r.recordset.map(x => x.val));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/suggerimenti/articoli?q=
app.get('/api/suggerimenti/articoli', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT TOP 15 MG66_CODART AS codice, MG53_DESCRFAM AS famiglia
              FROM [dbo].[view_alyante_ana_articoli_filtri] WITH (NOLOCK)
              WHERE MG66_CODART LIKE @q OR MG53_DESCRFAM LIKE @q
              ORDER BY MG66_CODART`);
    res.json(r.recordset.map(x => ({ label: x.codice + (x.famiglia ? ' – ' + x.famiglia : ''), value: x.codice })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/suggerimenti/componenti-codart?q=
app.get('/api/suggerimenti/componenti-codart', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT DISTINCT TOP 15 MG66_CODART AS val
              FROM [dbo].[view_alyante_ana_articoli_filtri_componenti] WITH (NOLOCK)
              WHERE MG66_CODART LIKE @q
              ORDER BY MG66_CODART`);
    res.json(r.recordset.map(x => x.val));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/suggerimenti/componenti-desc?q=
app.get('/api/suggerimenti/componenti-desc', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`SELECT DISTINCT TOP 15 MG87_DESCART AS val
              FROM [dbo].[view_alyante_ana_articoli_filtri_componenti] WITH (NOLOCK)
              WHERE MG87_DESCART LIKE @q
              ORDER BY MG87_DESCART`);
    res.json(r.recordset.map(x => x.val));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend avviato su http://localhost:${PORT}`);
  getPool()
    .then(() => console.log('Connessione SQL Server OK'))
    .catch((err) => console.error('Errore connessione DB:', err.message));
});

# Dashboard Ricette – Lirsa

Dashboard React + Node.js per visualizzare i dati MES dal database **Optimus_DSG** su SQL Server `10.0.0.23`.

## Struttura

```
Dashboard_ricette_Lirsa/
├── backend/      ← Express + mssql (API REST)
└── frontend/     ← React Vite + Tailwind CSS
```

## Setup

### 1. Configura le credenziali DB

Modifica `backend/.env`:

```env
DB_HOST=10.0.0.23
DB_PORT=1433
DB_USER=tuo_utente
DB_PASSWORD=tua_password
DB_NAME=Optimus_DSG
PORT=3001
```

### 2. Installa dipendenze

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Avvia

**Terminale 1 – Backend:**
```bash
cd backend
npm run dev
```

**Terminale 2 – Frontend:**
```bash
cd frontend
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173)

---

## Viste SQL utilizzate

| Vista | Descrizione |
|-------|-------------|
| `view_storico_miscele_applicate` | Storico completo miscele applicate dal MES |
| `view_alyante_ana_articoli_filtri` | Prodotti finiti (anagrafica articoli) |
| `view_alyante_ana_articoli_filtri_componenti` | Componenti dei prodotti finiti |

## Note

- Le colonne delle tabelle vengono scoperte **automaticamente** al runtime dalla struttura delle viste.
- I filtri nella pagina Storico usano le colonne `cod_articolo`, `des_articolo`, `cod_miscela`, `data_produzione`. Se i nomi delle colonne nel DB differiscono, aggiorna `backend/server.js`.

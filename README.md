# Boardverse

## Descrizione del progetto

**Boardverse** è una piattaforma web dedicata ai giochi da tavolo, a cominciare dagli **scacchi**, pensata per unire giocatori di ogni livello in un unico spazio digitale. L’obiettivo del progetto è offrire un luogo dove *le strategie si incontrano e le sfide prendono vita*, permettendo agli utenti di giocare a scacchi online, migliorare le proprie abilità tramite sfide/puzzle e connettersi con amici e appassionati di tutto il mondo. In futuro la piattaforma è progettata per espandersi e includere altri giochi da tavolo (ad esempio la dama, come indicato nell’app). Il progetto nasce dalla passione per il gioco degli scacchi e dall’idea di creare un’esperienza coinvolgente, accessibile sia ai principianti sia ai giocatori esperti.

## Funzionalità principali

* **Modalità di Gioco Varie:** È possibile giocare partite di scacchi in diverse modalità:

  * **Giocatore vs IA:** sfida un motore scacchistico (integrato tramite Stockfish) per partite contro il computer a vari livelli di difficoltà.
  * **Multigiocatore Locale:** due giocatori possono giocare sulla stessa macchina in locale, condividendo la scacchiera.
  * **Online PvP:** gioca partite online in tempo reale con altri utenti. Si possono creare nuovi tavoli di gioco specificando tempo di gara e modalità, oppure unirsi a partite esistenti. Le partite online supportano la condivisione di un link per invitare direttamente un amico e includono l’aggiornamento in tempo reale delle mosse sulla scacchiera.
  * **Sfide e Puzzle:** metti alla prova le tue abilità con problemi di scacchi predefiniti (es. *“mate in 2”* e simili). Le sfide presentano posizioni specifiche (fornite in notazione FEN) in cui il giocatore deve trovare lo scacco matto o la soluzione in un numero limitato di mosse. Il completamento delle sfide viene tracciato per ogni utente, sbloccando eventualmente **trofei** o ricompense virtuali.
* **Sistema di Profilo e Statistiche:** Ogni utente registrato ha un profilo personale con informazioni come nome, username, biografia e statistiche di gioco. Vengono registrati dati come numero di partite giocate, vittorie e altre statistiche salienti. L’utente può personalizzare le proprie preferenze (ad esempio lingua dell’interfaccia, tema chiaro/scuro, visibilità del profilo, notifiche ecc.).
* **Autenticazione e Gestione Utenti:** La piattaforma include un sistema di registrazione e login utenti. È possibile creare un nuovo account fornendo nome, username, email e password (con validazione dei requisiti di complessità della password) e successivamente autenticarsi per accedere alle funzionalità di gioco online. Le password sono gestite in modo sicuro (hash e salvataggio sicuro tramite libreria *bcryptjs*).
* **Social e Amici:** Boardverse integra funzionalità social basilari. Gli utenti possono aggiungere altri giocatori come **amici**, inviare richieste di amicizia e gestire una lista amici. È presente una chat integrata: si può avviare una conversazione privata con un amico direttamente dalla piattaforma. I messaggi vengono inviati in tempo reale e le nuove chat o messaggi sono notificati dinamicamente. Queste funzioni incentivano la creazione di una comunità all’interno dell’app, permettendo anche di organizzare facilmente partite private con persone che si conoscono.
* **Interfaccia Multilingua:** L’applicazione è disponibile in più lingue (attualmente Italiano, Inglese, Spagnolo, Francese e Tedesco) grazie al supporto di **i18n**. L’utente può selezionare la lingua preferita e tutti i testi dell’interfaccia (menu, pulsanti, descrizioni) verranno mostrati nella lingua scelta. Ciò rende Boardverse fruibile da un pubblico internazionale.
* **Esperienza Utente Moderna:** L’interfaccia è stata realizzata con un design moderno e responsive. È presente una modalità **tema scuro/chiaro** attivabile in base alle preferenze utente, utile anche per chi ha esigenze di accessibilità (es. modalità high-contrast o per daltonici prevista nelle impostazioni). La scacchiera utilizza immagini di pezzi ad alta qualità (pezzi in stile “neo” forniti da chess.com) ed evidenzia le mosse valide, scacco al re, ecc. Inoltre, sono stati integrati elementi grafici 3D: ad esempio, animazioni tridimensionali di pedoni e un modello 3D di trofeo ruotante rendono l’esperienza visivamente più accattivante. *(Nota: le animazioni 3D richiedono WebGL e hardware grafico adeguato, ma l’app si degrada graficamente in modo elegante se non supportate.)*
* **Aggiornamenti in Tempo Reale:** Grazie alla tecnologia backend scelta, le mosse degli avversari nelle partite online, le nuove partite create, le notifiche di amicizia e i messaggi in chat avvengono in tempo reale senza bisogno di ricaricare la pagina. Questo garantisce un’esperienza fluida e interattiva, fondamentale per un gioco come gli scacchi online.
* **Architettura Scalabile:** La piattaforma è pensata per essere estensibile. Ad esempio, è già predisposta una sezione “Game Types” in cui comparirà in futuro il gioco della **Dama** (attualmente indicato come “disponibile presto”) e potenzialmente altri giochi da tavolo. L’infrastruttura modulare consente di aggiungere nuovi giochi mantenendo le stesse funzionalità social, di matchmaking e di tracking statistiche già implementate per gli scacchi.

## Panoramica tecnica

Boardverse è stato sviluppato con un’architettura **web full-stack** moderna, sfruttando un front-end reattivo e un backend serverless/database gestito. Di seguito una panoramica degli aspetti tecnici principali:

* **Framework Front-end:** Il progetto è costruito con **Next.js** (versione 13+ con App Router), un framework React che combina i vantaggi di una Single Page Application con Rendering lato server (SSR) e API routing integrato. Next.js gestisce le pagine dell’applicazione (es. homepage, scacchiera, profilo, ecc.) all’interno della cartella `src/app` e fornisce la struttura per definire facilmente le rotte API server-side (utilizzate per implementare logiche come registrazione utenti, gestione amicizie, ecc.).
* **Linguaggio:** Tutto il codice applicativo è scritto in **TypeScript**, garantendo tipizzazione statica e maggiore sicurezza e manutenibilità del codice sia lato client che lato server.
* **Libreria UI e Stile:** L’interfaccia utente è realizzata in **React** e stilizzata principalmente con **Tailwind CSS**, un framework CSS utility-first che permette di designare componenti responsive e tematizzabili (dark mode) in maniera efficiente. Si fa anche uso di componenti UI accessori come **Headless UI** (per elementi accessibili e già stilizzati come modali) e set di icone come **Heroicons** e **Lucide Icons** per arricchire l’esperienza visiva. È presente nel progetto anche **Bootstrap 5** (incluso per specifiche necessità di stile e per le icone *Bootstrap Icons*), sebbene la maggior parte dello styling sia demandata a Tailwind.
* **Backend e Database:** Come backend **non** è utilizzato un server custom tradizionale, bensì i servizi forniti da **Supabase** – una piattaforma Backend-as-a-Service basata su PostgreSQL. Supabase gestisce:

  * Un database SQL (PostgreSQL) per conservare dati persistenti: profili utenti, partite (con dettagli come giocatori, mosse, stato), richieste di amicizia, liste amici, messaggi di chat, elenco delle sfide scacchistiche, ecc.
  * Un sistema di autenticazione utente (basato su tabelle utenti) integrabile facilmente. *(Nota: L’applicazione attuale implementa la registrazione manualmente via API Next, ma avrebbe potuto utilizzare direttamente l’Auth di Supabase; in entrambi i casi le credenziali e gli utenti finiscono nella base dati.)*
  * **Supabase Realtime:** una funzionalità che permette di sottoscriversi ai cambiamenti del database in tempo reale. Boardverse sfrutta questa caratteristica per aggiornare immediatamente l’interfaccia quando avvengono eventi importanti: ad esempio, quando l’avversario effettua una mossa la riga corrispondente nella tabella `games` viene aggiornata e tutti i client in ascolto su quella partita ricevono l’update; analogamente, l’inserimento di un nuovo messaggio nella tabella `messages` viene inviato in push al destinatario in chat senza polling. Questo evita la necessità di implementare manualmente un server WebSocket custom, delegando a Supabase la sincronizzazione realtime.
  * **API e Funzioni Serverless:** Alcune logiche sono implementate tramite le API Routes di Next (funzioni serverless in Node) che interagiscono con Supabase. Ad esempio, le rotte in `src/app/api/` gestiscono richieste come la creazione di una nuova richiesta di amicizia, l’inserimento e recupero di sfide completate, ecc., effettuando operazioni sul database tramite gli SDK Supabase.
* **Motore Scacchistico (AI):** Per implementare la modalità **giocatore vs computer**, Boardverse integra il motore open-source **Stockfish**. In particolare, l’applicazione invia la posizione corrente in notazione FEN a un’API esterna (stockfish.online) che fornisce la mossa migliore calcolata dal motore. Questo approccio evita di dover ospitare localmente il motore (che può essere oneroso) e sfrutta un servizio online per ottenere mosse IA in base a una profondità di analisi impostata. Il risultato è che l’utente può giocare contro un “computer” che risponde in modo intelligente, simulando diversi livelli di abilità in base alla profondità scelta.
* **Graphics 3D:** Il progetto utilizza **Three.js** (tramite il wrapper React **@react-three/fiber** e utilità di **@react-three/drei**) per gestire elementi 3D nell’interfaccia. Ad esempio, sono stati importati modelli `.glb` di un pedone e di un trofeo (resi disponibili in `public/models/`) e vengono renderizzati su canvas WebGL dentro componenti React. Questi elementi 3D sono usati per animazioni decorative (pedoni fluttuanti sullo sfondo della pagina di gioco, un trofeo rotante a fine partita o nella pagina profilo per indicare vittorie/sfide completate, ecc.). L’uso di React Three Fiber permette di definire scene 3D in JSX, integrandole facilmente col resto dell’app React.
* **Altre librerie e utilità:**

  * **next-i18next:** gestisce la localizzazione dell’app caricando i file di traduzione JSON per le varie lingue e fornendo il meccanismo di traduzione di testi nell’UI.
  * **bcryptjs:** utilizzato per cifrare in hash le password degli utenti prima di salvarle nel database, aggiungendo un livello di sicurezza all’archiviazione delle credenziali.
  * **ESLint:** il progetto include configurazioni di linting (con preset Next.js) per garantire uno stile di codice consistente e prevenire errori comuni. `npm run lint` può essere usato per analizzare il codice.
  * **Playwright:** nelle dipendenze di sviluppo è presente il framework di testing **Playwright**, il che indica che il progetto è predisposto per test end-to-end (ad esempio simulare l’interazione di un utente con il browser, come registrazione, login, partita, ecc.). È fornito uno script `npm run install:drivers` per installare i browser necessari ai test Playwright. *(Attualmente non sono inclusi test completi nella repository, ma la configurazione permette di aggiungerli facilmente.)*

In sintesi, tecnologie moderne e un’architettura orientata ai servizi (Supabase) rendono Boardverse un’app scalabile e manutenibile, con un front-end reattivo e ricco di funzionalità in real-time senza la complessità di dover gestire server dedicati per il gioco e la comunicazione.

## Installazione e avvio dell’applicazione

Di seguito sono riportati i passi dettagliati per installare e avviare Boardverse in ambiente locale per scopi di sviluppo o test:

1. **Requisiti Prerequisiti:** Assicurarsi di aver installato **Node.js** (si consiglia la versione LTS più recente, es. Node 18 o superiore) e un gestore di pacchetti come npm (incluso con Node) oppure **Yarn**/**pnpm**.
2. **Clonare il Repository:** Aprire un terminale ed eseguire:

   ```bash
   git clone https://github.com/JakeKing0001/board-verse-new.git 
   ```

   Questo copierà i file di progetto sul proprio computer.
3. **Installare le Dipendenze:** Spostarsi nella directory del progetto e installare le dipendenze npm:

   ```bash
   cd board-verse-new
   npm install
   ```

   *(In alternativa è possibile usare `yarn install` se si preferisce Yarn, oppure `pnpm install` se si usa pnpm – il progetto è compatibile con tutti e tre i gestori di pacchetti.)*
4. **Configurare le Variabili d’Ambiente:** Creare un file `.env.local` nella radice del progetto e definire le variabili `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` con i valori forniti dal proprio progetto Supabase. Il file `lib/supabase.js` le leggerà automaticamente per inizializzare il client.
5. **Avviare il Server di Sviluppo:** Eseguire il comando:

   ```bash
   npm run dev
   ```

   Questo avvierà l’applicazione in modalità sviluppo. Per default Next.js utilizza l’indirizzo `http://localhost:3000`. Aprire quindi il browser e navigare all’URL [http://localhost:3000](http://localhost:3000) per vedere l’app in funzione.
6. **Visibilità locale:** Una volta caricata la pagina, dovresti vedere la homepage di Boardverse. Da qui, se non hai un account, puoi registrarne uno nuovo; altrimenti procedi con il login per accedere.
7. **Comandi aggiuntivi:**

   * Per eseguire un **build di produzione** ottimizzato (ad esempio per distribuire l’app su un hosting/Vercel), usare:

     ```bash
     npm run build
     ```

     seguito da

     ```bash
     npm run start
     ```

     per avviare il server Node con i file statici generati. In modalità produzione verranno applicate ottimizzazioni e l’app girerà in ambiente Node.js.
   * Per eseguire i **test** (qualora ne vengano aggiunti in futuro), assicurarsi di aver eseguito `npm run build` e di aver lanciato il server in background, poi utilizzare i comandi forniti da Playwright (ad esempio `npx playwright test`). Prima di eseguire i test end-to-end la prima volta, eseguire `npm run install:drivers` per installare i browser necessari a Playwright.
8. **Problemi comuni:** Se l’app non si avvia correttamente, verificare di avere la versione di Node compatibile, che la porta 3000 non sia occupata da altri servizi e controllare il terminale per eventuali messaggi di errore (ad esempio errori di connessione a Supabase se le chiavi/API non sono corrette). In caso di errori di lint o di compilazione TypeScript, assicurarsi di avere tutte le dipendenze installate e di aver fatto eventuali migrate allo schema del database se si usa un proprio Supabase.

Dopo questi passi, Boardverse dovrebbe essere funzionante in locale. Potrai creare account di test e simulare partite o usare le varie funzionalità come faresti sulla versione live.

## Esempi d’uso dell’applicazione

Di seguito descriviamo alcuni esempi di come utilizzare Boardverse una volta avviata, esplorando i principali flussi utente:

* **Registrazione e Login:** Aprendo l’app la prima schermata mostra l’opzione di effettuare il **Login**. Se non si possiede un account, cliccare su “Registrati qui” per accedere al modulo di registrazione. Inserire nome, username desiderato, email e password. Sono previsti controlli sui campi (ad esempio la password deve avere almeno 6 caratteri, con almeno una maiuscola, un numero e un carattere speciale). Dopo la registrazione, l’app effettua automaticamente il login o reindirizza alla pagina di accesso. Inserire le credenziali per autenticarsi. Da questo momento si avrà un profilo utente attivo e si potrà accedere alle aree di gioco.
* **Pagina Home (Start Playing):** Dopo il login si viene accolti da una homepage che presenta il nome **Boardverse** e il motto del sito, con un pulsante “Inizia a Giocare”. Cliccando il pulsante (assicurarsi di essere loggati, altrimenti verrà mostrato un messaggio di errore chiedendo di autenticarsi prima) si accede alla **selezione della modalità di gioco**.
* **Selezione Modalità di Gioco:** Nella pagina *Game Mode* si possono scegliere quattro categorie:

  * **Multigiocatore (locale):** per giocare in due sulla stessa scacchiera. Selezionando questa modalità, si aprirà direttamente la scacchiera di gioco. I due utenti possono muovere i pezzi a turno usando lo stesso dispositivo – il gioco non applicherà controllo del tempo né necessita di un secondo account, è pensato per due persone fisicamente presenti.
  * **AI (Computer):** questa modalità consente di giocare contro il computer. Prima di iniziare, potrebbe essere richiesto di scegliere un livello di difficoltà o un tempo. Una volta avviata la partita, il motore Stockfish calcolerà le risposte alle tue mosse. Ogni volta che il giocatore esegue una mossa sulla scacchiera, l’app contatta l’API di Stockfish con la posizione attuale e attende la “mossa migliore” suggerita dall’engine, che verrà poi giocata dal lato computer. Puoi così allenarti contro l’IA e migliorare le tue capacità.
  * **Online:** questa è la modalità di punta per le partite tra utenti a distanza. Cliccando su *Online* si entra nella lobby online:

    * Viene mostrata una lista delle ultime partite create dagli utenti, con informazioni su nome/titolo della partita, tempo di gioco, stato (in attesa, in corso, concluse). Puoi usare questa lista per trovare una partita pubblica a cui unirti.
    * Puoi **creare una nuova partita online** cliccando sull’apposito pulsante. Ti verrà richiesto di inserire un nome partita (opzionale), impostare il tempo di gioco (puoi scegliere tra preset *Veloce, Standard, Daily* o inserire un tempo personalizzato – giorni/ore/minuti/secondi – tramite il modulo *Custom Time*), e scegliere se la partita sarà **privata** o visibile pubblicamente. Confermando, la partita viene creata: l’app genererà un *Game ID* univoco e ti reindirizzerà alla scacchiera in modalità attesa.
    * **Invitare un avversario:** se hai creato una partita privata (o anche pubblica ma vuoi far entrare un amico specifico), puoi condividere il link URL della partita. La schermata di attesa mostrerà un messaggio tipo “In attesa di un avversario... Condividi il link per far entrare un altro giocatore.” finché qualcuno non si unisce. Non appena un altro giocatore (autenticato) visita quel link, verrà collegato alla partita come sfidante. La partita inizierà automaticamente quando entrambi i giocatori sono presenti.
    * **Unirsi a una partita esistente:** dalla lobby online, puoi scegliere una partita pubblica dalla lista *Recent Games* e parteciparvi se è in stato “waiting”. In alternativa, se hai ricevuto un codice partita o un link, puoi usare l’opzione di **ricerca per ID** (inserisci l’ID fornito e unisciti direttamente).
    * Durante la partita online, i movimenti dell’avversario appaiono in tempo reale sulla tua scacchiera, con aggiornamento automatico grazie alle sottoscrizioni realtime di Supabase. È anche presente un **timer** (orologio chess clock) visualizzato per entrambi i giocatori grazie al componente *ChessTimer*, e la partita segue le regole standard degli scacchi (inclusi casi particolari come arrocco, en passant, promozione pedone – gestita tramite un’apposita finestra di dialogo per scegliere il pezzo della promozione).
    * Puoi abbandonare la partita in qualsiasi momento o offrire patta (se implementato nelle opzioni – attualmente il focus è sul completare la partita fino allo scacco matto o esaurimento del tempo).
    * Al termine, il risultato (vittoria, sconfitta o patta) viene registrato e nel profilo di ciascun giocatore saranno aggiornate le statistiche.
  * **Sfide:** selezionando *Challenge* (Sfide) si accede alla sezione puzzle. Qui trovi un elenco di problemi di scacchi di difficoltà variabile. La pagina *Sfide* mostra una griglia di card numerate: ciascun riquadro rappresenta un puzzle da risolvere. Puoi vedere a colpo d’occhio quali hai già completato (evidenziati in rosso o con un’icona trofeo, a seconda del tema) e quali sono ancora da tentare. Cliccando su una sfida, entrerai in modalità puzzle: ti verrà presentata una scacchiera con una configurazione specifica di pezzi (indicata anche dalla descrizione es. *“Matto in 2 mosse”*). Lo scopo è risolvere il puzzle eseguendo le mosse corrette per arrivare allo scacco matto dell’avversario nel numero di mosse indicato. Se sbagli una mossa o superi il limite di mosse, verrai notificato (es. “Nessuno scacco matto questa volta. Riprova!”) e potrai ritentare la sfida. Quando trovi la soluzione, la sfida viene marcata come completata e salvata per il tuo utente. Puoi collezionare **ricompense** o semplicemente soddisfazione personale completando tutte le sfide disponibili.
* **Gestione Amici e Chat:** Nella barra di navigazione c’è la sezione **Amici**, attraverso la quale puoi:

  * Cercare altri utenti registrati (per username o email) e inviare loro una **richiesta di amicizia**. Quando mandi una richiesta, questa viene salvata nel database (tabella friend\_requests) e l’utente destinatario vedrà una notifica nell’app (ad esempio un badge o un elenco di richieste in sospeso).
  * Accettare o rifiutare richieste di amicizia ricevute. Se accettate, l’utente viene aggiunto alla tua lista amici (memorizzata in tabella friends) e viceversa.
  * Aprire la **chat amici**: puoi selezionare un amico dalla lista e iniziare a scambiare messaggi in tempo reale. Un piccolo popup/modal di chat si aprirà mostrando la cronologia messaggi con quell’amico e un campo per inviare nuovi messaggi. Quando invii un messaggio, questo viene inserito nella tabella `messages` con il tuo ID come sender e l’ID dell’amico come receiver, e quasi istantaneamente il tuo amico (se online) lo vedrà apparire nella sua finestra di chat (grazie alla sottoscrizione realtime ai nuovi messaggi per l’utente). La chat supporta messaggi di testo (eventualmente l’invio di allegati era in piano, dato l’uso di un’icona *Paperclip*, ma attualmente è focalizzata sul testo). Puoi quindi organizzare le partite, discutere mosse o semplicemente fare due chiacchiere con i tuoi amici direttamente su Boardverse.
* **Profilo Utente e Impostazioni:** Cliccando sul proprio nome/username (o sull’icona profilo) si accede alla pagina **Profilo**. Qui troverai:

  * I dati personali: nome, username, bio, eventuale avatar (nell’interfaccia *About* sono citati avatar per il team, e c’è supporto per avatar utenti se implementato). Puoi modificare queste informazioni dalla pagina *Settings/Impostazioni*.
  * **Statistiche di gioco:** numero di partite giocate, vittorie, punteggio Elo (se previsto in futuro), ecc. Queste statistiche vengono aggiornate automaticamente al termine delle partite.
  * **Impostazioni**: in questa sezione puoi regolare preferenze come lingua dell’app, tema scacchiera, abilitare/disabilitare notifiche via email o in-app per eventi (inviti gioco, richieste amicizia, newsletter), la visibilità del tuo profilo agli altri, lo stato online/offline visibile o meno, e anche opzioni di accessibilità come la modalità per daltonici o la dimensione del testo. Le impostazioni vengono salvate (tramite l’endpoint `/api/settings`) nel tuo profilo utente su database, così rimangono consistenti ad ogni accesso.
* **Altre Pagine:** La navigazione include anche:

  * **Home:** per tornare alla pagina principale.
  * **Chi Siamo (About):** una pagina informativa sul progetto, dove viene raccontata (in forma di timeline e team) la storia di “ChessMaestro” – nome fittizio del progetto scacchistico – con obiettivi e membri del team immaginario che ha contribuito. È una sezione creata per dare spessore al progetto e mostrare contenuti statici multilingua (come esempio di utilizzo di next-i18next). Vi si trovano anche riferimenti cronologici (fondazione nel 2018 come piccolo club, crescita fino al lancio della piattaforma online, ecc.) e la “mission” del progetto di diffondere gli scacchi in modo accessibile.
  * **Errore 404:** se si naviga a una pagina inesistente, viene mostrata una pagina di errore personalizzata (con stile coerente al resto del sito) che invita a tornare in home o a contattare il supporto.

Questi esempi coprono i casi d’uso principali. In generale, l’app è stata pensata per essere intuitiva: una volta dentro, l’utente può esplorare le varie sezioni e funzionalità senza difficoltà. **Boardverse** offre quindi un’esperienza completa per giocare a scacchi online, allenarsi e interagire con una comunità di appassionati, il tutto tramite un’interfaccia unica.

## Struttura del progetto (mappa delle cartelle)

Il repository è organizzato in modo da separare le diverse responsabilità dell’applicazione. Di seguito una mappa semplificata delle cartelle e dei file principali, con una breve descrizione del loro contenuto:

```
board-verse-new/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Pagina Home (landing page dopo login)
│   │   ├── layout.tsx              # Layout principale dell'app (include theme, navbar, ecc.)
│   │   ├── globals.css            # CSS globale (include Tailwind base e custom global styles)
│   │   ├── api/                   # API Routes Next.js (funzioni server-side)
│   │   │   ├── friend/route.ts           # Endpoint POST/GET/DELETE per gestire richieste di amicizia:contentReference[oaicite:28]{index=28}:contentReference[oaicite:29]{index=29}
│   │   │   ├── challengeComplete/route.ts # Endpoint per segnare e ottenere sfide completate:contentReference[oaicite:30]{index=30}:contentReference[oaicite:31]{index=31}
│   │   │   └── ...                # (altri endpoint API come /api/register, /api/settings, /api/messages ecc. definiti similmente)
│   │   ├── chessboard/page.tsx    # Pagina principale della scacchiera di gioco:contentReference[oaicite:32]{index=32}. Gestisce il rendering del componente ChessBoard e la logica di caricamento partite online.
│   │   ├── challenge/page.tsx     # Pagina elenco Sfide (puzzle) che mostra le challenge disponibili.
│   │   ├── gameMode/page.tsx      # Pagina di selezione modalità di gioco (Multigiocatore, AI, Online, Sfide).
│   │   ├── profile/page.tsx       # Pagina profilo utente.
│   │   ├── friends/page.tsx       # Pagina gestione amici (lista amici, richieste).
│   │   ├── components/           # Componenti React riutilizzabili nell'app
│   │   │   ├── NavBar.tsx         # Barra di navigazione superiore (menu Home, Profilo, Amici, About, Logout...)
│   │   │   ├── MainPage.tsx       # Componente per la sezione principale della Home (titolo, pulsante inizia a giocare, sfondo animato):contentReference[oaicite:33]{index=33} 
│   │   │   ├── ChessBoard.tsx     # Componente chiave: implementa la logica e l’interfaccia della scacchiera di gioco:contentReference[oaicite:34]{index=34}. Rende le caselle, posiziona i pezzi, gestisce drag & drop, evidenzia mosse, turni, scacchi, ecc.
│   │   │   ├── Piece.tsx          # Componente per rappresentare un singolo pezzo sulla scacchiera:contentReference[oaicite:35]{index=35}. Mostra l’immagine del pezzo appropriata in base al codice (usa le immagini da chess.com).
│   │   │   ├── ChessMoves.tsx     # Sidebar o lista mosse effettuate in partita (storico delle mosse).
│   │   │   ├── ChessTimer.tsx     # Componenti timer (orologio) per il conteggio del tempo di gioco di ciascun giocatore.
│   │   │   ├── PromotionModal.tsx # Modal per la promozione del pedone: quando un pedone raggiunge l’ultima traversa, consente di scegliere in che pezzo promuoverlo:contentReference[oaicite:36]{index=36}.
│   │   │   ├── CheckMateModal.tsx # Modal che appare a fine partita in caso di scacco matto, indicando il vincitore.
│   │   │   ├── About.tsx          # Pagina “Chi Siamo” con informazioni sul progetto e team fittizio:contentReference[oaicite:37]{index=37}.
│   │   │   ├── OnlinePage.tsx     # Componente per la lobby online: consente di creare/joinare partite e mostra l’elenco partite recenti:contentReference[oaicite:38]{index=38}.
│   │   │   ├── ChooseTime.tsx     # Componente per la scelta del tempo personalizzato (giorni/ore/min/sec) per partite.
│   │   │   ├── FriendsChatModal.tsx # Componente per la chat tra amici (lista conversazioni e finestra chat):contentReference[oaicite:39]{index=39}.
│   │   │   ├── PieceContext.tsx   # Contesto React che mantiene lo stato globale del gioco (pezzi selezionati, turno, utente loggato, lingua, tema, elenco sfide, amici, ecc.) e fornisce queste info ai componenti annidati:contentReference[oaicite:40]{index=40}:contentReference[oaicite:41]{index=41}.
│   │   │   ├── App.tsx            # Wrapper generale per iniziare una partita: include ChessBoard e (commentato) il RenderModel 3D di sfondo:contentReference[oaicite:42]{index=42}:contentReference[oaicite:43]{index=43}.
│   │   │   ├── RenderModel.tsx    # Componente helper per renderizzare una scena 3D (usa Canvas di @react-three/fiber):contentReference[oaicite:44]{index=44}:contentReference[oaicite:45]{index=45}.
│   │   │   ├── models/            # Modelli 3D React per Three.js (caricano i file .glb)
│   │   │   │   ├── Pawn.tsx        # Carica modello pedone 3D e ne definisce animazione (fluttuante):contentReference[oaicite:46]{index=46}:contentReference[oaicite:47]{index=47}.
│   │   │   │   └── Trophy.tsx      # Carica modello trofeo 3D e lo ruota continuamente:contentReference[oaicite:48]{index=48}:contentReference[oaicite:49]{index=49}.
│   │   │   └── ...                # Altri componenti minori (modali, bottoni, ecc.)
│   │   └── (altre pagine)         # Ogni sezione principale ha una propria sottocartella o file page.tsx (es: login, register, settings, ecc.)
│   ├── lib/
│   │   └── supabase.js           # Configurazione client Supabase (URL e anon key del database):contentReference[oaicite:50]{index=50}.
│   ├── styles/ (opzionale)       # Potrebbe contenere file CSS aggiuntivi (in questo progetto la maggior parte dei stili è in Tailwind/global.css).
│   └── public/
│       ├── locales/             # File JSON per le traduzioni multilingua (en.json, it.json, ecc. contenenti tutte le stringhe dell’interfaccia):contentReference[oaicite:51]{index=51}:contentReference[oaicite:52]{index=52}.
│       ├── images/              # Immagini statiche utilizzate nell’app (es. avatar team nella pagina About, loghi, ecc.).
│       └── models/              # Modelli 3D (.glb) utilizzati (es. `scene-transformed.glb` per il pedone, `trophy-transformed.glb` per il trofeo).
├── services/                    # Funzioni di utilità per chiamate API e logica di backend lato client
│   ├── auth.ts                   # Funzioni per registrazione utente (`registerUser`):contentReference[oaicite:53]{index=53} e aggiornamento impostazioni profilo (`settingsUser`) via chiamate alle API interne:contentReference[oaicite:54]{index=54}.
│   ├── login.ts                  # Funzioni per effettuare login e fetch utenti (es. `getUsers` per ottenere lista utenti dal DB).
│   ├── friends.ts                # Funzioni per gestire amici e richieste (es. `getRequests` recupera richieste di amicizia pendenti, `getFriends` lista amici confermati).
│   ├── challenge.ts              # Funzione `getChallenge` per recuperare l’elenco delle sfide disponibili tramite API:contentReference[oaicite:55]{index=55}.
│   ├── challengeComplete.ts      # Funzioni `setChallengeComplete` e `getChallengeComplete` per segnare o leggere dal DB quali sfide un utente ha completato:contentReference[oaicite:56]{index=56}:contentReference[oaicite:57]{index=57}.
│   └── messages.ts               # Funzioni per inviare o ricevere messaggi chat (es. setMessages, getMessages).
├── package.json                 # File manifest npm con elenco dipendenze e script. Contiene script utili (`dev`, `build`, `start`, `lint`, ecc.) e le versioni dei principali pacchetti.
├── next.config.ts               # Configurazione Next.js (abilita strict mode React, dominio permesso per immagini esterne – es. chess.com:contentReference[oaicite:58]{index=58}, ecc.).
├── tailwind.config.ts           # Configurazione di Tailwind CSS (palette colori custom, percorsi dei file da scansionare per le classi, ecc.).
├── tsconfig.json                # Configurazione TypeScript del progetto.
└── README.md                    # (Da compilare) Documentazione del progetto con informazioni utili.
```

*N.B.:* La struttura sopra è semplificata per evidenziare gli elementi più importanti. Ci sono ulteriori file di configurazione (es. `.eslintrc.json`, file di configurazione Playwright, etc.) e componenti secondari non elencati. Tuttavia, quanto sopra dà un’idea chiara di come è organizzato il codice: **Next.js App Router** suddivide pagine e API, mentre i **componenti React** modularizzano le parti dell’interfaccia (scacchiera, chat, navbar, ecc.). La cartella *services* contiene codice che funge da ponte tra front-end e back-end (effettuando chiamate fetch alle rotte API interne invece di accedere direttamente al DB dal client, per sicurezza). I file in *public* e *lib* contengono risorse e configurazioni accessorie necessarie al funzionamento (rispettivamente contenuti statici e setup del client Supabase).

Chi volesse esplorare o modificare il codice troverà utile questa suddivisione logica per orientarsi rapidamente tra le varie parti dell’applicazione.

## Istruzioni per contribuire

Contributi e partecipazione della comunità sono benvenuti! Di seguito alcune linee guida su come contribuire al progetto **Boardverse**:

* **Segnalazione Bug e Richieste di Feature:** Se trovi un bug nell’applicazione o hai un’idea per migliorare il progetto, apri una *Issue* su GitHub descrivendo il problema o la proposta in modo dettagliato. Fornisci informazioni su come riprodurre l’errore (se si tratta di un bug) e, se possibile, allega screenshot o log utili. Per le feature, spiega la motivazione e l’utilità della nuova funzione.
* **Workflow di Sviluppo (Fork & PR):** Per contribuire con codice:

  1. Effettua il *fork* di questo repository sul tuo account GitHub.
  2. Crea un branch dedicato per la modifica che intendi apportare, con un nome descrittivo (ad es. `fix/bug-arrocco` o `feature/aggiungi-chat-di-gruppo`).
  3. Fai le modifiche nel tuo branch. Cerca di attenerti allo stile di codice esistente; il linter (ESLint) aiuterà a mantenere la consistenza. Se aggiungi funzionalità, aggiorna/aggiungi anche la documentazione (es. questo README o eventuali commenti nel codice) e i file di traduzione in altre lingue se coinvolgono testi visibili all’utente.
  4. Esegui i test locali se presenti (attualmente puoi testare manualmente le funzionalità nell’app in sviluppo ed eseguire `npm run lint` per assicurarti che non vi siano errori di sintassi o stile).
  5. Effettua commit chiari e concisi. Segui convenzioni uniformi nei messaggi di commit (ad esempio in Inglese, al presente indicativo, es: "Fix castling logic bug").
  6. Push sul tuo repository fork e apri una **Pull Request** verso il ramo principale (`main` o `master`) di Boardverse. Nella descrizione della PR, specifica quali problemi risolve o quali cambi introduce la tua modifica. Il template della PR (se impostato) guiderà le informazioni richieste.
* **Code Review:** I manutentori del progetto rivedranno la tua Pull Request. Potrebbero chiedere modifiche o chiarimenti. Cerca di rispondere tempestivamente e di apportare le correzioni richieste. Una volta che la PR è approvata, verrà unita al codice principale e le tue modifiche faranno parte di Boardverse! \:tada:
* **Best Practices:** Mantieni il codice pulito e leggibile. Usa la tipizzazione TypeScript in modo appropriato. Evita di introdurre dipendenze non necessarie. Per lo stile CSS, privilegia le utility class di Tailwind già in uso. Se aggiungi nuovi componenti, considera la loro riusabilità e posizione (la cartella `src/app/components/` può ospitarli).
* **Conformità allo Stile:** Il progetto utilizza ESLint con la configurazione Next.js: assicurati che `npm run lint` passi senza errori prima di proporre una PR. Idealmente, esegui anche una build di produzione (`npm run build`) per verificare che non vi siano errori di compilazione.
* **Contributi di Traduzione:** Visto che l’app è multilingua, un contributo utile potrebbe essere aggiungere o migliorare le traduzioni. I file si trovano in `public/locales/`. Se parli una delle lingue supportate e noti migliorie possibili ai testi, sentiti libero di proporre correzioni. Se vuoi aggiungere una lingua nuova, discuti prima nelle issue per coordinare l’aggiunta (ci sono alcune configurazioni aggiuntive da fare per integrarla).
* **Idee e Discussioni:** Anche se non contribuisci con codice, la tua opinione è importante. Usa la sezione *Discussions* (se abilitata) o le *Issue* per discutere nuove idee, chiedere supporto su come implementare qualcosa, o confrontarti con la comunità di Boardverse.

Ricordiamo che questo progetto è frutto di passione per il gioco: ogni contributo che aiuti a renderlo migliore, più stabile o più ricco di funzionalità sarà apprezzato. Manteniamo un ambiente collaborativo e rispettoso.

**Nota:** Assicurati di non includere nelle PR informazioni sensibili (come chiavi API private). La chiave Supabase anonima è pubblica e può rimanere nel codice, ma se collegassi servizi esterni assicurati di utilizzare variabili d’ambiente. Inoltre, eventuali dati utente presenti nel tuo ambiente di test (ad es. partite nel database) non dovrebbero essere inseriti nel repository.

Grazie per il tuo interesse nel contribuire a Boardverse!

## Licenza

Questo progetto è distribuito sotto licenza [MIT](LICENSE). Consulta il file per i dettagli.

## Contatti e riferimenti utili

Per qualsiasi domanda, segnalazione o richiesta di supporto relativa a Boardverse, puoi fare riferimento ai seguenti contatti e risorse:

* **Contatti progetto:** Puoi contattare il manutentore principale aprendo una Issue su GitHub (metodo preferito, così anche altri utenti possono contribuire alla risoluzione) oppure, per questioni personali, tramite l’email associata al profilo GitHub dell’autore. Il maintainer attuale è **JakeKing0001** (alias *Jake King*); puoi inviare un messaggio privato se necessario o connetterti via social/profili indicati nel suo GitHub.
* **Documentazione e Riferimenti tecnici:**

  * Sito ufficiale Next.js: [https://nextjs.org/docs](https://nextjs.org/docs) – per capire meglio il framework utilizzato per il front-end e le API.
  * Documentazione Supabase: [https://supabase.com/docs](https://supabase.com/docs) – per maggiori info su come funziona il backend (database, autenticazione, realtime) che Boardverse utilizza.
  * Guida Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs) – per comprendere le classi CSS utilizzate nel progetto per lo stile dell’interfaccia.
  * Repository GitHub Boardverse (questo): naturalmente, puoi esplorare il codice sorgente direttamente su GitHub per trovare dettagli implementativi; leggere i commenti nel codice (molti sono in italiano e spiegano la logica adottata) può essere utile.
* **Demo online:** *(Se disponibile)* Se il progetto è stato deployato online (ad esempio su Vercel, dato che Next.js si integra bene), l’URL verrà indicato qui. *(Esempio: [https://www.boardverse.org](https://www.boardverse.org))*. Su tale istanza pubblica puoi registrarti e provare l’app senza doverla eseguire in locale.
* **Comunità e Supporto:** Non esiste ancora un forum o gruppo dedicato a Boardverse, ma eventuali discussioni avvengono tramite la sezione GitHub Issues/Discussions. In futuro, se la base di utenti cresce, potremmo considerare canali Discord, subreddit o altri mezzi per la community di giocatori e sviluppatori.

**Riferimenti aggiuntivi:** Il concept di Boardverse è ispirato a popolari piattaforme di scacchi online come Lichess e Chess.com (per le funzionalità di gioco e social) e alla versatilità di piattaforme di gioco da tavolo online. Anche se il codice è originale, riconosciamo queste piattaforme come fonte di idee e best practice nell’ambito degli scacchi online.

---

*Speriamo che queste informazioni ti siano utili. Grazie per l’interesse in Boardverse! Se hai bisogno di ulteriore assistenza, non esitare a contattarci.*

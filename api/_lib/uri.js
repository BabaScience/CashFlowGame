/**
 * Composizione della stringa di connessione a MongoDB.
 *
 * Le credenziali stanno in tre variabili d'ambiente separate:
 *   MONGODB_USERNAME   utente del database
 *   MONGODB_PASSWORD   password
 *   MONGODB_URI        indirizzo del cluster
 *
 * Tenere la password fuori dalla URI evita due guai frequenti:
 * finisce meno facilmente in un log o in uno screenshot, e soprattutto
 * viene codificata correttamente. Le password Atlas contengono spesso
 * @ # / : ? %, caratteri che dentro una URI hanno un significato loro e
 * che, incollati a mano, producono l'errore "Invalid scheme" oppure
 * un'autenticazione che fallisce senza spiegazioni.
 */

/** Caratteri da proteggere nella parte credenziali di una URI. */
const codifica = (v) => encodeURIComponent(String(v));

/** Segnaposto che Atlas lascia nella stringa che ti fa copiare. */
const SEGNAPOSTO_UTENTE = /<(?:db_)?username>/gi;
const SEGNAPOSTO_PASSWORD = /<(?:db_)?password>/gi;

/**
 * Restituisce { uri, errore }.
 * `uri` è pronta da passare a MongoClient; `errore` è un messaggio leggibile.
 */
export function componiUri(uriGrezza, utente, password) {
  const uri = String(uriGrezza || "").trim();
  const u = utente == null ? "" : String(utente).trim();
  const p = password == null ? "" : String(password);

  if (!uri) {
    return { uri: null, errore: "MONGODB_URI non è impostata." };
  }
  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    return {
      uri: null,
      errore: 'MONGODB_URI deve iniziare con "mongodb://" o "mongodb+srv://".',
    };
  }

  const haSegnaposto = SEGNAPOSTO_UTENTE.test(uri) || SEGNAPOSTO_PASSWORD.test(uri);
  SEGNAPOSTO_UTENTE.lastIndex = 0;
  SEGNAPOSTO_PASSWORD.lastIndex = 0;

  // La URI si divide in "schema://" + "credenziali@" + "resto".
  const schema = uri.match(/^mongodb(\+srv)?:\/\//i)[0];
  const dopoSchema = uri.slice(schema.length);
  const taglio = dopoSchema.indexOf("@");
  const credenzialiPresenti = taglio !== -1 && !dopoSchema.slice(0, taglio).includes("/");
  const resto = credenzialiPresenti ? dopoSchema.slice(taglio + 1) : dopoSchema;

  // Caso 1: la stringa contiene ancora i segnaposto di Atlas.
  if (haSegnaposto) {
    if (!u || !p) {
      return {
        uri: null,
        errore:
          "MONGODB_URI contiene ancora i segnaposto <username>/<password>: " +
          "imposta MONGODB_USERNAME e MONGODB_PASSWORD.",
      };
    }
    return {
      uri: uri.replace(SEGNAPOSTO_UTENTE, codifica(u)).replace(SEGNAPOSTO_PASSWORD, codifica(p)),
      errore: null,
    };
  }

  // Caso 2: utente e password forniti a parte: comandano loro.
  if (u && p) {
    return { uri: `${schema}${codifica(u)}:${codifica(p)}@${resto}`, errore: null };
  }

  // Caso 3: solo uno dei due: quasi sempre una dimenticanza.
  if (u || p) {
    return {
      uri: null,
      errore: `Manca ${u ? "MONGODB_PASSWORD" : "MONGODB_USERNAME"}: vanno impostate entrambe.`,
    };
  }

  // Caso 4: nessuna credenziale a parte, ma la URI ne ha già di sue.
  if (credenzialiPresenti) return { uri, errore: null };

  // Caso 5: nessuna credenziale da nessuna parte.
  return {
    uri: null,
    errore:
      "Nessuna credenziale: imposta MONGODB_USERNAME e MONGODB_PASSWORD, " +
      "oppure includi utente e password dentro MONGODB_URI.",
  };
}

/** Versione senza password, da mettere nei log senza rischi. */
export function uriOscurata(uri) {
  if (!uri) return "(nessuna)";
  return String(uri).replace(/\/\/([^:@/]*)(:[^@/]*)?@/, (_, utente) => `//${utente || ""}:***@`);
}

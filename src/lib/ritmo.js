/**
 * IL RITMO DEL TURNO.
 *
 * Quanto dura una cosa che si guarda. Sta in un file suo perché i due
 * pezzi che devono andare d'accordo — la pedina che cammina e il foglio
 * della carta che aspetta — stanno in componenti diversi, e finché il
 * numero era scritto a mano in tutti e due potevano scostarsi senza che
 * nessuno se ne accorgesse.
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * Il motore muove e pesca nella stessa mossa: lo stato che torna dal
 * server ha già dentro la posizione nuova e la carta da decidere. Il
 * foglio si apriva quindi sopra il tabellone mentre la pedina stava
 * ancora camminando, e non si vedeva su che casella si fosse finiti — che
 * è la sola cosa che dà senso alla carta che si sta guardando.
 */

/** Quanto ci mette la pedina a passare da una casella alla successiva. */
export const MS_PER_CASELLA = 130;

/**
 * La camminata più breve che si riesca a seguire con gli occhi.
 * Un tiro da 1 o 2 caselle, animato in proporzione, sarebbe uno scatto.
 */
export const MS_CAMMINO_MINIMO = 350;

/**
 * Il respiro fra l'arrivo della pedina e l'apertura del foglio.
 * Serve a vedere DOVE si è arrivati prima che qualcosa lo copra.
 */
export const MS_RESPIRO = 420;

/** Quanto cammina la pedina per un tiro di `passi` caselle. */
export const msDiCammino = (passi) =>
  Math.max(MS_CAMMINO_MINIMO, Math.max(0, passi || 0) * MS_PER_CASELLA);

/** Quanto aspetta il foglio della carta, dopo un tiro di `passi` caselle. */
export const msPrimaDellaCarta = (passi) => msDiCammino(passi) + MS_RESPIRO;

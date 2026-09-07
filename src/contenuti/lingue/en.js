import { eur, pct, esempioRata, esempioZone } from "../esempi.js";
import { CREDITO } from "../../game/mercati/roma/fonti.js";
import { QUOTA_COSTI_L1 } from "../../game/mercati/roma/derivazione.js";

/**
 * Lessons and puzzles, in English.
 *
 * Same shape as the Italian original — a title, a summary, and a `corpo()`
 * that is a function — because the examples are computed from the market
 * data and must keep computing once translated. A lesson quoting a
 * hand-written "€1,000" would start lying the first time prices change.
 *
 * The amounts stay in euros and keep Rome's formatting: a market is its
 * market, whatever language you read it in.
 *
 * The boundary the Italian original sets stays exactly where it is: these
 * explain how things work, they never say what to buy.
 */
export default {
  avvertenza:
    "This is teaching material: it explains how things work. It is not " +
    "financial advice and it does not suggest what to buy or sell.",

  lezioni: {
    rendita: {
      titolo: "What passive income actually is",
      sommario: "The difference between earning and owning something that earns.",
      corpo: () => [
        "A salary stops when you stop. Passive income does not: it keeps arriving even " +
        "in the months when you do nothing, because what produces it is something you " +
        "own, not your time.",
        "That is the whole question this game asks, and it is an accounting question " +
        "before it is a philosophical one: how much of your spending is covered by money " +
        "that does not depend on your work? If the answer is «all of it», work becomes a " +
        "choice.",
        "Do not confuse income with a gain. Selling a flat at a profit is a one-off; " +
        "renting it out is income. The game measures only the second, because that is the " +
        "one that changes somebody's life.",
      ],
    },

    "attivo-passivo": {
      titolo: "Assets and liabilities, for real",
      sommario: "It is not what you own that counts, it is which way the money moves.",
      corpo: () => [
        "The useful distinction is not between nice things and ugly things, but between " +
        "things that put money in your pocket every month and things that take it out.",
        "By this definition the home you live in is not an asset: you pay the mortgage, " +
        "the bills, the upkeep and the tax, and you collect nothing. That does not mean " +
        "buying it was a mistake — it means that on the income statement it sits on the " +
        "left, among the outgoings.",
        "The same flat, let to somebody else, may be an asset or may not. It depends on a " +
        "calculation, not on a label: rent minus the loan payment, minus tax, minus costs, " +
        "minus the months it sits empty. In the game that calculation is already done and " +
        "it is called cash flow.",
      ],
    },

    rata: {
      titolo: "What a mortgage payment is made of",
      sommario: "Why the early years seem to barely dent the debt.",
      corpo: () => {
        const e = esempioRata();
        return [
          "A payment is made of two pieces: one gives back the capital, the other pays the " +
          "interest. In the common repayment mortgage the payment stays the same, but the " +
          "proportion changes: at the start it is almost all interest, at the end it is " +
          "almost all capital.",
          `With today's numbers: ${eur(e.capitale)} at ${pct(CREDITO.taeg)} over ` +
          `${CREDITO.anni} years makes a payment of roughly ${eur(e.rata)} a month.`,
          `By the end you will have paid ${eur(e.totale)}, of which ${eur(e.interessi)} is ` +
          "interest alone. That is why a tenth of a point on the rate, over twenty years, " +
          "is not a detail.",
          "The practical consequence: in the early years the debt falls very slowly. " +
          "Anyone selling after five years discovers they owe the bank almost what they " +
          "owed at the start.",
        ];
      },
    },

    "lordo-netto": {
      titolo: "Gross yield and net yield",
      sommario: "Why an advertised 7% becomes a 4% that actually arrives.",
      corpo: () => [
        "Gross yield is the easy sum: annual rent divided by price. It is also the one " +
        "written everywhere, because it is the highest.",
        "Between that number and what reaches your account there are at least five items: " +
        "tax on the rent, tax on the property, service charges and maintenance, the months " +
        "the flat sits empty, and the tenants who do not pay.",
        `In the game, at the first level, all of these are gathered into a single ` +
        `deduction of ${pct(QUOTA_COSTI_L1)} from the rent. It is a stated simplification: ` +
        "first you learn that a rent is not all yours, then you learn why.",
        "The one rule worth taking away: when somebody quotes you a yield, the first " +
        "question is whether it is gross or net. It is almost always gross.",
      ],
    },

    cedolare: {
      titolo: "Italy's flat rental tax: 21% or 10%",
      sommario: "What it is, and what changes if you agree a capped rent.",
      corpo: () => [
        "Anyone letting a property in Italy can choose to pay a flat tax on the rent " +
        "instead of adding it to their other income. It is called *cedolare secca* and the " +
        "ordinary rate is 21%.",
        "There is also a reduced rate of 10% for *canone concordato* contracts: you let " +
        "the property following the parameters set by the local council's agreements, " +
        "which are normally below the open-market price, and in exchange you pay half the " +
        "tax.",
        "It is a trade, not a gift: you collect less rent and you pay less tax. Which of " +
        "the two leaves more money in your pocket depends on the numbers of that contract " +
        "in that town — it is a calculation, and it has to be done every time.",
        "Choosing the flat tax also means giving up inflation increases on the rent for " +
        "the length of the contract. Worth knowing before, not after.",
      ],
    },

    "costi-acquisto": {
      titolo: "What buying costs, on top of the price",
      sommario: "The money that never comes back.",
      corpo: () => [
        "The price of a property is not what it takes to buy it. On top there is the " +
        "registration tax, the notary, and almost always the agency's commission.",
        "The registration tax is 2% of the cadastral value for a main home and 9% for any " +
        "other. The cadastral value is normally a good deal lower than the price paid, so " +
        "the percentage is less frightening than it looks — but on a second property it " +
        "remains the heaviest item.",
        "This money does not come back. It does not become part of the property's value: " +
        "sell the next day at the same price and you have lost it. It is the reason why " +
        "buying and reselling quickly rarely pays.",
        "In the game it is included in the deposit on every property card, and that is why " +
        "the deposit is larger than the plain difference between price and mortgage.",
      ],
    },

    leva: {
      titolo: "Leverage works in both directions",
      sommario: "Why borrowing multiplies the gains and the losses alike.",
      corpo: () => [
        "Buying with a mortgage means controlling a large thing by putting down a small " +
        "amount. If that thing earns more than the debt costs, the difference is yours, " +
        "and against the capital you put in it becomes a high percentage.",
        "The same mechanism, turned around: if it earns less than the debt costs, you put " +
        "the difference in, every month, and against the capital you put in it becomes an " +
        "equally high percentage with a minus in front.",
        "There is nothing magic or shady about leverage: it is arithmetic. It amplifies " +
        "what is there. On a deal that works it makes it excellent; on one that does not, " +
        "it makes it a monthly problem lasting twenty years.",
        "The signal to watch is not the yield, it is the margin between the yield and the " +
        "cost of the debt. When that margin is thin, leverage stops being a tool and " +
        "becomes a bet that nothing will go wrong.",
      ],
    },

    "centro-periferia": {
      titolo: "Why the centre yields less than the outskirts",
      sommario: "The sum almost nobody does before falling in love with an address.",
      corpo: () => {
        const e = esempioZone();
        return [
          "Rents rise as you approach the centre. Purchase prices rise a great deal more. " +
          "Since the yield is the ratio between the two, the yield falls.",
          `With Rome's own figures: ${e.centro.nome} runs at about ${eur(e.centro.euroMq)} ` +
          `a square metre with rents of ${e.centro.canoneMq} €, which makes a gross yield ` +
          `of ${pct(e.resaCentro)}. ${e.periferia.nome} is at ${eur(e.periferia.euroMq)} a ` +
          `metre with rents of ${e.periferia.canoneMq} €: a gross ${pct(e.resaPeriferia)}.`,
          "Nearly three times as much, for the same operation. And the gap survives taking " +
          "off tax and costs, which weigh roughly the same on both.",
          "This does not mean buying in the centre is a mistake: people who do it are " +
          "often betting on the property gaining value, on how easily it resells, or on " +
          "living in it — all of which are different reasons from yield. It means they are " +
          "two different operations, and confusing them is expensive.",
        ];
      },
    },

    "che-cose-un-etf": {
      titolo: "What a fund is, and what an ETF is",
      sommario: "The mechanism, in plain words. No names, no advice.",
      corpo: () => [
        "A mutual fund is a container: many people put money in, somebody invests it " +
        "following a stated rule, and each person owns a share of the container in " +
        "proportion to what they put in.",
        "An ETF is a fund with two extra features. The first is that it is bought and sold " +
        "on an exchange like a share, during the day. The second is that it normally does " +
        "not try to beat the market: it simply replicates an index, that is, a predefined " +
        "list of holdings with weights.",
        "From that follows the difference you hear quoted most often: replicating a list " +
        "costs less than paying somebody to choose, so management costs are usually lower. " +
        "Costs matter because you pay them every year, including the years when the value " +
        "falls.",
        "Two things an ETF is not. It is not a guarantee: it replicates the index when the " +
        "index loses, too. And it is not one single thing: there are ETFs on anything, " +
        "with wildly different risks, and «it is an ETF» tells you almost nothing about " +
        "what is inside it.",
        "We stop here, and it is not a choice: saying which one to buy would be investment " +
        "advice, which in Italy requires being on a professional register.",
      ],
    },

    "conto-economico": {
      titolo: "Reading your own income statement",
      sommario: "Four lines that say nearly everything.",
      corpo: () => [
        "Income from work. Income from what you own. Spending. The difference. Four " +
        "numbers, and almost nobody has them written down anywhere.",
        "The fourth line says whether this month moved you forward or back. The first " +
        "three say why, and above all which lever you can pull: earn more from work, build " +
        "income, or spend less.",
        "The non-obvious part is that the three levers are not equivalent. Earning more " +
        "from work usually brings higher spending with it — a bigger flat, a new car — and " +
        "the balance moves less than you expect. The game shows it immediately: the sheet " +
        "with the highest income is not the one that gets out first.",
        "It is also why the game makes you fill in those lines every turn instead of just " +
        "showing you the balance.",
      ],
    },

    "banca-presta": {
      titolo: "Why a bank lends to you (and how much)",
      sommario: "The one-third rule, and why nobody hands over half a million on a promise.",
      corpo: () => [
        "A bank does not lend by looking at how much you need: it looks at how much you " +
        "can pay back. The measure it almost always uses is the ratio between the payment " +
        "and your monthly net income, and the common threshold in Italy sits between 30 " +
        "and 35 per cent. A third, in practice.",
        "The sum is done on ALL your payments together, not just the new one: if you are " +
        "already paying off a car and a student loan, that room is taken. It is why two " +
        "people on the same salary are offered different amounts.",
        "Rent usually does not enter that sum — it is not a debt and does not appear in " +
        "credit registers — but the bank sees it anyway, because it reduces what is left.",
        "Then there is the kind of credit. A mortgage is secured on the property, so it " +
        "costs little (around 4% a year) and reaches up to 80% of the property's value. A " +
        "personal loan is secured on nothing, costs two or three times as much, and " +
        "lenders stop between 30,000 and 60,000 euros. An overdraft costs more still.",
        "In the game it works exactly like that: ask for more than your income supports " +
        "and the bank says no, and says why. It is not an obstacle placed there to slow " +
        "you down: it is what will actually happen at the counter.",
      ],
    },

    "vendere-costa": {
      titolo: "What selling a home costs",
      sommario: "The agency, the capital gain, and the five-year rule.",
      corpo: () => [
        "Buying costs more than the price — registration tax, notary, agency — and almost " +
        "everybody knows that. That SELLING costs as well is usually discovered by " +
        "whoever is selling for the first time.",
        "Two items. The agency's commission, normally around 3% plus VAT, is paid by the " +
        "seller too. And if you sell within five years of buying, you pay a 26 per cent " +
        "substitute tax on the gain, which the notary withholds at the deed and pays " +
        "straight to the state.",
        "The taxed gain is the difference between what you collect and what you had paid. " +
        "The mortgage has nothing to do with it: that was only how you paid for the " +
        "purchase.",
        "After five years that tax no longer applies. It is a rule written precisely to " +
        "separate investing from speculating, and it changes the sums brutally: the very " +
        "same transaction can return 29% closed immediately and more than 50% if you wait. " +
        "A main home you genuinely lived in is exempt either way.",
        "In the game it works exactly so, and you can see it in the log: every sale lists " +
        "the mortgage cleared, the agency and the tax, before telling you what you are " +
        "left holding.",
      ],
    },

    margine: {
      titolo: "Why breaking even is not enough",
      sommario: "Leaving the Wheel at break-even means being back in it at the first setback.",
      corpo: () => [
        "The obvious sum is: when what you own covers what you spend, work becomes " +
        "optional. That is true in arithmetic and false in life.",
        "What you own does not stand still. A tenant leaves and the flat sits empty for " +
        "two months; a boiler breaks; a business has a bad year; the building votes for " +
        "works. Meanwhile your spending moves too — and nearly always upwards.",
        "Whoever leaves work in the exact month the sums touch is one setback away from " +
        "going back looking for it. That is why the Rome market asks for one and a half " +
        "times the expenses rather than break-even: that margin is not excessive caution, " +
        "it is the price of being able to say no.",
        "It is also why borrowing to get out sooner rarely works. Every euro of loan " +
        "payment raises your spending, and so raises the target by one and a half. Debt " +
        "shortens the road only if what you buy earns far more than the debt costs — and " +
        "in reality that gap is thin, not enormous.",
      ],
    },

    "ral-netto": {
      titolo: "Gross package, gross pay, net pay: three different numbers",
      sommario: "Why the salary people talk about is not the one that arrives.",
      corpo: () => [
        "When somebody says «I earn 35,000 euros» they almost always mean the RAL, the " +
        "gross annual salary: what your contract costs before any deduction. It is not " +
        "what reaches you.",
        "Out of the RAL come social security contributions (around 9-10% on the " +
        "employee's side) and then income tax, which is banded: the more you earn, the " +
        "higher the rate on the top slice, and so the gap between gross and net widens.",
        "In the game the sheets are already NET, because that is what gets spent. For the " +
        "same reason the «Tax» line stays at zero against the salary: you have already " +
        "paid it. It appears instead once you start collecting rent, because that is new " +
        "income, and new income is taxed again.",
        "The Rome sheets belong to one person: their salary and their expenses. It is why " +
        "the rent is that of a studio or a shared room, not that of a family home. " +
        "Comparing a family's spending against one person's salary would give a false " +
        "picture, and for a while this game did exactly that.",
      ],
    },

    "dopo-la-liberta": {
      titolo: "What happens the day after",
      sommario: "Stopping work is not a finish line: it is a change of income.",
      corpo: () => [
        "In the popular picture, reaching financial independence is a line you cross: " +
        "before on this side, after on that one. In the sums it does not work like that. " +
        "The day after, you have exactly the same flats, the same businesses, the same " +
        "debts and the same spending as the day before. The only line that changes is the " +
        "salary, which goes to zero.",
        "That is why the margin matters. While you work, an empty month or a broken boiler " +
        "is absorbed by the payslip. Afterwards it is absorbed by what you own — and if " +
        "what you own covered the spending and no more, there is nothing to absorb it.",
        "The way a bank looks at you changes too. The income to prove is no longer the " +
        "payslip but the rent, and the rules stay the same: the payment cannot exceed a " +
        "third of what comes in. Someone who has stopped working has not stopped being " +
        "assessed.",
        "In the game it is the same: leaving the Wheel gives you nothing and cancels " +
        "nothing. The final screen shows what your things really produce, minus what it " +
        "costs you to live — and how many months it took you to get there.",
      ],
    },
  },

  /* THE PUZZLES.
     Same rule as the lessons: they teach a CALCULATION, never a purchase.
     The option ids (a, b, c) must not move — `giusta` points at one of
     them, and a translation that renamed them would change the answer. */
  quesiti: {
    q1: {
      titolo: "Two one-bedroom flats",
      domanda:
        "Two flats, same rent of 700 € a month. The first costs 140.000 €, " +
        "the second 210.000 €. Which one has the higher gross yield?",
      opzioni: {
        a: "The one at 140.000 €",
        b: "The one at 210.000 €",
        c: "The same: the rent is identical",
      },
      spiegazione:
        "Yield is the annual rent divided by the price. 8.400 € on 140.000 € makes 6.0%; " +
        "the same 8.400 € on 210.000 € makes 4.0%. For the same rent, paying less earns " +
        "more — which is why the purchase price counts as much as the rent does.",
    },
    q2: {
      titolo: "The rent is not the cash flow",
      domanda:
        "A flat brings in 900 € of rent a month. The mortgage payment is 620 €, and " +
        "taxes and running costs eat 28% of the rent. How much is left each month?",
      opzioni: {
        a: "280 €",
        b: "28 €",
        c: "900 €: the tenant pays the mortgage",
      },
      spiegazione:
        "900 minus 28% makes 648. Minus the 620 payment, 28 € a month are left. It is " +
        "the commonest mistake of a first-time buyer: take the payment off the rent and " +
        "stop there, forgetting taxes, building charges and empty months. The real " +
        "margin was ten times thinner than the one imagined.",
    },
    q3: {
      titolo: "What it really takes",
      domanda:
        "A property at 180.000 €, mortgage at 80%. Counting registration tax, notary " +
        "and agency, roughly how much cash do you need to have?",
      opzioni: {
        a: "36.000 €: the 20% and nothing more",
        b: "Around 55.000 €",
        c: "180.000 €",
      },
      spiegazione:
        "The 20% is 36.000 €, but on top of it go the registration tax on a second " +
        "home, the notary and the agency's commission: between fifteen and twenty " +
        "thousand euros more. That money does not come back and does not become value " +
        "in the property. Anyone who counts only the deposit finds out the difference " +
        "on signing day.",
    },
    q4: {
      titolo: "The first year of payments",
      /* Computed, like the Italian original: the rate and the term come from
         the market data, so the puzzle cannot go stale. */
      domanda: () => {
        const { rata } = esempioRata();
        return `A mortgage of ${eur(160000)} at ${pct(CREDITO.taeg)} over ` +
          `${CREDITO.anni} years: the payment is about ${eur(rata)}. After the ` +
          "first year, how far has the debt come down?";
      },
      opzioni: {
        a: "By about 10.000 €",
        b: "By about 4.000 €",
        c: "By about 800 €",
      },
      spiegazione: () => {
        const { rata } = esempioRata();
        const versato = rata * 12;
        const interessi = 160000 * CREDITO.taeg;
        return `In the first year you pay in about ${eur(versato)}, but nearly ` +
          `${eur(interessi)} of it is interest: the debt goes down by little more ` +
          `than ${eur(versato - interessi)}. In a mortgage the capital share grows ` +
          "with time, so at the start you are mostly paying for the privilege of " +
          "having the money. It is why selling after a few years leaves almost the " +
          "whole debt standing.";
      },
    },
    q5: {
      titolo: "Leverage on a thin margin",
      domanda:
        "A deal yields 5% gross a year. The debt used to buy it costs 4.5%. What " +
        "happens if the rent drops by 10%?",
      opzioni: {
        a: "The margin shrinks a little, and stays positive",
        b: "The margin turns negative: you put money in every month",
        c: "Nothing changes: the payment is fixed",
      },
      spiegazione:
        "A 10% drop takes the yield from 5.0% to 4.5%, exactly the cost of the debt — " +
        "and on top of that there are still taxes and running costs, so the balance " +
        "goes below zero. When the margin between the yield and the cost of the debt " +
        "is half a point, a small knock is enough to flip the sign. Leverage does not " +
        "create the problem: it multiplies it.",
    },
    q6: {
      titolo: "Regulated rent or open-market rent",
      domanda:
        "Open-market rent: 800 € a month, flat tax at 21%. Regulated rent: 680 € a " +
        "month, flat tax at 10%. Which one leaves more money in your pocket?",
      opzioni: {
        a: "The open-market one: 632 € against 612 €",
        b: "The regulated one: always, because of the rate",
        c: "They are identical",
      },
      spiegazione:
        "800 minus 21% makes 632. 680 minus 10% makes 612. Here the open-market " +
        "contract wins by twenty euros. But the regulated rent in that town only has " +
        "to be a little higher, or the open-market one a little lower, and it flips. " +
        "The lesson is not which one to choose: it is that it has to be worked out " +
        "every time, with the numbers of that contract, instead of taking the answer " +
        "for granted.",
    },
    q7: {
      titolo: "The home you live in",
      domanda:
        "You buy the home you are going to live in. In this game's income statement, " +
        "what is it?",
      opzioni: {
        a: "An asset: it is worth a lot and it appreciates",
        b: "An expense: every month it takes money out and brings none in",
        c: "Neither one nor the other: it is neutral",
      },
      spiegazione:
        "Payment, utilities, maintenance and taxes go out every month; nothing comes " +
        "in. By the definition used here — what counts is the direction the money " +
        "moves — it is an expense. Which does not mean that buying it is a mistake: " +
        "it only means knowing which column it sits in, and not counting it among the " +
        "things that will carry you out of the Wheel.",
    },
    q8: {
      titolo: "The garage and the flat",
      domanda:
        "A garage at 32.000 € rents for 230 € a month. A one-bedroom flat at " +
        "160.000 € rents for 800 €. Which one yields more in percentage terms?",
      opzioni: {
        a: "The flat",
        b: "The garage",
        c: "The same",
      },
      spiegazione:
        "The garage makes 2.760 € a year on 32.000 €, that is 8.6%. The flat makes " +
        "9.600 € on 160.000 €, that is 6.0%. Garages yield more than flats almost " +
        "everywhere, they have no tenants to chase and no boilers that break — and " +
        "almost nobody considers them, because they do not tell well over dinner.",
    },
    q9: {
      titolo: "High salary, slow exit",
      domanda:
        "Two players: one earns 5.700 € a month with 2.780 € of expenses, the other " +
        "2.250 € with 1.240 €. Who needs less passive income to leave the Wheel?",
      opzioni: {
        a: "The one earning 5.700 €",
        b: "The one earning 2.250 €",
        c: "They both need the same passive income",
      },
      spiegazione:
        "To get out you need passive income that covers the EXPENSES, not one that " +
        "matches the salary. The first needs 2.780 € a month, the second 1.240 €: " +
        "less than half. It is why in this game the sheet with the highest income is " +
        "not the one that gets out first — a high income brings high expenses with it, " +
        "and raises the bar you have to clear.",
    },
    q10: {
      titolo: "Passive income or a gain",
      domanda:
        "You buy a plot of land at 22.000 € and sell it again at 50.000 €. In the " +
        "game, what changes in your monthly passive income?",
      opzioni: {
        a: "It goes up by 28.000 €, once",
        b: "Nothing changes: the passive income stays what it was",
        c: "It goes up by about 230 € a month",
      },
      spiegazione:
        "Twenty-eight thousand euros of gain is a receipt, not passive income: it " +
        "increases the cash, not the monthly flow. It serves to buy something that " +
        "then produces passive income, but on its own it does not bring you an inch " +
        "closer to the exit. It is the same distinction as between selling a house " +
        "and letting it.",
    },
  },
};

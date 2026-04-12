const params = new URLSearchParams(window.location.search)
const carpeta = params.get('carpeta')
const fitxer = params.get('fitxer')
const nom = params.get('nom')
const fitxerResultats = params.get('fitxerResultats')
const RESULTS_URL = fitxerResultats
  ? `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/2026/${carpeta}/${fitxerResultats}`
  : null
const CSV_URL = `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/2026/${carpeta}/${fitxer}`



async function carregarDades() {
  const response = await fetch(CSV_URL)
  const text = await response.text()
  const firstLine = text.split('\n')[0]
  const delimiter = firstLine.includes(';') ? ';' : ','

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      delimiter: delimiter,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    })
  })
}

async function carregarResultats() {
  if (!RESULTS_URL) return []

  // 1. Descarreguem el text cru
  const response = await fetch(RESULTS_URL)
  const text = await response.text()

  // 2. Detectem el delimitador mirant la primera línia
  const firstLine = text.split('\n')[0]
  const delimiter = firstLine.includes(';') ? ';' : ','

  // 3. Parsegem amb PapaParse especificant el delimitador
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      delimiter: delimiter,   // ← forcem el delimitador detectat
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    })
  })
}

let totesDades = []
let totesLesVoltes = []

function formatarTemps(segons) {
    const minuts = Math.floor(segons / 60)
    const seg = (segons % 60).toFixed(3).padStart(6, '0')
    return `${minuts}:${seg}`
}

function minutsASegons(temps) {
    // converteix "2:55.481" a 175.481
    const parts = temps.trim().split(':')
    if (parts.length !== 2) return Infinity
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1])
}

function millorTempsPerCotxe(laps) {
    const cotxes = {}

    laps.forEach(lap => {
        const num = lap['NUMBER']?.trim()
        const temps = minutsASegons(lap[' LAP_TIME'] || '')
        const equip = lap['TEAM']?.trim()
        const classe = lap['CLASS']?.trim()

        if (!num || isNaN(temps) || temps < 60) return

        if (!cotxes[num]) {
            cotxes[num] = { numero: num, equip, classe, millorTemps: Infinity }
        }

        if (temps < cotxes[num].millorTemps) {
            cotxes[num].millorTemps = temps
            cotxes[num].millorVolta = parseInt(lap[' LAP_NUMBER'])
        }
    })

    return Object.values(cotxes).sort((a, b) => a.millorTemps - b.millorTemps)
}

function pintarCotxes(cotxes) {
    const contenidor = document.getElementById('car-list')
    const status = document.getElementById('status')

    // 1. recuperem el gràfic ABANS de buidar el contenidor
    const graficContainer = document.getElementById('grafic-container')

    if (graficContainer) {
        // el tornem al seu lloc original (abans del car-list)
        contenidor.parentNode.insertBefore(graficContainer, contenidor)
        graficContainer.style.display = 'none'
    }

    if (graficActual) {
        graficActual.destroy()
        graficActual = null
    }

    // 2. ara sí, buidem el contenidor
    contenidor.innerHTML = ''

    status.textContent = `${cotxes.length} cotxes carregats`

    cotxes.forEach(cotxe => {
        const card = document.createElement('div')
        card.className = `car-card ${cotxe.classe}`

       card.innerHTML = `
            <span class="car-position">${cotxe.posicio ?? '—'}</span>
            <span class="car-number">#${cotxe.numero}</span>
            <div class="car-info">
                <div class="car-team">${cotxe.equip}</div>
                <div class="car-class">
                <span class="badge ${cotxe.classe}">${cotxe.classe}</span>
                </div>
            </div>
            <div style="text-align: right">
                <div class="car-laptime">${formatarTemps(cotxe.millorTemps)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted)">pb: volta ${cotxe.millorVolta}</div>
            </div>
            `

        contenidor.appendChild(card)

        card.style.cursor = 'pointer'
        card.addEventListener('click', () => {
            mostrarGrafic(cotxe.numero, cotxe.equip, card)
        })
    })
}

function pintarInfoCircuit() {
  // llegim tots els paràmetres de la URL
  const circuit  = params.get('circuit')
  const data     = params.get('data')
  const durada   = params.get('durada')
  const logo     = params.get('logo')
  const layout   = params.get('layout')
  const ubicacio = params.get('ubicacio')
  const longitud = params.get('longitud')
  const tipus    = params.get('tipus')
  const superficie = params.get('superficie')
  const nota     = params.get('nota')

  // logo al header
  const logoEl = document.querySelector('.logo img')
  if (logoEl && logo) {
    logoEl.src = logo
    logoEl.alt = params.get('nom')
  }

  // imatge del circuit
  const layoutEl = document.querySelector('.imatge')
  if (layoutEl && layout) {
    layoutEl.src = layout
    layoutEl.alt = circuit
  }

  // títol de la columna dreta
  document.querySelector('.col-track h2').textContent = 'Informació del circuit'

  // dades del circuit
  document.querySelector('.track-info').innerHTML = `
    <h2>Track information</h2>
    <ul>
      <li><strong>Circuit:</strong> ${circuit}</li>
      <li><strong>Ubicació:</strong> ${ubicacio}</li>
      <li><strong>Longitud:</strong> ${longitud}</li>
      <li><strong>Tipus:</strong> ${tipus}</li>
      <li><strong>Superfície:</strong> ${superficie}</li>
    </ul>
    <p class="track-note">${nota}</p>
  `
}

async function init() {
  try {
    document.getElementById('cursa-titol').textContent = nom
    pintarInfoCircuit()

    // carreguem els dos fitxers alhora (més ràpid que seqüencial)
    const [laps, resultats] = await Promise.all([
      carregarDades(),
      carregarResultats()
    ])

    totesLesVoltes = laps

    const cotxes = millorTempsPerCotxe(laps)
    totesDades = aplicarOrdreResultats(cotxes, resultats)

    const stats = calcularStatsGlobals(laps)
    pintarStatsGlobals(stats)

    const statsClasses = statsPerClasse(cotxes)
    pintarStatsClasses(statsClasses)

    pintarCotxes(totesDades)
    configurarFiltres()

  } catch (error) {
    document.getElementById('status').textContent =
      'Error carregant les dades: ' + error.message
    console.error(error)
  }
}

function aplicarOrdreResultats(cotxes, resultats) {
  if (!resultats || resultats.length === 0) return cotxes

  // construïm un mapa de número de cotxe → posició final
  const ordreMap = {}
  resultats.forEach((fila, index) => {
    const num = fila['NUMBER']?.trim()
    const posicio = parseInt(fila['POSITION']) || index + 1
    if (num) ordreMap[num] = posicio
  })

  // afegim la posició a cada cotxe i ordenem
  return cotxes
    .map(cotxe => ({
      ...cotxe,
      posicio: ordreMap[cotxe.numero] ?? 999
    }))
    .sort((a, b) => a.posicio - b.posicio)
}

function configurarFiltres() {
    const botons = document.querySelectorAll('.filtre')
    //amagar grafic al fer clic
    //document.getElementById('grafic-container').style.display = 'none'
    //if (graficActual) graficActual.destroy()

    botons.forEach(boto => {
        boto.addEventListener('click', () => {
            // 1. treure la classe 'actiu' de tots els botons
            botons.forEach(b => b.classList.remove('actiu'))

            // 2. posar la classe 'actiu' al botó clicat
            boto.classList.add('actiu')

            // 3. llegir quin filtre hem seleccionat
            const classe = boto.dataset.classe

            // 4. filtrar les dades
            if (classe === 'tots') {
                pintarCotxes(totesDades)
            } else {
                const filtrades = totesDades.filter(cotxe => cotxe.classe === classe)
                pintarCotxes(filtrades)
            }

        })
    })
}


let graficActual = null   // guardem la instància del gràfic

function mostrarGrafic(numeroCotxe, equip, cardElement) {
    // 1. agafem totes les voltes d'aquest cotxe, ordenades per número de volta
    const voltes = totesLesVoltes
        .filter(lap => lap['NUMBER']?.trim() === numeroCotxe)
        .filter(lap => lap[' LAP_NUMBER']?.trim() !== '1')  // traiem la primera volta (outlap llarga)
        .map(lap => ({
            volta: parseInt(lap[' LAP_NUMBER']),
            temps: minutsASegons(lap[' LAP_TIME'] || '')
        }))
        .filter(v => v.temps > 60 && v.temps < 300)  // traiem voltes anòmales
        .sort((a, b) => a.volta - b.volta)

    // 2. mostrem el contenidor
    const container = document.getElementById('grafic-container')

    cardElement.after(container)

    container.style.display = 'block'
    document.getElementById('grafic-titol').textContent = `#${numeroCotxe} ${equip}`

    // 3. si ja hi havia un gràfic anterior, el destruïm
    if (graficActual) graficActual.destroy()

    // 4. creem el gràfic amb Chart.js
    const ctx = document.getElementById('grafic').getContext('2d')
    graficActual = new Chart(ctx, {
        type: 'line',
        data: {
            labels: voltes.map(v => `V${v.volta}`),
            datasets: [{
                label: 'Temps de volta',
                data: voltes.map(v => v.temps),
                borderColor: '#185FA5',
                borderWidth: 1.5,
                pointRadius: 2,
                tension: 0.1
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => 'Temps: ' + formatarTemps(context.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: val => formatarTemps(val)
                    }
                }
            }
        }
    })

    // 5. botó de tancar
    document.getElementById('grafic-tancar').onclick = () => {
        container.style.display = 'none'
        if (graficActual) graficActual.destroy()
    }
}


function calcularStatsGlobals(laps) {
    const cotxes = new Set()
    let millorTemps = Infinity
    let millorCotxe = null

    laps.forEach(lap => {
        const num = lap['NUMBER']?.trim()
        const temps = minutsASegons(lap[' LAP_TIME'] || '')

        if (num) cotxes.add(num)

        if (!isNaN(temps) && temps > 60 && temps < millorTemps) {
            millorTemps = temps
            millorCotxe = {
                numero: num,
                equip: lap['TEAM']?.trim()
            }
        }
    })

    return {
        totalCotxes: cotxes.size,
        totalVoltes: laps.length,
        millorVolta: millorTemps,
        millorCotxe
    }
}

function pintarStatsGlobals(stats) {
    const el = document.getElementById('race-stats')
    el.innerHTML = `
        <h3>Race statistics</h3>
        <ul>
            <li><strong>Cotxes:</strong> ${stats.totalCotxes}</li>
            <li><strong>Voltes totals:</strong> ${stats.totalVoltes}</li>
            <li><strong>Millor volta:</strong> ${formatarTemps(stats.millorVolta)}</li>
            <li><strong>Cotxe:</strong> #${stats.millorCotxe.numero} ${stats.millorCotxe.equip}</li>
        </ul>
    `
}

function pintarStatsClasses(stats) {
    const el = document.getElementById('class-stats')

    el.innerHTML = `
        <h3>Cotxes per cada categoria</h3>
        <ul>
            ${Object.entries(stats)
            .map(([classe, n]) =>
                `<li><strong>${classe}:</strong> ${n}</li>`
            )
            .join('')}
        </ul>
    `
}

function statsPerClasse(cotxes) {
    const comptador = {}

    cotxes.forEach(c => {
        const classe = c.classe || 'Desconeguda'
        comptador[classe] = (comptador[classe] || 0) + 1
    })

    return comptador
}




init()


const params = new URLSearchParams(window.location.search)
const any = params.get('any')
const carpeta = params.get('carpeta')
const fitxer = params.get('fitxer')
const nom = params.get('nom')
const fitxerResultats = params.get('fitxerResultats')
const fitxerWeather = params.get('fitxerWeather')
const btnTotesCurses = document.getElementById('btn-totes-curses')

if (btnTotesCurses && any) {
  btnTotesCurses.href = `index.html?any=${encodeURIComponent(any)}`
}
const RESULTS_URL = fitxerResultats
  ? `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/${any}/${carpeta}/${fitxerResultats}`
  : null
const CSV_URL = `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/${any}/${carpeta}/${fitxer}`

const WEATHER_URL = fitxerWeather
  ? `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/${any}/${carpeta}/${fitxerWeather}`
  : null



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

function normalitzarClausFila(row) {
  const normalitzat = {}

  Object.entries(row).forEach(([key, value]) => {
    const novaClau = String(key || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

    normalitzat[novaClau] = value
  })

  return normalitzat
}

async function carregarWeather() {
  if (!WEATHER_URL) return []

  const response = await fetch(WEATHER_URL)
  const text = await response.text()
  const firstLine = text.split('\n')[0]
  const delimiter = firstLine.includes(';') ? ';' : ','

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      delimiter,
      complete: (results) => {
        const filesNetes = results.data
          .filter(row => row && Object.values(row).some(v => String(v ?? '').trim() !== ''))
          .map(normalitzarClausFila)

        resolve(filesNetes)
        console.log('WEATHER FILES NETES:', filesNetes)
        console.log('WEATHER PRIMERA FILA:', filesNetes[0])
        console.log('WEATHER CLAUS:', Object.keys(filesNetes[0] || {}))
      },
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

  const graficContainer = document.getElementById('grafic-container')
  if (graficContainer) {
    contenidor.parentNode.insertBefore(graficContainer, contenidor)
    graficContainer.style.display = 'none'
  }
  if (graficActual) {
    graficActual.destroy()
    graficActual = null
  }

  contenidor.innerHTML = ''
  status.textContent = `${cotxes.length} cotxes carregats`

  cotxes.forEach(cotxe => {
    const card = document.createElement('div')
    card.className = `car-card ${cotxe.classe}`

    // construïm la llista de pilots
    const pilotsHTML = cotxe.pilots.length > 0
      ? cotxe.pilots.map(p =>
        `<span class="pilot-nom">${p.nom} ${p.cognom}${p.rating ? ` <span class="pilot-rating">${p.rating}</span>` : ''}</span>`
      ).join('')
      : '<span class="pilot-nom" style="opacity:0.4">Sense dades</span>'

    // si mai es vol posar la posicio en la que han quedat es aixi
    //<span class="car-position">${cotxe.posicio ?? '—'}</span>

    card.innerHTML = `
      <div class="card-top">
        <div class="card-left">
          
          <span class="car-number">#${cotxe.numero}</span>
        </div>
        <div class="car-info">
          <div class="car-team">${cotxe.equip}</div>
          <div class="car-class">
            <span class="badge ${cotxe.classe}">${cotxe.classe}</span>
            <span class="car-voltes">${cotxe.voltes} voltes</span>
          </div>
          <div class="pilots-list">${pilotsHTML}</div>
        </div>
        <div class="card-right">
          <div class="car-laptime">${formatarTemps(cotxe.millorTemps)}</div>
          <div class="car-pb">pb: volta ${cotxe.millorVolta}</div>
          <button class="btn-grafic">Gràfic</button>
        </div>
      </div>
    `

    // només el botó obre el gràfic
    card.querySelector('.btn-grafic').addEventListener('click', () => {
      mostrarGrafic(cotxe.numero, cotxe.equip, card)
    })

    contenidor.appendChild(card)
  })
}

function pintarInfoCircuit() {
  // llegim tots els paràmetres de la URL
  const circuit = params.get('circuit')
  const data = params.get('data')
  const durada = params.get('durada')
  const logo = params.get('logo')
  const layout = params.get('layout')
  const ubicacio = params.get('ubicacio')
  const longitud = params.get('longitud')
  const tipus = params.get('tipus')
  const superficie = params.get('superficie')
  const nota = params.get('nota')

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

function obtenirPrimerValor(obj, claus) {
  for (const clau of claus) {
    const valor = obj?.[clau]
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      return valor
    }
  }
  return null
}

function parseNumeroFlexible(valor) {
  if (valor == null) return NaN
  const net = String(valor).trim().replace(',', '.')
  const num = parseFloat(net)
  return Number.isFinite(num) ? num : NaN
}

function parseBooleanFlexible(valor) {
  if (valor == null) return false
  const v = String(valor).trim().toLowerCase()
  return ['1', 'true', 'yes', 'y', 'si', 'sí', 'rain', 'wet'].includes(v)
}

function parseTempsCursaASegons(text) {
  if (!text) return NaN

  const net = String(text).trim()
  const parts = net.split(':')

  if (parts.length === 3) {
    const h = parseFloat(parts[0])
    const m = parseFloat(parts[1])
    const s = parseFloat(parts[2])
    return h * 3600 + m * 60 + s
  }

  if (parts.length === 2) {
    const m = parseFloat(parts[0])
    const s = parseFloat(parts[1])
    return m * 60 + s
  }

  return parseFloat(net)
}

// weather
function calcularRaceContext(laps, weather) {
  // ---------- WEATHER ----------
  const temperaturesC = weather
    .map(row => {
      // primer provem si ja ve en Celsius
      const tempC = parseNumeroFlexible(obtenirPrimerValor(row, [
        'AIRTEMPC',
        'AMBIENTTEMPC',
        'TEMPERATUREC',
        'AIRTEMP',
        'AMBIENTTEMP',
        'TEMP',
        'TEMPC'
      ]))

      if (Number.isFinite(tempC)) return tempC

      // si no, provem Fahrenheit i convertim
      const tempF = parseNumeroFlexible(obtenirPrimerValor(row, [
        'AIRTEMPF',
        'AMBIENTTEMPF',
        'TEMPERATUREF',
        'TEMPF'
      ]))

      if (Number.isFinite(tempF)) {
        return ((tempF - 32) * 5 / 9)
      }

      return NaN
    })
    .filter(Number.isFinite)

  const ventsKmh = weather
    .map(row => {
      // primer provem si ja ve en km/h
      const windKmh = parseNumeroFlexible(obtenirPrimerValor(row, [
        'WINDSPEEDKMH',
        'WINDSPEEDKPH',
        'WINDKMH',
        'WINDKPH',
        'WINDSPEED',
        'WIND'
      ]))

      if (Number.isFinite(windKmh)) return windKmh

      // si no, provem mph i convertim
      const windMph = parseNumeroFlexible(obtenirPrimerValor(row, [
        'WINDSPEEDMPH',
        'WINDMPH'
      ]))

      if (Number.isFinite(windMph)) {
        return windMph * 1.60934
      }

      return NaN
    })
    .filter(Number.isFinite)

  const mostresPluja = weather.filter(row =>
    parseBooleanFlexible(obtenirPrimerValor(row, [
      'RAINING',
      'RAIN',
      'WET',
      'TRACKWET',
      'CONDITIONWET'
    ]))
  ).length

  let condition = 'No data'
  if (weather.length > 0) {
    if (mostresPluja === 0) {
      condition = 'Dry'
    } else if (mostresPluja === weather.length) {
      condition = 'Wet'
    } else {
      condition = 'Mixed'
    }
  }

  const tempMinC = temperaturesC.length
    ? Math.round(Math.min(...temperaturesC) * 10) / 10
    : null

  const tempMaxC = temperaturesC.length
    ? Math.round(Math.max(...temperaturesC) * 10) / 10
    : null

  const ventMinKmh = ventsKmh.length
    ? Math.round(Math.min(...ventsKmh) * 10) / 10
    : null

  const ventMaxKmh = ventsKmh.length
    ? Math.round(Math.max(...ventsKmh) * 10) / 10
    : null

  // ---------- FLAGS / NEUTRALITZACIONS ----------
  const mostresFlags = laps
    .map(lap => {
      const elapsed = lap[' ELAPSED'] || lap['ELAPSED'] || lap[' SESSION_TIME'] || lap['SESSION_TIME'] || ''
      const flag = (lap[' FLAG_AT_FL'] || lap['FLAG_AT_FL'] || lap['FLAGS'] || '').trim().toUpperCase()
      const segons = parseTempsCursaASegons(elapsed)

      return { segons, flag }
    })
    .filter(x => Number.isFinite(x.segons))
    .sort((a, b) => a.segons - b.segons)

  const perSegon = new Map()

  mostresFlags.forEach(sample => {
    const segon = Math.floor(sample.segons)
    const actual = perSegon.get(segon)

    if (!actual) {
      perSegon.set(segon, sample.flag || 'GF')
      return
    }

    if ((actual === 'GF' || actual === '') && sample.flag && sample.flag !== 'GF') {
      perSegon.set(segon, sample.flag)
    }
  })

  const timeline = Array.from(perSegon.entries())
    .map(([segon, flag]) => ({ segon, flag: flag || 'GF' }))
    .sort((a, b) => a.segon - b.segon)

  let neutralitzacions = 0
  let enNeutralitzacio = false
  let iniciNeutralitzacio = null
  let fcySegonsTotals = 0

  timeline.forEach((punt, idx) => {
    const flagEsNeutral = punt.flag !== 'GF' && punt.flag !== ''

    if (flagEsNeutral && !enNeutralitzacio) {
      enNeutralitzacio = true
      iniciNeutralitzacio = punt.segon
      neutralitzacions++
    }

    if (!flagEsNeutral && enNeutralitzacio) {
      fcySegonsTotals += Math.max(0, punt.segon - iniciNeutralitzacio)
      enNeutralitzacio = false
      iniciNeutralitzacio = null
    }

    if (idx === timeline.length - 1 && enNeutralitzacio) {
      fcySegonsTotals += Math.max(0, punt.segon - iniciNeutralitzacio)
    }
  })

  const fcyMinutsTotals = Math.round((fcySegonsTotals / 60) * 10) / 10

  return {
    condition,
    tempMinC,
    tempMaxC,
    ventMinKmh,
    ventMaxKmh,
    neutralitzacions,
    fcyMinutsTotals
  }
}


function pintarRaceContext(context) {
  const el = document.getElementById('race-context')
  if (!el) return

  const chipClass =
    context.condition === 'Dry'
      ? 'context-chip context-chip--dry'
      : context.condition === 'Wet'
        ? 'context-chip context-chip--wet'
        : context.condition === 'Mixed'
          ? 'context-chip context-chip--mixed'
          : 'context-chip'

  const tempText =
    context.tempMinC != null && context.tempMaxC != null
      ? `${context.tempMinC}–${context.tempMaxC}°C`
      : 'No disponible'

  const ventText =
    context.ventMinKmh != null && context.ventMaxKmh != null
      ? `${context.ventMinKmh}–${context.ventMaxKmh} km/h`
      : 'No disponible'

  const neutralText =
    Number.isFinite(context.neutralitzacions)
      ? context.neutralitzacions
      : 'No disponible'

  const fcyText =
    Number.isFinite(context.fcyMinutsTotals)
      ? `${context.fcyMinutsTotals} min`
      : 'No disponible'

  el.innerHTML = `
    <h3>Race context</h3>

    <div class="context-chips">
      <span class="${chipClass}">${context.condition}</span>
    </div>

    <ul class="context-list">
      <li>
        <span class="context-label">Air temp</span>
        <span class="context-value">${tempText}</span>
      </li>
      <li>
        <span class="context-label">Wind</span>
        <span class="context-value">${ventText}</span>
      </li>
      <li>
        <span class="context-label">Neutralizations</span>
        <span class="context-value">${neutralText}</span>
      </li>
      <li>
        <span class="context-label">FCY time</span>
        <span class="context-value">${fcyText}</span>
      </li>
    </ul>
  `
}


async function init() {
  try {
    document.getElementById('cursa-titol').textContent = nom
    pintarInfoCircuit()

    const [laps, resultats, weather] = await Promise.all([
      carregarDades(),
      carregarResultats(),
      carregarWeather()
    ])

    totesLesVoltes = laps

    const raceContext = calcularRaceContext(laps, weather)
    pintarRaceContext(raceContext)

    const cotxes = millorTempsPerCotxe(laps)
    totesDades = aplicarOrdreResultats(cotxes, resultats)

    const stats = calcularStatsGlobals(laps)
    pintarStatsGlobals(stats)

    const statsClasses = statsPerClasse(cotxes)
    pintarStatsClasses(statsClasses)
    actualitzarFiltres(statsClasses)

    pintarCotxes(totesDades)
    configurarFiltres()

  } catch (error) {
    document.getElementById('status').textContent =
      'Error carregant les dades: ' + error.message
    console.error(error)
  }
}


function actualitzarFiltres(statsClasses) {
  const botons = document.querySelectorAll('.filtre')

  botons.forEach(boto => {
    const classe = boto.dataset.classe

    // "tots" sempre visible
    if (classe === 'tots') {
      boto.classList.remove('ocult')
      return
    }

    const total = statsClasses[classe] || 0

    if (total > 0) {
      boto.classList.remove('ocult')
    } else {
      boto.classList.add('ocult')
    }
  })
}


function aplicarOrdreResultats(cotxes, resultats) {
  if (!resultats || resultats.length === 0) return cotxes

  const ordreMap = {}
  resultats.forEach((fila, index) => {
    const num = fila['NUMBER']?.trim()
    if (!num) return

    const posicio = parseInt(fila['POSITION']) || index + 1

    // construïm la llista de pilots
    const pilots = []
    for (let i = 1; i <= 6; i++) {
      const nom = fila[`DRIVER${i}_FIRSTNAME`]?.trim()
      const cognom = fila[`DRIVER${i}_SECONDNAME`]?.trim()
      const rating = fila[`DRIVER${i}_IMSA_DriverRatingLong`]?.trim()
      if (nom && cognom) {
        pilots.push({ nom, cognom, rating })
      }
    }

    ordreMap[num] = {
      posicio,
      pilots,
      voltes: fila['LAPS']?.trim(),
      tempsTotal: fila['TOTAL_TIME']?.trim(),
      gap: fila['GAP_FIRST']?.trim()
    }
  })

  return cotxes
    .map(cotxe => ({
      ...cotxe,
      posicio: ordreMap[cotxe.numero]?.posicio ?? 999,
      pilots: ordreMap[cotxe.numero]?.pilots ?? [],
      voltes: ordreMap[cotxe.numero]?.voltes ?? '—',
      tempsTotal: ordreMap[cotxe.numero]?.tempsTotal ?? '—',
      gap: ordreMap[cotxe.numero]?.gap ?? '—'
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


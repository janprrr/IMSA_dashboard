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

const BASE_URL = `https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/${any}/${carpeta}`
const CSV_URL = `${BASE_URL}/${fitxer}`
const RESULTS_URL = fitxerResultats ? `${BASE_URL}/${fitxerResultats}` : null
const WEATHER_URL = fitxerWeather ? `${BASE_URL}/${fitxerWeather}` : null


let totesDades = []
let totesLesVoltes = []
let graficActual = null
let mapaEstrategies = {}
let neutralitzacionsCursa = []
let totalVoltesCursa = 0
let estrategiaContainerActual = null



// =========================
// Helpers generals
// =========================

function normalitzarClausFila(row) {
  const normalitzat = {}

  Object.entries(row || {}).forEach(([key, value]) => {
    const novaClau = String(key || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

    normalitzat[novaClau] = value
  })

  return normalitzat
}

function filtrarFilesBuides(files) {
  return (files || []).filter(row =>
    row && Object.values(row).some(v => String(v ?? '').trim() !== '')
  )
}

function detectarDelimitador(text) {
  const firstLine = String(text || '').split('\n')[0] || ''
  return firstLine.includes(';') ? ';' : ','
}

function parseCsvNormalitzat(text) {
  const delimiter = detectarDelimitador(text)

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      delimiter,
      complete: (results) => {
        const filesNetes = filtrarFilesBuides(results.data).map(normalitzarClausFila)
        resolve(filesNetes)
      },
      error: (err) => reject(err)
    })
  })
}

async function fetchTextOrThrow(url, etiqueta = 'fitxer') {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`No s'ha pogut carregar ${etiqueta} (${response.status}): ${url}`)
  }

  return await response.text()
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

function minutsASegons(temps) {
  const parts = String(temps || '').trim().split(':')
  if (parts.length !== 2) return Infinity
  return parseFloat(parts[0]) * 60 + parseFloat(parts[1])
}

function formatarTemps(segons) {
  if (!Number.isFinite(segons)) return 'No disponible'
  const minuts = Math.floor(segons / 60)
  const seg = (segons % 60).toFixed(3).padStart(6, '0')
  return `${minuts}:${seg}`
}

function fahrenheitACelsius(f) {
  return (f - 32) * 5 / 9
}

function mphAKmh(mph) {
  return mph * 1.60934
}

function parseDuradaFlexibleASegons(text) {
  if (text == null) return NaN

  const net = String(text).trim()
  if (!net) return NaN

  const parts = net.split(':')

  // Ex: "31.245"
  if (parts.length === 1) {
    const num = parseNumeroFlexible(net)
    return Number.isFinite(num) ? num : NaN
  }

  // Ex: "1:02.345" -> 62.345
  if (parts.length === 2) {
    const m = parseFloat(parts[0])
    const s = parseFloat(parts[1])
    if (!Number.isFinite(m) || !Number.isFinite(s)) return NaN
    return m * 60 + s
  }

  // Ex: "0:01:02.345" -> 62.345
  if (parts.length === 3) {
    const h = parseFloat(parts[0])
    const m = parseFloat(parts[1])
    const s = parseFloat(parts[2])
    if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return NaN
    return h * 3600 + m * 60 + s
  }

  return NaN
}

function teIndicadorPit(row) {
  const pitTimeSec = parseDuradaFlexibleASegons(row.PITTIME)

  if (Number.isFinite(pitTimeSec) && pitTimeSec > 0) {
    return true
  }

  const crossing = String(row.CROSSINGFINISHLINEINPIT || '').trim().toLowerCase()

  if (!crossing) return false

  // casos habituals de "sí"
  if (['1', 'true', 'yes', 'y', 'si', 'sí', 'pit', 'in', 'x'].includes(crossing)) {
    return true
  }

  // si ve qualsevol valor no buit que no sigui un fals explícit, també ho acceptem
  if (!['0', 'false', 'no', 'n'].includes(crossing)) {
    return true
  }

  return false
}

function indexarEstrategiesPerCotxe(estrategies) {
  const map = {}

    ; (estrategies || []).forEach(e => {
      if (!e?.numero) return
      map[e.numero] = e
    })

  return map
}

function formatarPitLaps(pitStops) {
  if (!Array.isArray(pitStops) || pitStops.length === 0) {
    return '—'
  }

  return pitStops.map(stop => `L${stop.lap}`).join(', ')
}

function obtenirTotalVoltesCursa(laps) {
  const nums = laps
    .map(l => parseInt(l.LAPNUMBER, 10))
    .filter(Number.isFinite)

  return nums.length ? Math.max(...nums) : 0
}

function extreureNeutralitzacionsPerVolta(laps) {
  const perVolta = new Map()

  laps.forEach(row => {
    const lap = parseInt(row.LAPNUMBER, 10)
    if (!Number.isFinite(lap)) return

    const flag = String(row.FLAGATFL || row.FLAGS || '').trim().toUpperCase()
    const esNeutral = !!flag && flag !== 'GF'

    const actual = perVolta.get(lap)
    if (!actual) {
      perVolta.set(lap, {
        lap,
        esNeutral
      })
      return
    }

    // si qualsevol registre d'aquella volta és neutral, la volta queda neutral
    if (esNeutral) {
      actual.esNeutral = true
    }
  })

  const voltes = Array.from(perVolta.values())
    .sort((a, b) => a.lap - b.lap)

  const intervals = []
  let inici = null

  voltes.forEach((v, idx) => {
    if (v.esNeutral && inici == null) {
      inici = v.lap
    }

    const seguent = voltes[idx + 1]
    const acabaInterval =
      inici != null &&
      (
        !v.esNeutral ||
        !seguent ||
        seguent.lap !== v.lap + 1 ||
        !seguent.esNeutral
      )

    if (inici != null && v.esNeutral && acabaInterval) {
      intervals.push({
        startLap: inici,
        endLap: v.lap
      })
      inici = null
    }
  })

  return intervals
}

function indexarEstrategiesPerCotxe(estrategies) {
  const map = {}

    ; (estrategies || []).forEach(e => {
      if (!e?.numero) return
      map[e.numero] = e
    })

  return map
}

function clampPercent(valor) {
  if (!Number.isFinite(valor)) return 0
  return Math.max(0, Math.min(100, valor))
}

function percentatgeLap(lap, totalVoltes) {
  if (!Number.isFinite(lap) || !Number.isFinite(totalVoltes) || totalVoltes <= 0) {
    return 0
  }
  return clampPercent(((lap - 1) / totalVoltes) * 100)
}

function ampladaInterval(startLap, endLap, totalVoltes) {
  if (!Number.isFinite(startLap) || !Number.isFinite(endLap) || totalVoltes <= 0) {
    return 0
  }

  const laps = Math.max(1, endLap - startLap + 1)
  return clampPercent((laps / totalVoltes) * 100)
}

function formatarPitLaps(pitStops) {
  if (!Array.isArray(pitStops) || pitStops.length === 0) {
    return '—'
  }

  return pitStops.map(stop => `L${stop.lap}`).join(', ')
}

function generarTicksTimeline(totalVoltes) {
  if (!Number.isFinite(totalVoltes) || totalVoltes <= 0) return []

  let pas = 10
  if (totalVoltes <= 30) pas = 5
  else if (totalVoltes <= 80) pas = 10
  else if (totalVoltes <= 150) pas = 20
  else pas = 25

  const ticks = [1]

  for (let lap = pas; lap < totalVoltes; lap += pas) {
    ticks.push(lap)
  }

  if (!ticks.includes(totalVoltes)) {
    ticks.push(totalVoltes)
  }

  return ticks
}

function renderResumPrincipalCotxe(cotxe) {
  const estrategia = mapaEstrategies[cotxe.numero]

  const posicioText =
    Number.isFinite(cotxe.posicio) && cotxe.posicio < 999
      ? `P${cotxe.posicio}`
      : '—'

  const gapNet = String(cotxe.gap || '').trim()

  const gapText =
    !gapNet || gapNet === '—'
      ? '—'
      : gapNet === '-'
        ? 'Winner'
        : gapNet

  const stops = Number.isFinite(estrategia?.totalParades)
    ? estrategia.totalParades
    : null

  const stopsText =
    stops == null
      ? '—'
      : stops === 1
        ? '1 stop'
        : `${stops} stops`

  return `
    <div class="car-result-position">${posicioText}</div>
    <div class="car-result-gap">${gapText}</div>
    <div class="car-result-stops">${stopsText}</div>
  `
}




// =========================
// Càrrega de dades
// =========================

async function carregarDades() {
  const text = await fetchTextOrThrow(CSV_URL, 'race-laps.csv')
  const files = await parseCsvNormalitzat(text)

  console.log('LAPS CLAUS:', Object.keys(files[0] || {}))
  console.log('LAPS PRIMERA FILA:', files[0])

  return files
}

async function carregarResultats() {
  if (!RESULTS_URL) return []

  try {
    const text = await fetchTextOrThrow(RESULTS_URL, 'race-results.csv')
    const files = await parseCsvNormalitzat(text)

    console.log('RESULTS CLAUS:', Object.keys(files[0] || {}))
    console.log('RESULTS PRIMERA FILA:', files[0])

    return files
  } catch (error) {
    console.warn('No s’han pogut carregar els resultats. Continuem sense resultats.', error.message)
    return []
  }
}

async function carregarWeather() {
  if (!WEATHER_URL) return []

  try {
    const text = await fetchTextOrThrow(WEATHER_URL, 'race-weather.csv')
    const filesNetes = await parseCsvNormalitzat(text)

    console.log('WEATHER FILES NETES:', filesNetes)
    console.log('WEATHER PRIMERA FILA:', filesNetes[0])
    console.log('WEATHER CLAUS:', Object.keys(filesNetes[0] || {}))

    return filesNetes
  } catch (error) {
    console.warn('No s’ha pogut carregar el weather. Continuem sense weather.', error.message)
    return []
  }
}

// =========================
// UI informació circuit
// =========================

function pintarInfoCircuit() {
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

  const logoEl = document.querySelector('.logo img')
  if (logoEl && logo) {
    logoEl.src = logo
    logoEl.alt = params.get('nom')
  }

  const layoutEl = document.querySelector('.imatge')
  if (layoutEl && layout) {
    layoutEl.src = layout
    layoutEl.alt = circuit
  }

  const titolColTrack = document.querySelector('.col-track h2')
  if (titolColTrack) {
    titolColTrack.textContent = 'Informació del circuit'
  }

  const trackInfo = document.querySelector('.track-info')
  if (trackInfo) {
    trackInfo.innerHTML = `
      <h2>Track information</h2>
      <ul>
        <li><strong>Circuit:</strong> ${circuit || '—'}</li>
        <li><strong>Ubicació:</strong> ${ubicacio || '—'}</li>
        <li><strong>Longitud:</strong> ${longitud || '—'}</li>
        <li><strong>Tipus:</strong> ${tipus || '—'}</li>
        <li><strong>Superfície:</strong> ${superficie || '—'}</li>
        <li><strong>Data:</strong> ${data || '—'}</li>
        <li><strong>Durada:</strong> ${durada || '—'}</li>
      </ul>
      <p class="track-note">${nota || ''}</p>
    `
  }
}

// =========================
// Race context
// =========================

function calcularRaceContext(laps, weather) {
  // ---------- WEATHER ----------
  const temperaturesAireC = weather
    .map(row => {
      const airTemp = parseNumeroFlexible(obtenirPrimerValor(row, ['AIRTEMP']))
      if (!Number.isFinite(airTemp)) return NaN
      return fahrenheitACelsius(airTemp)
    })
    .filter(Number.isFinite)

  const temperaturesPistaC = weather
    .map(row => {
      const trackTemp = parseNumeroFlexible(obtenirPrimerValor(row, ['TRACKTEMP']))
      if (!Number.isFinite(trackTemp)) return NaN
      return fahrenheitACelsius(trackTemp)
    })
    .filter(Number.isFinite)

  const humitats = weather
    .map(row => parseNumeroFlexible(obtenirPrimerValor(row, ['HUMIDITY'])))
    .filter(Number.isFinite)

  const pressions = weather
    .map(row => parseNumeroFlexible(obtenirPrimerValor(row, ['PRESSURE'])))
    .filter(Number.isFinite)

  const ventsKmh = weather
    .map(row => {
      const windSpeed = parseNumeroFlexible(obtenirPrimerValor(row, ['WINDSPEED']))
      if (!Number.isFinite(windSpeed)) return NaN
      return mphAKmh(windSpeed)
    })
    .filter(Number.isFinite)

  const direccionsVent = weather
    .map(row => parseNumeroFlexible(obtenirPrimerValor(row, ['WINDDIRECTION'])))
    .filter(Number.isFinite)

  const mostresPluja = weather.filter(row =>
    parseBooleanFlexible(obtenirPrimerValor(row, ['RAIN']))
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

  const tempMinC = temperaturesAireC.length
    ? Math.round(Math.min(...temperaturesAireC) * 10) / 10
    : null

  const tempMaxC = temperaturesAireC.length
    ? Math.round(Math.max(...temperaturesAireC) * 10) / 10
    : null

  const trackTempMinC = temperaturesPistaC.length
    ? Math.round(Math.min(...temperaturesPistaC) * 10) / 10
    : null

  const trackTempMaxC = temperaturesPistaC.length
    ? Math.round(Math.max(...temperaturesPistaC) * 10) / 10
    : null

  const humidityMin = humitats.length
    ? Math.round(Math.min(...humitats) * 10) / 10
    : null

  const humidityMax = humitats.length
    ? Math.round(Math.max(...humitats) * 10) / 10
    : null

  const pressureMin = pressions.length
    ? Math.round(Math.min(...pressions) * 10) / 10
    : null

  const pressureMax = pressions.length
    ? Math.round(Math.max(...pressions) * 10) / 10
    : null

  const ventMinKmh = ventsKmh.length
    ? Math.round(Math.min(...ventsKmh) * 10) / 10
    : null

  const ventMaxKmh = ventsKmh.length
    ? Math.round(Math.max(...ventsKmh) * 10) / 10
    : null

  const windDirMin = direccionsVent.length
    ? Math.round(Math.min(...direccionsVent) * 10) / 10
    : null

  const windDirMax = direccionsVent.length
    ? Math.round(Math.max(...direccionsVent) * 10) / 10
    : null

  // ---------- FLAGS / NEUTRALITZACIONS ----------
  const mostresFlags = laps
    .map(lap => {
      const elapsed = lap.ELAPSED || lap.SESSIONTIME || ''
      const flag = String(lap.FLAGATFL || lap.FLAGS || '').trim().toUpperCase()
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
    trackTempMinC,
    trackTempMaxC,
    humidityMin,
    humidityMax,
    pressureMin,
    pressureMax,
    ventMinKmh,
    ventMaxKmh,
    windDirMin,
    windDirMax,
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

  const trackTempText =
    context.trackTempMinC != null && context.trackTempMaxC != null
      ? `${context.trackTempMinC}–${context.trackTempMaxC}°C`
      : 'No disponible'

  const humidityText =
    context.humidityMin != null && context.humidityMax != null
      ? `${context.humidityMin}–${context.humidityMax}%`
      : 'No disponible'

  const pressureText =
    context.pressureMin != null && context.pressureMax != null
      ? `${context.pressureMin}–${context.pressureMax}`
      : 'No disponible'

  const ventText =
    context.ventMinKmh != null && context.ventMaxKmh != null
      ? `${context.ventMinKmh}–${context.ventMaxKmh} km/h`
      : 'No disponible'

  const windDirectionText =
    context.windDirMin != null && context.windDirMax != null
      ? `${context.windDirMin}–${context.windDirMax}°`
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
        <span class="context-label">Track temp</span>
        <span class="context-value">${trackTempText}</span>
      </li>
      <li>
        <span class="context-label">Humidity</span>
        <span class="context-value">${humidityText}</span>
      </li>
      <li>
        <span class="context-label">Pressure</span>
        <span class="context-value">${pressureText}</span>
      </li>
      <li>
        <span class="context-label">Wind</span>
        <span class="context-value">${ventText}</span>
      </li>
      <li>
        <span class="context-label">Wind direction</span>
        <span class="context-value">${windDirectionText}</span>
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

// =========================
// Race Strat
// =========================

function extreureEstrategiaPerCotxe(lapsCotxe) {
  if (!Array.isArray(lapsCotxe) || lapsCotxe.length === 0) {
    return null
  }

  // 1. Ordenem voltes
  const voltes = [...lapsCotxe]
    .map(row => ({
      ...row,
      LAPNUMBER_NUM: parseInt(row.LAPNUMBER, 10),
      ELAPSEDSEC: parseTempsCursaASegons(row.ELAPSED || row.SESSIONTIME || ''),
      PITTIMESEC: parseDuradaFlexibleASegons(row.PITTIME),
      DRIVERNAME_CLEAN: String(row.DRIVERNAME || '').trim(),
      FLAG_CLEAN: String(row.FLAGATFL || row.FLAGS || '').trim().toUpperCase()
    }))
    .filter(row => Number.isFinite(row.LAPNUMBER_NUM))
    .sort((a, b) => a.LAPNUMBER_NUM - b.LAPNUMBER_NUM)

  if (voltes.length === 0) return null

  const numero = String(voltes[0].NUMBER || '').trim()
  const equip = String(voltes[0].TEAM || '').trim()
  const classe = String(voltes[0].CLASS || '').trim()
  const manufacturer = String(voltes[0].MANUFACTURER || '').trim()

  // 2. Detectem files candidates a pit stop
  const candidatsPit = voltes.filter(row => teIndicadorPit(row))

  // 3. Dedupliquem pit stops consecutius
  const pitStops = []

  candidatsPit.forEach(row => {
    const lap = row.LAPNUMBER_NUM

    const event = {
      lap,
      elapsedSec: row.ELAPSEDSEC,
      pitTimeSec: Number.isFinite(row.PITTIMESEC) ? row.PITTIMESEC : null,
      crossingInPit: teIndicadorPit(row),
      flag: row.FLAG_CLEAN || '',
      driverOnLap: row.DRIVERNAME_CLEAN || '',
      rawRow: row
    }

    const ultim = pitStops[pitStops.length - 1]

    // si la fila actual és a la mateixa volta o la següent, la considerem el mateix pit event
    if (ultim && lap <= ultim.lap + 1) {
      // ens quedem el pitTime si el nou és millor informat
      if (ultim.pitTimeSec == null && event.pitTimeSec != null) {
        ultim.pitTimeSec = event.pitTimeSec
      }

      // si l'actual té elapsed vàlid i l'altre no, el completem
      if (!Number.isFinite(ultim.elapsedSec) && Number.isFinite(event.elapsedSec)) {
        ultim.elapsedSec = event.elapsedSec
      }

      // si l'actual té flag i l'altre no, el completem
      if (!ultim.flag && event.flag) {
        ultim.flag = event.flag
      }

      // si l'actual té driver i l'altre no, el completem
      if (!ultim.driverOnLap && event.driverOnLap) {
        ultim.driverOnLap = event.driverOnLap
      }

      // si la nova volta és més gran, actualitzem la lap per representar millor el final del pit window
      if (event.lap > ultim.lap) {
        ultim.lap = event.lap
      }
    } else {
      pitStops.push(event)
    }
  })

  // 4. Enriquim pit stops amb driver abans/després i tipus de bandera
  pitStops.forEach(stop => {
    const idx = voltes.findIndex(v => v.LAPNUMBER_NUM === stop.lap)

    const filaAbans = idx > 0 ? voltes[idx - 1] : null
    const filaActual = idx >= 0 ? voltes[idx] : null
    const filaDespres = idx >= 0 && idx < voltes.length - 1 ? voltes[idx + 1] : null

    stop.driverBefore = filaAbans?.DRIVERNAME_CLEAN || filaActual?.DRIVERNAME_CLEAN || ''
    stop.driverAfter = filaDespres?.DRIVERNAME_CLEAN || filaActual?.DRIVERNAME_CLEAN || ''
    stop.underGreen = stop.flag === 'GF'
    stop.underFCY = !!stop.flag && stop.flag !== 'GF'
  })

  // 5. Construïm stints
  const ultimaVolta = voltes[voltes.length - 1].LAPNUMBER_NUM
  const stints = []

  let startLap = voltes[0].LAPNUMBER_NUM

  pitStops.forEach(stop => {
    const endLap = stop.lap

    if (endLap >= startLap) {
      stints.push({
        startLap,
        endLap,
        laps: endLap - startLap + 1
      })
    }

    startLap = stop.lap + 1
  })

  if (startLap <= ultimaVolta) {
    stints.push({
      startLap,
      endLap: ultimaVolta,
      laps: ultimaVolta - startLap + 1
    })
  }

  // 6. Agregats
  const totalPitTime = pitStops.reduce((acc, stop) => {
    return acc + (Number.isFinite(stop.pitTimeSec) ? stop.pitTimeSec : 0)
  }, 0)

  const stopsUnderGreen = pitStops.filter(stop => stop.underGreen).length
  const stopsUnderFCY = pitStops.filter(stop => stop.underFCY).length

  const driverChanges = pitStops.filter(stop => {
    return stop.driverBefore && stop.driverAfter && stop.driverBefore !== stop.driverAfter
  }).length

  const stintLaps = stints.map(s => s.laps).filter(Number.isFinite)

  const avgStintLaps = stintLaps.length
    ? Math.round((stintLaps.reduce((a, b) => a + b, 0) / stintLaps.length) * 10) / 10
    : null

  const longestStint = stintLaps.length ? Math.max(...stintLaps) : null
  const shortestStint = stintLaps.length ? Math.min(...stintLaps) : null

  return {
    numero,
    equip,
    classe,
    manufacturer,

    totalVoltes: ultimaVolta,
    totalParades: pitStops.length,
    totalStints: stints.length,

    totalPitTime: Math.round(totalPitTime * 10) / 10,
    stopsUnderGreen,
    stopsUnderFCY,
    driverChanges,

    avgStintLaps,
    longestStint,
    shortestStint,

    pitStops,
    stints
  }
}

function extreureEstrategiesDeLaCursa(laps) {
  const perCotxe = new Map()

  laps.forEach(row => {
    const num = String(row.NUMBER || '').trim()
    if (!num) return

    if (!perCotxe.has(num)) {
      perCotxe.set(num, [])
    }

    perCotxe.get(num).push(row)
  })

  return Array.from(perCotxe.values())
    .map(lapsCotxe => extreureEstrategiaPerCotxe(lapsCotxe))
    .filter(Boolean)
}

function extreureNeutralitzacionsPerVolta(laps) {
  const perVolta = new Map()

  laps.forEach(row => {
    const lap = parseInt(row.LAPNUMBER, 10)
    if (!Number.isFinite(lap)) return

    const flag = String(row.FLAGATFL || row.FLAGS || '').trim().toUpperCase()
    const esNeutral = !!flag && flag !== 'GF'

    const actual = perVolta.get(lap)
    if (!actual) {
      perVolta.set(lap, {
        lap,
        esNeutral
      })
      return
    }

    // si qualsevol registre d'aquella volta és neutral, la volta queda neutral
    if (esNeutral) {
      actual.esNeutral = true
    }
  })

  const voltes = Array.from(perVolta.values())
    .sort((a, b) => a.lap - b.lap)

  const intervals = []
  let inici = null

  voltes.forEach((v, idx) => {
    if (v.esNeutral && inici == null) {
      inici = v.lap
    }

    const seguent = voltes[idx + 1]
    const acabaInterval =
      inici != null &&
      (
        !v.esNeutral ||
        !seguent ||
        seguent.lap !== v.lap + 1 ||
        !seguent.esNeutral
      )

    if (inici != null && v.esNeutral && acabaInterval) {
      intervals.push({
        startLap: inici,
        endLap: v.lap
      })
      inici = null
    }
  })

  return intervals
}


// function renderResumEstrategia(cotxe) {
//   const estrategia = mapaEstrategies[cotxe.numero]

//   if (!estrategia) {
//     return `
//       <div class="strategy-box">
//         <div class="strategy-title">Estratègia</div>
//         <div class="strategy-empty">Sense dades d’estratègia</div>
//       </div>
//     `
//   }

//   return `
//     <div class="strategy-box">
//       <div class="strategy-title">Estratègia</div>
//       <ul class="strategy-list">
//         <li><strong>Stops:</strong> ${estrategia.totalParades}</li>
//         <li><strong>Stints:</strong> ${estrategia.totalStints}</li>
//         <li><strong>Avg stint:</strong> ${estrategia.avgStintLaps ?? '—'} voltes</li>
//         <li><strong>Longest:</strong> ${estrategia.longestStint ?? '—'} voltes</li>
//         <li><strong>Shortest:</strong> ${estrategia.shortestStint ?? '—'} voltes</li>
//         <li><strong>Pit time:</strong> ${Number.isFinite(estrategia.totalPitTime) ? `${estrategia.totalPitTime}s` : '—'}</li>
//         <li><strong>Green stops:</strong> ${estrategia.stopsUnderGreen}</li>
//         <li><strong>FCY stops:</strong> ${estrategia.stopsUnderFCY}</li>
//         <li><strong>Pit laps:</strong> ${formatarPitLaps(estrategia.pitStops)}</li>
//       </ul>
//     </div>
//   `
// }

// =========================
// Dades cotxes / classificació
// =========================


function millorTempsPerCotxe(laps) {
  const cotxes = {}

  laps.forEach(lap => {
    const num = String(lap.NUMBER || '').trim()
    const temps = minutsASegons(lap.LAPTIME || '')
    const equip = String(lap.TEAM || '').trim()
    const classe = String(lap.CLASS || '').trim()

    if (!num || isNaN(temps) || temps < 60) return

    if (!cotxes[num]) {
      cotxes[num] = { numero: num, equip, classe, millorTemps: Infinity }
    }

    if (temps < cotxes[num].millorTemps) {
      cotxes[num].millorTemps = temps
      cotxes[num].millorVolta = parseInt(lap.LAPNUMBER, 10)
    }
  })

  return Object.values(cotxes).sort((a, b) => a.millorTemps - b.millorTemps)
}

function aplicarOrdreResultats(cotxes, resultats) {
  if (!resultats || resultats.length === 0) return cotxes

  const ordreMap = {}

  resultats.forEach((fila, index) => {
    const num = String(fila.NUMBER || '').trim()
    if (!num) return

    const posicio = parseInt(fila.POSITION, 10) || index + 1

    const pilots = []
    for (let i = 1; i <= 6; i++) {
      const nom = String(fila[`DRIVER${i}FIRSTNAME`] || '').trim()
      const cognom = String(fila[`DRIVER${i}SECONDNAME`] || '').trim()
      const rating = String(fila[`DRIVER${i}IMSADRIVERRATINGLONG`] || '').trim()

      if (nom && cognom) {
        pilots.push({ nom, cognom, rating })
      }
    }

    ordreMap[num] = {
      posicio,
      pilots,
      voltes: String(fila.LAPS || '').trim() || '—',
      tempsTotal: String(fila.TOTALTIME || '').trim() || '—',
      gap: String(fila.GAPFIRST || '').trim() || '—'
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

function renderTimelineEstrategia(estrategia, totalVoltes, neutralitzacions) {
  if (!estrategia) {
    return `<div class="strategy-empty">Sense dades d’estratègia</div>`
  }

  const ticks = generarTicksTimeline(totalVoltes)

  const ticksHtml = ticks.map(lap => {
    const left = percentatgeLap(lap, totalVoltes)
    return `
      <div class="strategy-tick" style="left:${left}%;">
        <span class="strategy-tick-label">L${lap}</span>
      </div>
    `
  }).join('')

  const fcyHtml = (neutralitzacions || []).map((interval, i) => {
    const left = percentatgeLap(interval.startLap, totalVoltes)
    const width = ampladaInterval(interval.startLap, interval.endLap, totalVoltes)

    return `
      <div
        class="strategy-band strategy-band--fcy"
        style="left:${left}%; width:${width}%"
        title="FCY L${interval.startLap}–L${interval.endLap}"
      >
        <span class="strategy-band-label">FCY</span>
      </div>
    `
  }).join('')

  const stintsHtml = (estrategia.stints || []).map((stint, i) => {
    const left = percentatgeLap(stint.startLap, totalVoltes)
    const width = ampladaInterval(stint.startLap, stint.endLap, totalVoltes)

    return `
      <div
        class="strategy-band strategy-band--stint"
        style="left:${left}%; width:${width}%"
        title="Stint ${i + 1}: L${stint.startLap}–L${stint.endLap}"
      >
        <span class="strategy-band-label">S${i + 1}</span>
      </div>
    `
  }).join('')

  const pitHtml = (estrategia.pitStops || []).map((stop, i) => {
    const left = percentatgeLap(stop.lap, totalVoltes)

    return `
      <div
        class="strategy-marker strategy-marker--pit"
        style="left:${left}%"
        title="Pit stop L${stop.lap}"
      >
        <span class="strategy-marker-label">P L${stop.lap}</span>
      </div>
    `
  }).join('')

  const driverChangeHtml = (estrategia.pitStops || [])
    .filter(stop => stop.driverBefore && stop.driverAfter && stop.driverBefore !== stop.driverAfter)
    .map((stop, i) => {
      const left = percentatgeLap(stop.lap, totalVoltes)

      return `
        <div
          class="strategy-marker strategy-marker--driver"
          style="left:${left}%"
          title="Canvi de pilot a L${stop.lap}: ${stop.driverBefore} → ${stop.driverAfter}"
        >
          <span class="strategy-marker-label">D</span>
        </div>
      `
    }).join('')

  return `
    <div class="strategy-timeline">
      <div class="strategy-scale">
        ${ticksHtml}
      </div>

      <div class="strategy-lane-wrap">
        <div class="strategy-lane-title">Neutralitzacions</div>
        <div class="strategy-lane strategy-lane--fcy">
          ${fcyHtml}
        </div>
      </div>

      <div class="strategy-lane-wrap">
        <div class="strategy-lane-title">Stints / pit</div>
        <div class="strategy-lane strategy-lane--stints">
          ${stintsHtml}
          ${pitHtml}
          ${driverChangeHtml}
        </div>
      </div>
    </div>
  `
}

function renderDetallEstrategia(cotxe, estrategia) {
  if (!estrategia) {
    return `
      <div class="strategy-detail-card">
        <div class="strategy-detail-header">
          <div>
            <div class="strategy-detail-title">Estratègia · #${cotxe.numero}</div>
            <div class="strategy-detail-subtitle">${cotxe.equip}</div>
          </div>
          <button id="strategy-tancar" class="btn-strategy-close">Tancar</button>
        </div>

        <div class="strategy-empty">Sense dades d’estratègia</div>
      </div>
    `
  }

  return `
    <div class="strategy-detail-card">
      <div class="strategy-detail-header">
        <div>
          <div class="strategy-detail-title">Estratègia · #${cotxe.numero}</div>
          <div class="strategy-detail-subtitle">${cotxe.equip}</div>
        </div>
        <button id="strategy-tancar" class="btn-strategy-close">Tancar</button>
      </div>

      <div class="strategy-kpis">
        <div class="strategy-kpi"><span>Stops</span><strong>${estrategia.totalParades}</strong></div>
        <div class="strategy-kpi"><span>Stints</span><strong>${estrategia.totalStints}</strong></div>
        <div class="strategy-kpi"><span>Avg stint</span><strong>${estrategia.avgStintLaps ?? '—'} voltes</strong></div>
        <div class="strategy-kpi"><span>Longest</span><strong>${estrategia.longestStint ?? '—'} voltes</strong></div>
        <div class="strategy-kpi"><span>Shortest</span><strong>${estrategia.shortestStint ?? '—'} voltes</strong></div>
        <div class="strategy-kpi"><span>Pit time</span><strong>${Number.isFinite(estrategia.totalPitTime) ? `${estrategia.totalPitTime}s` : '—'}</strong></div>
        <div class="strategy-kpi"><span>Green</span><strong>${estrategia.stopsUnderGreen}</strong></div>
        <div class="strategy-kpi"><span>FCY</span><strong>${estrategia.stopsUnderFCY}</strong></div>
        <div class="strategy-kpi strategy-kpi--wide"><span>Pit laps</span><strong>${formatarPitLaps(estrategia.pitStops)}</strong></div>
      </div>




      ${renderTimelineEstrategia(estrategia, totalVoltesCursa, neutralitzacionsCursa)}
            <div class="strategy-legend strategy-legend--mini">
        <div class="strategy-legend-item">
          <span class="strategy-legend-marker strategy-legend-marker--pit"></span>
          <span class="strategy-legend-text">Pit stop</span>
        </div>

        <div class="strategy-legend-item">
          <span class="strategy-legend-marker strategy-legend-marker--driver"></span>
          <span class="strategy-legend-text">Driver change</span>
        </div>
      </div>
    </div>
  `
}

function obtenirStrategyContainer() {
  let container = document.getElementById('strategy-container')

  if (!container) {
    container = document.createElement('div')
    container.id = 'strategy-container'
    container.className = 'strategy-container'
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  return container
}


function mostrarEstrategia(numeroCotxe, equip, cardElement) {
  const estrategia = mapaEstrategies[numeroCotxe]
  const cotxe = totesDades.find(c => c.numero === numeroCotxe) || {
    numero: numeroCotxe,
    equip
  }

  const container = obtenirStrategyContainer()

  // si ja hi havia una estratègia oberta, la tanquem abans
  if (estrategiaContainerActual && estrategiaContainerActual !== container) {
    estrategiaContainerActual.style.display = 'none'
  }

  cardElement.after(container)
  estrategiaContainerActual = container

  container.innerHTML = renderDetallEstrategia(cotxe, estrategia)
  container.style.display = 'block'

  const btnTancar = document.getElementById('strategy-tancar')
  if (btnTancar) {
    btnTancar.onclick = () => {
      container.style.display = 'none'
    }
  }
}



// =========================
// Pintat de cotxes
// =========================

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

    const pilots = Array.isArray(cotxe.pilots) ? cotxe.pilots : []

    const pilotsHTML = pilots.length > 0
      ? pilots.map(p =>
        `<span class="pilot-nom">${p.nom} ${p.cognom}${p.rating ? ` <span class="pilot-rating">${p.rating}</span>` : ''}</span>`
      ).join('')
      : '<span class="pilot-nom" style="opacity:0.4">Sense dades</span>'

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
          <div class="car-result-summary">
            ${renderResumPrincipalCotxe(cotxe)}
          </div>

          <div class="card-actions">
            <button class="btn-grafic">Gràfic</button>
            <button class="btn-estrategia">Estratègia</button>
          </div>
        </div>
      </div>
    `

    card.querySelector('.btn-grafic').addEventListener('click', () => {
      mostrarGrafic(cotxe.numero, cotxe.equip, card)
    })

    card.querySelector('.btn-estrategia').addEventListener('click', () => {
      mostrarEstrategia(cotxe.numero, cotxe.equip, card)
    })

    contenidor.appendChild(card)
  })
}

// =========================
// Gràfic
// =========================

function mostrarGrafic(numeroCotxe, equip, cardElement) {
  const voltes = totesLesVoltes
    .filter(lap => String(lap.NUMBER || '').trim() === numeroCotxe)
    .filter(lap => String(lap.LAPNUMBER || '').trim() !== '1')
    .map(lap => ({
      volta: parseInt(lap.LAPNUMBER, 10),
      temps: minutsASegons(lap.LAPTIME || '')
    }))
    .filter(v => Number.isFinite(v.volta) && v.temps > 60 && v.temps < 300)
    .sort((a, b) => a.volta - b.volta)

  const container = document.getElementById('grafic-container')
  if (!container) return

  cardElement.after(container)

  container.style.display = 'block'
  document.getElementById('grafic-titol').textContent = `#${numeroCotxe} ${equip}`

  if (graficActual) graficActual.destroy()

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

  document.getElementById('grafic-tancar').onclick = () => {
    container.style.display = 'none'
    if (graficActual) graficActual.destroy()
  }
}

// =========================
// Stats
// =========================

function calcularStatsGlobals(laps) {
  const cotxes = new Set()
  let millorTemps = Infinity
  let millorCotxe = null

  laps.forEach(lap => {
    const num = String(lap.NUMBER || '').trim()
    const temps = minutsASegons(lap.LAPTIME || '')

    if (num) cotxes.add(num)

    if (!isNaN(temps) && temps > 60 && temps < millorTemps) {
      millorTemps = temps
      millorCotxe = {
        numero: num,
        equip: String(lap.TEAM || '').trim()
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
  if (!el) return

  el.innerHTML = `
    <h3>Race statistics</h3>
    <ul>
      <li><strong>Cotxes:</strong> ${stats.totalCotxes}</li>
      <li><strong>Voltes totals:</strong> ${stats.totalVoltes}</li>
      <li><strong>Millor volta:</strong> ${formatarTemps(stats.millorVolta)}</li>
      <li><strong>Cotxe:</strong> ${stats.millorCotxe ? `#${stats.millorCotxe.numero} ${stats.millorCotxe.equip}` : 'No disponible'}</li>
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

function pintarStatsClasses(stats) {
  const el = document.getElementById('class-stats')
  if (!el) return

  el.innerHTML = `
    <h3>Cotxes per cada categoria</h3>
    <ul>
      ${Object.entries(stats)
      .map(([classe, n]) => `<li><strong>${classe}:</strong> ${n}</li>`)
      .join('')}
    </ul>
  `
}

// =========================
// Filtres
// =========================

function actualitzarFiltres(statsClasses) {
  const botons = document.querySelectorAll('.filtre')

  botons.forEach(boto => {
    const classe = boto.dataset.classe

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

function configurarFiltres() {
  const botons = document.querySelectorAll('.filtre')

  botons.forEach(boto => {
    boto.addEventListener('click', () => {
      botons.forEach(b => b.classList.remove('actiu'))
      boto.classList.add('actiu')

      const classe = boto.dataset.classe

      if (classe === 'tots') {
        pintarCotxes(totesDades)
      } else {
        const filtrades = totesDades.filter(cotxe => cotxe.classe === classe)
        pintarCotxes(filtrades)
      }
    })
  })
}

// =========================
// Init
// =========================

async function init() {
  try {

    if (!any || !carpeta || !fitxer) {
      throw new Error('Falten paràmetres de cursa: any, carpeta o fitxer')
    }


    const titol = document.getElementById('cursa-titol')
    if (titol) titol.textContent = nom || 'Cursa'

    pintarInfoCircuit()

    const [laps, resultats, weather] = await Promise.all([
      carregarDades(),
      carregarResultats(),
      carregarWeather()
    ])

    totesLesVoltes = laps
    totalVoltesCursa = obtenirTotalVoltesCursa(laps)

    const estrategies = extreureEstrategiesDeLaCursa(laps)
    mapaEstrategies = indexarEstrategiesPerCotxe(estrategies)

    neutralitzacionsCursa = extreureNeutralitzacionsPerVolta(laps)

    console.log('ESTRATÈGIES:', estrategies)
    if (estrategies.length > 0) {
      console.log('PRIMERA ESTRATÈGIA:', estrategies[0])
    }

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
    const status = document.getElementById('status')
    if (status) {
      status.textContent = 'Error carregant les dades: ' + error.message
    }
    console.error(error)
  }
}

init()
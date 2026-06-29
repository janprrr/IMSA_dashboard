console.log('INDEX.JS CARREGAT - AUTO GITHUB TEST')

const params = new URLSearchParams(window.location.search)
const anyActiu = parseInt(params.get('any'), 10)

const TEMPORADES = [
  {
    any: 2026,
    curses: [
      {
        nom: 'Rolex 24 at Daytona',
        circuit: 'Daytona International Speedway',
        data: '24–26 gener 2026',
        durada: '24h',
        carpeta: '03-daytona-international-speedway',
        fitxer: '202601241340-race-laps.csv',
        fitxerResultats: '202601241340-race-results.csv',
        fitxerWeather: null,
        logo: './img/logo/Rolex_24_at_Daytona.png',
        layout: './img/layouts/daytona.png',
        info: {
          ubicacio: 'Daytona Beach, Florida (EUA)',
          longitud: '5.73 km',
          tipus: 'Oval + infield road course',
          superficie: 'Asfalt',
          nota: 'Circuit d\'alta velocitat que combina trams d\'oval amb seccions tècniques interiors.'
        }
      },
      {
        nom: '12 Hours of Sebring',
        circuit: 'Sebring International Raceway',
        data: '21 març 2026',
        durada: '12h',
        carpeta: '06-sebring-international-raceway',
        fitxer: '202603211010-race-hour-12-laps.csv',
        fitxerResultats: '202603211010-race-hour-12-results.csv',
        fitxerWeather: null,

        logo: './img/logo/sebring.png',
        layout: './img/layouts/sebring.png',
        info: {
          ubicacio: 'Sebring, Florida (EUA)',
          longitud: '6.02 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt + formigó',
          nota: 'Un dels circuits més antics i exigents dels EUA.'
        }
      },
      {
        nom: 'Acura Grand Prix of Long Beach',
        circuit: 'Long Beach Street Circuit',
        data: '17–19 abril 2026',
        durada: '1h40',
        carpeta: '07-long-beach-street-circuit',
        fitxer: '202604181305-race-laps.csv',
        fitxerResultats: '202604181305-race-results.csv',
        fitxerWeather: '202604181305-race-weather.csv',
        logo: './img/logo/long-beach.png',
        layout: './img/layouts/long-beach.png',
        info: {
          ubicacio: 'Long Beach, Califòrnia (EUA)',
          longitud: '3.17 km',
          tipus: 'Street circuit',
          superficie: 'Asfalt',
          nota: 'Circuit urbà al voltant de les illes de Long Beach.'
        }
      },
      {
        nom: 'Monterey SportsCar Championship',
        circuit: 'WeatherTech Raceway Laguna Seca',
        data: '01-03 Maig 2026',
        durada: '2h40',
        carpeta: '09-weathertech-raceway-laguna-seca',
        fitxer: '202605031310-race-laps.csv',
        fitxerResultats: '202605031310-race-results.csv',
        fitxerWeather: '202605031310-race-weather.csv',
        logo: './img/logo/laguna-seca.png',
        layout: './img/layouts/laguna-seca.png',
        info: {
          ubicacio: 'Salinas, Califòrnia (EUA)',
          longitud: '3.60 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Famous for the Corkscrew, one of motorsport\'s most iconic corners.'
        }
      },
      {
        nom: 'Detroit Grand Prix',
        circuit: 'Detroit Street Course',
        data: '29-30 Maig 2026',
        durada: '1h40',
        carpeta: '11-detroit-street-course',
        fitxer: '202605301610-race-laps.csv',
        fitxerResultats: '202605301610-race-results.csv',
        fitxerWeather: '202605301610-race-weather.csv',
        logo: './img/logo/detroit_logo.jpg',
        layout: './img/layouts/detroit.png',
        info: {
          ubicacio: 'Detroit, Michigan (EUA)',
          longitud: '3.51 km',
          tipus: 'Street circuit',
          superficie: 'Asfalt',
          nota: 'Circuit urbà al cor de la capital mundial de l\'automòbil.'
        }
      },
      {
        nom: 'Sahlen\'s Six Hours of The Glen',
        circuit: 'Watkins Glen International',
        data: '27-29 Juny 2026',
        durada: '6h',
        carpeta: '14-watkins-glen-international',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/watkins-glen.png',
        layout: './img/layouts/watkins-glen.png',
        info: {
          ubicacio: 'Watkins Glen, Nova York (EUA)',
          longitud: '5.54 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Un dels circuits més emblemàtics dels EUA, amb una llarga tradició en curses d\'endurance.'
        }
      },
      {
        nom: 'Canadian Tire Motorsport Park',
        circuit: 'Canadian Tire Motorsport Park',
        data: 'Juliol 2026',
        durada: '2h40',
        carpeta: '15-canadian-tire-motorsport-park',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/ctmp.png',
        layout: './img/layouts/ctmp.png',
        info: {
          ubicacio: 'Bowmanville, Ontario (Canadà)',
          longitud: '3.96 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'L\'única cursa de l\'IMSA en territori canadenc.'
        }
      },
      {
        nom: 'Road America Endurance GP',
        circuit: 'Road America',
        data: 'Agost 2026',
        durada: '6h',
        carpeta: '16-road-america',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/road-america.png',
        layout: './img/layouts/road-america.png',
        info: {
          ubicacio: 'Elkhart Lake, Wisconsin (EUA)',
          longitud: '6.52 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Un dels circuits més llargs dels EUA, conegut per les seves rectes ràpides.'
        }
      },
      {
        nom: 'Virginia Is For Racing Lovers Grand Prix',
        circuit: 'Virginia International Raceway',
        data: 'Agost 2026',
        durada: '2h40',
        carpeta: '17-virginia-international-raceway',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/vir.png',
        layout: './img/layouts/vir.png',
        info: {
          ubicacio: 'Alton, Virginia (EUA)',
          longitud: '5.26 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Circuit tècnic amb molts canvis d\'elevació.'
        }
      },
      {
        nom: 'TireRack.com Battle on the Bricks',
        circuit: 'Indianapolis Motor Speedway',
        data: 'Setembre 2026',
        durada: '2h40',
        carpeta: '20-indianapolis-motor-speedway-rc',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/indy.png',
        layout: './img/layouts/indy.png',
        info: {
          ubicacio: 'Indianapolis, Indiana (EUA)',
          longitud: '4.19 km',
          tipus: 'Oval + infield road course',
          superficie: 'Asfalt',
          nota: 'El temple de la velocitat, combinant el famós oval d\'Indy amb el traçat interior.'
        }
      },
      {
        nom: 'Petit Le Mans',
        circuit: 'Michelin Raceway Road Atlanta',
        data: 'Octubre 2026',
        durada: '10h',
        carpeta: '22-road-atlanta',
        fitxer: null,
        fitxerResultats: null,
        fitxerWeather: null,

        logo: './img/logo/road-atlanta.png',
        layout: './img/layouts/road-atlanta.png',
        info: {
          ubicacio: 'Braselton, Geòrgia (EUA)',
          longitud: '4.09 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'El final de temporada de l\'IMSA, una de les curses d\'endurance més importants d\'Amèrica.'
        }
      }
    ]
  },
  {
    any: 2025,
    curses: [
      {
        nom: 'Rolex 24 at Daytona',
        circuit: 'Daytona International Speedway',
        data: '22–26 gener 2025',
        durada: '24h',
        carpeta: '02-daytona-international-speedway',
        fitxer: '202501251340-race-laps.csv',
        fitxerResultats: '202501251340-race-results.csv',
        fitxerWeather: null,

        logo: './img/logo/Rolex_24_at_Daytona.png',
        layout: './img/layouts/daytona.png',
        info: {
          ubicacio: 'Daytona Beach, Florida (EUA)',
          longitud: '5.73 km',
          tipus: 'Oval + infield road course',
          superficie: 'Asfalt',
          nota: 'Circuit d\'alta velocitat que combina trams d\'oval amb seccions tècniques interiors.'
        }
      },
      {
        nom: 'Mobil 1 Twelve Hours of Sebring',
        circuit: 'Sebring International Raceway',
        data: '12–15 març 2025',
        durada: '12h',
        carpeta: '06-sebring-international-raceway',
        fitxer: '202503151010-race-laps.csv',
        fitxerResultats: '202503151010-race-results.csv',
        fitxerWeather: null,

        logo: './img/logo/sebring.png',
        layout: './img/layouts/sebring.png',
        info: {
          ubicacio: 'Sebring, Florida (EUA)',
          longitud: '6.02 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt + formigó',
          nota: 'Un dels circuits més antics i exigents dels EUA.'
        }
      },
      {
        nom: 'Acura Grand Prix of Long Beach',
        circuit: 'Long Beach Street Circuit',
        data: '11–12 abril 2025',
        durada: '1h40',
        carpeta: '07-long-beach-street-circuit',
        fitxer: '202504121405-race-laps.csv',
        fitxerResultats: '202504121405-race-results.csv',
        fitxerWeather: '202504121405-race-weather.csv',

        logo: './img/logo/long-beach.png',
        layout: './img/layouts/long-beach.png',
        info: {
          ubicacio: 'Long Beach, Califòrnia (EUA)',
          longitud: '3.17 km',
          tipus: 'Street circuit',
          superficie: 'Asfalt',
          nota: 'Circuit urbà al voltant de les illes de Long Beach.'
        }
      },
      {
        nom: 'TireRack.com Monterey SportsCar Championship',
        circuit: 'WeatherTech Raceway Laguna Seca',
        data: '9–11 maig 2025',
        durada: '2h40',
        carpeta: '10-weathertech-raceway-laguna-seca',
        fitxer: '202505111210-race-laps.csv',
        fitxerResultats: '202505111210-race-results.csv',
        fitxerWeather: '202505111210-race-weather.csv',

        logo: './img/logo/laguna-seca.png',
        layout: './img/layouts/laguna-seca.png',
        info: {
          ubicacio: 'Salinas, Califòrnia (EUA)',
          longitud: '3.60 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Famous for the Corkscrew, one of motorsport\'s most iconic corners.'
        }
      },
      {
        nom: 'Detroit Grand Prix',
        circuit: 'Detroit Street Course',
        data: '30–31 maig 2025',
        durada: '1h40',
        carpeta: '11-detroit-street-course',
        fitxer: '202505311640-race-laps.csv',
        fitxerResultats: '202505311640-race-results.csv',
        fitxerWeather: '202505311640-race-weather.csv',

        logo: './img/logo/detroit_logo.png',
        layout: './img/layouts/detroit.png',
        info: {
          ubicacio: 'Detroit, Michigan (EUA)',
          longitud: '3.51 km',
          tipus: 'Street circuit',
          superficie: 'Asfalt',
          nota: 'Circuit urbà al cor de la capital mundial de l\'automòbil.'
        }
      },
      {
        nom: 'Sahlen\'s Six Hours of The Glen',
        circuit: 'Watkins Glen International',
        data: '19–22 juny 2025',
        durada: '6h',
        carpeta: '14-watkins-glen-international',
        fitxer: '202506221210-race-laps.csv',
        fitxerResultats: '202506221210-race-results.csv',
        fitxerWeather: null,

        logo: './img/logo/watkins-glen.png',
        layout: './img/layouts/watkins-glen.png',
        info: {
          ubicacio: 'Watkins Glen, Nova York (EUA)',
          longitud: '5.54 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Un dels circuits més emblemàtics dels EUA, amb una llarga tradició en curses d\'endurance.'
        }
      },
      {
        nom: 'Chevrolet Grand Prix',
        circuit: 'Canadian Tire Motorsport Park',
        data: '11–13 juliol 2025',
        durada: '2h40',
        carpeta: '15-canadian-tire-motorsport-park',
        fitxer: '202507131405-race-laps.csv',
        fitxerResultats: '202507131405-race-results.csv',
        fitxerWeather: '202507131405-race-weather.csv',

        logo: './img/logo/ctmp.png',
        layout: './img/layouts/ctmp.png',
        info: {
          ubicacio: 'Bowmanville, Ontario (Canadà)',
          longitud: '3.96 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'L\'única cursa de l\'IMSA en territori canadenc.'
        }
      },
      {
        nom: 'Motul SportsCar Grand Prix',
        circuit: 'Road America',
        data: '31 juliol–3 agost 2025',
        durada: '2h40',
        carpeta: '16-road-america',
        fitxer: '202508031310-race-laps.csv',
        fitxerResultats: '202508031310-race-results.csv',
        fitxerWeather: '202508031310-race-weather.csv',

        logo: './img/logo/road-america.png',
        layout: './img/layouts/road-america.png',
        info: {
          ubicacio: 'Elkhart Lake, Wisconsin (EUA)',
          longitud: '6.52 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Un dels circuits més llargs dels EUA, conegut per les seves rectes ràpides.'
        }
      },
      {
        nom: 'Michelin GT Challenge At VIR',
        circuit: 'Virginia International Raceway',
        data: '22–24 agost 2025',
        durada: '2h40',
        carpeta: '17-virginia-international-raceway',
        fitxer: '202508241410-race-laps.csv',
        fitxerResultats: '202508241410-race-results.csv',
        fitxerWeather: '202508241410-race-weather.csv',

        logo: './img/logo/vir.png',
        layout: './img/layouts/vir.png',
        info: {
          ubicacio: 'Alton, Virginia (EUA)',
          longitud: '5.26 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Circuit tècnic amb molts canvis d\'elevació.'
        }
      },
      {
        nom: 'TireRack.com Battle on the Bricks',
        circuit: 'Indianapolis Motor Speedway',
        data: '18–21 setembre 2025',
        durada: '6h',
        carpeta: '20-indianapolis-motor-speedway-rc',
        fitxer: '202509211140-race-laps.csv',
        fitxerResultats: '202509211140-race-results.csv',
        fitxerWeather: null,

        logo: './img/logo/indy.png',
        layout: './img/layouts/indy.png',
        info: {
          ubicacio: 'Indianapolis, Indiana (EUA)',
          longitud: '4.19 km',
          tipus: 'Oval + infield road course',
          superficie: 'Asfalt',
          nota: 'El temple de la velocitat, combinant el famós oval d\'Indy amb el traçat interior.'
        }
      },
      {
        nom: 'MOTUL Petit Le Mans',
        circuit: 'Michelin Raceway Road Atlanta',
        data: '8–11 octubre 2025',
        durada: '10h',
        carpeta: '22-road-atlanta',
        fitxer: '202510111210-race-laps.csv',
        fitxerResultats: '202510111210-race-results.csv',
        fitxerWeather: null,

        logo: './img/logo/road-atlanta.png',
        layout: './img/layouts/road-atlanta.png',
        info: {
          ubicacio: 'Braselton, Geòrgia (EUA)',
          longitud: '4.09 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'El final de temporada de l\'IMSA, una de les curses d\'endurance més importants d\'Amèrica.'
        }
      },
    ]
  }
]

function activarAnimacions() {
  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index
          setTimeout(() => {
            entry.target.classList.add('visible')
          }, index * 80)
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    })

    document.querySelectorAll('.cursa-card').forEach((card, i) => {
      card.dataset.index = i
      observer.observe(card)
    })
  }, 100)
}

const GITHUB_OWNER = 'tobi'
const GITHUB_REPO = 'imsa_data'
const GITHUB_BRANCH = 'main'
const GITHUB_BASE_PATH = 'data/imsa'

const githubCache = new Map()
const GITHUB_CACHE_TTL_MS = 30 * 60 * 1000 // 30 minuts

async function githubContents(path) {
  const cacheKey = `github:${path}`
  const cachedRaw = localStorage.getItem(cacheKey)

  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw)
      const encaraValid = Date.now() - cached.timestamp < GITHUB_CACHE_TTL_MS

      if (encaraValid) {
        console.log('GitHub localStorage cache hit:', path)
        return cached.data
      }
    } catch (error) {
      localStorage.removeItem(cacheKey)
    }
  }

  const url =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}` +
    `/contents/${path}?ref=${GITHUB_BRANCH}`

  console.log('GitHub API request:', url)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('GitHub API error body:', text)
    throw new Error(`GitHub API error ${response.status}: ${url}`)
  }

  const data = await response.json()

  localStorage.setItem(cacheKey, JSON.stringify({
    timestamp: Date.now(),
    data
  }))

  return data
}

function treurePrefixNumericCarpeta(carpeta) {
  return String(carpeta || '').replace(/^\d+-/, '')
}

async function trobarCarpetaReal(any, carpetaConfigurada) {
  const yearPath = `${GITHUB_BASE_PATH}/${any}`
  const carpetes = await githubContents(yearPath)

  const slugBuscat = treurePrefixNumericCarpeta(carpetaConfigurada)

  const carpetaExacta = carpetes.find(item =>
    item.type === 'dir' && item.name === carpetaConfigurada
  )

  if (carpetaExacta) {
    return carpetaExacta.name
  }

  const carpetaPerSlug = carpetes.find(item =>
    item.type === 'dir' &&
    treurePrefixNumericCarpeta(item.name) === slugBuscat
  )

  return carpetaPerSlug ? carpetaPerSlug.name : carpetaConfigurada
}

function seleccionarFitxersCursa(files) {
  const csvs = files
    .filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.csv'))
    .map(file => file.name)
    .sort()
    .reverse()

  const fitxer = csvs.find(name =>
    /race.*laps\.csv$/i.test(name)
  ) || null

  const fitxerResultats = csvs.find(name =>
    /race.*results\.csv$/i.test(name)
  ) || null

  const fitxerWeather = csvs.find(name =>
    /race.*weather\.csv$/i.test(name)
  ) || null

  return {
    fitxer,
    fitxerResultats,
    fitxerWeather
  }
}

async function completarCursaAmbFitxers(any, cursa) {
  try {
    const carpetaReal = await trobarCarpetaReal(any, cursa.carpeta)
    const folderPath = `${GITHUB_BASE_PATH}/${any}/${carpetaReal}`

    const files = await githubContents(folderPath)
    const fitxers = seleccionarFitxersCursa(files)

    return {
      ...cursa,
      carpeta: carpetaReal,
      fitxer: cursa.fitxer || fitxers.fitxer,
      fitxerResultats: cursa.fitxerResultats || fitxers.fitxerResultats,
      fitxerWeather: cursa.fitxerWeather || fitxers.fitxerWeather
    }
  } catch (error) {
    console.warn(
      `No s'han pogut detectar fitxers per ${any} - ${cursa.nom}`,
      error.message
    )

    return cursa
  }
}

async function completarTemporadesAmbFitxers() {
  for (const temporada of TEMPORADES) {
    temporada.curses = await Promise.all(
      temporada.curses.map(cursa => {
        const jaTeFitxers =
          cursa.fitxer &&
          cursa.fitxerResultats !== undefined

        if (jaTeFitxers) {
          return cursa
        }

        return completarCursaAmbFitxers(temporada.any, cursa)
      })
    )
  }
}

function pintarCurses() {
  const contenidor = document.getElementById('cursa-list')
  const botonesContenidor = document.getElementById('temporada-botons')
  let temporadaActiva =
    TEMPORADES.some(t => t.any === anyActiu)
      ? anyActiu
      : TEMPORADES[0].any

  // botons de temporada
  TEMPORADES.forEach((temporada, i) => {
    const btn = document.createElement('button')
    btn.className = 'btn-temporada' + (temporada.any === temporadaActiva ? ' actiu' : '')
    btn.textContent = temporada.any
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-temporada').forEach(b => b.classList.remove('actiu'))
      btn.classList.add('actiu')

      document.querySelectorAll('.temporada-bloc').forEach(b => b.classList.remove('visible'))
      document.getElementById(`temporada-${temporada.any}`).classList.add('visible')

      //actualitzem la URL sense recarregar
      const params = new URLSearchParams(window.location.search)
      params.set('any', temporada.any)
      history.replaceState(null, '', `?${params.toString()}`)
    })
    botonesContenidor.appendChild(btn)
  })

  // blocs per temporada
  TEMPORADES.forEach((temporada, i) => {
    const bloc = document.createElement('div')
    bloc.className = 'temporada-bloc' + (temporada.any === temporadaActiva ? ' visible' : '')
    bloc.id = `temporada-${temporada.any}`

    const grid = document.createElement('div')
    grid.className = 'curses-grid'

    temporada.curses.forEach(cursa => {
      const card = document.createElement('div')
      card.className = 'cursa-card' + (!cursa.fitxer ? ' pendent' : '')

      card.innerHTML = `
        <div class="cursa-card-top">
          <span class="cursa-nom">${cursa.nom}</span>
          <span class="cursa-durada">${cursa.durada}</span>
        </div>
        <div class="cursa-card-bottom">
          <div>
            <div class="cursa-circuit">${cursa.circuit}</div>
            <div class="cursa-data">${cursa.data}</div>
          </div>
          ${cursa.fitxer ? '<span class="cursa-arrow">→</span>' : '<span class="cursa-pendent">Aviat</span>'}
        </div>
      `

      if (cursa.fitxer) {
        card.addEventListener('click', () => {
          const params = new URLSearchParams({
            any: temporada.any,
            carpeta: cursa.carpeta,
            fitxer: cursa.fitxer || '',
            fitxerResultats: cursa.fitxerResultats || '',
            fitxerWeather: cursa.fitxerWeather || '',
            nom: cursa.nom,
            circuit: cursa.circuit,
            data: cursa.data,
            durada: cursa.durada,
            logo: cursa.logo,
            layout: cursa.layout,
            ubicacio: cursa.info.ubicacio,
            longitud: cursa.info.longitud,
            tipus: cursa.info.tipus,
            superficie: cursa.info.superficie,
            nota: cursa.info.nota
          })
          window.location.href = `dashboard.html?${params.toString()}`
        })
      }

      grid.appendChild(card)
    })

    bloc.appendChild(grid)
    contenidor.appendChild(bloc)
  })
  setTimeout(() => activarAnimacions(), 50)
}
function activarParallax() {
  const heroBg = document.getElementById('hero-bg')
  if (!heroBg) return

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY
    // la imatge es mou a la meitat de velocitat del scroll
    heroBg.style.transform = `translateY(${scroll * 0.4}px)`
  }, { passive: true })
}


activarParallax()

async function initIndex() {
  console.log('1. initIndex executat')

  try {
    console.log('2. Abans de completar temporada activa')

    await completarTemporadaActivaAmbFitxers()

    console.log('3. Despres de completar temporada activa')
    console.log('TEMPORADES:', TEMPORADES)

    pintarCurses()

    console.log('4. pintarCurses executat')
  } catch (error) {
    console.error('ERROR A initIndex:', error)

    // Pintem igualment les curses manuals encara que GitHub falli
    pintarCurses()
  }
}

initIndex()
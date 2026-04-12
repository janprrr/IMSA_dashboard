

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
        logo: './img/logo/Rolex_24_at_Daytona.png',
        layout: './img/layouts/daytona.webp',
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
        durada: '2h',
        carpeta: '07-long-beach-street-circuit',
        fitxer: null,   //← pendent confirmar
        logo: './img/logo/long-beach.png',
        layout: './img/layouts/long-beach.webp',
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
        data: 'Maig 2026',
        durada: '2h40',
        carpeta: '10-weathertech-raceway-laguna-seca',
        fitxer: null,
        logo: './img/logo/laguna-seca.png',
        layout: './img/layouts/laguna-seca.webp',
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
        data: 'Maig 2026',
        durada: '2h',
        carpeta: '11-detroit-street-course',
        fitxer: null,
        logo: './img/logo/detroit.png',
        layout: './img/layouts/detroit.webp',
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
        data: 'Juny 2026',
        durada: '6h',
        carpeta: '14-watkins-glen-international',
        fitxer: null,
        logo: './img/logo/watkins-glen.png',
        layout: './img/layouts/watkins-glen.webp',
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
        durada: '2h',
        carpeta: '15-canadian-tire-motorsport-park',
        fitxer: null,
        logo: './img/logo/ctmp.png',
        layout: './img/layouts/ctmp.webp',
        info: {
          ubicacio: 'Bowmanville, Ontario (Canadà)',
          longitud: '3.96 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'L\'única cursa de l\'IMSA en territori canadenc.'
        }
      },
      {
        nom: 'Road America',
        circuit: 'Road America',
        data: 'Agost 2026',
        durada: '2h',
        carpeta: '16-road-america',
        fitxer: null,
        logo: './img/logo/road-america.png',
        layout: './img/layouts/road-america.webp',
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
        logo: './img/logo/vir.png',
        layout: './img/layouts/vir.webp',
        info: {
          ubicacio: 'Alton, Virginia (EUA)',
          longitud: '5.26 km',
          tipus: 'Permanent road course',
          superficie: 'Asfalt',
          nota: 'Circuit tècnic amb molts canvis d\'elevació.'
        }
      },
      {
        nom: 'Indy 8 Hours',
        circuit: 'Indianapolis Motor Speedway',
        data: 'Setembre 2026',
        durada: '8h',
        carpeta: '20-indianapolis-motor-speedway-rc',
        fitxer: null,
        logo: './img/logo/indy.png',
        layout: './img/layouts/indy.webp',
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
        logo: './img/logo/petit-le-mans.png',
        layout: './img/layouts/road-atlanta.webp',
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
        data: '24–26 gener 2025',
        durada: '24h',
        carpeta: '02-daytona-international-speedway',
        fitxer: '202501251340-race-laps.csv',
        fitxerResultats: '202501251340-race-results.csv',
        logo: './img/logo/Rolex_24_at_Daytona.png',
        layout: './img/layouts/daytona.webp',
        info: {
          ubicacio: 'Daytona Beach, Florida (EUA)',
          longitud: '5.73 km',
          tipus: 'Oval + infield road course',
          superficie: 'Asfalt',
          nota: 'Circuit d\'alta velocitat que combina trams d\'oval amb seccions tècniques interiors.'
        }
      },      
    ]  // ← omplirem després
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

function pintarCurses() {
  const contenidor = document.getElementById('cursa-list')
  const botonesContenidor = document.getElementById('temporada-botons')
  let temporadaActiva = TEMPORADES[0].any

  // botons de temporada
  TEMPORADES.forEach((temporada, i) => {
    const btn = document.createElement('button')
    btn.className = 'btn-temporada' + (i === 0 ? ' actiu' : '')
    btn.textContent = temporada.any
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-temporada').forEach(b => b.classList.remove('actiu'))
      btn.classList.add('actiu')
      document.querySelectorAll('.temporada-bloc').forEach(b => b.classList.remove('visible'))
      document.getElementById(`temporada-${temporada.any}`).classList.add('visible')
    })
    botonesContenidor.appendChild(btn)
  })

  // blocs per temporada
  TEMPORADES.forEach((temporada, i) => {
    const bloc = document.createElement('div')
    bloc.className = 'temporada-bloc' + (i === 0 ? ' visible' : '')
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
            carpeta: cursa.carpeta,
            fitxer: cursa.fitxer,
            fitxerResultats: cursa.fitxerResultats || '',
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


pintarCurses()
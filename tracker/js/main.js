const CSV_URL = 'https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/2026/03-daytona-international-speedway/202601241340-race-laps.csv'
async function carregarDades() {
    return new Promise((resolve, reject) => {
        Papa.parse(CSV_URL, {
            download: true,
            header: true,
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
            <span class="car-number">#${cotxe.numero}</span>
            <div class="car-info">
                <div class="car-team">${cotxe.equip}</div>
                <div class="car-class">
                    <span class="badge ${cotxe.classe}">${cotxe.classe}</span>
                </div>
            </div>
            <div style="text-align: right">
                <div class="car-laptime">${formatarTemps(cotxe.millorTemps)}</div>
                <div style="font-size: 0.75rem; color: #666">pb: volta ${cotxe.millorVolta}</div>
            </div>
        `

        contenidor.appendChild(card)

        card.style.cursor = 'pointer'
        card.addEventListener('click', () => {
            mostrarGrafic(cotxe.numero, cotxe.equip, card)
        })
    })
}

async function init() {
    try {
        const laps = await carregarDades() //funcioa async per a que esperi les dades del repo
        totesLesVoltes = laps

        const cotxes = millorTempsPerCotxe(laps)
        totesDades = cotxes

        // ✅ stats globals (directe del CSV)
        const stats = calcularStatsGlobals(laps)
        pintarStatsGlobals(stats)

        // ✅ stats per classe (a partir de cotxes)
        const statsClasses = statsPerClasse(cotxes)
        pintarStatsClasses(statsClasses)

        pintarCotxes(cotxes)
        configurarFiltres()

    } catch (error) {
        document.getElementById('status').textContent =
            'Error carregant les dades: ' + error.message
        console.error(error)
    }
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


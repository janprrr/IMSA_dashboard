# IMSA Strategy Dashboard

Dashboard web per visualitzar i analitzar dades de voltes d'una cursa IMSA a partir d'un fitxer CSV.

## Descripció

Aquest projecte mostra informació de la cursa **Rolex 24 at Daytona 2026** a partir de dades carregades des d'un CSV extern.  
Permet:

- Veure tots els cotxes participants
- Filtrar per categoria (`GTP`, `LMP2`, `GTD Pro`, `GTD`)
- Consultar la millor volta de cada cotxe
- Obrir un gràfic amb l'evolució dels temps de volta d'un cotxe
- Veure estadístiques generals de la cursa
- Veure el repartiment de cotxes per categoria

## Tecnologies utilitzades

- HTML5
- CSS3
- JavaScript
- [Papa Parse](https://www.papaparse.com/) per llegir el CSV
- [Chart.js](https://www.chartjs.org/) per mostrar els gràfics

## Data source
shoutout to the goat that's providing the data for whatever this app so it can work
https://raw.githubusercontent.com/tobi/imsa_data/refs/heads/main/data/imsa/2026/03-daytona-international-speedway/202601241340-race-laps.csv

## Estructura del projecte

```txt
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── img/
    └── layouts/


document.addEventListener('DOMContentLoaded', function() {
    var mymap = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(mymap);

    // Quemado en código xd
    var cities = [
        { nombre: "Roma", latitud: 41.9028, longitud: 12.4964, demora: 40},
        { nombre: "Pekín", latitud: 39.9042, longitud: 116.4074, demora: 10},
        { nombre: "Londres", latitud: 51.5074, longitud: -0.1278, demora: 30},
        { nombre: "Medellín", latitud: 6.2442, longitud: -75.5812, demora: 90},
        { nombre: "Dublín", latitud: 53.349805, longitud: -6.26031, demora: 40},
        { nombre: "Barcelona", latitud: 41.3851, longitud: 2.1734, demora: 130},
        { nombre: "Nueva York", latitud: 40.7128, longitud: -74.0060, demora: 20},
        { nombre: "Bogotá", latitud: 4.6097, longitud: -74.0817, demora: 60},
        { nombre: "Sídney", latitud: -33.8688, longitud: 151.2093, demora: 10 },
        { nombre: "Tokio", latitud: 35.6762, longitud: 139.6503, demora: 20 },
    ];

    function calcularDistancia(ciudadA, ciudadB) {
        var R = 6371; // Radio de la Tierra en kilómetros
        var lat1 = ciudadA.latitud * Math.PI / 180;
        var lat2 = ciudadB.latitud * Math.PI / 180;
        var lon1 = ciudadA.longitud * Math.PI / 180;
        var lon2 = ciudadB.longitud * Math.PI / 180;

        var dLat = lat2 - lat1;
        var dLon = lon2 - lon1;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    function dijkstra(graph, start) {
        var distances = {};
        var visited = {};
        var queue = new PriorityQueue();

        for (var vertex in graph) {
            distances[vertex] = Infinity;
            visited[vertex] = false;
        }

        distances[start] = 0;
        queue.enqueue(start, 0);

        while (!queue.isEmpty()) {
            var currentVertex = queue.dequeue().data;
            visited[currentVertex] = true;

            for (var neighbor in graph[currentVertex]) {
                var tentativeDistance = distances[currentVertex] + graph[currentVertex][neighbor];

                if (tentativeDistance < distances[neighbor]) {
                    distances[neighbor] = tentativeDistance;
                    queue.enqueue(neighbor, tentativeDistance);
                }
            }
        }

        return distances;
    }

    function calcularDistancias(cities) {
        var graph = {};

        // Construir el grafo
        for (var i = 0; i < cities.length; i++) {
            graph[cities[i].nombre] = {};
            for (var j = 0; j < cities.length; j++) {
                if (i !== j) {
                    var d = calcularDistancia(cities[i], cities[j]);
                    graph[cities[i].nombre][cities[j].nombre] = d + cities[j].demora;
                }
            }
        }

        var distances = dijkstra(graph, cities[0].nombre);

        var sortedCities = Object.keys(distances).sort(function(a, b) {
            return distances[a] - distances[b];
        });

        var cityOrder = sortedCities.map(function(nombreCiudad) {
            return cities.find(function(ciudad) {
                return ciudad.nombre === nombreCiudad;
            });
        });

        return {
            ruta: sortedCities,
            distancia: distances[sortedCities[sortedCities.length - 1]],
            cityOrder: cityOrder // Nuevo arreglo con el orden de las ciudades
        };
    }

    function PriorityQueue() {
        this.queue = [];

        this.enqueue = function(data, priority) {
            this.queue.push({ data: data, priority: priority });
            this.sort();
        }

        this.dequeue = function() {
            return this.queue.shift();
        }

        this.isEmpty = function() {
            return this.queue.length === 0;
        }

        this.sort = function() {
            this.queue.sort(function(a, b) {
                return a.priority - b.priority;
            });
        }
    }

    function displayCitiesOnMap(cities) {
        for (var i = 0; i < cities.length; i++) {
            var ciudad = cities[i];
            L.marker([ciudad.latitud, ciudad.longitud]).addTo(mymap)
                .bindPopup(ciudad.nombre)
                .openPopup();
        }

        var polylinePoints = [];

        for (var i = 0; i < cities.length; i++) {
            var ciudad = cities[i];
            polylinePoints.push([ciudad.latitud, ciudad.longitud]);
        }

        L.polyline(polylinePoints, {color: 'blue'}).addTo(mymap);
    }

    function updateCitiesList(cities) {
        var citiesList = document.getElementById('cities-list');
        citiesList.innerHTML = "";

        for (var i = 0; i < cities.length; i++) {
            var ciudad = cities[i];
            var listItem = document.createElement('li');
            listItem.textContent = ciudad.nombre; // Mostrar el nombre de la ciudad
            citiesList.appendChild(listItem);
        }
    }

    function updateTotalDistance(distance) {
        var totalDistance = document.getElementById('total-distance');
        totalDistance.textContent = "Distancia total de la ruta: " + distance.toFixed(2) + " km";
    }

    // Procesar la información
    var resultado = calcularDistancias(cities);

    // Mostrar en el mapa y en el DOM
    updateCitiesList(resultado.cityOrder); // Mostrar en el DOM en el orden de la ruta
    displayCitiesOnMap(resultado.cityOrder); // Mostrar en el mapa en el orden de la ruta
    updateTotalDistance(resultado.distancia);

    // Mostrar la información
    var infoDiv = document.getElementById('info');
    infoDiv.style.display = 'block';
});

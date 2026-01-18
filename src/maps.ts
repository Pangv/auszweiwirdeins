import * as L from "leaflet";

export default () => {
  // --- Karten Initialisierung ---

  // 1. Standesamt Münster
  const latStandesamt = 51.965304;
  const lngStandesamt = 7.632601;
  const mapStandesamt = L.map('mapStandesamt').setView([latStandesamt, lngStandesamt], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapStandesamt);
  L.marker([latStandesamt, lngStandesamt]).addTo(mapStandesamt)
    .bindPopup('<b>Standesamt Münster</b><br>Hörsterstraße 28')
    .openPopup();

  // 2. Yolk Münster
  const latYolk = 51.9536;
  const lngYolk = 7.6528;
  const mapYolk = L.map('mapYolk').setView([latYolk, lngYolk], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapYolk);
  L.marker([latYolk, lngYolk]).addTo(mapYolk)
    .bindPopup('<b>Yolk (Bennohaus)</b><br>Bennostraße 5')
    .openPopup();
}

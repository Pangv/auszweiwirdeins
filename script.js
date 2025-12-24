// API-Konfiguration
const API_CONFIG = {
  // Beispiel-Endpunkte - bitte durch echte API-URLs ersetzen
  endpoint: 'https://api.example.com/wedding-rsvp',
  // Alternative: Google Forms API, Formspree, oder eigener Backend-Service
  // endpoint: 'https://formspree.io/f/YOUR_FORM_ID',
  headers: {
    'Content-Type': 'application/json',
    // Optional: API-Key falls benötigt
    // 'Authorization': 'Bearer YOUR_API_KEY'
  }
};

// Karten initialisieren
function initMaps() {
  // Standesamt Karte
  const mapStandesamt = L.map('mapStandesamt').setView([51.9606649, 7.6261347], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapStandesamt);
  
  const markerStandesamt = L.marker([51.9606649, 7.6261347]).addTo(mapStandesamt);
  markerStandesamt.bindPopup('<b>Standesamt Münster</b><br>Hörsterstraße 28<br>48143 Münster<br><a href="https://www.openstreetmap.org/?mlat=51.9606649&mlon=7.6261347#map=17/51.9606649/7.6261347" target="_blank">In OpenStreetMap öffnen</a>').openPopup();
  
  // Yolk Karte
  const mapYolk = L.map('mapYolk').setView([51.9485, 7.6095], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapYolk);
  
  const markerYolk = L.marker([51.9485, 7.6095]).addTo(mapYolk);
  markerYolk.bindPopup('<b>Yolk</b><br>Bennostraße 5<br>48155 Münster<br><a href="https://www.openstreetmap.org/?mlat=51.9485&mlon=7.6095#map=17/51.9485/7.6095" target="_blank">In OpenStreetMap öffnen</a>').openPopup();
}

// Karten beim Laden der Seite initialisieren
if (typeof L !== 'undefined') {
  window.addEventListener('load', initMaps);
}

async function handleSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const statusMessage = document.getElementById('statusMessage');
  const form = document.getElementById('rsvpForm');
  
  // Formular-Daten sammeln
  const formData = {
    name: document.getElementById('guestName').value,
    attending: document.getElementById('attending').value,
    guestCount: document.getElementById('guestCount').value || '1',
    musicWishes: document.getElementById('musicWishes').value,
    dietaryRestrictions: document.getElementById('dietaryRestrictions').value,
    submittedAt: new Date().toISOString()
  };

  // UI-Feedback: Button deaktivieren
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet...';
  statusMessage.style.display = 'none';

  try {
    // API-Anfrage senden
    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    // Erfolgs-Nachricht anzeigen
    statusMessage.style.display = 'block';
    statusMessage.style.backgroundColor = '#d4edda';
    statusMessage.style.color = '#155724';
    statusMessage.textContent = '✅ Vielen Dank für eure Rückmeldung! Wir haben sie erfolgreich erhalten.';
    
    // Formular zurücksetzen
    form.reset();

    // Optional: Weitere Aktionen nach erfolgreichem Absenden
    console.log('RSVP erfolgreich gesendet:', result);

  } catch (error) {
    // Fehlerbehandlung
    console.error('Fehler beim Senden der Rückmeldung:', error);
    
    statusMessage.style.display = 'block';
    statusMessage.style.backgroundColor = '#f8d7da';
    statusMessage.style.color = '#721c24';
    statusMessage.textContent = '❌ Fehler beim Senden. Bitte versucht es später erneut oder kontaktiert uns direkt.';
    
    // Fallback: Daten in lokalem Storage speichern
    saveToLocalStorage(formData);
  } finally {
    // Button wieder aktivieren
    submitBtn.disabled = false;
    submitBtn.textContent = 'Antwort senden';
  }
}

// Fallback: Lokale Speicherung falls API nicht verfügbar
function saveToLocalStorage(data) {
  try {
    const existingData = JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
    existingData.push(data);
    localStorage.setItem('wedding-rsvp', JSON.stringify(existingData));
    console.log('Daten lokal gespeichert:', data);
  } catch (e) {
    console.error('Fehler beim lokalen Speichern:', e);
  }
}

// Optional: Funktion zum Abrufen lokal gespeicherter Daten
function getLocalRSVPs() {
  try {
    return JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
  } catch (e) {
    console.error('Fehler beim Abrufen lokaler Daten:', e);
    return [];
  }
}

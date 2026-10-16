
/* ==========================================================
   EAH DIVING PRO CLUB
   MULTILINGUE : FR / EN / ES / DE
   VERSION 1.0

   - Fenêtre de sélection
   - Langue mémorisée
   - Bouton de changement
   - Traduction des textes connus
   - Compatible avec les pages chargées dynamiquement
   - Aucun envoi des données privées vers une API externe
========================================================== */

(() => {
  "use strict";

  const LANGUAGES = {
    fr: { flag: "🇫🇷", label: "Français" },
    en: { flag: "🇬🇧", label: "English" },
    es: { flag: "🇪🇸", label: "Español" },
    de: { flag: "🇩🇪", label: "Deutsch" }
  };

  // Chaque entrée : [anglais, espagnol, allemand].
  // Le français reste le texte d'origine.

  const TRANSLATIONS = {
    "Le grading": [
      "Grading", "Evaluación", "Bewertung"
    ],
    "Blazons": [
      "Badges", "Insignias", "Abzeichen"
    ],
    "Population": [
      "Population", "Comunidad", "Community"
    ],
    "Actualités": [
      "News", "Noticias", "Neuigkeiten"
    ],
    "Tarifs": [
      "Pricing", "Precios", "Preise"
    ],
    "Disciplines": [
      "Disciplines", "Disciplinas", "Disziplinen"
    ],
    "Plongeon olympique": [
      "Olympic diving", "Saltos olímpicos",
      "Olympisches Wasserspringen"
    ],
    "Saut de l'ange": [
      "Swan dive", "Salto del ángel", "Engelssprung"
    ],
    "Espace Club": [
      "Club area", "Espacio club", "Clubbereich"
    ],
    "Faire grader": [
      "Get graded", "Solicitar evaluación",
      "Bewertung anfordern"
    ],
    "Le plongeon.": [
      "Diving.", "Los saltos.", "Wasserspringen."
    ],
    "Mesuré autrement.": [
      "Measured differently.",
      "Medido de otra manera.",
      "Anders bewertet."
    ],
    "Un passeport numérique de progression pour suivre les plongeurs, mesurer les performances et valoriser leur évolution.": [
      "A digital progress passport to track divers, measure performance and highlight development.",
      "Un pasaporte digital para seguir a los saltadores, medir su rendimiento y destacar su evolución.",
      "Ein digitaler Fortschrittspass, um Springer zu begleiten, Leistungen zu messen und ihre Entwicklung sichtbar zu machen."
    ],
    "Faire grader un plongeon": [
      "Get a dive graded", "Evaluar un salto",
      "Sprung bewerten lassen"
    ],
    "Comprendre le grading": [
      "Understand grading",
      "Comprender la evaluación",
      "Bewertung verstehen"
    ],
    "LE SYSTÈME EAH": [
      "THE EAH SYSTEM", "EL SISTEMA EAH",
      "DAS EAH SYSTEM"
    ],
    "Un parcours simple": [
      "A simple journey", "Un recorrido sencillo",
      "Ein einfacher Weg"
    ],
    "Du profil du plongeur jusqu'à sa progression.": [
      "From the diver's profile to their progress.",
      "Desde el perfil del saltador hasta su progreso.",
      "Vom Springerprofil bis zum Fortschritt."
    ],
    "Profil EAH": [
      "EAH profile", "Perfil EAH", "EAH-Profil"
    ],
    "Chaque plongeur possède un numéro EAH et une carte NFC / QR personnelle.": [
      "Each diver has an EAH number and a personal NFC / QR card.",
      "Cada saltador tiene un número EAH y una tarjeta NFC / QR personal.",
      "Jeder Springer hat eine EAH-Nummer und eine persönliche NFC-/QR-Karte."
    ],
    "Le coach évalue Takeoff, Trick et Entry.": [
      "The coach evaluates Takeoff, Trick and Entry.",
      "El entrenador evalúa Takeoff, Trick y Entry.",
      "Der Trainer bewertet Takeoff, Trick und Entry."
    ],
    "Un rapport est généré et enregistré dans l'historique.": [
      "A report is generated and saved in the history.",
      "Se genera un informe y se guarda en el historial.",
      "Ein Bericht wird erstellt und im Verlauf gespeichert."
    ],
    "Progression": [
      "Progress", "Progreso", "Fortschritt"
    ],
    "Les évaluations alimentent la progression du plongeur.": [
      "Evaluations track the diver's progress.",
      "Las evaluaciones reflejan el progreso del saltador.",
      "Die Bewertungen dokumentieren den Fortschritt des Springers."
    ],
    "Plusieurs pratiques.": [
      "Multiple disciplines.",
      "Varias disciplinas.",
      "Mehrere Disziplinen."
    ],
    "Un même passeport.": [
      "One passport.", "Un mismo pasaporte.",
      "Ein einziger Pass."
    ],
    "Tremplin et plateforme jusqu'à 10 mètres.": [
      "Springboard and platform up to 10 metres.",
      "Trampolín y plataforma hasta 10 metros.",
      "Sprungbrett und Plattform bis 10 Meter."
    ],
    "Créativité, contrôle et règles adaptées à la discipline.": [
      "Creativity, control and discipline-specific rules.",
      "Creatividad, control y reglas adaptadas a la disciplina.",
      "Kreativität, Kontrolle und disziplinspezifische Regeln."
    ],
    "Progression et évaluation en grande hauteur.": [
      "Progress and evaluation in high diving.",
      "Progreso y evaluación en saltos de gran altura.",
      "Fortschritt und Bewertung beim High Diving."
    ],
    "Progression spécifique selon la hauteur.": [
      "Height-specific progression.",
      "Progresión específica según la altura.",
      "Höhenspezifischer Fortschritt."
    ],
    "MÉTHODE EAH": [
      "EAH METHOD", "MÉTODO EAH", "EAH-METHODE"
    ],
    "Une évaluation structurée du plongeon autour de trois critères complémentaires.": [
      "A structured diving evaluation based on three complementary criteria.",
      "Una evaluación estructurada del salto basada en tres criterios complementarios.",
      "Eine strukturierte Sprungbewertung anhand von drei ergänzenden Kriterien."
    ],
    "Départ": [
      "Takeoff", "Despegue", "Absprung"
    ],
    "Phase aérienne": [
      "Aerial phase", "Fase aérea", "Flugphase"
    ],
    "Entrée à l'eau": [
      "Water entry", "Entrada al agua",
      "Eintauchen"
    ],
    "NOTE FINALE": [
      "FINAL SCORE", "NOTA FINAL", "ENDNOTE"
    ],
    "Le critère le plus faible compte.": [
      "The weakest criterion matters.",
      "El criterio más débil cuenta.",
      "Das schwächste Kriterium zählt."
    ],
    "La note finale repose sur le minimum des trois critères. Lorsque ce minimum n'apparaît qu'une seule fois, un bonus de 0,5 est appliqué.": [
      "The final score is based on the lowest of the three criteria. A 0.5 bonus applies when this minimum occurs only once.",
      "La nota final parte del menor de los tres criterios. Se añade una bonificación de 0,5 cuando ese mínimo aparece una sola vez.",
      "Die Endnote basiert auf dem niedrigsten der drei Kriterien. Tritt dieser Mindestwert nur einmal auf, gibt es einen Bonus von 0,5."
    ],
    "PROGRESSION EAH": [
      "EAH PROGRESSION", "PROGRESIÓN EAH",
      "EAH-FORTSCHRITT"
    ],
    "Les blazons": [
      "The badges", "Las insignias", "Die Abzeichen"
    ],
    "Du Blazon Blanc au Blazon Titan.": [
      "From the White Badge to the Titan Badge.",
      "De la Insignia Blanca a la Insignia Titán.",
      "Vom weißen Abzeichen bis zum Titan-Abzeichen."
    ],
    "Chargement des blazons…": [
      "Loading badges…", "Cargando insignias…",
      "Abzeichen werden geladen…"
    ],
    "POPULATION EAH": [
      "EAH COMMUNITY", "COMUNIDAD EAH",
      "EAH-COMMUNITY"
    ],
    "Explorer les performances": [
      "Explore performances", "Explorar resultados",
      "Leistungen entdecken"
    ],
    "Recherche par code, nom ou prénom.": [
      "Search by code, last name or first name.",
      "Buscar por código, apellido o nombre.",
      "Suche nach Code, Nachname oder Vorname."
    ],
    "Code du plongeon": [
      "Dive code", "Código del salto", "Sprungcode"
    ],
    "Nom ou prénom": [
      "Last name or first name",
      "Apellido o nombre", "Nachname oder Vorname"
    ],
    "Rechercher": [
      "Search", "Buscar", "Suchen"
    ],
    "Entre un code, un nom ou un prénom.": [
      "Enter a code, last name or first name.",
      "Introduce un código, apellido o nombre.",
      "Code, Nachname oder Vorname eingeben."
    ],
    "SPOTS EAH": [
      "EAH LOCATIONS", "LUGARES EAH",
      "EAH-STANDORTE"
    ],
    "Où plonger ?": [
      "Where to dive?", "¿Dónde saltar?",
      "Wo springen?"
    ],
    "Chargement des spots…": [
      "Loading locations…", "Cargando lugares…",
      "Standorte werden geladen…"
    ],
    "Chargement des actualités…": [
      "Loading news…", "Cargando noticias…",
      "Neuigkeiten werden geladen…"
    ],
    "Les offres": [
      "Our offers", "Las ofertas", "Unsere Angebote"
    ],
    "Chargement des offres…": [
      "Loading offers…", "Cargando ofertas…",
      "Angebote werden geladen…"
    ],
    "Les offres ne sont pas disponibles pour le moment.": [
      "Offers are currently unavailable.",
      "Las ofertas no están disponibles actualmente.",
      "Die Angebote sind derzeit nicht verfügbar."
    ],
    "GRADING EAH": [
      "EAH GRADING", "EVALUACIÓN EAH",
      "EAH-BEWERTUNG"
    ],
    "Envoyez une demande à EAH Diving.": [
      "Send a request to EAH Diving.",
      "Envía una solicitud a EAH Diving.",
      "Sende eine Anfrage an EAH Diving."
    ],
    "Prénom": [
      "First name", "Nombre", "Vorname"
    ],
    "Nom": [
      "Last name", "Apellido", "Nachname"
    ],
    "E-mail": [
      "Email", "Correo electrónico", "E-Mail"
    ],
    "Discipline": [
      "Discipline", "Disciplina", "Disziplin"
    ],
    "Code / figure": [
      "Code / skill", "Código / figura",
      "Code / Figur"
    ],
    "Hauteur": [
      "Height", "Altura", "Höhe"
    ],
    "Type de hauteur": [
      "Height type", "Tipo de altura", "Höhenart"
    ],
    "Hauteur connue": [
      "Known height", "Altura conocida",
      "Bekannte Höhe"
    ],
    "Hauteur approximative": [
      "Approximate height", "Altura aproximada",
      "Ungefähre Höhe"
    ],
    "Lien vidéo": [
      "Video link", "Enlace del vídeo", "Videolink"
    ],
    "Ville du plongeon": [
      "Dive location city", "Ciudad del salto",
      "Stadt des Sprungs"
    ],
    "Spot / piscine": [
      "Location / pool", "Lugar / piscina",
      "Standort / Schwimmbad"
    ],
    "Message": [
      "Message", "Mensaje", "Nachricht"
    ],
    "Envoyer la demande": [
      "Submit request", "Enviar solicitud",
      "Anfrage senden"
    ],
    "Gestion des plongeurs, évaluations et progression.": [
      "Manage divers, evaluations and progress.",
      "Gestiona saltadores, evaluaciones y progreso.",
      "Springer, Bewertungen und Fortschritt verwalten."
    ],
    "Connexion coach": [
      "Coach login", "Acceso entrenador",
      "Trainer-Anmeldung"
    ],
    "Accédez à votre club avec votre compte personnel.": [
      "Access your club using your personal account.",
      "Accede a tu club con tu cuenta personal.",
      "Greife mit deinem persönlichen Konto auf deinen Club zu."
    ],
    "Mot de passe": [
      "Password", "Contraseña", "Passwort"
    ],
    "Accéder à l'espace coach": [
      "Access coach area", "Acceder al espacio entrenador",
      "Zum Trainerbereich"
    ],
    "PLONGEUR": [
      "DIVER", "SALTADOR", "SPRINGER"
    ],
    "Ouvrir mon profil": [
      "Open my profile", "Abrir mi perfil",
      "Mein Profil öffnen"
    ],
    "Retrouvez votre passeport EAH sans votre carte.": [
      "Access your EAH passport without your card.",
      "Accede a tu pasaporte EAH sin tu tarjeta.",
      "Öffne deinen EAH-Pass auch ohne Karte."
    ],
    "Numéro EAH": [
      "EAH number", "Número EAH", "EAH-Nummer"
    ],
    "Code personnel": [
      "Personal code", "Código personal",
      "Persönlicher Code"
    ],
    "ESPACE PRIVÉ": [
      "PRIVATE AREA", "ESPACIO PRIVADO",
      "PRIVATER BEREICH"
    ],
    "Coach": [
      "Coach", "Entrenador", "Trainer"
    ],
    "+ Nouvelle évaluation": [
      "+ New evaluation", "+ Nueva evaluación",
      "+ Neue Bewertung"
    ],
    "Déconnexion": [
      "Log out", "Cerrar sesión", "Abmelden"
    ],
    "Dernières évaluations": [
      "Recent evaluations", "Últimas evaluaciones",
      "Letzte Bewertungen"
    ],
    "Chargement…": [
      "Loading…", "Cargando…", "Wird geladen…"
    ],
    "Groupes": [
      "Groups", "Grupos", "Gruppen"
    ],
    "PLONGEURS": [
      "DIVERS", "SALTADORES", "SPRINGER"
    ],
    "Mes plongeurs": [
      "My divers", "Mis saltadores", "Meine Springer"
    ],
    "Accéder au profil, aux notes, Grade Reports et vidéos.": [
      "Access profiles, scores, Grade Reports and videos.",
      "Accede a perfiles, notas, informes y vídeos.",
      "Profile, Bewertungen, Grade Reports und Videos öffnen."
    ],
    "PROFIL EAH": [
      "EAH PROFILE", "PERFIL EAH", "EAH-PROFIL"
    ],
    "Aucun profil ouvert": [
      "No profile open", "Ningún perfil abierto",
      "Kein Profil geöffnet"
    ],
    "Scannez votre carte NFC / QR ou connectez-vous avec votre numéro EAH.": [
      "Scan your NFC / QR card or log in with your EAH number.",
      "Escanea tu tarjeta NFC / QR o entra con tu número EAH.",
      "Scanne deine NFC-/QR-Karte oder melde dich mit deiner EAH-Nummer an."
    ],
    "Connexion": [
      "Login", "Acceso", "Anmeldung"
    ],
    "PREMIÈRE ACTIVATION": [
      "FIRST ACTIVATION", "PRIMERA ACTIVACIÓN",
      "ERSTE AKTIVIERUNG"
    ],
    "Activez votre profil EAH": [
      "Activate your EAH profile",
      "Activa tu perfil EAH",
      "Aktiviere dein EAH-Profil"
    ],
    "Configurez votre profil une seule fois. Les prochains scans de votre carte ouvriront directement votre passeport EAH.": [
      "Set up your profile once. Future card scans will open your EAH passport directly.",
      "Configura tu perfil una sola vez. Los siguientes escaneos abrirán directamente tu pasaporte EAH.",
      "Richte dein Profil einmal ein. Spätere Kartenscans öffnen deinen EAH-Pass direkt."
    ],
    "Date de naissance": [
      "Date of birth", "Fecha de nacimiento",
      "Geburtsdatum"
    ],
    "Sexe / catégorie": [
      "Sex / category", "Sexo / categoría",
      "Geschlecht / Kategorie"
    ],
    "Non renseigné": [
      "Not specified", "No especificado",
      "Nicht angegeben"
    ],
    "Femme": [
      "Female", "Mujer", "Weiblich"
    ],
    "Homme": [
      "Male", "Hombre", "Männlich"
    ],
    "Groupe": [
      "Group", "Grupo", "Gruppe"
    ],
    "Visibilité du profil": [
      "Profile visibility", "Visibilidad del perfil",
      "Profilsichtbarkeit"
    ],
    "Privé": [
      "Private", "Privado", "Privat"
    ],
    "Public": [
      "Public", "Público", "Öffentlich"
    ],
    "URL de la photo": [
      "Photo URL", "URL de la foto", "Foto-URL"
    ],
    "Activer mon profil": [
      "Activate my profile", "Activar mi perfil",
      "Mein Profil aktivieren"
    ],
    "Nouveau Grade Report": [
      "New Grade Report", "Nuevo Grade Report",
      "Neuer Grade Report"
    ],
    "Connexion coach requise": [
      "Coach login required",
      "Se requiere acceso de entrenador",
      "Trainer-Anmeldung erforderlich"
    ],
    "Vous devez être connecté à un club pour grader un plongeur.": [
      "You must be logged into a club to grade a diver.",
      "Debes acceder a un club para evaluar a un saltador.",
      "Du musst in einem Club angemeldet sein, um einen Springer zu bewerten."
    ],
    "Se connecter": [
      "Log in", "Iniciar sesión", "Anmelden"
    ],
    "Évaluation EAH Diving": [
      "EAH Diving evaluation",
      "Evaluación EAH Diving",
      "EAH Diving Bewertung"
    ],
    "Plongeur & figure": [
      "Diver & skill", "Saltador y figura",
      "Springer und Figur"
    ],
    "Plongeur": [
      "Diver", "Saltador", "Springer"
    ],
    "Choisir un plongeur": [
      "Select a diver", "Elegir un saltador",
      "Springer auswählen"
    ],
    "Code plongeon": [
      "Dive code", "Código de salto", "Sprungcode"
    ],
    "Connue": [
      "Known", "Conocida", "Bekannt"
    ],
    "Approximative": [
      "Approximate", "Aproximada", "Ungefähr"
    ],
    "Spot EAH": [
      "EAH location", "Lugar EAH", "EAH-Standort"
    ],
    "Autre / non répertorié": [
      "Other / not listed",
      "Otro / no incluido",
      "Andere / nicht aufgeführt"
    ],
    "Nom du lieu": [
      "Location name", "Nombre del lugar",
      "Name des Standorts"
    ],
    "DD World Aquatics": [
      "World Aquatics DD",
      "Dificultad World Aquatics",
      "World Aquatics Schwierigkeitsgrad"
    ],
    "Difficulté EAH": [
      "EAH difficulty", "Dificultad EAH",
      "EAH-Schwierigkeit"
    ],
    "Note principale du Grade Report": [
      "Main Grade Report score",
      "Nota principal del Grade Report",
      "Hauptbewertung des Grade Reports"
    ],
    "Note World Aquatics": [
      "World Aquatics score",
      "Nota World Aquatics",
      "World Aquatics Wertung"
    ],
    "Entrée": [
      "Entry", "Entrada", "Eintauchen"
    ],
    "Retour du coach": [
      "Coach feedback", "Comentarios del entrenador",
      "Trainerrückmeldung"
    ],
    "Points réussis": [
      "Strengths", "Puntos positivos", "Stärken"
    ],
    "Critères à améliorer": [
      "Areas to improve", "Aspectos por mejorar",
      "Verbesserungspunkte"
    ],
    "Commentaire": [
      "Comment", "Comentario", "Kommentar"
    ],
    "Vidéo": [
      "Video", "Vídeo", "Video"
    ],
    "Ajouter un accès vidéo dans le Grade Report": [
      "Add video access to the Grade Report",
      "Añadir acceso al vídeo en el Grade Report",
      "Videolink zum Grade Report hinzufügen"
    ],
    "Générer le Grade Report": [
      "Generate Grade Report",
      "Generar Grade Report",
      "Grade Report erstellen"
    ],
    "DISCIPLINE": [
      "DISCIPLINE", "DISCIPLINA", "DISZIPLIN"
    ],
    "Tremplin, plateforme et progression jusqu'à 10 mètres.": [
      "Springboard, platform and progression up to 10 metres.",
      "Trampolín, plataforma y progresión hasta 10 metros.",
      "Sprungbrett, Plattform und Fortschritt bis 10 Meter."
    ],
    "Une lecture structurée du plongeon": [
      "A structured diving assessment",
      "Una evaluación estructurada del salto",
      "Eine strukturierte Sprungbewertung"
    ],
    "EAH Diving permet de suivre les plongeons au tremplin et à la plateforme avec les critères Takeoff, Trick et Entry.": [
      "EAH Diving tracks springboard and platform dives using Takeoff, Trick and Entry criteria.",
      "EAH Diving permite seguir los saltos de trampolín y plataforma con los criterios Takeoff, Trick y Entry.",
      "EAH Diving bewertet Sprungbrett- und Plattformsprünge anhand von Takeoff, Trick und Entry."
    ],
    "Une notation adaptée aux spécificités de ces pratiques.": [
      "Scoring adapted to these disciplines.",
      "Puntuación adaptada a estas disciplinas.",
      "Eine an diese Disziplinen angepasste Bewertung."
    ],
    "Des critères adaptés": [
      "Adapted criteria", "Criterios adaptados",
      "Angepasste Kriterien"
    ],
    "La grille conserve Takeoff, Trick et Entry, avec des tolérances adaptées à la discipline.": [
      "The scoring grid retains Takeoff, Trick and Entry with discipline-specific tolerances.",
      "La tabla mantiene Takeoff, Trick y Entry con tolerancias adaptadas a la disciplina.",
      "Die Bewertung behält Takeoff, Trick und Entry mit disziplinspezifischen Toleranzen bei."
    ],
    "Grande hauteur, difficulté et progression.": [
      "High diving, difficulty and progression.",
      "Gran altura, dificultad y progresión.",
      "High Diving, Schwierigkeit und Fortschritt."
    ],
    "Suivre les plongeons de grande hauteur": [
      "Track high dives",
      "Seguir los saltos de gran altura",
      "High-Diving-Sprünge verfolgen"
    ],
    "EAH Diving peut associer la hauteur, le degré de difficulté, la note EAH et l'historique du plongeur.": [
      "EAH Diving can combine height, difficulty, EAH score and the diver's history.",
      "EAH Diving puede combinar altura, dificultad, nota EAH e historial del saltador.",
      "EAH Diving kann Höhe, Schwierigkeitsgrad, EAH-Note und Verlauf des Springers verknüpfen."
    ],
    "Une progression par maîtrise et par hauteur.": [
      "Progress by skill and height.",
      "Progresión por dominio y altura.",
      "Fortschritt nach Können und Höhe."
    ],
    "Une catégorie spécifique": [
      "A specific category",
      "Una categoría específica",
      "Eine eigene Kategorie"
    ],
    "EAH Diving conserve une lecture adaptée de l'entrée à l'eau et de la hauteur réalisée.": [
      "EAH Diving uses criteria adapted to water entry and achieved height.",
      "EAH Diving utiliza criterios adaptados a la entrada al agua y la altura alcanzada.",
      "EAH Diving berücksichtigt Eintauchen und erreichte Höhe mit angepassten Kriterien."
    ],
    "Le passeport numérique de progression du plongeur.": [
      "The diver's digital progress passport.",
      "El pasaporte digital de progreso del saltador.",
      "Der digitale Fortschrittspass für Springer."
    ],
    "Clubs": [
      "Clubs", "Clubes", "Vereine"
    ],
    "EAH fournit l'outil. Le coach reste le coach.": [
      "EAH provides the tool. The coach remains in charge.",
      "EAH proporciona la herramienta. El entrenador sigue al mando.",
      "EAH stellt das Werkzeug bereit. Der Trainer bleibt verantwortlich."
    ],

    // Descriptions actuellement présentes dans TARIFS

    "25 profils + 25 cartes NFC/QR + espace club + Grade Reports.": [
      "25 profiles + 25 NFC/QR cards + club area + Grade Reports.",
      "25 perfiles + 25 tarjetas NFC/QR + espacio club + Grade Reports.",
      "25 Profile + 25 NFC-/QR-Karten + Clubbereich + Grade Reports."
    ],
    "50 profils + 50 cartes NFC/QR + dashboard club.": [
      "50 profiles + 50 NFC/QR cards + club dashboard.",
      "50 perfiles + 50 tarjetas NFC/QR + panel del club.",
      "50 Profile + 50 NFC-/QR-Karten + Club-Dashboard."
    ],
    "100 profils + 100 cartes NFC/QR + dashboard club.": [
      "100 profiles + 100 NFC/QR cards + club dashboard.",
      "100 perfiles + 100 tarjetas NFC/QR + panel del club.",
      "100 Profile + 100 NFC-/QR-Karten + Club-Dashboard."
    ],
    "Vérification d’une vidéo directement par EAH Diving.": [
      "Video verification directly by EAH Diving.",
      "Verificación de un vídeo directamente por EAH Diving.",
      "Videoverifizierung direkt durch EAH Diving."
    ],
    "Profil EAH + 3 gradings.": [
      "EAH profile + 3 gradings.",
      "Perfil EAH + 3 evaluaciones.",
      "EAH-Profil + 3 Bewertungen."
    ],
    "Profil EAH + Carte NFC personnel + 5 gradings": [
      "EAH profile + personal NFC card + 5 gradings",
      "Perfil EAH + tarjeta NFC personal + 5 evaluaciones",
      "EAH-Profil + persönliche NFC-Karte + 5 Bewertungen"
    ]
  };

  const STORAGE_KEY = "eah_diving_language_v1";

  const languageOrder = ["fr", "en", "es", "de"];
  const originals = new WeakMap();
  const attributes = new WeakMap();

  function normalize(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/[’‘]/g, "'")
      .trim();
  }

  const dictionary = new Map(
    Object.entries(TRANSLATIONS).map(([key, value]) => [
      normalize(key), value
    ])
  );

  function storedLanguage() {
    try {
      const result = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES[result] ? result : null;
    } catch (_) {
      return null;
    }
  }

  let currentLanguage = storedLanguage() || "fr";

  function translate(value) {
    const entry = dictionary.get(normalize(value));

    if (!entry || currentLanguage === "fr") {
      return value;
    }

    const index = languageOrder.indexOf(currentLanguage) - 1;

    return entry[index] || value;
  }

  function isExcluded(element) {
    return !element || !!element.closest(
      "script,style,noscript,textarea," +
      "[contenteditable='true'],#eahLanguageModal," +
      "#eahLanguageSwitcher"
    );
  }

  function updateTextNode(node) {
    const parent = node.parentElement;

    if (isExcluded(parent)) return;

    const current = node.nodeValue || "";
    let snapshot = originals.get(node);

    if (!snapshot) {
      snapshot = { source: current, last: current };
      originals.set(node, snapshot);
    } else if (current !== snapshot.last) {
      snapshot.source = current;
    }

    const source = snapshot.source;
    const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);

    if (!match) return;

    const result =
      match[1] + translate(match[2]) + match[3];

    if (current !== result) {
      node.nodeValue = result;
    }

    snapshot.last = result;
  }

  function updateAttributes(element) {
    if (isExcluded(element)) return;

    let record = attributes.get(element);

    if (!record) {
      record = {};
      attributes.set(element, record);
    }

    ["placeholder", "title", "aria-label", "alt"]
      .forEach(attr => {
        if (!element.hasAttribute(attr)) return;

        const current = element.getAttribute(attr) || "";
        let saved = record[attr];

        if (!saved || current !== saved.last) {
          saved = { source: current, last: current };
          record[attr] = saved;
        }

        const result = translate(saved.source);

        if (current !== result) {
          element.setAttribute(attr, result);
        }

        saved.last = result;
      });
  }

  function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    if (document.body) {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      let node;

      while ((node = walker.nextNode())) {
        updateTextNode(node);
      }

      document.querySelectorAll(
        "[placeholder],[title],[aria-label],[alt]"
      ).forEach(updateAttributes);
    }

    const switcher = document.getElementById(
      "eahLanguageSwitcher"
    );

    if (switcher) {
      switcher.textContent =
        "🌐 " +
        LANGUAGES[currentLanguage].flag +
        " " +
        currentLanguage.toUpperCase();
    }
  }

  let scheduled = false;

  const observer = new MutationObserver(() => {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      observer.disconnect();
      applyLanguage();
      startObserver();
    });
  });

  function startObserver() {
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "placeholder",
        "title",
        "aria-label",
        "alt"
      ]
    });
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {}
  }

  function selectLanguage(language) {
    if (!LANGUAGES[language]) return;

    currentLanguage = language;
    saveLanguage(language);

    observer.disconnect();
    applyLanguage();
    startObserver();

    const modal = document.getElementById(
      "eahLanguageModal"
    );

    if (modal) {
      modal.hidden = true;
    }
  }

  function addStyles() {
    const style = document.createElement("style");

    style.textContent = `
      #eahLanguageModal[hidden] {
        display: none !important;
      }

      #eahLanguageModal {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: rgba(1,12,25,.88);
        backdrop-filter: blur(12px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 18px;
      }

      .eah-language-dialog {
        width: min(460px,100%);
        padding: 28px;
        border-radius: 23px;
        background: linear-gradient(
          145deg,#0c3150,#03131f
        );
        border: 1px solid rgba(48,207,255,.38);
        box-shadow: 0 25px 75px rgba(0,0,0,.45);
        color: #f5f9ff;
        text-align: center;
        font-family: Inter,Arial,sans-serif;
      }

      .eah-language-dialog h2 {
        color: #fff;
        margin: 8px 0;
        font-size: 25px;
      }

      .eah-language-dialog p {
        color: #afc9da;
        margin-bottom: 22px;
      }

      .eah-language-grid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 12px;
      }

      .eah-language-choice {
        background: rgba(255,255,255,.055);
        color: #fff;
        border: 1px solid rgba(48,207,255,.25);
        border-radius: 14px;
        min-height: 100px;
        padding: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        font-weight: 700;
      }

      .eah-language-choice:hover,
      .eah-language-choice:focus-visible {
        background: rgba(11,107,255,.28);
        border-color: #30cfff;
        outline: none;
      }

      .eah-language-flag {
        font-size: 36px;
        line-height: 1.3;
      }

      #eahLanguageSwitcher {
        position: fixed;
        left: 14px;
        bottom: 14px;
        z-index: 10000;
        background: #0b3253;
        color: white;
        border: 1px solid #30cfff;
        border-radius: 30px;
        padding: 10px 15px;
        font: 700 13px Inter,Arial,sans-serif;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,.3);
      }

      @media(max-width:480px) {
        .eah-language-dialog { padding: 20px; }
        .eah-language-dialog h2 { font-size: 22px; }
      }
    `;

    document.head.appendChild(style);
  }

  function createInterface() {
    const modal = document.createElement("div");
    modal.id = "eahLanguageModal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute(
      "aria-label",
      "Select your country?"
    );

    const dialog = document.createElement("div");
    dialog.className = "eah-language-dialog";

    const heading = document.createElement("h2");
    heading.textContent = "Select your country?";

    const subtitle = document.createElement("p");
    subtitle.textContent = "Choose your language";

    const grid = document.createElement("div");
    grid.className = "eah-language-grid";

    Object.entries(LANGUAGES).forEach(([code, info]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "eah-language-choice";

      const flag = document.createElement("span");
      flag.className = "eah-language-flag";
      flag.textContent = info.flag;

      const name = document.createElement("span");
      name.textContent = info.label;

      button.append(flag, name);

      button.addEventListener("click", () => {
        selectLanguage(code);
      });

      grid.appendChild(button);
    });

    dialog.append(heading, subtitle, grid);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    const switcher = document.createElement("button");
    switcher.id = "eahLanguageSwitcher";
    switcher.type = "button";

    switcher.addEventListener("click", () => {
      modal.hidden = false;
      grid.querySelector("button")?.focus();
    });

    document.body.appendChild(switcher);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) {
        modal.hidden = true;
      }
    });

    return modal;
  }

  function init() {
    addStyles();

    const modal = createInterface();

    applyLanguage();
    startObserver();

    if (!storedLanguage()) {
      modal.hidden = false;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();

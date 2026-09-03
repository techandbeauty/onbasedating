// ============================================================
// OnBase — Waitlist Landing Page
// Firebase config + all interactive behavior lives here.
// This file is loaded AFTER the Firebase compat SDK <script> tags
// in index.html, so `firebase` is already available globally.
// ============================================================

// Firebase web config — this is safe to keep in a public repo.
// It identifies your project; it does NOT grant access on its own.
// Actual security comes from your Firestore rules (see README.md).
const firebaseConfig = {
  apiKey: "AIzaSyDk3TyQs8pALQf1oxsdPrfEN25FQ98Zy4s",
  authDomain: "branches-dating.firebaseapp.com",
  projectId: "branches-dating",
  storageBucket: "branches-dating.firebasestorage.app",
  messagingSenderId: "747335822786",
  appId: "1:747335822786:web:3d9d756a43fe0fbebc3a5b",
  measurementId: "G-7JX7REMXC0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
if (firebase.analytics) {
  firebase.analytics();
}

// ---------- INTRO SEQUENCE ----------
const intro = document.getElementById('intro');
const introVideo = document.getElementById('introVideo');
const unmuteBtn = document.getElementById('unmuteBtn');
const unmuteLabel = document.getElementById('unmuteLabel');
const skipBtn = document.getElementById('skipBtn');

const INTRO_KEY = 'onbase_intro_seen';

function leaveIntro(){
  intro.classList.add('leaving');
  introVideo.pause();
  setTimeout(() => { intro.style.display = 'none'; }, 1100);
  sessionStorage.setItem(INTRO_KEY, '1');
}

// Skip the full intro if they've already seen it this session
if (sessionStorage.getItem(INTRO_KEY)) {
  intro.style.display = 'none';
} else {
  introVideo.addEventListener('ended', leaveIntro);
}

skipBtn.addEventListener('click', leaveIntro);

unmuteBtn.addEventListener('click', () => {
  introVideo.muted = !introVideo.muted;
  unmuteLabel.textContent = introVideo.muted ? 'Tap for sound' : 'Mute';
});

// ---------- FILM MODAL (re-watch on the landing page itself) ----------
const filmModal = document.getElementById('filmModal');
const modalVideo = document.getElementById('modalVideo');
const watchFilmBtn = document.getElementById('watchFilmBtn');
const modalClose = document.getElementById('modalClose');

watchFilmBtn.addEventListener('click', () => {
  filmModal.classList.add('open');
  modalVideo.currentTime = 0;
  modalVideo.play();
});
function closeModal(){
  filmModal.classList.remove('open');
  modalVideo.pause();
}
modalClose.addEventListener('click', closeModal);
filmModal.addEventListener('click', (e) => { if (e.target === filmModal) closeModal(); });

// ---------- FORM SUBMISSION ----------
const form = document.getElementById('waitlistForm');
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const successState = document.getElementById('successState');

function showError(msg){
  formError.textContent = msg;
  formError.style.display = 'block';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.style.display = 'none';

  // honeypot check — bots fill every field
  if (document.getElementById('companyWebsite').value) {
    return; // silently drop, don't tip off the bot
  }

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const affiliation = document.getElementById('affiliation').value;
  const question = document.getElementById('question').value.trim();
  const consent = document.getElementById('consent').checked;

  if (!firstName || !lastName) return showError('Please enter your first and last name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Please enter a valid email address.');
  if (!affiliation) return showError('Please select your affiliation.');
  if (!question) return showError('Please share a quick answer before joining.');
  if (!consent) return showError('Please confirm eligibility to continue.');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Joining…';

  try {
    await db.collection('waitlist').add({
      firstName,
      lastName,
      email: email.toLowerCase(),
      affiliation,
      healthyRelationshipAnswer: question,
      source: 'landing_page',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    form.style.display = 'none';
    successState.classList.add('visible');
  } catch (err) {
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join the Waitlist';
    showError('Something went wrong on our end — please try again in a moment.');
  }
});

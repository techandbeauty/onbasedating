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

// Firebase is loaded from a CDN and can fail (ad blockers, privacy browsers,
// offline use, or restrictive networks commonly block gstatic.com/firebase
// domains). If this throws unguarded, it kills the rest of this script —
// including the video modal and nav. Keep it optional so the page still works.
let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  if (firebase.analytics) {
    firebase.analytics();
  }
} catch (err) {
  console.error('Firebase failed to initialize — waitlist submissions will be disabled.', err);
}

// ---------- RESPONSIVE VIDEO ORIENTATION ----------
// Source video is shot vertically (portrait). On desktop/web we rotate it
// 90° via a Cloudinary transformation so it plays horizontally and fills
// the wide hero background; on mobile we serve it in its natural vertical
// orientation.
const CLOUD_NAME = 'didqb05ko';
const VIDEO_VERSION = 'v1788225152';
const VIDEO_PUBLIC_ID = 'onbase_promo_video_axcoye';

function cloudinaryUrl(transform){
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transform}/${VIDEO_VERSION}/${VIDEO_PUBLIC_ID}.mp4`;
}

const DESKTOP_VIDEO_URL = cloudinaryUrl('a_90,f_auto,q_auto'); // rotated to landscape
const MOBILE_VIDEO_URL = cloudinaryUrl('f_auto,q_auto');       // natural vertical

const heroVideo = document.getElementById('heroVideo');
const mobileQuery = window.matchMedia('(max-width: 760px)');

function applyResponsiveVideoSource(){
  if (!heroVideo) return;
  const url = mobileQuery.matches ? MOBILE_VIDEO_URL : DESKTOP_VIDEO_URL;
  const source = heroVideo.querySelector('source');
  if (!source || source.getAttribute('src') === url) return;
  const wasPlaying = !heroVideo.paused && !heroVideo.ended;
  source.setAttribute('src', url);
  heroVideo.load();
  if (wasPlaying) heroVideo.play().catch(() => {});
}

applyResponsiveVideoSource();
mobileQuery.addEventListener('change', applyResponsiveVideoSource);

if (heroVideo) {
  heroVideo.addEventListener('loadeddata', () => heroVideo.classList.add('loaded'));
}

// ---------- FILM MODAL ----------
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const watchFilmBtn = document.getElementById('watchFilmBtn');
const videoModalClose = document.getElementById('videoModalClose');

function openVideoModal(e){
  if (e) e.preventDefault();
  videoModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {});
}
function closeVideoModal(){
  videoModal.classList.remove('show');
  document.body.style.overflow = '';
  modalVideo.pause();
}
watchFilmBtn.addEventListener('click', openVideoModal);
videoModalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.classList.contains('show')) closeVideoModal();
});

// ---------- SELECT FILLED STATE (for placeholder styling) ----------
const affiliationSelect = document.getElementById('affiliation');
affiliationSelect.addEventListener('change', function(){
  if (this.value) this.classList.add('filled');
  else this.classList.remove('filled');
});

// ---------- FORM SUBMISSION ----------
const form = document.getElementById('waitlistForm');
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');
const formView = document.getElementById('formView');
const tyScreen = document.getElementById('tyScreen');
const tyName = document.getElementById('tyName');

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
  if (!db) return showError('Something went wrong on our end — please try again in a moment.');

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

    tyName.textContent = firstName;
    formView.style.display = 'none';
    tyScreen.classList.add('show');
  } catch (err) {
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join the Waitlist';
    showError('Something went wrong on our end — please try again in a moment.');
  }
});

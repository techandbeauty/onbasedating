// ═══════════════════════════════════════
// OnBase — Landing Page JavaScript
// ═══════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ═══ FIREBASE CONFIG ═══
// These are PUBLIC identifiers (not secrets). Google designed them to be in client code.
// Your Firestore security rules control data access — not these keys.
const firebaseConfig = {
  apiKey: "AIzaSyDk3TyQs8pALQf1oxsdPrfEN25FQ98Zy4s",
  authDomain: "branches-dating.firebaseapp.com",
  projectId: "branches-dating",
  storageBucket: "branches-dating.firebasestorage.app",
  messagingSenderId: "747335822786",
  appId: "1:747335822786:web:3d9d756a43fe0fbebc3a5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ═══════════════════════════════════════
// VIDEO
// ═══════════════════════════════════════

// Hero background video fade-in
const video = document.getElementById('heroVideo');
if (video) {
  video.addEventListener('loadeddata', () => video.classList.add('loaded'));
}

// Video modal (Watch the Film)
const watchBtn = document.getElementById('watchFilmBtn');
const videoModal = document.getElementById('videoModal');
const videoModalClose = document.getElementById('videoModalClose');

function openVideoModal(e) {
  if (e) e.preventDefault();
  videoModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  const modalVideo = videoModal.querySelector('video');
  if (modalVideo) modalVideo.play().catch(() => {});
}

function closeVideoModal() {
  videoModal.classList.remove('show');
  document.body.style.overflow = '';
  const modalVideo = videoModal.querySelector('video');
  if (modalVideo) modalVideo.pause();
}

watchBtn.addEventListener('click', openVideoModal);
videoModalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) closeVideoModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.classList.contains('show')) closeVideoModal();
});

// ═══════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════

function san(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML.trim();
}

function vN(n, label) {
  const c = san(n);
  // Must be 2-50 chars, letters/hyphens/apostrophes/spaces only
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,50}$/.test(c))
    return { ok: 0, e: label + ' must be 2-50 letters only.' };
  // Block SQL/script injection
  if (/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|SCRIPT|IFRAME)\b|--|;|<|>|\\)/i.test(n))
    return { ok: 0, e: 'Invalid characters detected.' };
  // Block keyboard mash / gibberish (4+ same letter in a row)
  if (/(.)\1{3,}/i.test(c))
    return { ok: 0, e: 'Please enter a real ' + label.toLowerCase() + '.' };
  // Block single repeated patterns like "aaaa", "abab"
  if (/^(.)\1+$/.test(c) || /^(..)\1+$/.test(c))
    return { ok: 0, e: 'Please enter a real ' + label.toLowerCase() + '.' };
  // Block common test/fake names
  const fakes = ['test','tester','testing','fake','asdf','qwerty','none','na','n/a','xxx','abc','aaa','admin','user','sample'];
  if (fakes.includes(c.toLowerCase()))
    return { ok: 0, e: 'Please enter your real ' + label.toLowerCase() + '.' };
  return { ok: 1, v: c };
}

function vE(e) {
  const c = san(e).toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9._%+\-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9.\-]*[a-z0-9])?\.[a-z]{2,10}$/.test(c))
    return { ok: 0, e: 'Please enter a valid email address.' };
  if (c.length > 100) return { ok: 0, e: 'Email too long.' };
  if (/(<|>|;|"|'|\\|\{|\})/i.test(e)) return { ok: 0, e: 'Invalid characters.' };
  // Block disposable / temp email providers
  const blocked = [
    'mailinator.com','guerrillamail.com','tempmail.com','yopmail.com','throwaway.email',
    'sharklasers.com','trashmail.com','dispostable.com','maildrop.cc','10minutemail.com',
    'guerrillamail.info','grr.la','guerrillamail.net','guerrillamail.org','spam4.me',
    'temp-mail.org','fakeinbox.com','mailnesia.com','tempail.com','burnermail.io',
    'mohmal.com','emailondeck.com','tempmailo.com','getnada.com','inboxbear.com'
  ];
  const domain = c.split('@')[1];
  if (blocked.includes(domain)) return { ok: 0, e: 'Please use a permanent email address.' };
  // Block obviously fake email patterns
  const localPart = c.split('@')[0];
  if (/^(test|fake|asdf|qwerty|sample|admin|user|none|xxx|abc|aaa)$/i.test(localPart))
    return { ok: 0, e: 'Please use your real email address.' };
  return { ok: 1, v: c };
}

function vS(v, a) { return a.includes(v); }

// ═══════════════════════════════════════
// ELIGIBILITY
// ═══════════════════════════════════════

const ELIGIBLE = ['active_duty', 'veteran', 'reservist', 'dod_cleared', 'first_responder', 'military_spouse'];

function isEligible(affiliation) {
  return ELIGIBLE.includes(affiliation);
}

// ═══════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════

let sc = 0, lt = 0;
const FL = Date.now();

function rl() {
  if (sc >= 3) return { ok: 0, e: 'Too many attempts. Please refresh the page.' };
  if (Date.now() - lt < 8000) return { ok: 0, e: 'Please wait a moment before trying again.' };
  return { ok: 1 };
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function err(m) {
  const el = document.getElementById('fErr');
  el.textContent = m;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 6000);
}

function bad(id) {
  const el = document.getElementById(id);
  el.classList.add('bad');
  setTimeout(() => el.classList.remove('bad'), 3000);
}

// Keep selects styled when filled
document.querySelectorAll('.waitlist select').forEach(sel => {
  sel.addEventListener('change', function() {
    this.classList.toggle('filled', !!this.value);
  });
});

// ═══════════════════════════════════════
// RESULT SCREENS
// ═══════════════════════════════════════

function showEligible(firstName, email) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('tyName').textContent = firstName;
  document.getElementById('tyEmail').textContent = email;
  const ty = document.getElementById('tyScreen');
  ty.classList.add('show');
  ty.style.display = 'block';
}

function showIneligible(firstName) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('tyNameIneligible').textContent = firstName;
  const ty = document.getElementById('tyIneligible');
  ty.classList.add('show');
  ty.style.display = 'block';
}

function showDuplicate(firstName) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('tyNameDup').textContent = firstName;
  const ty = document.getElementById('tyDuplicate');
  ty.classList.add('show');
  ty.style.display = 'block';
}

// ═══════════════════════════════════════
// FIRESTORE
// ═══════════════════════════════════════

async function exists(email) {
  try {
    const q = query(collection(db, 'waitlist'), where('email', '==', email));
    const s = await getDocs(q);
    return !s.empty;
  } catch (e) { return false; }
}

// ═══════════════════════════════════════
// EMAIL — Deferred
// ═══════════════════════════════════════
// Email automation is not active. All signups are saved to Firestore.
// When ready, export your waitlist CSV from Firebase Console and send
// emails manually, or add Mailchimp/MailerLite automation later.
async function sendConfirmationEmail(firstName, email) {
  // No-op — signups are stored in Firestore
}

// ═══════════════════════════════════════
// FORM HANDLER
// ═══════════════════════════════════════

const interests = ['women', 'men', 'both', 'undecided'];
const affiliations = ['active_duty', 'veteran', 'reservist', 'dod_cleared', 'first_responder', 'military_spouse', 'civilian', 'other'];

document.getElementById('onbaseForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  document.getElementById('fErr').style.display = 'none';

  // Honeypot
  if (document.getElementById('website').value) { showEligible('friend', 'your inbox'); return; }
  // Bot timing
  if (Date.now() - FL < 2500) { showEligible('friend', 'your inbox'); return; }
  // Rate limit
  const r = rl();
  if (!r.ok) { err(r.e); return; }

  // Validate all fields
  const fn = vN(document.getElementById('fn').value, 'First name');
  if (!fn.ok) { err(fn.e); bad('fn'); return; }

  const ln = vN(document.getElementById('ln').value, 'Last name');
  if (!ln.ok) { err(ln.e); bad('ln'); return; }

  const em = vE(document.getElementById('em').value);
  if (!em.ok) { err(em.e); bad('em'); return; }

  const int = document.getElementById('interest').value;
  if (!vS(int, interests)) { err('Please tell us who you\'re interested in.'); bad('interest'); return; }

  const aff = document.getElementById('affiliation').value;
  if (!vS(aff, affiliations)) { err('Please select your status.'); bad('affiliation'); return; }

  // reCAPTCHA check
  const btn = document.getElementById('subBtn');
  const recaptchaReady = typeof grecaptcha !== 'undefined' && typeof grecaptcha.getResponse === 'function';
  if (recaptchaReady) {
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      err('Please complete the "I\'m not a robot" check.');
      return;
    }
  }

  btn.disabled = true;
  btn.textContent = 'Joining...';

  try {
    // Check duplicate
    const dup = await exists(em.v);
    if (dup) { showDuplicate(fn.v); return; }

    // Save to Firestore — everyone gets saved, eligibility is tracked
    const eligible = isEligible(aff);
    await addDoc(collection(db, 'waitlist'), {
      firstName: fn.v,
      lastName: ln.v,
      email: em.v,
      interest: int,
      affiliation: aff,
      eligible: eligible,
      source: 'landing_page',
      createdAt: serverTimestamp(),
      invited: false,
      invitedAt: null,
    });

    sc++;
    lt = Date.now();

    // Show correct confirmation based on eligibility
    if (eligible) {
      showEligible(fn.v, em.v);
      sendConfirmationEmail(fn.v, em.v);
    } else {
      showIneligible(fn.v);
    }

  } catch (error) {
    console.error('Signup error:', error);
    // Fallback: save locally if Firebase is down
    const wl = JSON.parse(localStorage.getItem('onbase_wl') || '[]');
    wl.push({ firstName: fn.v, lastName: ln.v, email: em.v, interest: int, affiliation: aff, ts: new Date().toISOString() });
    localStorage.setItem('onbase_wl', JSON.stringify(wl));
    if (isEligible(aff)) { showEligible(fn.v, em.v); }
    else { showIneligible(fn.v); }
  }
});

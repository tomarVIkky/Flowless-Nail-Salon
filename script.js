/* ==========================================================================
   Flawless Nail Studio — Vanilla JavaScript
   Edit SALON_CONFIG below to update salon details, hours, or social links.
   ========================================================================== */

export const SALON_CONFIG = {
  businessName: 'Flawless Nail Studio',
  cityLine: 'Maninagar · Ahmedabad',
  address:
    'F/7, Silverlake Complex, Rambagh BRTS, beside City Corner, near Rambagh, Kankaria, Maninagar, Ahmedabad, Gujarat 380008',
  phoneDisplay: '+91 878 097 3878',
  whatsappNumber: '918780973878',
  whatsappBaseUrl: 'https://wa.me/918780973878',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Flawless+Nail+Studio+Silverlake+Complex+Rambagh+BRTS+Maninagar+Ahmedabad+380008',
  hours: {
    monSat: 'Monday–Saturday, 11:00 AM–7:00 PM',
    sunday: 'Sunday, 11:00 AM–5:00 PM',
  },
  // SOCIAL MEDIA LINKS:
  // No official Instagram or Facebook profile URL was verified for Flawless Nail Studio (Maninagar).
  // Paste verified URLs below (e.g. 'https://instagram.com/yourhandle') to activate live footer links.
  socialProfiles: {
    instagramUrl: '',
    facebookUrl: '',
  },
};

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getLocalTodayIso(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a YYYY-MM-DD string is strictly in the past compared to todayIso.
 */
export function isPastDate(dateStr, todayIso = getLocalTodayIso()) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  return dateStr < todayIso;
}

/**
 * Normalizes and validates a customer phone number (accepts 10-15 digits).
 */
export function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validates booking form fields and returns an errors map keyed by field name.
 */
export function validateBookingInput(input, todayIso = getLocalTodayIso()) {
  const errors = {};
  const name = String(input?.name || '').trim();
  const phone = String(input?.phone || '').trim();
  const service = String(input?.service || '').trim();
  const date = String(input?.date || '').trim();
  const time = String(input?.time || '').trim();

  if (name.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Please enter a valid 10 to 15 digit phone number.';
  }

  if (!service) {
    errors.service = 'Please select a service category.';
  }

  if (!date) {
    errors.date = 'Please choose a preferred date.';
  } else if (isPastDate(date, todayIso)) {
    errors.date = 'Please choose today or an upcoming date.';
  }

  if (!time) {
    errors.time = 'Please choose a preferred time window.';
  } else if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    if (dayOfWeek === 0 && time.startsWith('5:00 PM')) {
      errors.time = 'On Sundays the studio closes at 5:00 PM. Please pick an earlier window.';
    }
  }

  return errors;
}

/**
 * Formats a clean WhatsApp appointment request message.
 */
export function formatWhatsAppMessage(input) {
  const name = String(input?.name || '').trim();
  const phone = String(input?.phone || '').trim();
  const service = String(input?.service || '').trim();
  const date = String(input?.date || '').trim();
  const time = String(input?.time || '').trim();
  const note = String(input?.note || '').trim();

  const lines = [
    `Hello ${SALON_CONFIG.businessName} (Maninagar),`,
    '',
    'I would like to request an appointment:',
    `• Name: ${name}`,
    `• Phone: ${phone}`,
    `• Service: ${service}`,
    `• Preferred Date: ${date}`,
    `• Preferred Time: ${time}`,
  ];

  if (note) {
    lines.push(`• Note: ${note}`);
  }

  lines.push('', 'Please let me know if this slot is available. Thank you!');
  return lines.join('\n');
}

/**
 * Builds the full wa.me URL with pre-filled encoded text.
 */
export function buildWhatsAppUrl(input) {
  const message = formatWhatsAppMessage(input);
  return `${SALON_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Browser DOM initialization.
 */
function initSite() {
  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Hydrate verified social links if provided in SALON_CONFIG.socialProfiles
  hydrateSocialSlot('social-instagram-slot', 'Instagram', SALON_CONFIG.socialProfiles.instagramUrl);
  hydrateSocialSlot('social-facebook-slot', 'Facebook', SALON_CONFIG.socialProfiles.facebookUrl);

  // Mobile Hamburger Menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  function setMenuOpen(isOpen) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Close navigation menu' : 'Open navigation menu'
    );
    mobileMenu.hidden = !isOpen;
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!expanded);
    });

    // Close drawer automatically after tapping any mobile link or CTA
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  // Service Card -> Pre-select service & scroll to booking form
  const serviceSelect = document.getElementById('service-select');
  const bookingSection = document.getElementById('booking');
  const nameInput = document.getElementById('customer-name');

  document.querySelectorAll('.service-select-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosenService = btn.getAttribute('data-service');
      if (serviceSelect && chosenService) {
        serviceSelect.value = chosenService;
        clearFieldError('service-select', 'error-service');
      }
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (nameInput) {
        nameInput.focus({ preventScroll: true });
      }
    });
  });

  // Booking Form Validation & WhatsApp Request Flow
  const form = document.getElementById('booking-form');
  const dateInput = document.getElementById('preferred-date');
  const resultPanel = document.getElementById('whatsapp-result');
  const messagePreview = document.getElementById('message-preview');
  const launchLink = document.getElementById('whatsapp-launch-link');
  const editBtn = document.getElementById('edit-request-btn');

  if (dateInput) {
    dateInput.setAttribute('min', getLocalTodayIso());
  }

  const fieldMapping = [
    { inputId: 'customer-name', errorId: 'error-name', key: 'name' },
    { inputId: 'customer-phone', errorId: 'error-phone', key: 'phone' },
    { inputId: 'service-select', errorId: 'error-service', key: 'service' },
    { inputId: 'preferred-date', errorId: 'error-date', key: 'date' },
    { inputId: 'preferred-time', errorId: 'error-time', key: 'time' },
  ];

  fieldMapping.forEach(({ inputId, errorId }) => {
    const el = document.getElementById(inputId);
    if (el) {
      const eventName = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
      el.addEventListener(eventName, () => clearFieldError(inputId, errorId));
    }
  });

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const payload = {
        name: document.getElementById('customer-name')?.value || '',
        phone: document.getElementById('customer-phone')?.value || '',
        service: document.getElementById('service-select')?.value || '',
        date: document.getElementById('preferred-date')?.value || '',
        time: document.getElementById('preferred-time')?.value || '',
        note: document.getElementById('booking-note')?.value || '',
      };

      const errors = validateBookingInput(payload, getLocalTodayIso());
      let firstInvalidEl = null;

      fieldMapping.forEach(({ inputId, errorId, key }) => {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        const fieldWrapper = inputEl?.closest('.form-field');
        const message = errors[key] || '';

        if (errorEl) {
          errorEl.textContent = message;
        }
        if (fieldWrapper) {
          fieldWrapper.classList.toggle('has-error', Boolean(message));
        }
        if (inputEl) {
          inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
        }
        if (message && !firstInvalidEl && inputEl) {
          firstInvalidEl = inputEl;
        }
      });

      if (firstInvalidEl) {
        firstInvalidEl.focus();
        return;
      }

      const formattedMessage = formatWhatsAppMessage(payload);
      const whatsappUrl = buildWhatsAppUrl(payload);

      if (messagePreview) {
        messagePreview.textContent = formattedMessage;
      }
      if (launchLink) {
        launchLink.setAttribute('href', whatsappUrl);
      }

      form.hidden = true;
      if (resultPanel) {
        resultPanel.hidden = false;
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Trigger opening WhatsApp via a clean external anchor click without window.open
      openExternalLink(whatsappUrl);
    });
  }

  if (editBtn && form && resultPanel) {
    editBtn.addEventListener('click', () => {
      resultPanel.hidden = true;
      form.hidden = false;
      document.getElementById('customer-name')?.focus();
    });
  }
}

function clearFieldError(inputId, errorId) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  const fieldWrapper = inputEl?.closest('.form-field');
  if (errorEl) errorEl.textContent = '';
  if (fieldWrapper) fieldWrapper.classList.remove('has-error');
  if (inputEl) inputEl.setAttribute('aria-invalid', 'false');
}

function hydrateSocialSlot(slotId, label, url) {
  const slot = document.getElementById(slotId);
  if (!slot || !url) return;
  slot.classList.remove('social-placeholder');
  slot.textContent = '';
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.textContent = label;
  slot.appendChild(anchor);
}

function openExternalLink(url) {
  try {
    const tempAnchor = document.createElement('a');
    tempAnchor.href = url;
    tempAnchor.target = '_blank';
    tempAnchor.rel = 'noopener noreferrer';
    tempAnchor.style.display = 'none';
    document.body.appendChild(tempAnchor);
    tempAnchor.click();
    tempAnchor.remove();
  } catch {
    // Fallback link remains visible inside #whatsapp-result
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
  } else {
    initSite();
  }
}

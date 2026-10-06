(() => {
  const menuButton = document.querySelector('.menu-button');
  const siteLinks = document.querySelector('#site-links');
  if (menuButton && siteLinks) {
    menuButton.addEventListener('click', () => {
      const open = siteLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    siteLinks.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        siteLinks.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const dialog = document.querySelector('#lightbox');
  const dialogImage = document.querySelector('#lightbox-image');
  const dialogCaption = document.querySelector('#lightbox-caption');
  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      dialogImage.src = button.querySelector('img')?.src || button.dataset.lightbox;
      dialogImage.alt = button.dataset.caption || 'Enlarged project image';
      dialogCaption.textContent = button.dataset.caption || '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  document.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const form = document.querySelector('#tax-calculator');
  const type = document.querySelector('#property-type');
  const value = document.querySelector('#property-value');
  const annual = document.querySelector('#annual-cost');
  const monthly = document.querySelector('#monthly-cost');
  const daily = document.querySelector('#daily-cost');
  const detail = document.querySelector('#assessment-detail');
  const note = document.querySelector('#value-note');
  const mills = 16.1;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function updateNote() {
    const ratio = Number(type.value);
    note.textContent = ratio === 0.30
      ? 'For agricultural land, enter the applicable use value rather than market value.'
      : ratio === 0.25
        ? 'For commercial/industrial property, enter the appraised property value.'
        : 'For a home, enter the appraised home value.';
  }

  function calculate() {
    const propertyValue = Math.max(0, Number(value.value) || 0);
    const ratio = Number(type.value) || 0.115;
    const assessed = propertyValue * ratio;
    const yearly = assessed * (mills / 1000);
    annual.textContent = money.format(yearly);
    monthly.textContent = money.format(yearly / 12);
    daily.textContent = money.format(yearly / 365);
    detail.textContent = `Estimated assessed value: ${money.format(assessed)}.`;
  }

  form?.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  type?.addEventListener('change', () => { updateNote(); calculate(); });
  value?.addEventListener('input', calculate);
  updateNote();
  calculate();
})();
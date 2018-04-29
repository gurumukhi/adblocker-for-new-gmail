const SCRIPT_ADDITION_ATTEMP_COUNT = 10,
    SCRIPT_ADDITION_ATTEMP_TIMEOUT = 1000,
    AD_CLEAN_ATTEMP_COUNT = 5,
    AD_CLEAN_ATTEMP_TIMEOUT = 500,
    TAB_SELECTOR = 'tr.aAA.J-KU-Jg.J-KU-Jg-K9',
    AD_ROW_SELECTOR = 'img.aPe.jJBbu',
    AD_TEXT_SPAN_SELECTOR = 'span.a3x';

let scriptAdditionAttemptsCount = 0;

const attemptScriptAddtion = () => {
  if(addCleanAdScript()) {
    // console.log('Gmail ad remover: Injected ad remover script successfully.');
    return;
  }
  if(scriptAdditionAttemptsCount++ < SCRIPT_ADDITION_ATTEMP_COUNT) {
    // console.log('Gmail ad remover: retrying adding ad remover script in '+ SCRIPT_ADDITION_ATTEMP_TIMEOUT +' ms.');
    setTimeout(attemptScriptAddtion, SCRIPT_ADDITION_ATTEMP_TIMEOUT);
  } else {
    console.warn('Gmail ad remover: Could not inject ad remover script. Kindly report it to add-on team.');
  }
};

const addCleanAdScript = () => {
  cleanAds();
  let tabs = document.querySelector(TAB_SELECTOR);
  if (!tabs || !tabs.children) {
    return false;
  }
  let tabsList = tabs.children;
  for( let i=0; i<tabsList.length; i++) {
    if(tabsList[i].hasAttribute('role')) {
    tabsList[i].addEventListener('click', () => {
        attempAdCleanMultipleTimes(AD_CLEAN_ATTEMP_COUNT, AD_CLEAN_ATTEMP_TIMEOUT);
      });
    }
  }
  return true;
};

const attempAdCleanMultipleTimes = (attemptCount, attemptTimeout) => {
  if(cleanAds() || attemptCount < 1) {
    // console.log('NOT trying ad cleaning now');
    return;
  }
  setTimeout( () => {
    // console.log('trying ad cleaning again');
    attempAdCleanMultipleTimes(attemptCount - 1, attemptTimeout);
  }, attemptTimeout);
}

const cleanAds = () => {
  try {
    let adRow = document.querySelector(AD_ROW_SELECTOR);
    if (!adRow) {
      return false; // Ad not found or not yet loaded
    }

    let adDiv = adRow.closest('table').closest('div').closest('div');
    if (!adDiv || adDiv.querySelector(AD_TEXT_SPAN_SELECTOR).innerHTML != 'Ad') {
      return false; // Ad not found or not yet loaded
    }

    if (adDiv.style.display != "none") {
      adDiv.style.display='none';
      // console.log('Gmail ad remover: Removed ad.');
      // console.log(adDiv);
    }
    return true; // Ad removed, already removed or no ad on page at all
  }
  catch (error) {
    console.warn('Gmail ad remover: Error in removing ad, kindly report below error message to add-on team.');
    console.warn(error);
    return false;
  }
};

attemptScriptAddtion();

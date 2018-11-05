const SCRIPT_ADDITION_ATTEMP_TIMEOUT = 2000,
    AD_CLEAN_ATTEMP_COUNT = 5,
    AD_CLEAN_ATTEMP_TIMEOUT = 100,
    TAB_SELECTOR = 'tr.aAA.J-KU-Jg.J-KU-Jg-K9',
    AD_ROW_SELECTOR = 'img.aPe.jJBbu',
    AD_TEXT_SPAN_SELECTOR = 'span.bBw';

let DEBUG_MODE_ON = false,
    maxScriptAdditionAttempts = 10;

let scriptAdditionAttemptsCount = 0;

const attemptScriptAddtion = () => {
  if(addCleanAdScript()) {
    if (DEBUG_MODE_ON) {
      console.log('Gmail ad remover: Injected ad remover script successfully.');
    }
    return;
  }
  if(scriptAdditionAttemptsCount++ < maxScriptAdditionAttempts) {
    if (DEBUG_MODE_ON) {
      console.log('Gmail ad remover: retrying adding ad remover script in '+ SCRIPT_ADDITION_ATTEMP_TIMEOUT +' ms.');
    }
    setTimeout(attemptScriptAddtion, SCRIPT_ADDITION_ATTEMP_TIMEOUT);
  } else {
    if (document.querySelector('#loading').style.display != 'none' &&
        maxScriptAdditionAttempts < 100 ) {
      maxScriptAdditionAttempts = 100;
      console.log('Gmail ad remover: retrying adding ad remover script in '+ SCRIPT_ADDITION_ATTEMP_TIMEOUT +' ms.');
      setTimeout(attemptScriptAddtion, SCRIPT_ADDITION_ATTEMP_TIMEOUT);
    } else {
      console.warn('Gmail ad remover: Could not inject ad remover script. Kindly report it to add-on team.');
    }
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
  if (DEBUG_MODE_ON) {
    console.log('Gmail ad remover: Added script.');
  }
  return true;
};

const attempAdCleanMultipleTimes = (attemptCount, attemptTimeout) => {
  if(cleanAds() || attemptCount < 1) {
    if (DEBUG_MODE_ON) {
      console.log('Gmail ad remover: NOT trying ad cleaning now');
    }
    return;
  }
  setTimeout( () => {
    if (DEBUG_MODE_ON) {
      console.log('Gmail ad remover: Trying ad cleaning (again)');
    }
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
      if (DEBUG_MODE_ON) {
        console.log('Gmail ad remover: Highlighting and removing ad in 2 sec.');
        console.log(adDiv);
        adDiv.style.border='2px dotted red';
        setTimeout( () => { adDiv.style.display='none'; }, 2000);
      } else {
        adDiv.style.display='none';
      }
    }
    return true; // Ad removed, already removed or no ad on page at all
  }
  catch (error) {
    console.warn('Gmail ad remover: Error in removing ad, kindly report below error message to add-on team.');
    console.warn(error);
    return false;
  }
};

// Initialization
let storageItem = browser.storage.local.get();
storageItem.then((result) => {
  DEBUG_MODE_ON = result.isDebugModeOn;
});

attemptScriptAddtion();

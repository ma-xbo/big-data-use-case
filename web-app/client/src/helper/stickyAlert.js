const toastOut = (alertElement) => {
  alertElement.classList.remove("alert-block");
  alertElement.classList.remove("show");
  alertElement.classList.remove("fade");
};

const toast = (alertElement, timeShown) => {
  if (timeShown === undefined) timeShown = 5000;
  setTimeout(() => {
    alertElement.classList.add("show");
  }, 250);
  const timeToFade = timeShown + 250;
  setTimeout(() => {
    alertElement.classList.add("fade");
  }, timeToFade);
  const timeToDestroy = timeToFade + 500;
  setTimeout(() => {
    toastOut(alertElement);
  }, timeToDestroy);
};

const getStickyAlertElement = (title, content, dismissible, color, filled) => {
  const element = document.createElement("div");
  element.classList.add("alert");
  element.classList.add("alert-block");
  if (color) element.classList.add(`alert-${color}`);
  if (filled) {
    if (filled === "lm") element.classList.add("filled-lm");
    else if (filled === "dm") element.classList.add("filled-dm");
    else if (filled === true) element.classList.add("filled");
  }
  if (dismissible) {
    const closeBtn = document.createElement("div");
    closeBtn.classList.add("close");
    closeBtn.onclick = () => {
      toastOut(element);
    };
    const closeIcon = document.createElement("span");
    closeIcon.innerHTML = "&times;";
    closeBtn.insertAdjacentElement("afterbegin", closeIcon);
    element.insertAdjacentElement("afterbegin", closeBtn);
  }
  const titleEle = document.createElement("h4");
  titleEle.classList.add("alert-heading");
  titleEle.insertAdjacentText("afterbegin", title);
  element.insertAdjacentText("beforeend", content);
  element.insertAdjacentElement("afterbegin", titleEle);
  return element;
};

export function stickyAlert({ title, content, dismissible, color, filled, timeShown }) {
  const pagewrapper = document.querySelector(".page-wrapper");
  if (!pagewrapper) {
    console.error("PageWrapper is required to render sticky alerts.");
    return;
  }
  const container = document.getElementById("halfmoon-stickyalerts-container");
  if (!container) {
    console.error("Please specify 'withStickyAlert' in PageWrapper component.");
    console.warn("Do not change the default id ('halfmoon-stickyalerts-container') of the sticky-alerts container.");
    return;
  }
  const alertElement = getStickyAlertElement(title, content, dismissible, color, filled);
  container.insertAdjacentElement("afterbegin", alertElement);
  toast(alertElement, timeShown);
}

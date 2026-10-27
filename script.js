const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-nav");
const dropdownTriggers = document.querySelectorAll(".nav-dropdown__trigger");

const closeDropdowns = () => {
  dropdownTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.closest(".nav-dropdown")?.classList.remove("is-open");
  });
};

const closeMenu = () => {
  if (!menuToggle || !primaryNavigation) {
    return;
  }

  closeDropdowns();
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  primaryNavigation.classList.remove("is-open");
};

if (menuToggle && primaryNavigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Open navigation menu" : "Close navigation menu",
    );
    primaryNavigation.classList.toggle("is-open", !isExpanded);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dropdown = trigger.closest(".nav-dropdown");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      closeDropdowns();
      trigger.setAttribute("aria-expanded", String(!isExpanded));
      dropdown?.classList.toggle("is-open", !isExpanded);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const clickedDropdown =
      target instanceof Element && target.closest(".nav-dropdown");

    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      event.target instanceof Node &&
      !menuToggle.contains(event.target) &&
      !primaryNavigation.contains(event.target)
    ) {
      closeMenu();
    } else if (!clickedDropdown) {
      closeDropdowns();
    }
  });
}

const year = document.querySelector("#current-year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const calendarGrid = document.querySelector("#calendar-grid");
const calendarMonthLabel = document.querySelector("#calendar-month-label");
const selectedDateHeading = document.querySelector("#selected-date");
const selectedDayEvents = document.querySelector("#selected-day-events");

if (
  calendarGrid instanceof HTMLElement &&
  calendarMonthLabel instanceof HTMLElement &&
  selectedDateHeading instanceof HTMLElement &&
  selectedDayEvents instanceof HTMLElement
) {
  const today = new Date();
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
  const dateFormatter = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const dateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const sameDate = (first, second) => dateKey(first) === dateKey(second);

  const eventsForDate = (date) => {
    const weekday = date.getDay();
    const events = [{ time: "7:00 AM", minutes: 420, name: "Daily Mass" }];

    if (weekday === 2) {
      events.push({ time: "6:00 PM", minutes: 1080, name: "Bible Study" });
    }

    if (weekday === 4) {
      events.push({ time: "6:00 PM", minutes: 1080, name: "Soup Kitchen" });
    }

    if (weekday === 6) {
      events.push({ time: "4:00 PM", minutes: 960, name: "Saturday Vigil Mass" });
    }

    if (weekday === 0) {
      events.push(
        { time: "7:30 AM", minutes: 450, name: "Sunday Mass" },
        { time: "9:00 AM", minutes: 540, name: "Sunday Mass" },
        { time: "11:00 AM", minutes: 660, name: "Sunday Mass" },
        { time: "4:00 PM", minutes: 960, name: "Spanish Mass" },
      );
    }

    return events.sort((first, second) => first.minutes - second.minutes);
  };

  const renderSelectedDate = () => {
    selectedDateHeading.textContent = dateFormatter.format(selectedDate);
    selectedDayEvents.replaceChildren();

    eventsForDate(selectedDate).forEach((event) => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      const name = document.createElement("span");
      time.textContent = event.time;
      name.textContent = event.name;
      item.append(time, name);
      selectedDayEvents.append(item);
    });
  };

  const createCalendarCell = (date, index) => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("role", "gridcell");
    const button = document.createElement("button");
    const isToday = sameDate(date, today);
    const isSelected = sameDate(date, selectedDate);
    const dateEvents = eventsForDate(date);

    button.type = "button";
    button.className = "calendar-cell";
    button.dataset.date = dateKey(date);
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `${dateFormatter.format(date)}. ${dateEvents.map((event) => `${event.time} ${event.name}`).join("; ")}`);
    button.style.animationDelay = `${Math.min(index, 20) * 12}ms`;

    if (isToday) {
      button.classList.add("calendar-cell--today");
      button.setAttribute("aria-current", "date");
    }

    if (isSelected) {
      button.classList.add("calendar-cell--selected");
    }

    const number = document.createElement("span");
    number.className = "calendar-cell__number";
    number.textContent = String(date.getDate());

    const dots = document.createElement("span");
    dots.className = "calendar-cell__dots";
    dots.setAttribute("aria-hidden", "true");
    dateEvents.slice(0, 4).forEach((event) => {
      const dot = document.createElement("span");
      dot.className = "calendar-cell__dot";
      if (event.name === "Bible Study" || event.name === "Soup Kitchen") {
        dot.classList.add("calendar-cell__dot--study");
      }
      dots.append(dot);
    });

    button.append(number, dots);
    button.addEventListener("click", () => {
      selectedDate = date;
      renderCalendar();
    });
    button.addEventListener("keydown", (event) => {
      const dayOffsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      const offset = dayOffsets[event.key];
      if (offset === undefined) {
        return;
      }

      event.preventDefault();
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
      visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderCalendar();
      calendarGrid.querySelector(`[data-date="${dateKey(selectedDate)}"]`)?.focus();
    });
    wrapper.append(button);
    return wrapper;
  };

  const renderCalendar = () => {
    calendarMonthLabel.textContent = monthFormatter.format(visibleMonth);
    calendarGrid.replaceChildren();
    calendarGrid.setAttribute("role", "grid");
    calendarGrid.setAttribute("aria-labelledby", "calendar-month-label");

    const weekdayRow = document.createElement("div");
    weekdayRow.setAttribute("role", "row");
    weekdayNames.forEach((name) => {
      const weekday = document.createElement("span");
      weekday.className = "calendar-weekday";
      weekday.setAttribute("role", "columnheader");
      weekday.textContent = name.slice(0, 3);
      weekday.setAttribute("aria-label", name);
      weekdayRow.append(weekday);
    });
    calendarGrid.append(weekdayRow);

    const offset = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const cells = [];

    for (let blank = 0; blank < offset; blank += 1) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "calendar-cell calendar-cell--empty";
      emptyCell.setAttribute("role", "gridcell");
      emptyCell.setAttribute("aria-hidden", "true");
      cells.push(emptyCell);
    }

    for (let day = 1; day <= dayCount; day += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      cells.push(createCalendarCell(date, offset + day - 1));
    }

    const trailingCells = (7 - ((offset + dayCount) % 7)) % 7;
    for (let blank = 0; blank < trailingCells; blank += 1) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "calendar-cell calendar-cell--empty";
      emptyCell.setAttribute("role", "gridcell");
      emptyCell.setAttribute("aria-hidden", "true");
      cells.push(emptyCell);
    }

    for (let start = 0; start < cells.length; start += 7) {
      const weekRow = document.createElement("div");
      weekRow.setAttribute("role", "row");
      weekRow.append(...cells.slice(start, start + 7));
      calendarGrid.append(weekRow);
    }

    renderSelectedDate();
  };

  document.querySelector("#calendar-previous")?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    selectedDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    renderCalendar();
  });

  document.querySelector("#calendar-next")?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    selectedDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    renderCalendar();
  });

  document.querySelector("#calendar-today")?.addEventListener("click", () => {
    visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    renderCalendar();
    calendarGrid.querySelector(`[data-date="${dateKey(today)}"]`)?.focus();
  });

  renderCalendar();
}

const revealElements = document.querySelectorAll(".reveal, .quick-link");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const announcement = document.querySelector("#announcement");
const announcementClose = document.querySelector(".announcement__close");
const announcementLink = document.querySelector(".announcement__link");
const upcomingEvents = document.querySelector("#events");
const announcementStorageKey = "stRoseAnnouncementDismissed";
let announcementDismissed = false;

const wasAnnouncementDismissed = () => {
  try {
    return (
      announcementDismissed ||
      window.sessionStorage.getItem(announcementStorageKey) === "true"
    );
  } catch (error) {
    console.warn("Could not read the announcement dismissal state.", error);
    return announcementDismissed;
  }
};

const dismissAnnouncement = () => {
  if (!announcement) {
    return;
  }

  const focusWasInAnnouncement = announcement.contains(document.activeElement);
  announcementDismissed = true;
  announcement.hidden = true;
  announcement.classList.remove("is-open");

  try {
    window.sessionStorage.setItem(announcementStorageKey, "true");
  } catch (error) {
    console.warn("Could not save the announcement dismissal state.", error);
  }

  if (focusWasInAnnouncement && upcomingEvents instanceof HTMLElement) {
    upcomingEvents.focus({ preventScroll: true });
  }
};

if (announcement && announcementClose && announcementLink) {
  if (!wasAnnouncementDismissed()) {
    window.setTimeout(() => {
      if (!wasAnnouncementDismissed()) {
        announcement.hidden = false;
        announcement.classList.add("is-open");
      }
    }, 2000);
  }

  announcementClose.addEventListener("click", dismissAnnouncement);
  announcementLink.addEventListener("click", dismissAnnouncement);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (announcement && !announcement.hidden) {
    dismissAnnouncement();
    return;
  }

  const openDropdown = document.querySelector(".nav-dropdown.is-open");
  if (openDropdown) {
    const trigger = openDropdown.querySelector(".nav-dropdown__trigger");
    closeDropdowns();
    trigger?.focus();
    return;
  }

  if (menuToggle?.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

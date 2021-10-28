import moment from "moment";
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addYears
} from "date-fns";
const queryString = require('query-string');


export const appendScript = (scriptToAppend) => {
  const script = document.createElement("script");
  script.src = scriptToAppend;
  script.async = true;
  document.body.appendChild(script);
};

export const removeScript = (scriptToremove) => {
  let allsuspects = document.getElementsByTagName("script");
  for (let i = allsuspects.length; i >= 0; i--) {
    if (
      allsuspects[i] &&
      allsuspects[i].getAttribute("src") !== null &&
      allsuspects[i].getAttribute("src").indexOf(`${scriptToremove}`) !== -1
    ) {
      allsuspects[i].parentNode.removeChild(allsuspects[i]);
    }
  }
};

export const convertToSlug = (Text) => {
    return Text
        .toLowerCase()
        .replace(/ /g,'_')
        .replace(/[^\w-]+/g,'')
        ;
};

let logs = {
  organization_created:{ title:'Created', icon:'org_add_icon.svg' },
  contact_created:{ title:'Contact Created', icon:'contact_add_icon.svg' },
  deal_created:{ title:'Deal Created', icon:'deal_add_icon.svg' },
  deal_won:{ title:'Deal Won', icon:'deal_add_icon.svg' },
  deal_lost:{ title:'Deal Lost', icon:'deal_add_icon.svg' },
  deal_cancel:{ title:'Deal Cancel', icon:'deal_add_icon.svg' },
  edit_detail:{ title:'Details Edited', icon:'edit_detail_icon.svg' },
  deal_status_change:{ title:'Deal Status Changed', icon:'deal_status_icon.svg' },
  follow_up:{ title:'Follow Up', icon:'follow_up_icon.svg' },
};
export const log_keys = logs;

let notes = {
  organization:{ title:'Organisation', icon:'organisation_icon.svg', link:'organisations' },
  contact:{ title:'Contact', icon:'contact_icon.svg', link:'contacts' },
  deal:{ title:'Deal', icon:'deal_icon.svg', link:'deals' },
};
export const note_keys = notes;

export const queryStringParse = (Text) => {
  return queryString.parse(Text);
};

export const dynamicSort = (key, order = 'asc') => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

// Date Range Picker
const defineds = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  startOfLastSevenDay: startOfDay(addDays(new Date(), -7)),
  startOfLastThirtyDay: startOfDay(addDays(new Date(), -30)),
  startOfLastNintyDay: startOfDay(addDays(new Date(), -90)),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
  startOfYear: startOfYear(new Date()),
  endOfYear: endOfYear(new Date()),
  startOflastYear: startOfYear(addYears(new Date(), -1)),
  endOflastYear: endOfYear(addYears(new Date(), -1))
};

// export const DateStaticRanges2 = [
//   {
//     label: 'today',
//     value: [defineds.startOfToday,defineds.endOfToday]
//   },
//   {
//     label: 'yesterday',
//     value: [defineds.startOfYesterday,defineds.startOfYesterday]
//   },
//   {
//     label: 'This Week',
//     value: [defineds.startOfWeek,defineds.endOfWeek]
//   },
//   {
//     label: 'Last Week',
//     value: [defineds.startOfLastWeek,defineds.endOfLastWeek]
//   },
//   {
//     label: 'This Month',
//     value: [defineds.startOfMonth, defineds.endOfMonth]
//   },
//   {
//     label: 'Last Month',
//     value: [defineds.startOfLastMonth, defineds.endOfLastMonth]
//   }
// ];

export const DateStaticRanges = { 
  Today: [moment(), moment()],
  'Yesterday': [moment().add(-1, 'days'), moment().add(-1, 'days')],
  'This Week': [moment().startOf('week'), moment().endOf('week')],
  'Last Week': [moment().subtract(1, 'weeks').startOf('week'), moment().subtract(1, 'weeks').endOf('week')],
  'This Month': [moment().startOf('month'), moment().endOf('month')],
  'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
};
export const disableAllLog = () => {
  console.log = function () {};
  console.warn = function () {};
  console.error = function () {};
  console.info = function () {};
}

// STORE THEME
export const setTheme = (theme) => {
  localStorage.setItem('theme', JSON.stringify(theme))
}
// GET THEME
export const getTheme = () => {
  return JSON.parse(localStorage.getItem('theme'));
}
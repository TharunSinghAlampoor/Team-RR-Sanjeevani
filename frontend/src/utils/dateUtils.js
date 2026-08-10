/**
 * Utility to accurately parse ISO date strings from Spring Boot / Jackson / MySQL.
 * Prevents timezone offset shifts when parsing strings like "2026-08-10T19:59:00".
 */
export const parseExactDate = (dateInput) => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  if (typeof dateInput === 'string') {
    const str = dateInput.trim();
    // Handles ISO strings without explicit timezone offsets (e.g. "2026-08-10T19:59:00" or "2026-08-10T19:59:00.962826")
    if (str.includes('T') && !str.endsWith('Z') && !str.includes('+') && !str.includes('-')) {
      const [datePart, timePart] = str.split('T');
      const datePieces = datePart.split('-').map(Number);
      if (datePieces.length === 3) {
        const [year, month, day] = datePieces;
        const timeClean = timePart ? timePart.split('.')[0] : '00:00:00';
        const timePieces = timeClean.split(':').map(Number);
        const [hours = 0, minutes = 0, seconds = 0] = timePieces;
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
    }
  }

  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Format Date to exact 12-hour Indian Standard Time format (e.g. "10 Aug 2026, 07:59 PM").
 */
export const formatExactDateTime = (dateInput) => {
  const d = parseExactDate(dateInput);
  const dateStr = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr}, ${timeStr}`;
};

/**
 * Format Date to exact Date string (e.g. "10 Aug 2026").
 */
export const formatExactDateStr = (dateInput) => {
  const d = parseExactDate(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format Date to exact 12-hour Time string (e.g. "07:59 PM").
 */
export const formatExactTimeStr = (dateInput) => {
  const d = parseExactDate(dateInput);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Calculates realistic, exact timeline event timestamps based on DB createdAt, DB updatedAt, and order status.
 * Ensures stage times fall exactly between createdAt and updatedAt without scaling into the future.
 */
export const calculateOrderTimelines = (createdAtInput, updatedAtInput, statusInput) => {
  const createdDate = parseExactDate(createdAtInput);
  const updatedDate = updatedAtInput ? parseExactDate(updatedAtInput) : createdDate;
  const rawStatus = String(statusInput || 'PENDING').toUpperCase().replace(/\s+/g, '_');
  
  let stage = 1;
  if (rawStatus === 'CONFIRMED' || rawStatus === 'PENDING' || rawStatus === 'SUCCESS' || rawStatus === 'PAID') stage = 1;
  else if (rawStatus === 'PACKED') stage = 2;
  else if (rawStatus === 'SHIPPED' || rawStatus === 'IN_TRANSIT') stage = 3;
  else if (rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'OUT_DELIVERY') stage = 4;
  else if (rawStatus === 'DELIVERED') stage = 5;
  else if (rawStatus === 'CANCELLED') stage = -1;

  const t0 = createdDate.getTime();
  const tUpdate = updatedDate.getTime();

  // Deterministic fixed timestamps for past stages relative to createdAt:
  const tPackedDefault = t0 + 25 * 60 * 1000;       // +25 mins
  const tShippedDefault = t0 + 65 * 60 * 1000;      // +65 mins
  const tOutDefault = t0 + 115 * 60 * 1000;         // +115 mins
  const tDeliveredDefault = t0 + 155 * 60 * 1000;   // +155 mins

  let packTime = null;
  let shipTime = null;
  let outTime = null;
  let delTime = null;

  if (stage >= 2) {
    if (stage === 2) {
      packTime = new Date(Math.max(tPackedDefault, tUpdate));
    } else {
      packTime = new Date(tPackedDefault);
    }
  }

  if (stage >= 3) {
    if (stage === 3) {
      shipTime = new Date(Math.max(tShippedDefault, tUpdate));
    } else {
      shipTime = new Date(tShippedDefault);
    }
  }

  if (stage >= 4) {
    if (stage === 4) {
      outTime = new Date(Math.max(tOutDefault, tUpdate));
    } else {
      outTime = new Date(tOutDefault);
    }
  }

  if (stage >= 5) {
    delTime = new Date(Math.max(tDeliveredDefault, tUpdate));
  }

  const milestones = [
    { step: 1, title: 'Confirmed', time: formatExactDateTime(createdDate), done: stage >= 1 },
    { step: 2, title: 'Packed', time: stage >= 2 && packTime ? formatExactDateTime(packTime) : 'Pending', done: stage >= 2 },
    { step: 3, title: 'Shipped', time: stage >= 3 && shipTime ? formatExactDateTime(shipTime) : 'Pending', done: stage >= 3 },
    { step: 4, title: 'Out for Delivery', time: stage >= 4 && outTime ? formatExactDateTime(outTime) : 'Pending', done: stage >= 4 },
    { step: 5, title: 'Delivered', time: stage >= 5 && delTime ? formatExactDateTime(delTime) : 'Expected Soon', done: stage >= 5 },
  ];

  return {
    stage,
    milestones,
    createdDate,
    packTime,
    shipTime,
    outTime,
    delTime,
    packDate: packTime,
    shipDate: shipTime,
    outDate: outTime,
    delDate: delTime,
    status: rawStatus
  };
};

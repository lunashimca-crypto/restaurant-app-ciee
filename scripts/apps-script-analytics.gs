// Paste this into Extensions > Apps Script in your Google Sheet, replacing the
// placeholder code. Then deploy it as a Web App (see README notes below).

const SHEET_NAME = "Events";

function doPost(e) {
  const sheet = getOrCreateSheet();
  const data = JSON.parse(e.postData.contents);

  const tz = "Asia/Seoul";
  const now = new Date();
  const hour = Number(Utilities.formatDate(now, tz, "H"));
  const dayName = Utilities.formatDate(now, tz, "EEEE");
  const isWeekend = dayName === "Saturday" || dayName === "Sunday";

  let mealPeriod = "Other";
  if (hour >= 11 && hour < 14) mealPeriod = "Lunch";
  else if (hour >= 17 && hour < 21) mealPeriod = "Dinner";

  sheet.appendRow([
    now,
    data.deviceId || "",
    data.event || "",
    data.restaurantName || "",
    data.neighborhood || "",
    data.cuisine || "",
    dayName,
    isWeekend ? "Weekend" : "Weekday",
    mealPeriod,
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Device ID",
      "Event",
      "Restaurant",
      "Neighborhood",
      "Cuisine",
      "Day",
      "Weekday/Weekend",
      "Meal Period",
    ]);
  }
  return sheet;
}

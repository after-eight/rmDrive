
let GMAIL_LABEL = 'rm2';
let GDRIVE_FILE = 'documents/rm2/$name';

/* ------------- no changes needed below this line ------------------------- */

/**
 * Returns the Google Drive folder object matching the given path
 *
 * Creates the path if it doesn't exist, yet.
 *
 * @param {string} path
 * @return {Folder}
 */
function getOrMakeFolder(path) {
  return path
    .split('/')
    .filter((name) => name !== '')
    .reduce((folder, name) => {
      const folders = folder.getFoldersByName(name);
      return folders.hasNext() ? folders.next() : folder.createFolder(name);
    }, DriveApp.getRootFolder())
}


/**
 * Get all the given label and all its sub labels
 *
 * @param {string} name
 * @return {GmailLabel[]}
 */
function getSubLabels(name) {
  return GmailApp
    .getUserLabels()
    .filter((label) =>
      label.getName() === name ||
      label.getName().substr(0, name.length + 1) === name + '/'
    );
}


/**
 * Get all starred threads in the given label
 *
 * @param {GmailLabel} label
 * @return {GmailThread[]}
 */
function getUnprocessedThreads(label) {
  const perrun = 50; //maximum is 500
  const result = [];
  let from = 0;

  do {
    const threads = label.getThreads(from, perrun);
    const starredThreads = threads.filter((thread) => thread.hasStarredMessages());

    result.push(...starredThreads);

    threads.length === perrun ? from += perrun : from = 0;

  } while (from !== 0);

  Logger.log(result.length + ' threads to process in ' + label.getName());
  return result;
}


/**
 * Get the extension of a file
 *
 * @param  {string} name filename
 * @return {string} extension
 */
function getExtension(name) {
  var re = /(?:\.([^.]+))?$/;
  var result = re.exec(name);
  if (result && result[1]) {
    return result[1].toLowerCase();
  } else {
    return 'unknown';
  }
}


/**
 * Apply template vars
 *
 * @param {string} filename with template placeholders
 * @param {object} info data to fill in
 * @return {string} replaced filename
 */
function createFilename(filename, info) {
  return Object
    .entries(info)
    .reduce((_filename, [key, value]) => _filename
      .replace(new RegExp('\\$' + key, 'g'), value),
      filename);
}


/**
 * Saves or updates a file in Drive
 *
 * @param {GmailAttachment} attachment
 * @param {string} path
 */
function saveAttachment(attachment, path) {
  var parts = path.split('/');
  var file = parts.pop();
  var path = parts.join('/');

  var folder = getOrMakeFolder(path);
  var check = folder.getFilesByName(file);

  if (check.hasNext()) {
    var currentfile = check.next();

    // use extended Api for update, since Scripts-Api does
    // not seem to support update of binary objects.
    // You need to activate this in settings/manifest.
    Drive.Files.update(
      {
        title: currentfile.getName(),
        mimeType: currentfile.getMimeType()
      },
      currentfile.getId(),
      attachment.copyBlob()
    );
    Logger.log(path + '/' + file + ' updated.');
  } else {
    folder
      .createFile(attachment)
      .setName(file);
    Logger.log(path + '/' + file + ' saved.');
  }
}


/**
 * @param {GmailMessage} message
 * @param {integer} m number of message
 * @param {GmailAttachment} attachment
 * @param {integer} a number of attachment
 * @param {GmailLabel} label where this thread was found
 */
function processAttachment(attachment, a, message, m, label) {
  var info = {
    'name': attachment.getName(),
    'ext': getExtension(attachment.getName()),
    'domain': message.getFrom().split('@')[1].replace(/[^a-zA-Z]+$/, ''), // domain part of email
    'sublabel': label.getName().substr(GMAIL_LABEL.length + 1),
    'y': ('0000' + (message.getDate().getFullYear())).slice(-4),
    'm': ('00' + (message.getDate().getMonth() + 1)).slice(-2),
    'd': ('00' + (message.getDate().getDate())).slice(-2),
    'h': ('00' + (message.getDate().getHours())).slice(-2),
    'i': ('00' + (message.getDate().getMinutes())).slice(-2),
    's': ('00' + (message.getDate().getSeconds())).slice(-2),
    'mc': m,
    'ac': a,
  }
  var file = createFilename(GDRIVE_FILE, info);
  saveAttachment(attachment, file);
}


/**
 * @param {GmailMessage} message
 * @param {integer} m number of message
 * @param {GmailLabel} label where this thread was found
 */
function processMessage(message, m, label) {
  message
    .getAttachments()
    .forEach((attachment, a) => {
      processAttachment(attachment, a, message, m, label);
      message.unstar();
    });
}


/**
 * @param {GmailThread} thread
 * @param {GmailLabel} label where this thread was found
 */
function processThread(thread, label) {
  thread
    .getMessages()
    .filter((message) => message.isStarred())
    .forEach((message, m) => processMessage(message, m, label));
}


/**
 * Get all the starred threads within our label and process their attachments
 */
function main(gmailLabel, gdriveFile) {

  GMAIL_LABEL = gmailLabel || GMAIL_LABEL;
  GDRIVE_FILE = gdriveFile || GDRIVE_FILE;

  getSubLabels(GMAIL_LABEL)
    .forEach((label) => getUnprocessedThreads(label)
      .forEach((thread) => processThread(thread, label)));
}

# rmDrive - upload reMarkable files to Google Drive

## Objective

The reMarkable cloud is nice to sync data between the device and the reMarkable App on your desktop or mobile.
But, unlike GoogleDrive, it does not offer a Web-Interface, and you can't share a file directly from there via a permanent link.

rmDrive is a solution that scans your GMail inbox for emails from your reMarkable and saves them to your GDrive.

GDrive has a nice UI to view the files from your reMarkable.

You can easily share documents with others, and as soon as you "upload" (again, via email) a new version,
everybody who has the link will get the new version as well.

And as a bonus, GoogleDrive stores all versions of your files, so you can even go back in time and restore a previous version.


<!-- ------------------------------------------------------------------- -->

## Prerequisites

### GMail

Obviously, you need a GMail Account for this, which includes everything you need.


<!-- ------------------------------------------------------------------- -->

## Installation

There are multiple ways to install rmDrive.


### Quick

- Login with your GMail account.

- Go to [script.google.com](https://script.google.com)

- click `New Project` in the upper left corner

- select `File/Project Properties` and give the project a name of your choice.

- select `Resource/Libraries` and paste the following id into the edit-box:
```
1V-SjNZZIWb9AsTo9r6VAGp_3W1Ox1QrazdteU5zgpd2WqiOM-hNSSmOl
```

Press `Add`. In the new row that appears, select the latest version, then click `Save`.

- The main file `Code.gs` is already open. Delete everything inside, and paste the following code:

```
const GMAIL_LABEL = 'rm2';
const GDRIVE_FILE = 'documents/rm2/$name';

function main() {
  rmDrive.main(GMAIL_LABEL, GDRIVE_FILE);
}
```

Adjust the variables `GMAIL_LABEL` and `GDRIVE_FILE` to your liking.

- Select `View/Show manifest file`. Delete everything and paste the following code:

```
{
  "timeZone": "Europe/Berlin",
  "dependencies": {
    "enabledAdvancedServices": [{
      "userSymbol": "Drive",
      "serviceId": "drive",
      "version": "v2"
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/drive"
  ],
  "runtimeVersion": "V8"
}
```

Adjust the time-zone to reflect your local area.
If you don't know the name of your zone, go to `File/Project Properties` and select it via the UI.

- In order to get permissions, you have to run the script manually once.
  - Select the `Code.gs` tab.
  - In the dropbox that says `Select Function`, choose `main`.
  - click the black triangle to run the script.

It will ask you for permissions.


### As your own script

TODO


### Clone repository and use `clasp`

TODO


## Usage

### Trigger

Select `Edit/Current project's triggers` and add a trigger of your choice.
"Every five minutes" works well for me.


### GMail-Filter

Inside your GMail, create a filter to process mails from your reMarkable:

- add the label you configured in `GMAIL_LABEL`
- star them
- never mark as spam


## Credits and Links

Huge credits go to Andreas Gohr from [splitbrain.org](https://splitbrain.org).
[This blog post](https://www.splitbrain.org/blog/2017-01/30-save_gmail_attachments_to_google_drive) inspired me to create "rmDrive".


## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

test new line

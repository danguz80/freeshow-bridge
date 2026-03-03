WINDOWS INSTRUCTIONS (STEP BY STEP) - FreeShow Bridge
=====================================================

Goal
----
Run the "freeshow-bridge" server on Windows so FreeShow can display the songs/items
from the active project inside a Web/Browser slide.

Requirements
------------
1) FreeShow installed and OPEN.
2) Internet connection to download Node.js (first time only).
3) Permission to install software on Windows.

Step 1: Install Node.js (one-time)
----------------------------------
1. Open your browser and search: "Node.js LTS download".
2. Go to the official Node.js website and download the LTS version for Windows.
3. Run the installer (.msi) and keep default settings:
   - Next → Next → Install → Finish

IMPORTANT: Restart your PC if Windows asks you to.

Step 2: Confirm Node.js is installed
------------------------------------
1. Open Start Menu.
2. Type: "cmd"
3. Open "Command Prompt".
4. Run these commands (one at a time) and press Enter:

   node -v
   npm -v

If you see version numbers (example: v20.x.x), it's OK.

Step 3: Download the project (2 options)
----------------------------------------

OPTION A (recommended): Download ZIP from GitHub
1. Open the repository on GitHub.
2. Click the green "Code" button.
3. Select "Download ZIP".
4. Unzip it into an easy folder, for example:
   C:\freeshow-bridge\

OPTION B: Clone with Git (only if you already have Git installed)
1. Install Git if you don’t have it.
2. Open CMD and run:
   git clone https://github.com/YOUR_USER/YOUR_REPO.git

Step 4: Open the project folder in CMD
--------------------------------------
1. Open CMD (Command Prompt).
2. Type (example if you installed it in C:\freeshow-bridge):

   cd C:\freeshow-bridge

TIP: You can type "cd " (with a space) and then drag the folder into CMD.

Step 5: Install dependencies (first time only)
----------------------------------------------
In the same CMD window, run:

   npm install

This will download required libraries. It may take 1–2 minutes.

Step 6: Start the server
------------------------
Run:

   node server.js

If everything is OK, you should see messages similar to:
- "Bridge ready..."
- "Connected to FreeShow WebSocket"
- URLs like http://localhost:3000/...

IMPORTANT:
- Do NOT close this CMD window while using the bridge.
- If you close CMD, the server stops.

Step 7: Test in your browser
----------------------------
Open Chrome/Edge and visit one of these URLs:

1) Vertical view:
   http://localhost:3000/songs

2) Ticker (Coro only):
   http://localhost:3000/songs/ticker/coro
   -----> (Adjust "coro" based on your section names in your FreeShow project)

3) Ticker (Conjunto only):
   http://localhost:3000/songs/ticker/conjunto
   -----> (Adjust "conjunto" based on your section names in your FreeShow project)

4) Ticker (both sections, 1 line):
   http://localhost:3000/songs/ticker

5) Ticker (both sections, 2 lines):
   http://localhost:3000/songs/ticker2

If you see the list moving, it’s working.

Step 8: Use it inside FreeShow (Web/Browser slide)
--------------------------------------------------

VERTICAL VIEW

1. Open FreeShow.
2. Create a new presentation, give it a name like "Item List".
3. Edit the presentation and add a "Web" element, then set a specific output,
   in this case the Stage output.
4. Paste the URL you want to use, for example:
   http://localhost:3000/songs
   This is the vertical view, it uses the full screen. It’s useful when your
   Audience output is showing the church logo (or any background) while the
   Stage output shows the list for musicians.
5. Exit edit mode and click "Clear all" (or similar). If your Audience output
   has a background configured (usually a church logo), that logo will continue
   on the Audience screen. Then place the created presentation ("Item List")
   so it shows ONLY on the Stage output, while the Audience output keeps showing
   the logo.

TICKER VIEWS

1. Open FreeShow.
2. On Stage, create or configure a Stage Template.
3. The intended use of tickers is when the Stage screen is showing announcements
   or videos, so musicians can still see what items are coming next. You can add
   a ticker to that template (usually at the bottom). The main content is still
   visible, and the ticker will show the project items looping infinitely.
4. In the template where you want a ticker, add a Web element. Available URLs:

   - http://localhost:3000/songs/ticker/coro
   - http://localhost:3000/songs/ticker/conjunto
   - http://localhost:3000/songs/ticker
   - http://localhost:3000/songs/ticker2

   The first URL shows items inside a section named "Coro". You can change this
   to match your own section names, as explained in the README.

   The second URL shows items inside a section named "Conjunto". You can change
   this to match your own section names, as explained in the README.

   The third URL shows items from both sections ("Coro" and "Conjunto") on one
   single line. You can customize section names as explained in the README.

   The fourth URL shows items from both sections ("Coro" and "Conjunto") in two
   lines. You can customize section names as explained in the README.

Done: FreeShow will now display the bridge’s dynamic content.

Step 9 (Optional): Start automatically with Windows (easy)
----------------------------------------------------------
This is useful if you don’t want to open CMD and run node every time.

SIMPLE OPTION: Startup batch file
1. Open Notepad.
2. Paste this (adjust the path if your folder is different):

   cd /d C:\freeshow-bridge
   node server.js

3. Save the file as:
   start-bridge.bat
   (IMPORTANT: it must end with .bat)

4. Press Windows + R
5. Type:
   shell:startup
6. Copy start-bridge.bat into that folder.

From now on, when Windows starts, the bridge will start automatically.

Troubleshooting (most common)
-----------------------------

1) It doesn’t connect to FreeShow:
- Make sure FreeShow is OPEN.
- In FreeShow go to Settings → Connection and enable the remote server (API/WebSocket).
- Make sure the FreeShow port is correct (default is 5505).

2) "'node' is not recognized":
- Node.js may not be installed correctly or you need a restart.
- Reinstall Node.js LTS.

3) Blank page / not loading:
- Make sure you ran: node server.js
- Try opening: http://localhost:3000/songs

4) Windows Firewall:
- Allow Node.js through the firewall if Windows prompts you.
- If you’re on a local network, set your network to "Private".

End
---
If you need help, check the repository README or open an Issue on GitHub.
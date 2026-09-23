/**
 * Entry point for cPanel's "Setup Node.js App".
 *
 * cPanel runs Node applications under Phusion Passenger, and Passenger starts
 * an app by loading a startup *file* — not by running an npm script. `npm
 * start` (`next start`) is the right command on any ordinary server and the
 * wrong shape here, because there is no npm script for Passenger to run.
 *
 * So this file does what `next start` does, in a form Passenger can load: it
 * builds Next's request handler and puts an HTTP server in front of it.
 *
 * Passenger patches `listen()` to hand the server its own socket, so the port
 * below is only used when this file is run directly (`node server.js`), which
 * is a useful way to check a production build outside cPanel.
 *
 * One caveat worth recording: "custom server" is the exact configuration named
 * in GHSA-89xv-2m56-2m9x, the SSRF in Server Actions. That advisory is fixed in
 * the Next version this project is pinned to — it is the reason the upgrade off
 * 14.2.35 had to happen before this file could exist. Do not downgrade Next
 * while running this way.
 */

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);

// dev:false is deliberate rather than inferred from NODE_ENV — Passenger does
// not always set NODE_ENV, and a production box silently running the dev
// compiler would be slow in a way that is hard to spot.
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`M.D. Hygiene listening on ${port}`);
    });
  })
  .catch((error) => {
    // Passenger shows this in the app's error log. Without it a failed start
    // is just a 503 with nothing to explain it.
    console.error("Failed to start Next.js:", error);
    process.exit(1);
  });

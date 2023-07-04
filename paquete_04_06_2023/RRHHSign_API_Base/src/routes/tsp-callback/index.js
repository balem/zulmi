const express = require("express");
const { TrustServicesManager } = require("pki-express");

const { Util } = require("../../util");

const router = express.Router();
const db = require('../../modules/db/db');

/**
 * GET /
 *
 * The route used for callback for cloud samples.
 */
router.get("/", async (req, res) => {
	// If some error ocurr, you have to handle it gracefully.
	// The most common error is "user_denied", which happens when
	// the user's rejects the operation.
	if (req.query.error) {
		res.render("tsp-callback", { error: req.query.error });
		return;
	}
	const { code, state } = req.query;

	// Get an instance of the TrustServiceManager class, responsible for
	// communicating with PSCs and handling the OAuth flow. And set common
	// configuration with setPkiDefaults (see util.js)
	const manager = new TrustServicesManager();

	// Set PKI default options (see util.js)
	Util.setPkiDefaults(manager);

	// Retrieve session from customState
	const result = await manager.getCustomState(state);
	const sessionId = result.customState;

	try {
		await db.pg.table('signature_sessions')
		.insert({
			code: code,
			state: state,
			session_id: sessionId
		})
	} catch (error) {
		console.log(error)
	}

	
	// Render page.
	//res.render("tsp-callback", { code, state, sessionId });
});

module.exports = router;

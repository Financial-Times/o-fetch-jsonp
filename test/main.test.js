/* eslint-env mocha */
import {jsonpFetch} from '../main';
import proclaim from 'proclaim';

describe('JSONP Fetch', function () {
	this.timeout(10 * 1000);

	it('should insert a script tag into the page', () => {
		jsonpFetch('http://other.domain.com/foo');
		// get the last script tag
		const scriptEls = document.querySelectorAll('script');
		proclaim.equal(scriptEls[scriptEls.length - 1].src, 'http://other.domain.com/foo?callback=FT.jsonpCallback_1');
	});

	it('should handle urls with query strings', () => {
		jsonpFetch('http://other.domain.com/foo?query=blah');
		// get the last script tag
		const scriptEls = document.querySelectorAll('script');
		proclaim.equal(scriptEls[scriptEls.length - 1].src,
			'http://other.domain.com/foo?query=blah&callback=FT.jsonpCallback_2'
		);
	});

	it('should return a promise with correct data', () => {
		return jsonpFetch('https://next-media-api.ft.com/v1/4165329773001')
			.then(response => {
				proclaim.equal(response.ok, true);
				proclaim.equal(response.status, 200);

				return response.json()
					.then(json => proclaim.equal(json.id, '261f0184-4e6a-33e2-86fa-df372fab4b2a'));
			});
	});

	// NOTE - need to mock this somehow
	it.skip('should return correct error message', () => {
		return jsonpFetch('https://next-media-api.ft.com/v1/bad-id', { timeout: 100 })
			.then(response => {
				proclaim.equal(response.ok, false);
				proclaim.equal(response.status, 400);
			});
	});

	it('should throw if script times out', () => {
		return jsonpFetch(
			'https://next-media-api.ft.com/v1/bad-id', { timeout: 0 }
		).then(() => {
			throw new Error('Promise should have been rejected but was resolved.');
		}, (error) => {
			proclaim.equal(error.message, 'JSONP request to https://next-media-api.ft.com/v1/bad-id timed out');
		});
	});

});
